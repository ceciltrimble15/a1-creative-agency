# Phase 2A — Shadow-Mode Deployment Plan (for CEO review)

**Status: PLAN ONLY. Nothing in this document has been executed.**
No production change, no triggers installed, no fields created, no merge, no auto-send.

## What "shadow mode" means here
The agent runs the full pipeline **capture → classify → summarize → draft → route → escalate → log**
but the **send step is switched off**. Operators read the agent's draft and routing next to the
real email and score accuracy. No customer ever receives an agent-influenced reply during shadow.

| Capability | Shadow mode |
|---|---|
| Capture email → Inbox Queue | ON |
| Classify / summarize / draft / route | ON (writes AI Draft, never Final Copy) |
| Red → ACOS escalation (internal record) | ON (internal only; gives Cecil Red visibility) |
| **Send any reply** | **OFF** (`MANUAL_SEND_ENABLED=false`) |
| Auto-send | OFF (`AUTO_SEND_ENABLED=false`) |

Exit shadow → supervised sending only after the acceptance criteria below and a CEO sign-off
that flips a single switch (`MANUAL_SEND_ENABLED=true`). No code change to graduate.

---

## A. Airtable migration checklist (exact, in order)
Base **A1 Creative Agency Hub** `appvfR20qp1dh5bT0`. All fields additive, blank default — Phase 1
keeps working after each step. Field types/options are in `docs/phase2a/02-airtable-migration.md`.

- [ ] **0. Backup** — export the Inbox Queue as CSV before any change.
- [ ] **1. New table "Automation Logs"** — fields: Logged At (date+time), Function, Action, Record ID, Message ID, Result, Detail (long text), Agent Version.
- [ ] **2. Group A – Capture/Dedupe** — Gmail Message ID*, Capture State (Pending/Processing/Captured/Failed), Capture Attempt ID, Capture Error.  *(dedupe key)*
- [ ] **3. Group B – Agent** — Agent Status (Not Processed/Processing/Completed/Failed/Skipped), Agent Processed At, Agent Version, Agent Error, Processing Attempt ID, Processing Started At, Processing Completed At, Processing Attempts (number), Daily Limit Reached (checkbox), Confidence Score (number 0–100), Prompt Version, Original AI Output (long text).
- [ ] **4. Group C – Understanding** — Message Category (20 opts), Sender Type (12 opts), Response Required (checkbox), Detected Deadline (date), Urgency (Low/Normal/High/Critical), Risk Level (Low/Medium/High/Critical), Opportunity Value (None/Low/Medium/High), Sensitive Content (checkbox), PII Detected (checkbox), Masked Fields (long text), Model Payload Hash, Attachment Review Required (checkbox).
- [ ] **5. Group D – Routing** — Decision Tier (Green/Yellow/Red), Recommended Owner (Agent/Krisha/Cecil), Recommended Next Action (long text), Escalation Reason (long text), Green Denial Reason, Auto-Send Eligible (checkbox), CEO Review Required (checkbox), ACOS Escalated At (date+time).
- [ ] **6. Group E – Thread risk** — Thread Risk Floor (Green/Yellow/Red), Thread Red Reason (long text), Thread Risk Set At (date+time), Thread Risk Override (checkbox), Thread Risk Override By.
- [ ] **7. Group F – Draft/Approval** — AI Draft (long text), AI Draft Last Modified (date+time), Final Copy Last Modified (date+time), Human Edited (checkbox), Human Editor, Approval Authority Required (Krisha/Cecil), Approved By, Approved By Email (email), Approved At (date+time), Draft Approved At (date+time).
- [ ] **8. Group G – Follow-up** — Outcome (Open/Replied/Won/Lost/No Response/Closed), Closed At (date+time), Follow-Up Status (None/Scheduled/Due/Overdue/Done), Last Follow-Up At (date+time), Next Follow-Up At (date+time), Post-Send Audit Required (checkbox).
- [ ] **9. Group H – Governance** — Reprocess Agent (checkbox), Reprocess Reason (long text), Model Validation Status (Unvalidated/Validated/Blocked), Model Validation Date (date), Model Approved By.
- [ ] **10. Verify** — Phase 1 still sends a manual test after the fields exist.

**Do not** rename or delete any existing field (Subject, From, Brand, Priority, Preview, Recommended Action, Approve / Edit / Reject, Final Copy, Send From, Sent At, Follow-Up Date, Gmail Thread ID, Status, Received At, AI Summary, Claude Draft, ACOS Ref).

---

## B. Required Script Properties (shadow values)
Set in the Apps Script project → Project Settings → Script properties. Secrets never go in source.

| Property | Shadow value | Note |
|---|---|---|
| `AIRTABLE_TOKEN` | *(secret)* | read/write Hub + ACOS |
| `AI_PROVIDER` | `anthropic` | |
| `AI_API_KEY` | *(secret)* | |
| `AI_MODEL` | `claude-sonnet-5` | |
| `MODEL_VALIDATED_FOR` | `claude-sonnet-5` | must equal `AI_MODEL` or processing blocks |
| `AGENT_VERSION` | `phase2a-shadow-1.0.0` | |
| `AGENT_ENABLED` | `true` | analysis on |
| `MANUAL_SEND_ENABLED` | **`false`** | **shadow: no sends** |
| `AUTO_SEND_ENABLED` | **`false`** | never true in Phase 2A |
| `CEO_APPROVER_EMAIL` | `cecil.trimble15@gmail.com` | Red approver |
| `GREEN_MIN_CONFIDENCE` | `95` | |
| `YELLOW_MIN_CONFIDENCE` | `75` | |
| `MAX_AGENT_RECORDS_PER_RUN` | `3` | |
| `DAILY_AGENT_CALL_LIMIT` | `50` | |
| `MODEL_TIMEOUT_SECONDS` | `60` | advisory (UrlFetchApp has no hard timeout) |
| `EXECUTION_TIME_BUDGET_SECONDS` | `240` | |
| `POST_SEND_AUDIT_PERCENT` | `10` | inert during shadow (nothing sends) |

---

## C. Deployment sequence (shadow)
Two isolation options — CEO picks one.

**Option A (recommended) — single project, send disabled.** Deploy the Phase 2A modules into the
existing `A1 Creative Email Spine` project during a short maintenance window; set
`MANUAL_SEND_ENABLED=false`. This also upgrades capture to the deduped version (the intended
end-state). Simplest; one source of truth.

**Option B (max isolation) — parallel shadow project.** A second Apps Script project bound to
operations@, reading a separate `A1C/Shadow-Intake` label, never sending. Phase 1 project is
untouched. Use if the CEO wants zero contact with the live project during shadow.

Sequence (Option A):
1. Run the **Airtable migration** (section A) — verify Phase 1 still green.
2. In a **separate test project**, paste all modules + `tests/`, run `runAllPhase2Tests()` → expect all pass. (Headless evidence already: 40/40.)
3. In the live project (maintenance window): add each module `.gs` file (not `tests/`).
4. Set **Script Properties** (section B) — confirm `MANUAL_SEND_ENABLED=false`, `AUTO_SEND_ENABLED=false`.
5. Run `validateModelConfiguration()` → expect `Validated`. Run `testAgentConnection()` → expect `{ok:true}`.
6. Run `installPhase2Triggers()` → confirm it reports Phase 1 retained + `analyzePendingEmails`/`processOverdueFollowUps` added, no duplicates.
7. Confirm no send trigger behavior: `sendApproved()` is present but every call returns `SEND_BLOCKED: MANUAL_SEND_DISABLED` (verify one Approved row is **not** sent).

---

## D. Test plan (for CEO review)
**Automated (already passing, reproducible):**
- `node google-apps-script/tests/headless-harness.cjs` → **40/40** (routing bands, Green/Yellow/Red, validation, guards, redaction, dedupe, locks, governance, no-resend, auto-send off).
- In-editor `runAllPhase2Tests()` on the deploy account (adds live Airtable/Gmail paths).

**Shadow live validation (the CEO-facing measurement):**
1. Seed **≥20 real A1 Creative emails** over the shadow window with `A1C/Intake` (include ≥3 obvious Red: refund/contract/legal, ≥3 Yellow leads, a few routine Green candidates, and 1 with a fake SSN/card to prove redaction).
2. For each, Krisha records: agent Category/Sender/Tier vs. correct; draft usable Y/N; any correction.
3. Confirm: 1 row per message (no duplicates), Red rows escalate to ACOS, PII masked in `Masked Fields` with originals absent from logs, `AUTO_SEND_ENABLED` still false, **zero emails sent** (all `Sent At` blank).

**Acceptance criteria to graduate shadow → supervised sending:**
- **No missed Red** — 0 Red items mis-routed to Green/Yellow (hard gate).
- Routing accuracy ≥ **95%** overall; ≤ 1 unsafe Green candidate.
- Draft usable (as-is or light edit) ≥ **80%**.
- 0 duplicate records; 0 PII leaks into logs/audit fields.
- Krisha + Cecil review the scorecard; **CEO signs off**.

**Graduation action (one switch, still no auto-send):** set `MANUAL_SEND_ENABLED=true`. Sending
then requires a human Approve, and Red still requires the CEO email. `AUTO_SEND_ENABLED` remains
false (Phase 2B is a separate future approval).

---

## E. Rollback / kill (during shadow)
- Stop analysis: `AGENT_ENABLED=false`.
- Remove Phase 2 triggers: `removePhase2Triggers()` (Phase 1 untouched).
- Full automation stop: `removeAllTriggers()` → `installTriggers()` restores Phase 1 only.
- Fields remain (harmless); never deleted. Phase 1 capture + manual send preserved throughout.
