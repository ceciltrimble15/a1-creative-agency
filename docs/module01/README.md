# Module 01 — A1 Operations Command Center

Centralized email/communications operations for Cecil Trimble's separate businesses, with
**permanent entity separation**. Hub: `operations@a1creativeagency.com`. Built on the existing
Phase 2A spine + A1 Creative Agency Hub base — no new OS, no duplicate base, no Make.com.

**Core guarantee:** every message keeps its owning company identity (Entity + Original Recipient
as system data), and no message can be answered from the wrong company (three-way cross-entity lock).
Nothing sends — `SHADOW_MODE` + send switches are locked.

## Docs
- `A1-OPERATIONS-ARCHITECTURE.md` — locked flow + entity lock
- `A1-OPERATIONS-CURRENT-STATE.md` — audit (working/partial/missing)
- `A1-OPERATIONS-DATA-MODEL.md` — Entity Registry + Inbox Queue fields
- `A1-OPERATIONS-AUTOMATION-MAP.md` — functions/triggers
- `A1-OPERATIONS-SETUP.md` — owner setup
- `A1-OPERATIONS-MANUAL-ACTIONS.md` — Krisha/Cretia + Cecil actions
- `A1-OPERATIONS-SECURITY.md` — security posture
- `A1-OPERATIONS-TEST-PLAN.md` — tests + results (86 assertions green)
- `A1-OPERATIONS-HANDOFF.md` — continuity

## Status: READY FOR CODEX QA (not production — live mail routing + send-from config are owner steps)
