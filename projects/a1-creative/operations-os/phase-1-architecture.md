# A1 Creative Operations Agent — Phase 1 Architecture

> **Status:** DESIGN FOR APPROVAL. No automations are built in this phase.
> **Author:** Operations build (Phase 1 specification).
> **Date:** 2026-06-21.
> **Scope:** Airtable schema, relationships, field documentation, automation
> architecture, integration roadmap, and a duplicate-prevention / risk plan.

This document is the operational backbone design for A1 Creative Agency. Every
lead, call, form, SMS, email, booking, payment, and task enters one centralized
system and becomes a trackable opportunity. The build prioritizes
**reliability, simplicity, scalability, and automation** — in that order.

---

## 0. Grounding — what already runs in production

This is not a greenfield base. A live intake stack already exists in this repo
and writes to a production Airtable base. The Phase 1 schema is designed to
**absorb** that stack without breaking it, then migrate it onto the clean model.

| Live component | File | Writes to Airtable |
|---|---|---|
| Website lead capture | `api/submit-lead.js` | `Leads` + `Tasks` + `Automation Logs` |
| Missed-call recovery | `api/twilio/missed-call.js` | `Leads` + `Tasks` + `Automation Logs` |
| Voicemail handling | `api/twilio/voicemail.js` | `Automation Logs` (+ alerts) |
| Call routing / greeting | `api/twilio/voice.js` | `Automation Logs` |
| Airtable form fallback | `projects/a1-creative/airtable-automation.md` | `Leads` + `Tasks` + `Automation Logs` |
| Notifications | `api/_lib/notify.js` | Resend email → operations@, Twilio SMS → OWNER_CELL |

**Current live tables and fields (as coded today):**

- **Leads:** `Lead Name`, `Phone`, `Email ` *(trailing space — real)*,
  `lead_status` *(only ever written as `new`)*, `Source` *(value `Website form `
  has a trailing space)*, `Client` *(holds the brand string, e.g.
  "A1 Creative Agency")*, `Notes`, `date`.
- **Tasks:** `Name`, `Status` *(written as `To Do`)*, `Notes`.
- **Automation Logs:** `Event`, `Details`, `Status`.

**Key gaps the Phase 1 schema must close:**

1. **No `source_event_id` anywhere.** Today nothing carries a dedup key. A
   double form submit or a retried Twilio webhook creates duplicate leads.
2. **Brand separation is informal.** Brand lives in a free-text `Client` field,
   not a controlled value — cross-brand contamination is possible.
3. **Status drift.** Code writes `lead_status = new`; the Airtable fallback
   script expects `New Lead`; Tasks use `To Do` not the spec's `Open`.
4. **Field-name hazards.** `Email ` and `Source` value `Website form ` carry
   trailing spaces. These are load-bearing in the current code and must be
   handled deliberately during migration.
5. **No single front door.** Ingestion writes straight to `Leads`/`Tasks`.
   There is no `Inbox_Events` layer, so there is no single, auditable,
   dedup-gated entry point.

> **Migration principle:** the live stack keeps working untouched in Phase 1.
> We *add* the new tables and fields, backfill, then cut the code over to the
> `Inbox_Events` front door in Phase 2 (see §5). Nothing in `api/` is edited in
> Phase 1.

---

## 1. Complete Airtable schema

Five tables. Two universal columns appear on **every** table:

- **`source_event_id`** — the master deduplication key (Universal Data Rule).
- **`brand`** — single select, enforces brand separation (Brand Separation Rule).

Legend: **PK** = primary field · **U** = should be unique · type names are
Airtable field types.

### 1.1 `Inbox_Events` — the single front door

Every inbound event lands here first, before it becomes a Lead/Task/Escalation.

| Field | Type | Required | Options / Notes |
|---|---|---|---|
| `source_event_id` | Single line text **(U)** | Yes | **PK.** Master dedup key. Raw external id (Twilio SID, Outlook Message-ID, form submission id, Calendly/PayPal/Stripe id). No record is created without it. |
| `event_type` | Single select | Yes | `Form`, `Call`, `SMS`, `Email`, `Booking`, `Payment`, `Other` |
| `source_platform` | Single select | Yes | `Website`, `Twilio`, `Outlook`, `Calendly`, `PayPal`, `Stripe`, `Manual` |
| `date_received` | Date (incl. time) | Yes | Defaults to event timestamp; falls back to created time |
| `contact_name` | Single line text | No | |
| `business_name` | Single line text | No | |
| `phone` | Phone number | No | Store E.164 (`+15134403329`) for clean matching |
| `email` | Email | No | |
| `message` | Long text | No | Raw payload / transcript / body |
| `brand` | Single select | Yes | `A1 Creative`, `A/1 Suppliers` |
| `linked_lead` | Link → `Leads` | No | Set when the event is matched/promoted to a Lead |
| `status` | Single select | Yes | `New`, `Processed`, `Archived` (default `New`) |
| `processed_at` | Date | No | *(add)* set when status → Processed; supports SLA reporting |
| `raw_payload` | Long text (JSON) | No | *(add)* full original payload for audit/replay |

### 1.2 `Leads` — master prospect/client record

| Field | Type | Required | Options / Notes |
|---|---|---|---|
| `lead_id` | Formula or Autonumber **(U)** | Yes | **PK.** Human ID, e.g. `A1-L-000123` (see §6.2) |
| `source_event_id` | Single line text **(U)** | Yes | Originating event's dedup key |
| `company_name` | Single line text | No | |
| `contact_name` | Single line text | Yes | |
| `email` | Email | No | Clean field (no trailing space — see migration §6.4) |
| `phone` | Phone number | No | E.164 |
| `website` | URL | No | |
| `service_interest` | Single select / multi-select | No | `Website`, `Branding`, `Automation`, `Lead System`, `Supplies`, `Other` |
| `estimated_value` | Currency (USD) | No | Pipeline value |
| `lead_status` | Single select | Yes | `New`, `Contacted`, `Qualified`, `Proposal Sent`, `Negotiating`, `Won`, `Lost`, `Nurture` |
| `lead_owner` | Single select / Collaborator | No | CEO / team member |
| `linked_tasks` | Link → `Tasks` | No | One lead → many tasks |
| `linked_event` | Link → `Inbox_Events` | No | *(add)* reverse of `Inbox_Events.linked_lead` for traceability |
| `linked_escalations` | Link → `Escalations` | No | *(add)* reverse of `Escalations.related_lead` |
| `brand` | Single select | Yes | `A1 Creative`, `A/1 Suppliers` |
| `notes` | Long text | No | |

### 1.3 `Tasks` — actions for team / CEO

| Field | Type | Required | Options / Notes |
|---|---|---|---|
| `task_id` | Formula or Autonumber **(U)** | Yes | **PK.** e.g. `A1-T-000123` |
| `source_event_id` | Single line text | Yes | Originating event's dedup key |
| `task_title` | Single line text | Yes | |
| `task_type` | Single select | No | `Call Back`, `Follow Up`, `Proposal`, `Onboarding`, `Admin`, `Other` |
| `assigned_to` | Single select / Collaborator | No | |
| `priority` | Single select | Yes | `Low`, `Medium`, `High`, `Critical` |
| `due_date` | Date | No | |
| `related_lead` | Link → `Leads` | No | Many tasks → one lead |
| `status` | Single select | Yes | `Open`, `In Progress`, `Waiting`, `Completed`, `Cancelled` |
| `brand` | Single select | Yes | `A1 Creative`, `A/1 Suppliers` *(roll-up from lead, set on create)* |

### 1.4 `Escalations` — urgent leadership items

| Field | Type | Required | Options / Notes |
|---|---|---|---|
| `escalation_id` | Formula or Autonumber **(U)** | Yes | **PK.** e.g. `A1-E-000123` |
| `source_event_id` | Single line text | Yes | Originating event's dedup key |
| `escalation_type` | Single select | Yes | `Legal`, `Contract`, `Chargeback`, `Refund Request`, `VIP Prospect`, `Partnership`, `System Failure`, `Missed-Call Recovery Failure` |
| `related_lead` | Link → `Leads` | No | |
| `description` | Long text | Yes | |
| `priority` | Single select | Yes | `Low`, `Medium`, `High`, `Critical` |
| `assigned_to` | Single select / Collaborator | No | Defaults to CEO |
| `escalation_status` | Single select | Yes | `New`, `Sent`, `Acknowledged`, `In Progress`, `Resolved`, `Closed`, `False Alarm` |
| `created_date` | Date (incl. time) | Yes | |
| `acknowledged_date` | Date (incl. time) | No | |
| `resolved_date` | Date (incl. time) | No | |
| `brand` | Single select | Yes | `A1 Creative`, `A/1 Suppliers` |

### 1.5 `Daily_Reports` — CEO visibility

One row per **brand per day** (brand separation extends to reporting). A
combined executive view aggregates both brands (see §4.6).

| Field | Type | Required | Options / Notes |
|---|---|---|---|
| `source_event_id` | Single line text **(U)** | Yes | **PK.** Deterministic: `report_<brand>_<YYYY-MM-DD>` (satisfies the Universal Data Rule and prevents duplicate daily rows) |
| `report_date` | Date | Yes | |
| `brand` | Single select | Yes | `A1 Creative`, `A/1 Suppliers` *(add — required for per-brand reporting)* |
| `new_leads` | Number | Yes | Count of Leads created that day for the brand |
| `qualified_leads` | Number | Yes | |
| `proposals_sent` | Number | Yes | |
| `deals_won` | Number | Yes | |
| `deals_lost` | Number | Yes | |
| `open_tasks` | Number | Yes | |
| `critical_tasks` | Number | Yes | Tasks with priority `Critical` not yet `Completed` |
| `escalations_created` | Number | Yes | |
| `revenue_pipeline` | Currency (USD) | Yes | Σ `estimated_value` of open leads |
| `notes` | Long text | No | |

> **Note on additions:** fields marked *(add)* are not in the original spec but
> are required to satisfy the spec's own Universal Data Rule (`source_event_id`
> on every table), Brand Separation Rule (`brand` on every table and on
> reports), and basic auditability. They are minimal and flagged for approval.

---

## 2. Relationship map

```
                         ┌──────────────────────┐
                         │     Inbox_Events     │  ← single front door
                         │  (every inbound hit) │     dedup gate on
                         └──────────┬───────────┘     source_event_id
                                    │ linked_lead (many events → 1 lead)
                                    ▼
                         ┌──────────────────────┐
              ┌──────────┤        Leads         ├──────────┐
              │          │ (master prospect/    │          │
              │          │     client record)   │          │
              │          └──────────┬───────────┘          │
   related_lead│ (N tasks → 1 lead) │ related_lead         │ linked_event
              ▼                     ▼ (N escalations→1 lead)▲
     ┌─────────────────┐  ┌────────────────────┐           │
     │      Tasks      │  │     Escalations    │           │
     │ (team/CEO work) │  │ (leadership items) │           │
     └─────────────────┘  └────────────────────┘           │
                                                            │
     ┌────────────────────────────────────────────────────┘
     │
     ▼
  ┌────────────────────┐
  │    Daily_Reports   │  rollup only — no link fields.
  │ 1 row / brand / day│  aggregates Leads, Tasks, Escalations
  └────────────────────┘  by brand + report_date.
```

**Cardinalities**

| Relationship | Direction | Cardinality |
|---|---|---|
| `Inbox_Events.linked_lead → Leads` | event → lead | many-to-one |
| `Leads.linked_tasks ↔ Tasks.related_lead` | lead ↔ task | one-to-many |
| `Leads.linked_escalations ↔ Escalations.related_lead` | lead ↔ escalation | one-to-many |
| `Leads.linked_event → Inbox_Events` | lead → event | one-to-one (origin) |
| `Daily_Reports` | none (computed rollup) | — |

**Brand is a partition, not a relationship.** Every record carries `brand`, and
every query/automation/report filters on it. Records never cross brands; only
the executive dashboard view reads across both.

---

## 3. Field documentation (cross-cutting conventions)

- **`source_event_id` (all tables, master dedup key).** Raw, stable external
  identifier. Required on every record; no automation may create a record
  without it. Sources:
  - Twilio Call → `CallSid` · Twilio SMS → `MessageSid`
  - Outlook → `Internet-Message-ID` (preferred) or Graph `id`
  - Website form → server-generated submission id (UUID per POST)
  - Calendly → event `uuid` · PayPal → `txn_id` · Stripe → event `id`
  - Manual entry → `manual_<table>_<timestamp>_<initials>`
- **`brand` (all tables).** Controlled single select, exactly two values:
  `A1 Creative`, `A/1 Suppliers`. Set at ingestion from the routing rule
  (domain, phone number, mailbox) and **inherited** by child Leads/Tasks/
  Escalations. Never free text.
- **`phone` (all tables).** Store E.164 only. Normalize at ingestion so
  matching/dedup is reliable.
- **`status` family.** Each table has exactly one status field with a closed
  option set (listed per table in §1). No ad-hoc statuses.
- **IDs (`lead_id`, `task_id`, `escalation_id`).** Human-readable, prefixed,
  zero-padded (see §6.2). The Airtable record id is *not* used as the business
  id (it is opaque and not brand-aware).
- **Dates.** Store with time + timezone awareness; reports bucket by America/
  New_York (Cincinnati) day boundaries.

---

## 4. Recommended automation architecture

> Architecture only — **not built in Phase 1.** Documented here for approval so
> Phase 2 can implement against an agreed design.

Pipeline: **Capture → Qualify → Task → Follow-Up → Escalate → Report.**

### 4.1 Where automations run

A hybrid model that builds on what already exists:

- **Vercel serverless (`api/`)** — handles all *external* webhooks (Twilio,
  website forms, later Calendly/PayPal/Stripe, Outlook polling). It owns
  signature verification, brand routing, E.164 normalization, and the
  **dedup gate**. It writes the normalized event into `Inbox_Events`.
- **Airtable Automations** — handle *internal* record-driven workflows
  (event → lead promotion, task creation, escalation flagging, daily report
  rollup). These react to `Inbox_Events`/`Leads` record changes.

Rationale: keep untrusted, signed, rate-limited ingestion in code we control
(Vercel, already in place); keep business-rule workflows close to the data
(Airtable) where the CEO can see and tweak them. Watch the Airtable Free plan's
**100 automation runs/month** ceiling — see §6.

### 4.2 Stage 1 — Capture (→ `Inbox_Events`)

Every channel funnels through one normalizer:

```
Twilio / Website / Outlook / Calendly / PayPal / Stripe
        │  (webhook or poll)
        ▼
  Vercel ingestion endpoint
        │  1. verify signature / origin
        │  2. derive brand (routing rule §4.7)
        │  3. extract source_event_id (channel-specific)
        │  4. DEDUP GATE: does Inbox_Events already have this id?  → stop if yes
        │  5. normalize phone (E.164), names, message
        ▼
  Inbox_Events  (status = New)
```

### 4.3 Stage 2 — Qualify + Promote (→ `Leads`)

Airtable automation on `Inbox_Events` create:

1. Skip non-lead event types (e.g. pure payment receipts route to Escalations
   logic, not Leads).
2. **Match-or-create lead:** look for an existing `Leads` row with the same
   `phone`/`email` **and same `brand`**. If found, link to it; else create a new
   lead with `lead_status = New`, copying contact fields + `source_event_id`.
3. Set `Inbox_Events.linked_lead` and flip `status = Processed`,
   `processed_at = now`.
4. (Phase 4) AI qualification layer scores the lead and may set
   `service_interest` / `estimated_value` — see §5.

### 4.4 Stage 3 — Task creation (→ `Tasks`)

On new Lead (or new inbound event on an existing lead), create a `Tasks` row:
`task_type = Call Back`/`Follow Up`, `priority` from rules (missed call = High),
`related_lead` set, `status = Open`, `brand` inherited. This generalizes the
follow-up task already created today in `submit-lead.js` / `missed-call.js`.

### 4.5 Stage 4 — Follow-Up + Stage 5 — Escalate

- **Follow-Up:** time-based automation flags `Tasks` past `due_date` still
  `Open`, and pings the owner (reusing `notifyOps` / `alertOwner`).
- **Escalate:** an automation evaluates each event/lead against the escalation
  rules and creates an `Escalations` row + alert when matched:

  | Trigger | escalation_type | Default priority |
  |---|---|---|
  | Legal language / dispute | `Legal` | Critical |
  | Contract request/signature | `Contract` | High |
  | Chargeback notice (PayPal/Stripe) | `Chargeback` | Critical |
  | Refund request | `Refund Request` | High |
  | VIP prospect (rule/whitelist) | `VIP Prospect` | High |
  | Partnership inquiry | `Partnership` | Medium |
  | Webhook/automation error | `System Failure` | Critical |
  | Recovery text failed to send | `Missed-Call Recovery Failure` | High |

  New escalations start `escalation_status = New`, alert leadership (SMS +
  email), then move `Sent → Acknowledged → In Progress → Resolved/Closed`, with
  `acknowledged_date` / `resolved_date` stamped on transition.

### 4.6 Stage 6 — Report (→ `Daily_Reports`)

Scheduled Airtable automation (once daily, end of day America/New_York). For
**each brand**, upsert the `Daily_Reports` row keyed by
`report_<brand>_<date>` (the deterministic `source_event_id`), counting that
day's new/qualified leads, proposals, wins/losses, open & critical tasks,
escalations, and summing open-lead `estimated_value` into `revenue_pipeline`.
The **executive dashboard** is an Airtable interface/view that reads
`Daily_Reports` across both brands; underlying brand rows stay separate.

### 4.7 Brand routing rule (single source of truth)

| Signal | A1 Creative | A/1 Suppliers |
|---|---|---|
| Inbound domain / form | `a1creativeagency.com` | suppliers domain (TBD) |
| Phone number | `+15134403329` | suppliers line (TBD) |
| Mailbox | `operations@a1creativeagency.com` | suppliers mailbox (TBD) |

Brand is decided **once** at ingestion and inherited downstream. Unknown signals
default to `A1 Creative` and raise a low-priority review task. *(Confirm the
A/1 Suppliers domain/number/mailbox before Phase 2.)*

---

## 5. Future integration roadmap

| Phase | Integration | What it adds | Entry point |
|---|---|---|---|
| **1 (now)** | Schema + architecture | Tables, relationships, dedup & brand model | *this doc* |
| **2** | Cut existing stack over to `Inbox_Events` | Website + Twilio write to the front door with `source_event_id`; promotion/task/escalation/report automations live | `api/` + Airtable Automations |
| **3** | Outlook ingestion | Email inquiries → `Inbox_Events` (Message-ID dedup) | Graph poll / webhook → Vercel |
| **3** | Calendly | Booking requests → events + auto lead/task; booking links | Calendly webhook → Vercel |
| **4** | PayPal + Stripe | Payment notifications → events; chargeback/refund → auto escalation | Payment webhooks → Vercel |
| **4** | AI Qualification Layer | Score/route leads, draft replies, set `service_interest`/`estimated_value`, suggest priority | Airtable record → Vercel (Claude API) |
| **5** | Executive dashboard polish | Cross-brand interface, SLA & conversion analytics | Airtable Interfaces |

Each integration follows the same contract: **verify → derive brand → extract
`source_event_id` → dedup → write `Inbox_Events`.** No integration writes
directly to `Leads`/`Tasks`/`Escalations` after Phase 2.

---

## 6. Risk assessment & duplicate-prevention strategy

### 6.1 Duplicate prevention (the core risk)

Airtable does **not** enforce unique fields natively, so uniqueness is enforced
by process, not by the column:

1. **Single dedup key.** `source_event_id` on every table, sourced from the
   channel's own immutable id (§3). Never a value we invent at random per write.
2. **Dedup gate before create.** The ingestion layer (Vercel) queries
   `Inbox_Events` for the `source_event_id` *before* inserting. Match → update/
   ignore; no match → insert. This is the single most important guard against
   the current "double submit / retried webhook = duplicate lead" risk.
3. **Match-or-create on promotion.** Event→Lead promotion matches on
   `phone`/`email` + `brand` so repeat contacts attach to the existing lead
   instead of spawning new ones.
4. **Deterministic keys for rollups.** `Daily_Reports` uses
   `report_<brand>_<date>` so a re-run upserts the same row.
5. **Detective control.** A scheduled "duplicate audit" view groups by
   `source_event_id` (count > 1) and by `phone`+`brand`, surfacing any leaks for
   manual merge until/if the base moves to a plan with stricter controls.

### 6.2 Stable business IDs

Use a formula/autonumber to mint `A1-L-000123` / `A1-T-...` / `A1-E-...`. Do not
expose Airtable's internal `recXXXX` id as the business id; it is opaque and not
brand-aware.

### 6.3 Brand contamination risk

- Brand as a **controlled single select**, set once at ingestion, inherited by
  children — never re-typed.
- Every automation and report **filters by brand**; the only cross-brand surface
  is the read-only executive dashboard.
- **Risk:** today brand is free-text `Client`. Mitigation: migrate `Client` →
  `brand` single select with a mapping table; default unknowns to `A1 Creative`
  + review task.

### 6.4 Migration risks from the live base

| Risk | Detail | Mitigation |
|---|---|---|
| Trailing-space fields | `Email ` and `Source` value `Website form ` are load-bearing in `api/` code | Keep old fields during transition; add clean `email`/`source_platform`; backfill; cut code over in Phase 2; only then retire old fields |
| Status mismatch | Code writes `lead_status=new`; fallback script expects `New Lead`; tasks use `To Do` not `Open` | Standardize on the spec's option sets; add aliases temporarily via Airtable `typecast`; update code in Phase 2 |
| No `source_event_id` on existing rows | Current records can't dedup | Backfill `CallSid`/submission id where recoverable; else mint `legacy_<recordId>` so the column is non-null |
| Direct writes bypass front door | `submit-lead.js` / `missed-call.js` write `Leads`/`Tasks` directly | Acceptable in Phase 1 (untouched); Phase 2 repoints them at `Inbox_Events` |

### 6.5 Operational / platform risks

| Risk | Impact | Mitigation |
|---|---|---|
| Airtable Free = 100 automation runs/month | Reporting/promotion automations starve at volume | Keep heavy logic in Vercel; budget runs; upgrade plan when volume warrants |
| A2P 10DLC not approved | Twilio recovery texts silently filtered | Verify registration (per BACKEND.md); raise `Missed-Call Recovery Failure` escalation on send failure |
| Webhook retries / replays | Duplicate events | Dedup gate (§6.1) + signature verification (already in `twilio.js`) |
| Missing env vars (`AIRTABLE_*`, `RESEND_*`, `TWILIO_*`) | Silent no-ops | Existing code already degrades gracefully + logs; add a startup/health check in Phase 2 |
| Single base, no env separation | Test writes pollute prod | Use a `Test` brand value or a separate sandbox base for E2E tests |
| PII (phone/email/message) | Privacy exposure | Restrict base shares; least-privilege API tokens; avoid logging raw PII in `Automation Logs` |

### 6.6 What is explicitly NOT done in Phase 1

- No Airtable automations created.
- No changes to `api/` code.
- No live-base field renames/deletions (only additive plan documented).

Approve this architecture and Phase 2 will implement the `Inbox_Events` front
door, the promotion/task/escalation/report automations, and the migration of the
existing live stack onto this model.
