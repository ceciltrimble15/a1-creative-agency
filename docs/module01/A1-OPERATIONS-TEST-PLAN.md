# A1 Operations — Test Plan & Results

Three headless harnesses run against the real modules (Apps Script globals stubbed):
- `tests/headless-harness.cjs` — Phase 2A agent/safety: **41/41**
- `tests/shadow-20-sim.cjs` — 20-email shadow (all sends blocked): **20/20**
- `tests/ops-module01-tests.cjs` — Module 01 entity/ops (below): **25/25**

In-editor mirror: `runAllPhase2Tests()`.

## Module 01 required tests (section 25) → result
| # | Test | Result |
|---|---|---|
| 1 | A1 Creative incoming email | PASS |
| 2 | A/1 Suppliers incoming email | PASS |
| 3 | TBF incoming (unconfigured → NEEDS REVIEW, fail closed) | PASS |
| 4 | Original recipient preserved through forward | PASS |
| 5 | Correct entity detection (domain) | PASS |
| 6 | Incorrect/unknown entity → NEEDS REVIEW | PASS |
| 7 | Lead classification vocabulary | PASS |
| 8 | Billing classification | PASS |
| 9 | Legal classification | PASS |
| 10 | P1 escalation | PASS |
| 11 | Normal-priority handling | PASS |
| 12 | Follow-up counted | PASS |
| 13 | Airtable logging (no throw) | PASS |
| 14 | Duplicate email handling | PASS |
| 15 | Thread handling (same entity) | PASS |
| 16 | Unknown/empty recipient | PASS |
| 17 | Spam → P4 | PASS |
| 18 | Reply identity protection (mismatch / config-req / needs-review / match) | PASS (×4) |
| 19 | Human approval gate vocabulary | PASS |
| 20 | Daily report generation | PASS |
| 21 | Operator assignment by tier | PASS |
| 22 | Closed-item handling | PASS |

Reproduce: `node google-apps-script/tests/ops-module01-tests.cjs`

## Live tests still owner-run (need Gmail/mail-flow)
Real forwarding + original-recipient headers per lane; live-model classification accuracy; the
20-email shadow window per lane. These run after the shadow project + mail routing are configured.
