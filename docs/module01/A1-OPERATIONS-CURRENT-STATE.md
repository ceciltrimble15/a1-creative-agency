# A1 Operations — Current State (Audit)

Legend: 🟢 working · 🟡 partial/needs config · 🔴 missing/owner-side.

## Inventory
| Component | State | Notes |
|---|---|---|
| Operations Hub mailbox operations@ | 🟢 | Live; Phase 1 send verified (record `recgjoz5Q8qQ5aWhQ`) |
| Phase 1 email spine (Apps Script) | 🟢 | Capture → approve → send in-thread; untouched by Module 01 |
| A1 Creative Agency Hub base `appvfR20qp1dh5bT0` | 🟢 | Reused; not duplicated |
| Inbox Queue table `tblUFUnImwgHhHyqP` | 🟢 | Phase 2A (61 fields) + Module 01 entity/ops fields added |
| Entity Registry table `tblrfAF2LmVIUQihF` | 🟢 | Seeded: A1 Creative (configured), A/1 Suppliers (alias config req), TBF (addresses config req) |
| Agent Activity Log table `tblBFSgzCEsnQcWHI` | 🟢 | Audit sink |
| Phase 2A supervised agent + shadow lock | 🟢 | Classify/route/redact/guards; `SHADOW_MODE` hard lock |
| Entity resolution + cross-entity guard (Module 01) | 🟢 | Built + tested (25/25) |
| Daily Ops Report | 🟢 | `buildDailyOpsReport` built + tested |
| A/1 Suppliers Send-As alias | 🟡 | CONFIG REQUIRED (Gmail Send-As) |
| TBF domains/addresses | 🟡 | CONFIG REQUIRED (Cecil to supply) |
| Live multi-entity mail routing (forwarding into hub) | 🔴 | Owner Gmail/GoDaddy/M365 config |
| Shadow Apps Script project | 🔴 | Owner creates (turn-key in `docs/phase2a/09`) |
| Phase 2 production triggers | 🔴 | Not installed (awaiting CEO approval) |

## WORKING / PARTIAL / MISSING / ACCESS / DECISION
- **WORKING:** entity lock logic, original-recipient detection, cross-entity send protection,
  classification/routing/redaction/guards, daily report, Airtable schema, all tests (86 assertions total).
- **PARTIAL:** Suppliers/TBF send-from identities (config required, fail-closed by design).
- **MISSING (owner-side):** live mail forwarding into the hub, shadow project creation, provider decisions.
- **ACCESS REQUIRED:** operations@ Google Workspace / Apps Script; AI provider key; TBF address list.
- **CECIL DECISION REQUIRED:** approve graduation from shadow; supply TBF identities; approve any provider migration.
