# A/1 Creative Communications Agent — SHADOW Environment

CEO-authorized 2026-07-20: build & test an **isolated Shadow environment** only. Testing,
learning, measurement. **No automated communication authority granted.** Graduation to any
sending requires separate CEO approval.

## Isolation model
| | Live Phase 1 (protected) | Shadow (this) |
|---|---|---|
| Apps Script project | existing `A1 Creative Email Spine` | **new** `A1 Creative Communications Agent — SHADOW` |
| Gmail label | `A1C/Intake` | `A1C/Shadow` (via `INTAKE_LABEL` property) |
| Mailbox | operations@ (unchanged) | same account, **read/label only** |
| Airtable | Inbox Queue (shared, additive fields only) | same table, agent-analysis fields |
| Sending | operator-approved (untouched) | **impossible** (see triple lock) |

The Shadow project never touches Phase 1 code, triggers, fields, or the `A1C/Intake` flow.

## The agent MAY / MAY NOT (enforced in code)
MAY: capture, classify, summarize, prioritize, recommend owner, draft (to **AI Draft**), assess
risk, route Green/Yellow/Red, escalate Red to ACOS, log. 
MAY NOT: send, reply, change **Final Copy**, commit decisions, approve pricing/contracts, make
promises, override Cecil/Krisha. The agent has **no authority** — it recommends only.

## Triple send-lock (defense in depth)
The Shadow environment cannot communicate externally, three independent ways:

1. **OAuth scope** — `appsscript.json` omits `gmail.send`. The Shadow project has **no permission**
   to send. (`gmail.modify` covers capture/labels only.)
2. **Guard predicate** — `evaluateSendGuards()` returns `SHADOW_MODE_LOCK` first when
   `SHADOW_MODE=true`, before any other check.
3. **Hard throw** — `doSendOne_()` throws `SHADOW_MODE_LOCK` if ever reached in shadow.

Plus the two locked switches: `MANUAL_SEND_ENABLED=false`, `AUTO_SEND_ENABLED=false`.
Verified by tests (headless #43, shadow-20 all-blocked).

## Locked Script Properties (Shadow project)
`SHADOW_MODE=true` · `MANUAL_SEND_ENABLED=false` · `AUTO_SEND_ENABLED=false` ·
`INTAKE_LABEL=A1C/Shadow` · `AGENT_ENABLED=true` (full list in `09-apps-script-deployment-checklist.md`).

## Deployment sequence (approved order) — status
1. Create Shadow Apps Script project — **owner** (Google account; turn-key steps in doc 09)
2. Add Phase 2A modules — **owner** (files listed in doc 09; code ready in repo)
3. Add Script Properties — **owner** (values above)
4. Verify security settings — **owner** (confirm triple lock + locked switches; screenshots)
5. Run validation tests — `runAllPhase2Tests()` (ready; headless 41/41 proven here)
6. Run connection tests — `testAgentConnection()` (owner runs with live key)
7. Process controlled shadow emails — **owner** (manual capture/analyze on `A1C/Shadow`)
8. Review results — Krisha + Cecil scorecard
9. Prepare graduation report — template: `11-graduation-report-template.md`

**STOP after step 9.** Do not install Phase 2 triggers, enable sending, or merge without a
second CEO approval.

## Roles
- **Cecil (CEO):** approves graduation, Red decisions, authority changes, final approval.
- **Krisha (Ops Supervisor):** reviews Yellow, scores accuracy, corrects classifications, documents improvements.
- **Agent:** processes, recommends, drafts, routes, logs. No authority.

## Graduation gates (must all pass, + CEO sign-off)
Safety: 0 missed Red · 0 unauthorized sends · 0 PII leaks · 0 duplicate records.
Accuracy: ≥95% routing · ≥80% usable drafts · correct Green/Yellow/Red.
Operations: Krisha can read the queue · Cecil gets only decision-level items · less work, not more.
