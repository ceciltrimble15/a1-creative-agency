# Phase 2 · Step 1 — Airtable Table & Field Setup (build contract)

> **Build step 1 of 8.** This is the authoritative field contract. Every later
> step (ingestion, dedup, brand routing, migrations) writes against the names,
> types, and option sets defined here. Additive-only against the live base.
>
> **Execution note:** physical creation/verification happens *inside the
> Airtable base* (Automations/fields are configured in Airtable, not in this
> repo). This file is the spec to create against and the checklist to verify.
> See the open decision in the Step 1 report (Airtable plan / record ceiling)
> before treating the base as final.

## Conventions (apply to all tables)

- **`source_event_id`** — Single line text. Present on every operational table.
  No record without it. This is the dedup key.
- **`brand`** — Single select, exactly two options: `A1 Creative`,
  `A/1 Suppliers`. Present on every operational table. Set once at ingestion.
- **Phone** — store E.164 (`+15134403329`, `+15138667141`).
- **Statuses** — closed option sets exactly as listed. No ad-hoc values.
- **No renames or deletes** of existing live fields in this step.

---

## A. NEW table — `Inbox_Events`

| Field | Type | Options / notes |
|---|---|---|
| `source_event_id` | Single line text | **Primary field.** Unique dedup key. |
| `event_type` | Single select | `Form`, `Call`, `SMS`, `Email`, `Booking`, `Payment`, `Other` |
| `source_platform` | Single select | `Website`, `Twilio`, `Outlook`, `Calendly`, `PayPal`, `Stripe`, `Manual` |
| `date_received` | Date (incl. time) | |
| `contact_name` | Single line text | |
| `business_name` | Single line text | |
| `phone` | Phone number | E.164 |
| `email` | Email | |
| `message` | Long text | |
| `brand` | Single select | `A1 Creative`, `A/1 Suppliers` |
| `linked_lead` | Link → `Leads` | set on promotion |
| `status` | Single select | `New`, `Processed`, `Archived` (default `New`) |
| `processed_at` | Date (incl. time) | set when status → Processed |
| `raw_payload` | Long text | original JSON payload for audit/replay |

## B. NEW table — `Escalations` (created in step 7, defined now)

| Field | Type | Options / notes |
|---|---|---|
| `escalation_id` | Formula/Autonumber | **Primary.** e.g. `A1-E-000123` |
| `source_event_id` | Single line text | |
| `escalation_type` | Single select | `Legal`, `Contract`, `Chargeback`, `Refund Request`, `VIP Prospect`, `Partnership`, `System Failure`, `Missed-Call Recovery Failure` |
| `related_lead` | Link → `Leads` | |
| `description` | Long text | |
| `priority` | Single select | `Low`, `Medium`, `High`, `Critical` |
| `assigned_to` | Single select / Collaborator | default CEO |
| `escalation_status` | Single select | `New`, `Sent`, `Acknowledged`, `In Progress`, `Resolved`, `Closed`, `False Alarm` |
| `created_date` | Date (incl. time) | |
| `acknowledged_date` | Date (incl. time) | |
| `resolved_date` | Date (incl. time) | |
| `brand` | Single select | `A1 Creative`, `A/1 Suppliers` |

## C. NEW table — `Daily_Reports` (created in step 8, defined now)

| Field | Type | Options / notes |
|---|---|---|
| `source_event_id` | Single line text | **Primary.** Deterministic: `report_<brand>_<YYYY-MM-DD>` |
| `report_date` | Date | |
| `brand` | Single select | `A1 Creative`, `A/1 Suppliers` |
| `new_leads` | Number | |
| `qualified_leads` | Number | |
| `proposals_sent` | Number | |
| `deals_won` | Number | |
| `deals_lost` | Number | |
| `open_tasks` | Number | |
| `critical_tasks` | Number | |
| `escalations_created` | Number | |
| `revenue_pipeline` | Currency (USD) | |
| `notes` | Long text | |

---

## D. EXTEND existing `Leads` (additive — do not rename/delete live fields)

Keep all current fields (`Lead Name`, `Phone`, `Email ` *(trailing space)*,
`lead_status`, `Source`, `Client`, `Notes`, `date`). **Add:**

| Field | Type | Options / notes |
|---|---|---|
| `source_event_id` | Single line text | dedup key from originating event |
| `brand` | Single select | `A1 Creative`, `A/1 Suppliers` (migrated from `Client`) |
| `email` | Email | clean field, no trailing space (parallel to `Email `) |
| `linked_event` | Link → `Inbox_Events` | |
| `linked_tasks` | Link → `Tasks` | |
| `lead_id` | Formula/Autonumber | `A1-L-000123` |

`lead_status` option set to standardize on (add missing, keep legacy values
accepted during transition): `New`, `Contacted`, `Qualified`, `Proposal Sent`,
`Negotiating`, `Won`, `Lost`, `Nurture`.

## E. EXTEND existing `Tasks` (additive)

Keep `Name`, `Status`, `Notes`. **Add:**

| Field | Type | Options / notes |
|---|---|---|
| `task_id` | Formula/Autonumber | `A1-T-000123` |
| `source_event_id` | Single line text | |
| `brand` | Single select | `A1 Creative`, `A/1 Suppliers` (inherited from lead) |
| `related_lead` | Link → `Leads` | |
| `priority` | Single select | `Low`, `Medium`, `High`, `Critical` |

`Status` option set to standardize on: `Open`, `In Progress`, `Waiting`,
`Completed`, `Cancelled` (legacy `To Do` kept/aliased during transition).

## F. `Automation Logs` — unchanged (`Event`, `Details`, `Status`).

---

## Verification checklist (run in the base before Step 2 code lands)

- [ ] `Inbox_Events`, `Escalations`, `Daily_Reports` exist with the fields above.
- [ ] `source_event_id` present on all 5 operational tables; it is the primary
      field on Inbox_Events / Daily_Reports.
- [ ] `brand` single-select (exactly the two values) present on all 5 tables.
- [ ] Link fields wired both directions (Inbox↔Leads, Leads↔Tasks,
      Leads↔Escalations).
- [ ] Standardized `lead_status` / Tasks `Status` options exist; legacy values
      not deleted.
- [ ] A "Duplicate audit" grid view on Inbox_Events grouped by
      `source_event_id` (count > 1 surfaces leaks) — detective control.
- [ ] Per-brand filtered views confirm no cross-brand records appear.

## Uniqueness reality (important)

Airtable does **not** enforce unique fields. `source_event_id` uniqueness is
guaranteed by the ingestion dedup gate (Step 3, code), **not** by the column.
The "Duplicate audit" view is the backstop. Do not rely on Airtable to reject a
duplicate id.
