# Phase 2A — Airtable Migration Plan

**Do not create these in live Airtable without explicit CEO write authorization.**
All fields are **additive** — no existing field is renamed or deleted. Every new
field is optional/blank by default, so adding them cannot break Phase 1.

Base: **A1 Creative Agency Hub** `appvfR20qp1dh5bT0` · Table: **Inbox Queue** `tblUFUnImwgHhHyqP`
(plus a new **Automation Logs** table, see bottom).

Legend — *Safe pre-deploy?* = can be added now with zero impact on Phase 1 (all YES, because additive + blank default).

## Preserved existing fields (do not touch)
Subject, From, Brand, Priority, Preview, Recommended Action, Approve / Edit / Reject,
Final Copy, Send From, Sent At, Follow-Up Date, Gmail Thread ID, Status, Received At,
AI Summary, Claude Draft, ACOS Ref.

## A. Identification & capture

| Field | Type | Options | Default | Required | Used by | Safe pre-deploy? |
|---|---|---|---|---|---|---|
| Gmail Message ID | Single line text | — | blank | Yes (dedupe key) | captureInbox | YES |
| Capture State | Single select | Pending, Processing, Captured, Failed | blank | No | captureInbox | YES |
| Capture Attempt ID | Single line text | — | blank | No | captureInbox | YES |
| Capture Error | Long text | — | blank | No | captureInbox | YES |

## B. Agent processing

| Field | Type | Options | Default | Required | Used by | Safe? |
|---|---|---|---|---|---|---|
| Agent Status | Single select | Not Processed, Processing, Completed, Failed, Skipped | Not Processed | No | analyzePendingEmails | YES |
| Agent Processed At | Date (w/ time) | — | blank | No | applyAgentOutput | YES |
| Agent Version | Single line text | — | blank | No | applyAgentOutput | YES |
| Agent Error | Long text | — | blank | No | analyzePendingEmails | YES |
| Processing Attempt ID | Single line text | — | blank | No | analyzePendingEmails | YES |
| Processing Started At | Date (w/ time) | — | blank | No | analyzePendingEmails | YES |
| Processing Completed At | Date (w/ time) | — | blank | No | applyAgentOutput | YES |
| Processing Attempts | Number (integer) | — | 0 | No | analyzePendingEmails | YES |
| Daily Limit Reached | Checkbox | — | unchecked | No | analyzePendingEmails | YES |
| Confidence Score | Number (integer, 0–100) | — | blank | No | validate/route | YES |
| Prompt Version | Single line text | — | blank | No | buildAgentPayload | YES |
| Original AI Output | Long text | — | blank | No | applyAgentOutput | YES |

## C. Understanding

| Field | Type | Options | Default | Required | Used by | Safe? |
|---|---|---|---|---|---|---|
| Message Category | Single select | (20 categories, §8) | blank | No | validate/route | YES |
| Sender Type | Single select | (12 sender types, §9) | blank | No | validate/route | YES |
| Response Required | Checkbox | — | unchecked | No | route | YES |
| Detected Deadline | Date | — | blank | No | follow-up | YES |
| Urgency | Single select | Low, Normal, High, Critical | blank | No | route | YES |
| Risk Level | Single select | Low, Medium, High, Critical | blank | No | route | YES |
| Opportunity Value | Single select | None, Low, Medium, High | blank | No | route | YES |
| Sensitive Content | Checkbox | — | unchecked | No | redaction/route | YES |
| PII Detected | Checkbox | — | unchecked | No | redaction | YES |
| Masked Fields | Long text | (categories only, never values) | blank | No | redaction | YES |
| Model Payload Hash | Single line text | — | blank | No | buildAgentPayload | YES |
| Attachment Review Required | Checkbox | — | unchecked | No | route | YES |

## D. Routing

| Field | Type | Options | Default | Required | Used by | Safe? |
|---|---|---|---|---|---|---|
| Decision Tier | Single select | Green, Yellow, Red | blank | No | route/send | YES |
| Recommended Owner | Single select | Agent, Krisha, Cecil | blank | No | route | YES |
| Recommended Next Action | Long text | — | blank | No | route | YES |
| Escalation Reason | Long text | — | blank | No | route/escalate | YES |
| Green Denial Reason | Single line text | — | blank | No | route | YES |
| Auto-Send Eligible | Checkbox | — | unchecked | No | route (future 2B) | YES |
| CEO Review Required | Checkbox | — | unchecked | No | route/send | YES |
| ACOS Escalated At | Date (w/ time) | — | blank | No | escalateRedToAcos | YES |

## E. Thread risk (sticky)

| Field | Type | Options | Default | Required | Used by | Safe? |
|---|---|---|---|---|---|---|
| Thread Risk Floor | Single select | Green, Yellow, Red | blank | No | route/thread risk | YES |
| Thread Red Reason | Long text | — | blank | No | setThreadRiskFloor | YES |
| Thread Risk Set At | Date (w/ time) | — | blank | No | setThreadRiskFloor | YES |
| Thread Risk Override | Checkbox | — | unchecked | No | CEO override | YES |
| Thread Risk Override By | Single line text | — | blank | No | CEO override | YES |

## F. Draft & approval

| Field | Type | Options | Default | Required | Used by | Safe? |
|---|---|---|---|---|---|---|
| AI Draft | Long text | — | blank | No | applyAgentOutput (agent writes here, never Final Copy) | YES |
| AI Draft Last Modified | Date (w/ time) | — | blank | No | applyAgentOutput | YES |
| Final Copy Last Modified | Date (w/ time) | — | blank | No | derive Human Edited | YES |
| Human Edited | Checkbox | — | unchecked | No | derived (Final Copy ≠ AI Draft) | YES |
| Human Editor | Single line text | — | blank | No | approval | YES |
| Approval Authority Required | Single select | Krisha, Cecil | blank | No | send guard | YES |
| Approved By | Single line text | — | blank | No | send guard | YES |
| Approved By Email | Email | — | blank | No | send guard (Red = CEO email) | YES |
| Approved At | Date (w/ time) | — | blank | No | send guard | YES |
| Draft Approved At | Date (w/ time) | — | blank | No | approval | YES |

## G. Follow-up & completion

| Field | Type | Options | Default | Required | Used by | Safe? |
|---|---|---|---|---|---|---|
| Outcome | Single select | Open, Replied, Won, Lost, No Response, Closed | blank | No | follow-up | YES |
| Closed At | Date (w/ time) | — | blank | No | follow-up | YES |
| Follow-Up Status | Single select | None, Scheduled, Due, Overdue, Done | blank | No | processOverdueFollowUps | YES |
| Last Follow-Up At | Date (w/ time) | — | blank | No | processOverdueFollowUps | YES |
| Next Follow-Up At | Date (w/ time) | — | blank | No | processOverdueFollowUps | YES |
| Post-Send Audit Required | Checkbox | — | unchecked | No | send (sampling %) | YES |

## H. Reprocessing & model governance

| Field | Type | Options | Default | Required | Used by | Safe? |
|---|---|---|---|---|---|---|
| Reprocess Agent | Checkbox | — | unchecked | No | analyzePendingEmails | YES |
| Reprocess Reason | Long text | — | blank | No | analyzePendingEmails | YES |
| Model Validation Status | Single select | Unvalidated, Validated, Blocked | Unvalidated | No | validateModelConfiguration | YES |
| Model Validation Date | Date | — | blank | No | validateModelConfiguration | YES |
| Model Approved By | Single line text | — | blank | No | validateModelConfiguration | YES |

## New table: Automation Logs

Table name **Automation Logs** in base `appvfR20qp1dh5bT0`.

| Field | Type | Notes |
|---|---|---|
| Logged At | Date (w/ time) | primary/timestamp |
| Function | Single line text | function name |
| Action | Single line text | e.g. SEND_BLOCKED, AGENT_COMPLETED |
| Record ID | Single line text | Inbox Queue rec id |
| Message ID | Single line text | Gmail message id (safe) |
| Result | Single line text | ok / failed / skipped |
| Detail | Long text | safe summary only |
| Agent Version | Single line text | agent version tag |

## Safe order of creation
1. Automation Logs table (logging works from first run).
2. Group A (capture/dedupe) — needed by `captureInbox`.
3. Group B (agent processing).
4. Groups C, D, E (understanding, routing, thread risk).
5. Group F (draft & approval) — needed by send guards.
6. Groups G, H (follow-up, governance).

Every step is independently safe; Phase 1 keeps working after each.
