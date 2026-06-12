# Airtable Automation — New Lead Follow-up (temporary production intake)

Intake path while the website form is being wired:
**Airtable public form → Leads table → this automation** (task + log + email + defaults).

Build it inside the Airtable base (Automations are configured in Airtable itself):

## Click path

1. Open the base → **Automations** (top bar) → **Create automation**.
2. Name it: `New lead follow-up`.
3. **Trigger:** "When a record is created" → Table: **Leads** → test the trigger
   with Cecil's existing test lead.
4. **Action 1:** "Run a script".
   - In the left *Input variables* panel add one variable:
     - Name: `recordId` → Value: click ⚙ → Record (from trigger step) → **Airtable record ID**.
   - Paste the script below.
5. **Action 2:** "Send email" (Airtable's built-in Gmail-less email action).
   - To: `operations@a1creativeagency.com`
   - Subject: `New lead: ` + insert token **Lead Name** from the trigger record
   - Message: insert tokens for Lead Name, Phone, Email, Notes, Source.
6. Click **Test automation** end-to-end, then toggle the automation **ON**.

> Free-plan note: Airtable Free allows 100 automation runs/month. Fine for
> launch volume; upgrade or move the email to the Vercel backend if leads scale.

## Script for Action 1 (paste as-is)

```js
// Fills defaults on the new lead, creates a follow-up Task and an
// Automation Log entry. Never overwrites values the form captured.
const { recordId } = input.config();

// ── Adjust only if your base differs ──────────────────────────────
const STATUS_FIELD = 'lead_status';      // single select on Leads
const STATUS_DEFAULT = 'New Lead';       // option must exist on the field
const SOURCE_FIELD = 'Source';
const SOURCE_DEFAULT = 'A1 Creative Intake Form';
const EMAIL_FIELD = 'Email ';            // note: trailing space
// ──────────────────────────────────────────────────────────────────

const leads = base.getTable('Leads');
const tasks = base.getTable('Tasks');
const logs = base.getTable('Automation Logs');

const record = await leads.selectRecordAsync(recordId, {
  fields: leads.fields.map((f) => f.name),
});

const name = record.getCellValueAsString('Lead Name') || 'Unknown';
const phone = record.getCellValueAsString('Phone');
const email = record.getCellValueAsString(EMAIL_FIELD);

// Select fields need {name: ...}; text fields take plain strings.
function valueFor(table, fieldName, raw) {
  const field = table.getField(fieldName);
  return field.type === 'singleSelect' ? { name: raw } : raw;
}

// 1. Defaults — only when blank, so form values are preserved.
const updates = {};
if (!record.getCellValueAsString(STATUS_FIELD)) {
  updates[STATUS_FIELD] = valueFor(leads, STATUS_FIELD, STATUS_DEFAULT);
}
if (!record.getCellValueAsString(SOURCE_FIELD)) {
  updates[SOURCE_FIELD] = valueFor(leads, SOURCE_FIELD, SOURCE_DEFAULT);
}
if (Object.keys(updates).length) {
  await leads.updateRecordAsync(recordId, updates);
}

// 2. Follow-up task.
await tasks.createRecordAsync({
  Name: `Follow up with ${name}${phone ? ` (${phone})` : ''}`,
  Status: valueFor(tasks, 'Status', 'To Do'),
  Notes: `Lead from Airtable intake form. Email: ${email || '—'}`,
});

// 3. Automation log.
await logs.createRecordAsync({
  Event: 'airtable_form_lead',
  Details: `Lead ${recordId} (${name}, ${phone || 'no phone'}) captured via Airtable form. Task created.`,
  Status: valueFor(logs, 'Status', 'ok'),
});
```

### Before turning it on, verify in the base

- `Leads.lead_status` (single select) has an option named **New Lead** —
  add it if missing. (The website backend writes `new`; consider renaming one
  of the two so the pipeline uses a single value.)
- `Tasks` table exists with fields `Name`, `Status` (option `To Do`), `Notes`.
- `Automation Logs` table exists with fields `Event`, `Details`, `Status`.
- The Leads email field really is named `Email ` with a trailing space; if
  not, change `EMAIL_FIELD` at the top of the script.
