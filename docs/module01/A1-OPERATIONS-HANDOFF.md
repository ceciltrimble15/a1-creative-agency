# A1 Operations — Handoff (Module 01)

Another qualified operator can continue from here without Cecil rebuilding knowledge.

## Where everything lives
- Code: `google-apps-script/` (Module 01: `ops-entity.gs`, `ops-daily-report.gs`; entity-aware
  `gmail-intake.gs`, `approval-send.gs`; all Phase 2A modules). Manifest: `appsscript.json` (no send scope).
- Tests: `google-apps-script/tests/` (3 `.cjs` harnesses + in-editor `.gs`).
- Docs: `docs/module01/` (this set) + `docs/phase2a/` (agent/safety/shadow).
- Airtable: base `appvfR20qp1dh5bT0` — Inbox Queue `tblUFUnImwgHhHyqP`, Entity Registry
  `tblrfAF2LmVIUQihF`, Agent Activity Log `tblBFSgzCEsnQcWHI`.
- Branch: `claude-code/a1-creative-communications-agent-phase2a` (not merged).

## State
Built + tested: entity lock, original-recipient preservation, cross-entity send protection,
classification/routing/redaction/guards, daily report. Sending is locked (`SHADOW_MODE` +
`MANUAL_SEND_ENABLED=false` + `AUTO_SEND_ENABLED=false`). No production triggers installed.

## To continue
1. Owner: create the Shadow Apps Script project + set properties (`docs/phase2a/09`).
2. Configure entity send-from (Suppliers alias; TBF addresses) — see `A1-OPERATIONS-MANUAL-ACTIONS.md`.
3. Configure original-recipient-preserving forwarding per lane.
4. Run shadow window per lane; score with the graduation template (`docs/phase2a/11`).
5. Only after gates + CEO approval: install triggers / enable supervised sending (separate approval).

## Never (section 28)
No entity merge, no ownership/DNS/provider/banking changes, no credential exposure, no duplicate
base/automations, no rebuilding working systems, no executive decisions for Cecil.
