/* Shared Airtable helpers for lead capture, tasks, and automation logs.
   Table names are env-overridable so they can be aligned to the live base
   without a code change. */

const LEADS_TABLE = process.env.AIRTABLE_LEADS_TABLE || 'Leads';
const TASKS_TABLE = process.env.AIRTABLE_TASKS_TABLE || 'Tasks';
const LOGS_TABLE = process.env.AIRTABLE_LOGS_TABLE || 'Automation Logs';

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

/* Deep link to the Leads record in the Airtable UI. A precise record link
   needs the table id (tblXXXXXXXX) — set AIRTABLE_LEADS_TABLE_ID to get it.
   Without it we fall back to opening the base, which still works. */
export function airtableRecordUrl(recordId) {
  const baseId = process.env.AIRTABLE_BASE_ID;
  if (!baseId || !recordId) return '';
  const tableId = process.env.AIRTABLE_LEADS_TABLE_ID;
  return tableId
    ? `https://airtable.com/${baseId}/${tableId}/${recordId}`
    : `https://airtable.com/${baseId}`;
}

export function createLead(fields) {
  return airtableCreate(LEADS_TABLE, fields);
}

export function createTask(fields) {
  return airtableCreate(TASKS_TABLE, fields);
}

/* Automation Log entry. Writes the mission-spec fields:
   Event Type, Related Lead (link), Status, Timestamp, Notes.
   Best-effort — failures are reported to the function log but never break
   the flow that triggered them. */
export async function logEvent({ eventType, relatedLeadId, status = 'Success', notes }) {
  const fields = {
    'Event Type': eventType,
    'Status': status,
    'Timestamp': new Date().toISOString(),
  };
  if (notes) fields['Notes'] = notes;
  if (relatedLeadId) fields['Related Lead'] = [relatedLeadId];

  const result = await airtableCreate(LOGS_TABLE, fields);
  if (!result.ok) console.error(`Automation log failed (${eventType}):`, result.error);
  return result;
}
