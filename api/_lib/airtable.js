/* Shared Airtable helpers for lead capture, tasks, and automation logs.
   Table names are env-overridable so they can be aligned to the live base
   without a code change.

   Env-var names are read tolerantly so this code works whether the Netlify
   site was configured with this repo's names (AIRTABLE_API_KEY,
   AIRTABLE_LEADS_TABLE) or the older deployed package's names (AIRTABLE_TOKEN,
   AIRTABLE_LEADS_TBL). Set either; the first defined value wins. */

const LEADS_TABLE =
  process.env.AIRTABLE_LEADS_TABLE || process.env.AIRTABLE_LEADS_TBL || 'Leads';
const TASKS_TABLE =
  process.env.AIRTABLE_TASKS_TABLE || process.env.AIRTABLE_TASKS_TBL || 'Tasks';
const LOGS_TABLE =
  process.env.AIRTABLE_LOGS_TABLE || process.env.AIRTABLE_LOGS_TBL || 'Automation Logs';

async function airtableCreate(table, fields) {
  const apiKey = process.env.AIRTABLE_API_KEY || process.env.AIRTABLE_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID;

  if (!apiKey || !baseId) {
    return {
      ok: false,
      error: 'Missing Airtable credentials (set AIRTABLE_API_KEY/AIRTABLE_TOKEN and AIRTABLE_BASE_ID)',
    };
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
