# Phase 2A — Repository Audit & Architecture

Date: 2026-07-20 · Branch: `claude-code/a1-creative-communications-agent-phase2a`

## Current architecture (as found)

| Layer | Location | Notes |
|---|---|---|
| Transport spine (Phase 1) | `google-apps-script/a1-creative-email-spine.gs` (245 lines, monolith) | `captureInbox`, `sendApproved`, `processRejects`, `installTriggers`, `escalateOne_` |
| Deploy guide | `google-apps-script/README.md` | Direct-method rationale + deploy steps |
| Runbook | `A1-CREATIVE-EMAIL-WORKFLOW.md` | Airtable IDs, flow, guardrails |
| Website/Twilio backend | `api/` (Vercel serverless) | Not part of the email spine |

### Confirmed Airtable references (from Phase 1)
- Hub base `appvfR20qp1dh5bT0`, table **Inbox Queue** `tblUFUnImwgHhHyqP`
- ACOS base `appbJeQpEUFRV1Dim`, table **04 – CEO Approval Queue** `tblcgxEvHsyNQujL1`
- Field IDs present: Subject `fldgR4R59HlzzeZE8`, From `fldamXc4SRNDXljyW`, Brand `fld3guVnL7cwnPCL7`, Priority `fldBlJrkf69nJ5yaX`, Preview `fld9VWJxqrpRDWtJK`, Recommended Action `fldVFTEOmfzjzicsa`, Claude Draft `fldLfR24jvaC24OHk`, Status `fldC4l802EkuLzYDt`, Received At `flds4SjtKIsxdKt53`, AI Summary `fldqohDB6p66wfigf`, Approve/Edit/Reject `fldc74yGeJKKXLlnx`, Final Copy `fldnjMXUj83sWCEXK`, Send From `fldhQQkksxGqYhqXT`, Sent At `fldbaBOIu8eABtMgd`, Follow-Up Date `fldRewinbCeNVs0FU`, ACOS Ref `fldHGGJDRVZMmJLUt`, Gmail Thread ID `fldLyb6ChOeVmF9r2`

## Risks found in the Phase 1 monolith (addressed in Phase 2A)

1. **No concurrency lock** — overlapping timed runs could double-process. → Phase 2A adds `ScriptLock` to every scheduled function.
2. **Thread-ID-only dedupe** — capture relies on a Gmail label, not a durable per-message key. A relabel or re-run could duplicate. → Phase 2A adds **Gmail Message ID** as the unique dedupe key and a Processing/Captured label handshake.
3. **No fail-closed capture** — a mid-capture failure could strand a thread. → Phase 2A adds Capture State + Capture Error + label restoration.
4. **`replyAll` risk** — Phase 1 uses `replyAll`, which can include third parties. → Phase 2A send path documents/uses `reply` semantics and adds send guards (kept configurable; noted for CEO review).
5. **No classification/routing/validation** — nothing decides Green/Yellow/Red. → Phase 2A adds the supervised agent layer.
6. **No structured audit log table** — Phase 1 used `console` only. → Phase 2A adds `logAgentAction` writing to an Automation Logs sink (Airtable table, migration-documented).

## Assumptions verified
- Phase 1 is committed and untouched on the parent branch; this branch preserves it.
- No Make.com anywhere in the repo email spine. Confirmed. Phase 2A introduces no new platform (Google Apps Script + Airtable + a pluggable AI provider via HTTPS only).
- New Airtable fields **were NOT created** in the live base this turn (no write authorization given) — see the migration plan; they are added by the owner before deploy.

## Discrepancies from this specification
- Spec lists `a1-creative-email-spine.gs` **and** separate `gmail-intake.gs` / `approval-send.gs`. Apps Script shares one global namespace, so a function cannot be defined twice. **Resolution:** the transport functions are refactored into the named modules; `a1-creative-email-spine.gs` is kept as a **manifest/orchestration header** (no duplicate bodies). Phase 1 logic is preserved inside the modules and behaves identically when Phase 2 config is off.
- Existing draft field is named **`Claude Draft`** (not `AI Draft`). Migration adds a new **`AI Draft`** field per spec; the agent writes to `AI Draft`. `Claude Draft` is left intact for backward compatibility.
- Existing summary field **`AI Summary`** already exists and is reused (spec also lists `AI Summary` under understanding fields — no duplicate created).
