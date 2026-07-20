# Phase 2A — Final Pre-Deployment Checklist (CEO Review)

**STATUS: REVIEW ONLY. Nothing executed.** No fields migrated · no Phase 2 triggers installed ·
no production modified · not merged. Execution waits for CEO approval.

Scope of first go-live: **shadow mode** (agent classifies/drafts/routes, sends nothing).
`MANUAL_SEND_ENABLED=false` and `AUTO_SEND_ENABLED=false`.

---

## 1. Phase 1 backup procedure (do before any change)
- [ ] **Airtable data:** Inbox Queue → download CSV of all rows (also the whole base via *Base → Duplicate* or a snapshot backup). Store dated copy (`inbox-queue-YYYYMMDD.csv`).
- [ ] **Airtable schema:** screenshot/export the current field list of Inbox Queue (proof of pre-migration state).
- [ ] **Apps Script code:** copy the current live `A1 Creative Email Spine` project source to a dated backup (Apps Script → *Project history*, or copy files to `backup/spine-YYYYMMDD/`). This branch already preserves the Phase 1 file in git history.
- [ ] **Triggers:** note the current triggers (screenshot) so Phase 1 can be restored exactly.
- [ ] **Labels:** confirm `A1C/Intake`, `A1C/Captured` exist; note counts.
- [ ] **Green check:** send one manual test through Phase 1 end-to-end and confirm it still works. Record the timestamp.

Backup is complete only when: CSV saved · schema captured · code copied · triggers noted · Phase 1 test green.

---

## 2. Airtable field-by-field migration review table
All **additive**, blank/unchecked default → safe (Phase 1 unaffected). Nothing renamed/deleted.
Create in the order shown. (SS = Single select, LT = Long text, SL = Single line, D/T = date+time.)

### New table: **Automation Logs**
| Field | Type | Notes |
|---|---|---|
| Logged At | D/T | primary/timestamp |
| Function / Action / Result | SL | what ran / outcome |
| Record ID / Message ID | SL | safe references |
| Detail | LT | safe summary only (no secrets/PII) |
| Agent Version | SL | tag |

### Inbox Queue — additive fields
| # | Field | Type | Options / default | Used by |
|---|---|---|---|---|
| A1 | Gmail Message ID | SL | blank (**dedupe key**) | capture |
| A2 | Capture State | SS | Pending/Processing/Captured/Failed | capture |
| A3 | Capture Attempt ID | SL | blank | capture |
| A4 | Capture Error | LT | blank | capture |
| B1 | Agent Status | SS | Not Processed/Processing/Completed/Failed/Skipped | analyze |
| B2 | Agent Processed At | D/T | blank | analyze |
| B3 | Agent Version | SL | blank | analyze |
| B4 | Agent Error | LT | blank | analyze |
| B5 | Processing Attempt ID | SL | blank | analyze |
| B6 | Processing Started At | D/T | blank | analyze |
| B7 | Processing Completed At | D/T | blank | analyze |
| B8 | Processing Attempts | Number | 0 | analyze |
| B9 | Daily Limit Reached | Checkbox | off | analyze |
| B10 | Confidence Score | Number(0–100) | blank | validate/route |
| B11 | Prompt Version | SL | blank | analyze |
| B12 | Original AI Output | LT | blank | analyze |
| C1 | Message Category | SS | 20 categories (§8 spec) | route |
| C2 | Sender Type | SS | 12 sender types (§9 spec) | route |
| C3 | Response Required | Checkbox | off | route |
| C4 | Detected Deadline | Date | blank | follow-up |
| C5 | Urgency | SS | Low/Normal/High/Critical | route |
| C6 | Risk Level | SS | Low/Medium/High/Critical | route |
| C7 | Opportunity Value | SS | None/Low/Medium/High | route |
| C8 | Sensitive Content | Checkbox | off | redaction/route |
| C9 | PII Detected | Checkbox | off | redaction |
| C10 | Masked Fields | LT | blank (categories only) | redaction |
| C11 | Model Payload Hash | SL | blank | analyze |
| C12 | Attachment Review Required | Checkbox | off | route |
| D1 | Decision Tier | SS | Green/Yellow/Red | route/send |
| D2 | Recommended Owner | SS | Agent/Krisha/Cecil | route |
| D3 | Recommended Next Action | LT | blank | route |
| D4 | Escalation Reason | LT | blank | route/escalate |
| D5 | Green Denial Reason | SL | blank | route |
| D6 | Auto-Send Eligible | Checkbox | off | future 2B |
| D7 | CEO Review Required | Checkbox | off | route/send |
| D8 | ACOS Escalated At | D/T | blank | escalate |
| E1 | Thread Risk Floor | SS | Green/Yellow/Red | thread risk |
| E2 | Thread Red Reason | LT | blank | thread risk |
| E3 | Thread Risk Set At | D/T | blank | thread risk |
| E4 | Thread Risk Override | Checkbox | off | CEO override |
| E5 | Thread Risk Override By | SL | blank | CEO override |
| F1 | AI Draft | LT | blank (**agent writes here, never Final Copy**) | analyze |
| F2 | AI Draft Last Modified | D/T | blank | analyze |
| F3 | Final Copy Last Modified | D/T | blank | derive Human Edited |
| F4 | Human Edited | Checkbox | off (derived) | approval |
| F5 | Human Editor | SL | blank | approval |
| F6 | Approval Authority Required | SS | Krisha/Cecil | send guard |
| F7 | Approved By | SL | blank | send guard |
| F8 | Approved By Email | Email | blank (**Red = CEO email**) | send guard |
| F9 | Approved At | D/T | blank | send guard |
| F10 | Draft Approved At | D/T | blank | approval |
| G1 | Outcome | SS | Open/Replied/Won/Lost/No Response/Closed | follow-up |
| G2 | Closed At | D/T | blank | follow-up |
| G3 | Follow-Up Status | SS | None/Scheduled/Due/Overdue/Done | follow-up |
| G4 | Last Follow-Up At | D/T | blank | follow-up |
| G5 | Next Follow-Up At | D/T | blank | follow-up |
| G6 | Post-Send Audit Required | Checkbox | off | send sampling |
| H1 | Reprocess Agent | Checkbox | off | analyze |
| H2 | Reprocess Reason | LT | blank | analyze |
| H3 | Model Validation Status | SS | Unvalidated/Validated/Blocked | governance |
| H4 | Model Validation Date | Date | blank | governance |
| H5 | Model Approved By | SL | blank | governance |

**Preserve untouched:** Subject, From, Brand, Priority, Preview, Recommended Action,
Approve / Edit / Reject, Final Copy, Send From, Sent At, Follow-Up Date, Gmail Thread ID,
Status, Received At, AI Summary, Claude Draft, ACOS Ref.

---

## 3. Required permissions list
- [ ] **Google Workspace:** sign-in to `operations@a1creativeagency.com` (owner of the Apps Script project).
- [ ] **Apps Script OAuth scopes** (granted on first run): Gmail read/modify (capture, labels), Gmail send (held off in shadow — `MANUAL_SEND_ENABLED=false`), external requests (`UrlFetchApp` to Airtable + AI provider), triggers.
- [ ] **Airtable PAT:** scopes `data.records:read`, `data.records:write`, `schema.bases:read`; access to **A1 Creative Agency Hub** (`appvfR20qp1dh5bT0`) and **ACOS** (`appbJeQpEUFRV1Dim`).
- [ ] **AI provider:** account + API key for `AI_PROVIDER`/`AI_MODEL` (default Anthropic / claude-sonnet-5).
- [ ] **ACOS write:** ability to create rows in `04 – CEO Approval Queue` (Red escalation).
- [ ] **Roles:** Cecil = base owner / CEO approver (`CEO_APPROVER_EMAIL`); Krisha = editor on Inbox Queue + interface access.
- [ ] All secrets live only in **Script Properties** — never in source, logs, or Airtable.

---

## 4. Exact rollback steps
| Goal | Action | Effect |
|---|---|---|
| Pause AI analysis | Script Property `AGENT_ENABLED=false` | Capture + manual review continue; no model calls |
| Guarantee no send | `MANUAL_SEND_ENABLED=false` (already shadow default) | Every send returns `SEND_BLOCKED` |
| Remove Phase 2 automation | Run `removePhase2Triggers()` | Deletes only analyze + follow-up triggers; **Phase 1 triggers stay** |
| Full automation stop | Run `removeAllTriggers()` | No scheduled work; data intact |
| Restore Phase 1 exactly | Run `installTriggers()` | Re-creates capture/send/rejects (Phase 1) |
| Block after model change | leave `MODEL_VALIDATED_FOR` ≠ `AI_MODEL` | Analysis blocks until re-validated |
| Revert code | redeploy the dated Phase 1 backup (§1) | Original spine restored |

New Airtable fields may remain (harmless) — **do not delete** (preserves data). Rollback always
preserves: Gmail capture, Inbox Queue, human approval, Phase 1 sending, labels, all records.

---

## 5. Shadow-mode success dashboard
Track over the shadow window (≥20 emails). Suggested Airtable interface/grid + a scorecard.

| Metric | Source | Target (graduate gate) |
|---|---|---|
| Emails captured | count of shadow rows | = emails sent in (no misses) |
| Duplicate records | rows sharing Gmail Message ID | **0** |
| **Missed Red** (Red mis-routed to Green/Yellow) | manual score vs Decision Tier | **0 — hard gate** |
| Routing accuracy | correct tier ÷ total | **≥ 95%** |
| Unsafe Green candidates | Green that should not be | **≤ 1** |
| Draft usable (as-is or light edit) | Krisha score | **≥ 80%** |
| PII leaks in logs/audit | inspect Automation Logs + Masked Fields | **0** |
| Emails actually sent | rows with Sent At | **0** (shadow) |
| Red escalated to ACOS | ACOS rows created | = Red count |
| Agent failures | Agent Status = Failed | reviewed; each fails closed to Red |
| Avg confidence / daily calls | Confidence Score / call counter | within `DAILY_AGENT_CALL_LIMIT` |

Graduation to supervised sending requires all gates met **and CEO sign-off** → then flip
`MANUAL_SEND_ENABLED=true` (auto-send stays false).

---

## 6. Operator responsibilities
**Cecil (CEO)**
- Approves go-live for shadow; reviews the success dashboard; gives the graduation sign-off.
- Sole approver of **Red** items (contracts, legal, refunds, discounts, pricing, banking/tax,
  government, media/public statements, disputes, high-value partnerships, money commitments).
- Only person who may clear a sticky Red thread floor (logged override).
- Approves any AI provider/model change and Phase 2B (future) separately.

**Krisha (Operator)**
- Supervises **Yellow** exceptions; edits drafts; corrects misclassifications; assigns work.
- Scores each shadow email (tier correct? draft usable? correction) for the dashboard.
- Escalates anything unclear or risky to Cecil (Red).
- Monitors accuracy, duplicates, and overdue follow-ups. **Cannot approve Red.**

**Agent (automation)**
- Captures email (dedupe by Message ID), classifies, summarizes, sets urgency/risk/opportunity,
  detects deadlines, drafts a reply into **AI Draft** (never Final Copy), routes Green/Yellow/Red,
  applies sticky thread risk, escalates Red to ACOS, logs every action.
- **Never sends** in shadow; masks PII before any model call; fails closed to Red on any
  uncertainty, invalid output, or error.

---

## 7. First 20 shadow test email categories
Seed these (real or realistic) with `A1C/Intake`. Expected routing in brackets.

**Green candidates (routine, human-approved even after shadow) — 1–4**
1. Document received / receipt confirmation *(Green → Krisha)*
2. Office-hours / "are you open?" question *(Green → Krisha)*
3. Intake-form submission acknowledgment *(Green → Krisha)*
4. Simple thank-you / "got it" reply *(Green → Krisha)*

**Yellow (operator) — 5–10**
5. New prospect: "Do you build websites + booking?" *(Yellow → Krisha)*
6. Existing client requests project status *(Yellow → Krisha)*
7. Partner requests a meeting *(Yellow → Krisha)*
8. Quote prep, no final price authority *(Yellow → Krisha)*
9. Scheduling conflict / reschedule *(Yellow → Krisha)*
10. Email with an ordinary attachment to review *(Yellow → Krisha; Attachment Review)*

**Red (CEO-only) — 11–17**
11. Refund request *(Red → Cecil)*
12. Discount / price-match request *(Red → Cecil)*
13. Contract/NDA from an attorney *(Red → Cecil)*
14. Government/compliance notice (SAM.gov / D-U-N-S) *(Red → Cecil)*
15. Bank/tax verification (W-9, routing) *(Red → Cecil)*
16. Legal threat / dispute / cancellation *(Red → Cecil)*
17. Media / public-statement request *(Red → Cecil)*

**Safety / edge — 18–20**
18. Email containing a fake SSN + card number *(PII masked before model; sensitive → not Green)*
19. Vague/unknown low-confidence message *(Red → Cecil; fail closed)*
20. Benign "thank you" reply **inside an existing Red thread** *(stays Red — sticky floor)*

Mix ensures coverage of every tier, the PII path, fail-closed, and sticky-thread risk.

---

**STOP — await CEO approval before execution.**
