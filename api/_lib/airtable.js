/* Shared Airtable helpers for lead capture, tasks, and automation logs.
   Table names are env-overridable so they can be aligned to the live base
   without a code change. */

const LEADS_TABLE = process.env.AIRTABLE_LEADS_TABLE || 'Leads';
const TASKS_TABLE = process.env.AIRTABLE_TASKS_TABLE || 'Tasks';
const LOGS_TABLE = process.env.AIRTABLE_LOGS_TABLE || 'Automation Logs';
const EVENTS_TABLE = process.env.AIRTABLE_EVENTS_TABLE || 'Inbox_Events';
const ESCALATIONS_TABLE = process.env.AIRTABLE_ESCALATIONS_TABLE || 'Escalations';
const REPORTS_TABLE = process.env.AIRTABLE_REPORTS_TABLE || 'Daily_Reports';

async function airtableCreate(table, fields) {
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;

  if (!apiKey || !baseId) {
    return { ok: false, error: 'Missing AIRTABLE_API_KEY or AIRTABLE_BASE_ID' };
  }

  try {
    const response = await fetch(
      `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(table)}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        // typecast lets Airtable add new single-select options (e.g. a new
        // Source value) instead of rejecting the record.
        body: JSON.stringify({ fields, typecast: true }),
      }
    );

    const data = await response.json();
    if (!response.ok) {
      return { ok: false, error: data.error?.message || `Airtable ${response.status}` };
    }
    return { ok: true, id: data.id };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/* Single-record lookup by formula. Used by the dedup gate to find an existing
   event/lead before creating a new one. Returns { ok, record|null } so callers
   can distinguish "not found" (record null) from "lookup failed" (ok false) —
   a failed lookup must NOT be treated as "not found", or duplicates leak. */
async function airtableFindOne(table, filterByFormula) {
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;

  if (!apiKey || !baseId) {
    return { ok: false, error: 'Missing AIRTABLE_API_KEY or AIRTABLE_BASE_ID' };
  }

  try {
    const url =
      `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(table)}` +
      `?maxRecords=1&filterByFormula=${encodeURIComponent(filterByFormula)}`;
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    const data = await response.json();
    if (!response.ok) {
      return { ok: false, error: data.error?.message || `Airtable ${response.status}` };
    }
    return { ok: true, record: data.records?.[0] || null };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/* Escapes a value for safe interpolation inside an Airtable formula string. */
function formulaString(value) {
  return `"${String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

/* Dedup-gate lookup: find an Inbox_Events row by its source_event_id. */
export function findEventBySourceId(sourceEventId) {
  return airtableFindOne(EVENTS_TABLE, `{source_event_id} = ${formulaString(sourceEventId)}`);
}

/* Match-or-create support: find a Lead by phone or email within one brand so
   repeat contacts attach to the existing lead instead of spawning a new one. */
export function findLeadByContact({ phone, email, brand }) {
  const clauses = [];
  if (phone) clauses.push(`{phone} = ${formulaString(phone)}`);
  if (email) clauses.push(`LOWER({email}) = ${formulaString(String(email).toLowerCase())}`);
  if (clauses.length === 0) return Promise.resolve({ ok: true, record: null });
  const contactMatch = clauses.length > 1 ? `OR(${clauses.join(', ')})` : clauses[0];
  const formula = brand
    ? `AND({brand} = ${formulaString(brand)}, ${contactMatch})`
    : contactMatch;
  return airtableFindOne(LEADS_TABLE, formula);
}

export function createEvent(fields) {
  return airtableCreate(EVENTS_TABLE, fields);
}

export function createEscalation(fields) {
  return airtableCreate(ESCALATIONS_TABLE, fields);
}

export function createDailyReport(fields) {
  return airtableCreate(REPORTS_TABLE, fields);
}

export function createLead(fields) {
  return airtableCreate(LEADS_TABLE, fields);
}

export function createTask(fields) {
  return airtableCreate(TASKS_TABLE, fields);
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
