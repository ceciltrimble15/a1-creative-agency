/*
  A1 LEAD CONNECTOR — "New Lead Intake" Airtable automation script
  ================================================================
  This covers leads that enter Airtable DIRECTLY through the published intake
  form / QR code (the temporary path). Those never hit the Vercel endpoint, so
  the pipeline (steps 1-4 of the mission) has to run inside Airtable itself.

  HOW TO INSTALL (one time, ~5 minutes):
  1. Airtable → A1 Lead Connector base → Automations → Create automation.
  2. Trigger:  "When a record is created"  →  Table: Leads.
  3. Add action:  "Run a script".
  4. Under "Input variables", add ONE variable:
        Name:  recordId      Value:  (insert) Airtable record ID from the trigger
  5. Paste this entire file into the script editor. Click "Test".
  6. Add a SECOND action: "Send email"  (native action — most reliable):
        To:       operations@a1creativeagency.com
        Subject:  New A1 Creative Lead: {{ steps.script.output.leadName }}
        Body:     use the output fields set at the bottom of this script
                  (leadName, phone, email, service, message, source, recordUrl)
  7. Turn the automation ON.

  FIELD NAMES below match the mission spec. If your base uses different names
  (e.g. lead_status instead of Status), edit the CONFIG block — nothing else.
*/

// ---- CONFIG: edit only if your base uses different field/table names -------
const LEADS_TABLE = 'Leads';
const TASKS_TABLE = 'Tasks';
const LOGS_TABLE = 'Automation Logs';

const LEAD = {
  name: 'Lead Name',
  phone: 'Phone',
  email: 'Email', // note: if your field has a trailing space ("Email "), match it exactly
  service: 'Service',
  message: 'Message',
  status: 'Status', // single-select; live base may call this "lead_status"
  source: 'Source',
};
const NEW_STATUS = 'New Lead';
const DEFAULT_SOURCE = 'A1 Creative Intake Form';
// ---------------------------------------------------------------------------

let { recordId } = input.config();

let leadsTable = base.getTable(LEADS_TABLE);
let record = await leadsTable.selectRecordAsync(recordId);
if (!record) {
  throw new Error(`Lead record ${recordId} not found in ${LEADS_TABLE}`);
}

// Helpers tolerant of missing fields (so the script never hard-fails on a
// base whose schema differs slightly).
function str(field) {
  try { return (record.getCellValueAsString(field) || '').trim(); } catch { return ''; }
}

const name = str(LEAD.name) || 'New lead';
const phone = str(LEAD.phone);
const email = str(LEAD.email);
const service = str(LEAD.service);
const message = str(LEAD.message);

// ---- 1. New Lead Intake: set Status, and Source if blank -------------------
let updates = {};
try {
  if (!str(LEAD.status)) updates[LEAD.status] = { name: NEW_STATUS };
} catch (e) { /* field may not be a single-select; skip */ }
if (!str(LEAD.source)) updates[LEAD.source] = DEFAULT_SOURCE;
if (Object.keys(updates).length) {
  try { await leadsTable.updateRecordAsync(record, updates); } catch (e) { console.log('Status/Source update skipped:', e.message); }
}

// Due date: today if a weekday, else next Monday.
function nextBusinessDay() {
  let d = new Date();
  let day = d.getDay();
  if (day === 6) d.setDate(d.getDate() + 2);
  else if (day === 0) d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

// ---- 2. Follow-Up Task -----------------------------------------------------
let taskId = null;
try {
  let tasks = base.getTable(TASKS_TABLE);
  taskId = await tasks.createRecordAsync({
    'Task Name': `Follow up with ${name}`,
    'Related Lead': [{ id: record.id }],
    'Priority': { name: 'High' },
    'Status': { name: 'Open' },
    'Due Date': nextBusinessDay(),
    'Notes': `Phone: ${phone || '—'}\nEmail: ${email || '—'}\nService: ${service || '—'}\nMessage: ${message || '—'}`,
  });
} catch (e) {
  console.log('Task creation failed:', e.message);
}

// ---- 4. Automation Log -----------------------------------------------------
try {
  let logs = base.getTable(LOGS_TABLE);
  await logs.createRecordAsync({
    'Event Type': 'New Lead Captured',
    'Related Lead': [{ id: record.id }],
    'Status': { name: 'Success' },
    'Timestamp': new Date().toISOString(),
    'Notes': 'Lead captured from A1 Creative intake form and follow-up task created'
      + (taskId ? '' : ' (task creation skipped — check Tasks schema)'),
  });
} catch (e) {
  console.log('Automation log failed:', e.message);
}

// ---- 3. Outputs for the native "Send email" action -------------------------
let baseId = base.id;
output.set('leadName', name);
output.set('phone', phone);
output.set('email', email);
output.set('service', service || '—');
output.set('message', message || '—');
output.set('source', str(LEAD.source) || DEFAULT_SOURCE);
output.set('recordUrl', `https://airtable.com/${baseId}/${leadsTable.id}/${record.id}`);
