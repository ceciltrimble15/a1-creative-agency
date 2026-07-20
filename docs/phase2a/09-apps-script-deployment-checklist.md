# Phase 2A — Google Apps Script Deployment Checklist (owner-side prep)

**STATUS: PREP ONLY. Do NOT install production triggers. Do NOT enable sending.**
`MANUAL_SEND_ENABLED=false`, `AUTO_SEND_ENABLED=false` — leave both false. Await CEO
approval before `installPhase2Triggers()`.

**Recommended target: a SEPARATE "A1 Creative Email Spine — SHADOW" Apps Script project**
bound to `operations@a1creativeagency.com`, running on its own Gmail label `A1C/Shadow`.
This leaves the live Phase 1 project **untouched and healthy** while the agent classifies in
shadow. (Consolidate into the single project later, after graduation.)

---

## 1. Files / modules to paste
Create the shadow project (script.google.com → New project) and add these files from
`google-apps-script/` (contents = current branch). Order does not matter — Apps Script shares one
namespace. **Do not paste the `tests/` folder here** (use a separate test project for that).

- [ ] `agent-config.gs`
- [ ] `airtable-client.gs`
- [ ] `automation-logging.gs`
- [ ] `security-redaction.gs`
- [ ] `agent-prompt.gs`
- [ ] `agent-provider.gs`
- [ ] `agent-validation.gs`
- [ ] `agent-routing.gs`
- [ ] `agent-processing.gs`
- [ ] `gmail-intake.gs`
- [ ] `approval-send.gs`
- [ ] `follow-up-processing.gs`
- [ ] `trigger-management.gs`
- [ ] `a1-creative-email-spine.gs` (manifest/header)
- [ ] Confirm **no duplicate function names** (there are none) and the project saves clean.

Optional test project: paste the modules **plus** `tests/*.gs`, then run `runAllPhase2Tests()`.

---

## 2. Script Properties (Project Settings → Script properties)
Set exactly these. Secrets never go in code.

| Property | Value | Note |
|---|---|---|
| `AIRTABLE_TOKEN` | *(secret)* | read/write Hub + ACOS |
| `AI_PROVIDER` | `anthropic` | |
| `AI_API_KEY` | *(secret)* | |
| `AI_MODEL` | `claude-sonnet-5` | |
| `MODEL_VALIDATED_FOR` | `claude-sonnet-5` | must equal `AI_MODEL` |
| `AGENT_VERSION` | `phase2a-shadow-1.0.0` | |
| `INTAKE_LABEL` | `A1C/Shadow` | **shadow project only** — isolates from Phase 1's `A1C/Intake` |
| `AGENT_ENABLED` | `true` | |
| `MANUAL_SEND_ENABLED` | `false` | **leave false** |
| `AUTO_SEND_ENABLED` | `false` | **leave false** |
| `CEO_APPROVER_EMAIL` | `cecil.trimble15@gmail.com` | |
| `GREEN_MIN_CONFIDENCE` | `95` | |
| `YELLOW_MIN_CONFIDENCE` | `75` | |
| `MAX_AGENT_RECORDS_PER_RUN` | `3` | |
| `DAILY_AGENT_CALL_LIMIT` | `50` | |
| `MODEL_TIMEOUT_SECONDS` | `60` | |
| `EXECUTION_TIME_BUDGET_SECONDS` | `240` | |
| `POST_SEND_AUDIT_PERCENT` | `10` | inert in shadow |

---

## 3. Required OAuth permissions
On first run Apps Script prompts for consent. Expected scopes (add to `appsscript.json`
`oauthScopes` if managing manifest explicitly):

- [ ] `https://www.googleapis.com/auth/gmail.modify` — read email, add/remove labels (capture)
- [ ] `https://www.googleapis.com/auth/gmail.send` — authorized but **unused in shadow** (send stays gated off)
- [ ] `https://www.googleapis.com/auth/script.external_request` — `UrlFetchApp` to Airtable + AI provider
- [ ] `https://www.googleapis.com/auth/script.scriptapp` — manage triggers (install later, after approval)
- [ ] `https://www.googleapis.com/auth/script.storage` — Script Properties

Grant as `operations@a1creativeagency.com`. Do not grant on any other account.

---

## 4. Exact function execution order (manual, NO triggers)
Run from the editor's Run menu, in this order. **Do not run `installPhase2Triggers()`.**

1. [ ] `validateModelConfiguration()` → expect `{ status: "Validated" }`.
2. [ ] `testAgentConnection()` → expect `{ ok: true }` and a valid JSON classification (safe fixture, no PII).
3. [ ] (test project) `runAllPhase2Tests()` → expect all pass.
4. [ ] Apply the `A1C/Shadow` label to **one** real A1 Creative email.
5. [ ] `captureInbox()` (run once) → one new Inbox Queue row (Capture State = Captured, Gmail Message ID set).
6. [ ] `captureInbox()` **again** → no new row (dedupe proven; log `CAPTURE_DUPLICATE_PREVENTED`).
7. [ ] `analyzePendingEmails()` (run once) → the row gets Agent Status = Completed, Category/Tier/Summary/AI Draft filled, routing set; Red items also escalate to ACOS.
8. [ ] Mark one processed row `Approve` in Airtable, then run `sendApproved()` → it must **NOT send**; expect log `SEND_BLOCKED: MANUAL_SEND_DISABLED` and `Sent At` stays blank.

STOP here. `installPhase2Triggers()` is the next step and requires CEO approval.

---

## 5. How to verify Phase 1 remains healthy
Because shadow runs in a **separate project on `A1C/Shadow`**, the live Phase 1 project is untouched.

- [ ] Live Phase 1 project: triggers still listed (`captureInbox`, `sendApproved`, `processRejects`).
- [ ] Send yourself a Phase 1 test on the normal `A1C/Intake` label → it still captures, approves, and
      sends in-thread from operations@ (this is the existing, already-verified path — see live record
      `recgjoz5Q8qQ5aWhQ`).
- [ ] Confirm the shadow project's `INTAKE_LABEL=A1C/Shadow` (not `A1C/Intake`) so the two never compete.
- [ ] Inbox Queue: existing rows and the 18 original fields unchanged; only new fields populate.

---

## 6. How to run the first live shadow test
1. [ ] Prepare a small batch (start with 3–5, build to 20) of real/realistic A1 Creative emails; label each `A1C/Shadow`. Include at least one Red (refund/contract/legal), one Yellow lead, one PII case (fake SSN/card), and one benign reply inside a Red thread.
2. [ ] Run `captureInbox()` then `analyzePendingEmails()` manually (2–3 cycles for >3 emails, since `MAX_AGENT_RECORDS_PER_RUN=3`).
3. [ ] In the Cecil CEO-Review and Krisha Operator views, score each row: tier correct? draft usable? correction needed?
4. [ ] For any Red, confirm the ACOS `04 – CEO Approval Queue` record was created.
5. [ ] Confirm **zero sends**: every `Sent At` blank; each Approved row logs `SEND_BLOCKED: MANUAL_SEND_DISABLED`.
6. [ ] Record results against the gates (0 missed Red, ≥95% tier accuracy, ≥80% usable drafts, 0 PII leaks, 0 duplicates).

---

## 7. What screenshots / logs prove success
Collect for the CEO packet:

- [ ] **Script Properties** screenshot showing `MANUAL_SEND_ENABLED=false` and `AUTO_SEND_ENABLED=false`.
- [ ] **`validateModelConfiguration()`** result = Validated; **`testAgentConnection()`** = ok.
- [ ] **Agent Activity Log** table rows: `CAPTURED`, `CAPTURE_DUPLICATE_PREVENTED`, `AGENT_COMPLETED`, `ROUTED`, `SEND_BLOCKED` — and confirm **no secrets/PII** in them.
- [ ] **Inbox Queue** screenshot: a processed row with Category, Decision Tier, AI Summary, AI Draft, Confidence, Masked Fields — and **Sent At blank**.
- [ ] **Masked Fields** on the PII test row shows categories (e.g. `SSN, CARD`) with **no raw values anywhere**.
- [ ] A **Red row** with its ACOS `04 – CEO Approval Queue` record link.
- [ ] The **20-email scorecard** (tier accuracy, missed-Red=0, usable-draft %, duplicates=0).
- [ ] Triggers page screenshot showing **Phase 2 triggers NOT yet installed** (proof shadow ran manually).

---

**STOP — await CEO approval before running `installPhase2Triggers()` or changing any send switch.**
