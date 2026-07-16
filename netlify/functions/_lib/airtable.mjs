/* Shared Airtable helpers for lead capture, assessments, tasks, and logs.
   Table names are env-overridable so they can be aligned to the live base
   without a code change. Runtime-agnostic: uses only global fetch + env,
   so it runs unchanged on Netlify Functions (Node 18+). Server-side only —
   the Airtable token never reaches the browser. */

const LEADS_TABLE = process.env.AIRTABLE_LEADS_TABLE || 'Leads';
const TASKS_TABLE = process.env.AIRTABLE_TASKS_TABLE || 'Tasks';
const LOGS_TABLE = process.env.AIRTABLE_LOGS_TABLE || 'Automation Logs';
const ASSESSMENTS_TABLE = process.env.AIRTABLE_ASSESSMENTS_TABLE || 'Business Assessments';

/* The live Leads table uses these exact field names. Two carry a trailing
   space in the base, so they are named as constants to avoid silent typos. */
export const LEAD_FIELDS = {
  name: 'Lead Name',
  email: 'Email ', // trailing space is intentional — matches the base
  phone: 'Phone',
  business: 'Business Name',
  service: 'Service Requested ', // trailing space is intentional
  source: 'Source',
  status: 'lead_status',
  client: 'Client',
  notes: 'Notes',
  smsConsent: 'SMS Consent',
  smsConsentAt: 'SMS Consent Timestamp',
  smsConsentVersion: 'SMS Consent Text Version',
  consentSourceUrl: 'Consent Source URL',
  consentIp: 'Consent IP',
};

function airtableConfig() {
  // Accept either env var name so a token stored under either key works.
  // Prefer AIRTABLE_API_KEY; fall back to AIRTABLE_TOKEN. Neither value is
  // ever logged or returned to the client.
  const apiKey = process.env.AIRTABLE_API_KEY || process.env.AIRTABLE_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID;
  if (!apiKey || !baseId) return null;
  return { apiKey, baseId };
}

/* True when the Airtable token + base id are both present in this deploy
   context. Lets the intake function return a clear "not configured yet"
   message (instead of a generic failure) when a context — e.g. Deploy
   Previews — is missing the env vars. Never exposes the values themselves. */
export function hasAirtableConfig() {
  return airtableConfig() !== null;
}

/* Low-level request wrapper. Returns { ok, status, data, error } and never
   throws — callers decide how to degrade. */
async function airtableRequest(method, tablePath, { body, query } = {}) {
  const cfg = airtableConfig();
  if (!cfg) return { ok: false, error: 'Missing Airtable credentials (AIRTABLE_API_KEY or AIRTABLE_TOKEN, and AIRTABLE_BASE_ID)' };

  let url = `https://api.airtable.com/v0/${cfg.baseId}/${tablePath}`;
  if (query) url += `?${query}`;

  try {
    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${cfg.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await response.json();
    if (!response.ok) {
      return { ok: false, status: response.status, data, error: data.error?.message || `Airtable ${response.status}` };
    }
    return { ok: true, status: response.status, data };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

async function airtableCreate(table, fields) {
  // typecast lets Airtable add new single-select options (e.g. a new Source
  // value) instead of rejecting the record.
  const res = await airtableRequest('POST', encodeURIComponent(table), {
    body: { fields, typecast: true },
  });
  return res.ok ? { ok: true, id: res.data.id } : { ok: false, error: res.error };
}

async function airtableUpdate(table, id, fields) {
  const res = await airtableRequest('PATCH', `${encodeURIComponent(table)}/${id}`, {
    body: { fields, typecast: true },
  });
  return res.ok ? { ok: true, id: res.data.id } : { ok: false, error: res.error };
}

async function airtableSelectFirst(table, formula) {
  const query = `filterByFormula=${encodeURIComponent(formula)}&maxRecords=1`;
  const res = await airtableRequest('GET', encodeURIComponent(table), { query });
  if (!res.ok) return { ok: false, error: res.error };
  const record = res.data.records && res.data.records[0];
  return { ok: true, record: record || null };
}

function escapeFormulaValue(value) {
  return String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

export function createLead(fields) {
  return airtableCreate(LEADS_TABLE, fields);
}

export function updateLead(id, fields) {
  return airtableUpdate(LEADS_TABLE, id, fields);
}

export function createAssessment(fields) {
  return airtableCreate(ASSESSMENTS_TABLE, fields);
}

export function createTask(fields) {
  return airtableCreate(TASKS_TABLE, fields);
}

/* Find an existing Lead by email and/or phone.
   - Email match is case-insensitive and trimmed.
   - Phone match compares the last 10 digits, so formatting differences
     (spaces, dashes, +1 country code) don't cause a false miss.
   Returns { ok, record|null }. A lookup failure degrades to "not found" at the
   call site so a transient read error never blocks a submission. */
export async function findLead({ email, phone }) {
  const clauses = [];
  if (email) {
    clauses.push(`LOWER(TRIM({${LEAD_FIELDS.email}})) = "${escapeFormulaValue(email.trim().toLowerCase())}"`);
  }
  const phoneDigits = phone ? String(phone).replace(/\D/g, '') : '';
  if (phoneDigits.length >= 7) {
    const last10 = phoneDigits.slice(-10);
    clauses.push(`RIGHT(REGEX_REPLACE({${LEAD_FIELDS.phone}}, "[^0-9]", ""), 10) = "${escapeFormulaValue(last10)}"`);
  }
  if (clauses.length === 0) return { ok: true, record: null };

  const formula = clauses.length === 1 ? clauses[0] : `OR(${clauses.join(', ')})`;
  return airtableSelectFirst(LEADS_TABLE, formula);
}

/* Best-effort automation log — failures are reported to the function log
   but never break the flow that triggered them. */
export async function logAutomation(event, details, status = 'ok') {
  const result = await airtableCreate(LOGS_TABLE, {
    Event: event,
    Details: details,
    Status: status,
  });
  if (!result.ok) console.error(`Automation log failed (${event}):`, result.error);
  return result;
}
