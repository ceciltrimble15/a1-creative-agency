# Airtable Automation — New Lead Follow-up (NO-CODE version)

Same outcome as `airtable-automation.md`, but with **zero scripting**. No
"Run a script" step, nothing to paste. Everything below is built with
Airtable's built-in point-and-click actions, so anyone on the team can edit it.

What it does on every new Leads record:
- defaults **Status** and **Source** when the form left them blank,
- creates a follow-up **Task**,
- writes an **Automation Log** row,
- emails **operations@a1creativeagency.com**.

The "default when blank" is handled by **field defaults** (a table setting),
not the automation — that's the trick that removes the script. A value the
form submits always overrides the field default, so form data is never lost.

---

## Part A — Set field defaults (one time, no automation)

This replaces the script's "fill defaults only when blank" logic.

1. Open the **Leads** table → click the **lead_status** field header → **Edit field**.
2. Make sure it's a **Single select** with an option named **New Lead**
   (add it if missing) → set **Default value → New Lead** → **Save**.
3. Click the **Source** field header → **Edit field** → set
   **Default value → `A1 Creative Intake Form`** → **Save**.
   - If Source is a single select, add that option first, then pick it as the default.

That's it for defaults. Any record created without a Status/Source — including
ones the automation's trigger fires on — now gets these values automatically,
and submitted values win over the default.

> If your plan's field type doesn't expose a "Default value" box (some
> field types don't), use the **conditional fallback** in Part C instead.

---

## Part B — Build the automation (all point-and-click)

1. Base → **Automations** → **Create automation** → name it `New lead follow-up`.
2. **Trigger:** *When a record is created* → Table: **Leads** → **Test trigger**
   (use Cecil's existing test lead so the later steps have real data to map).

### Action 1 — Create record → Tasks

- Action: **Create record** → Table: **Tasks**.
- Fields:
  | Field | Value |
  |---|---|
  | **Name** | type `Follow up with ` then insert the **Lead Name** token from the trigger step |
  | **Status** | choose **To Do** |
  | **Notes** | type `Lead from Airtable intake form. Email: ` then insert the **Email** token |

### Action 2 — Create record → Automation Logs

- Action: **Create record** → Table: **Automation Logs**.
- Fields:
  | Field | Value |
  |---|---|
  | **Event** | `airtable_form_lead` |
  | **Details** | type `Lead `, insert **Lead Name**, type ` (`, insert **Phone**, type `) captured via Airtable form. Task created.` |
  | **Status** | `ok` |

### Action 3 — Send email

- Action: **Send email**.
- **To:** `operations@a1creativeagency.com`
- **Subject:** type `New lead: ` then insert **Lead Name**.
- **Message:** insert tokens, one per line — **Lead Name**, **Phone**,
  **Email**, **Source**, **Notes**.

3. **Test automation** end-to-end → confirm a Task row, a Log row, and the
   email all appear → toggle the automation **ON**.

> Free-plan note: Airtable Free allows 100 automation runs/month — fine for
> launch volume. If leads scale, move the email to the Vercel backend.

---

## Part C — Optional: defaults inside the automation (if Part A won't work)

Only needed if a field can't hold a table-level default value. Add these as
the **first** steps of the automation, before Action 1, still no script:

1. **Find records** → Table **Leads**, where **Record ID** *is* the trigger
   record's ID (insert the **Airtable record ID** token). This lets later
   steps read the current values.
2. **Conditional logic** group → *If* **lead_status** *is empty* →
   **Update record** (Leads, the trigger record) → set **lead_status = New Lead**.
3. Add another **Conditional logic** group → *If* **Source** *is empty* →
   **Update record** → set **Source = `A1 Creative Intake Form`**.

The *Conditional logic* and *Update record* actions are standard no-code
blocks. (Conditional groups require a plan that includes them; if yours
doesn't, stick with Part A's field defaults.)

---

## Before turning it on, verify in the base

- `Leads.lead_status` (single select) has an option **New Lead**. The website
  backend writes `new` — pick one spelling so the pipeline uses a single value.
- `Tasks` table exists with fields `Name`, `Status` (option `To Do`), `Notes`.
- `Automation Logs` table exists with fields `Event`, `Details`, `Status`.
- The Leads email field is named exactly as it appears when you insert its
  token (the website backend uses `Email ` with a trailing space — confirm
  which one your form writes to).

## Which version should I use?

| | `airtable-automation.md` (script) | this file (no-code) |
|---|---|---|
| Edited by | someone comfortable with JS | anyone on the team |
| "Default when blank" | inside the script | field defaults (Part A) |
| Steps | 2 (script + email) | 3 create/email actions |
| Behavior | identical | identical |

Pick one — don't run both on the same Leads table or you'll double-create
Tasks and Logs.
