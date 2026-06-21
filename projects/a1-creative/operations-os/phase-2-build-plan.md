# A1 Creative Operations Agent — Phase 2 Implementation Plan

> **Status:** PLAN FOR APPROVAL. No build performed in this document. No PR.
> **Date:** 2026-06-21.
> **Predecessor:** `phase-1-architecture.md` (approved, conditional).
> **Gate:** Build begins only after this plan is approved.

## Locked decisions honored by this plan

1. `source_event_id` exists on every operational table.
2. `brand` exists on every operational table.
3. `Inbox_Events` is the single front door for all inbound activity.
4. The live stack is absorbed deliberately — additive, flag-gated, reversible.
5. **No code path creates a Lead or Task before creating/checking an
   `Inbox_Events` record first** (enforced in the ingestion layer, §3).

## Build order (locked — implemented in exactly this sequence)

1. Create/verify Airtable tables and fields.
2. Build `Inbox_Events` ingestion layer.
3. Add deduplication gate using `source_event_id`.
4. Route brand by phone / domain / mailbox / form source.
5. Migrate lead creation (only after Inbox_Events is stable).
6. Migrate task creation.
7. Add escalation logic.
8. Add Daily_Report generation.

Each step ships and is verified before the next begins. A step never writes
ahead of the front door.

---

## 1. Files that will be touched

### New files

| File | Purpose | Build step |
|---|---|---|
| `api/_lib/brand.js` | Single source of truth for brand routing (`deriveBrand`). | 4 |
| `api/_lib/inbox.js` | `Inbox_Events` ingestion + dedup gate (`ingestEvent`, `findEventBySourceId`). The only sanctioned way to record inbound activity. | 2–3 |
| `api/_lib/ids.js` | `source_event_id` derivation per channel + normalization helpers (E.164 phone, content-hash idempotency for forms). | 2–3 |
| `projects/a1-creative/operations-os/airtable-setup.md` | Click-path + field list to create/verify the 5 tables (supersedes the old single-table note for new tables). | 1 |

### Modified files (additive, flag-gated — legacy path preserved)

| File | Change | Build step |
|---|---|---|
| `api/_lib/airtable.js` | Add generic `airtableFind(table, formula)` (list + `filterByFormula`); add env table names for `Inbox_Events`, `Escalations`, `Daily_Reports`; add `createEscalation`, `upsertDailyReport`. Keep `createLead`/`createTask`/`logAutomation` unchanged. | 2,7,8 |
| `api/submit-lead.js` | Reorder to: `ingestEvent()` (Inbox first, dedup) → promote to Lead → Task. Add `a1suppliers.org` origins to CORS. Gated by `INBOX_ENABLED`; falls back to current behavior when off. | 2–6 |
| `api/twilio/missed-call.js` | `ingestEvent()` with `CallSid` → promote Lead → Task. Same flag/fallback. Add `Missed-Call Recovery Failure` escalation when recovery SMS fails. | 2–7 |
| `api/twilio/voicemail.js` | Record voicemail as an `Inbox_Events` row (`RecordingSid`/`CallSid-vm`). | 2 |
| `api/twilio/voice.js` | Record inbound call as an `Inbox_Events` row (`CallSid`); derive brand from the dialed number (`To`). | 2,4 |
| `api/_lib/notify.js` | Make notifications brand-aware: route ops email + alert identity per brand (A1 → operations@a1creativeagency.com; A/1 Suppliers → info@ / Shuri@a1suppliers.org). Backward-compatible default. | 4–6 |
| `BACKEND.md` | Update wiring/audit to reflect the front-door flow. | end |

### Out of scope for Phase 2 (explicitly not touched)

AI qualification, Chief of Staff, payment automation (PayPal/Stripe), Calendly,
Outlook ingestion, any whole-repo rewrite. No PR until this plan is approved.

---

## 2. Airtable tables affected

| Table | Action in Phase 2 |
|---|---|
| `Inbox_Events` | **Create** (new front door). Fields per Phase 1 §1.1. |
| `Leads` | **Extend** (additive): add `source_event_id`, `brand`, `linked_event`, clean `email`/`phone`. Keep legacy `Lead Name`/`Email `/`Client` until cutover proven. |
| `Tasks` | **Extend** (additive): add `source_event_id`, `brand`, `related_lead`. Keep `Name`/`Status`/`Notes`. |
| `Escalations` | **Create** (step 7). |
| `Daily_Reports` | **Create** (step 8). |
| `Automation Logs` | Unchanged; continues as the run log. |

**Field changes are additive only.** No renames or deletes in Phase 2.
Trailing-space legacy fields (`Email `, `Source` value `Website form `) stay
live and untouched; new clean fields are written in parallel and backfilled.

---

## 3. Ingestion layer & dedup gate (the heart of the build)

`api/_lib/inbox.js` exposes one entry point used by every channel:

```
ingestEvent({ sourceEventId, eventType, sourcePlatform, brandSignals,
              contact, message, raw }) → { event, deduped }
```

Order of operations (enforces locked rule #5):

```
1. require sourceEventId  → throw if missing (no id, no record — ever)
2. deriveBrand(brandSignals)            (api/_lib/brand.js)
3. findEventBySourceId(sourceEventId)   (airtableFind, filterByFormula)
       ├─ found    → return { event: existing, deduped: true }   (STOP)
       └─ not found→ create Inbox_Events row (status=New) → continue
4. caller may then promote → Lead → Task, passing the same sourceEventId
```

`source_event_id` derivation per channel (`api/_lib/ids.js`):

| Channel | id source |
|---|---|
| Twilio inbound call | `CallSid` |
| Twilio missed call | `CallSid` |
| Twilio voicemail | `RecordingSid` (fallback `CallSid + '-vm'`) |
| Twilio SMS | `MessageSid` |
| Website form | client `submissionId` (UUID held in form state across re-clicks); server fallback = sha256 of `brand|email|phone|normalized-message` bucketed to the minute |
| Manual | `manual_<table>_<ts>` |

Promotion (step 5) does **match-or-create on Lead**: search `Leads` by
`phone`/`email` **within the same brand**; attach if found, else create with
`lead_status=New`, `source_event_id`, `brand`, `linked_event`.

---

## 4. Brand routing (`api/_lib/brand.js`)

`deriveBrand({ toPhone, fromEmail, mailbox, originHost })` → exactly one of
`A1 Creative` / `A/1 Suppliers`.

| Signal | A1 Creative | A/1 Suppliers |
|---|---|---|
| Dialed number (`To`) | `+15134403329` | `+15138667141` |
| Email domain / mailbox | `a1creativeagency.com`, `operations@…` | `a1suppliers.org`, `info@…`, `Shuri@…` |
| Form origin host | `a1creativeagency.com` | `a1suppliers.org` |

Resolution: first matching signal wins, checked in order phone → mailbox/domain
→ origin host. **No match → default `A1 Creative`** + a low-priority review Task
+ an `Automation Logs` warning (never silently guess). Brand is decided once at
ingestion and inherited by the promoted Lead/Task/Escalation — children never
re-derive it.

---

## 5. Migration order (steps 5–8, after the front door is stable)

1. **Leads (step 5):** `submit-lead.js` and `missed-call.js` create the
   `Inbox_Events` row first, then promote. Dual-write clean + legacy lead fields
   so existing views/automations keep working. Verify parity before step 6.
2. **Tasks (step 6):** task creation moves behind promotion (always tied to a
   Lead that came from an event). Same dual-write.
3. **Escalations (step 7):** add the escalation evaluator (Phase 1 §4.5 table).
   First live rule wired: `Missed-Call Recovery Failure` when the recovery SMS
   fails. Others (Legal/Contract/Refund/VIP/etc.) are rule stubs — payment-
   sourced ones stay dormant (no payment automation yet).
4. **Daily_Reports (step 8):** scheduled rollup, one row per brand per day,
   keyed `report_<brand>_<date>` (idempotent upsert).

---

## 6. Rollback plan

Reversibility is designed in, at three levels:

1. **Feature flag.** `INBOX_ENABLED` (default `false` until cutover). Off = every
   modified handler runs its **current** code path verbatim. Flip a single env
   var to revert behavior with no deploy.
2. **Additive-only schema.** No fields renamed or deleted; legacy fields keep
   receiving writes during transition. Disabling the flag leaves the base fully
   functional on the old fields.
3. **Git.** Each build step is its own commit; `git revert` of a step restores
   the prior state. Branch `claude/vibrant-carson-wrvdcx`; no PR/merge until
   approved.

Per-step rollback: if step N regresses, set `INBOX_ENABLED=false` (instant) and
revert step N's commit; steps 1..N-1 remain safely shipped because each was
verified independently.

---

## 7. Test cases

### 7.1 Core / compatibility

| # | Scenario | Expected |
|---|---|---|
| C1 | Website form submit (A1) | 1 Inbox_Events (New), 1 Lead (brand A1), 1 Task, ops email to operations@, log `ok` |
| C2 | Missed call to +15134403329 | Inbox_Events (Call), recovery SMS, Lead+Task, owner SMS + ops email |
| C3 | Voicemail left | Inbox_Events (RecordingSid), alert + log; no duplicate Lead from the same call |
| C4 | `INBOX_ENABLED=false` | Behavior identical to today (legacy path) — no Inbox writes |
| C5 | Missing `source_event_id` | `ingestEvent` throws; **no** Inbox/Lead/Task created; logged |

### 7.2 Duplicate-prevention test (must pass)

| # | Scenario | Expected |
|---|---|---|
| D1 | Same form posted twice, same `submissionId` (double-click) | Exactly **1** Inbox_Events + **1** Lead; 2nd call returns `deduped:true` |
| D2 | Twilio retries `missed-call` webhook (same `CallSid`) | Exactly **1** Inbox_Events row; no duplicate Lead/Task |
| D3 | Same caller phones twice on different days (different `CallSid`) | 2 Inbox_Events, but **1** Lead (match-or-create on phone+brand), 2 Tasks |
| D4 | Daily report re-run for same brand/day | Upsert — same `report_<brand>_<date>` row, not a duplicate |

### 7.3 Brand-routing test (must pass)

| # | Scenario | Expected brand |
|---|---|---|
| B1 | Form origin `a1creativeagency.com` | A1 Creative |
| B2 | Form origin `a1suppliers.org` | A/1 Suppliers |
| B3 | Call dialed to `+15138667141` | A/1 Suppliers |
| B4 | Inbound email from `info@a1suppliers.org` | A/1 Suppliers |
| B5 | Email to `operations@a1creativeagency.com` | A1 Creative |
| B6 | No usable signal | A1 Creative (default) + review Task + warning log |
| B7 | A/1 Suppliers lead | never appears in an A1-Creative-filtered view (no contamination) |

---

## 8. Existing live-stack compatibility risks

| Risk | Detail | Mitigation in this plan |
|---|---|---|
| Trailing-space fields | `Email `, `Source` value `Website form ` are load-bearing in `api/` | Leave untouched; dual-write clean `email` in parallel; cut over only after parity |
| Status drift | code writes `lead_status=new`; fallback expects `New Lead`; tasks `To Do` | Standardize on spec option sets via Airtable `typecast`; legacy values still accepted during transition |
| No id on legacy rows | existing records have no `source_event_id` | Backfill where recoverable; else `legacy_<recordId>` so the column is non-null |
| CORS | `submit-lead.js` allows only A1 origins | Add `a1suppliers.org` (+ `www`) to `ALLOWED_ORIGINS` in step 4 |
| Brand-blind notifications | single `operations@` recipient | `notify.js` becomes brand-aware (A/1 → info@/Shuri@) without breaking the A1 default |
| SMS sender per brand | one Twilio number today (+15134403329) | A1 sends as today; A/1 Suppliers outbound SMS deferred until its number/A2P is confirmed — recovery SMS for A/1 logged as pending, not silently failed |
| Airtable Free 100 runs/mo | scheduled report + promotion automations | Keep promotion inline in Vercel (no Airtable automation run cost); only the daily report uses a scheduled run |
| A2P 10DLC | unverified → texts filtered | Verify per BACKEND.md; recovery-SMS failure raises `Missed-Call Recovery Failure` escalation |
| Test pollution | one shared base | Use a `Test` brand value / sandbox for E2E; never assert against prod rows |

---

## 9. Definition of done (Phase 2)

- 5 tables exist with `source_event_id` + `brand` on every operational table.
- All inbound channels write through `Inbox_Events` first; dedup gate proven
  (tests D1–D4 green).
- Brand routing proven (B1–B7 green) with zero cross-brand contamination.
- Lead → Task → Escalation → Daily_Report migrated in order, each verified.
- Legacy behavior fully restorable via `INBOX_ENABLED=false`.
- `BACKEND.md` updated; build documented commit-by-commit.

**Awaiting approval of this plan before any build begins.**
