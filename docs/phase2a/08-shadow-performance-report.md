# Phase 2A — Shadow Deployment Performance Report

Date: 2026-07-20 · Branch: `claude-code/a1-creative-communications-agent-phase2a` (not merged)
Switches: `MANUAL_SEND_ENABLED=false`, `AUTO_SEND_ENABLED=false` — **no customer email can be sent.**

## Execution boundary (what ran where)
| Step | Executed this session | Owner step (Google account) |
|---|---|---|
| Full Airtable backup | ✅ (records + schema captured) | — |
| Airtable field migration | ✅ **done live** | — |
| Logic/safety validation (real code) | ✅ 40/40 + 20/20 | — |
| Apps Script code deploy | code ready in repo | ✅ paste into project |
| Set Script Properties | values documented | ✅ set on project |
| Install Phase 2 shadow triggers | `installPhase2Triggers()` ready | ✅ run once |
| Live-model 20-email shadow run | plan + fixtures ready | ✅ run on deploy acct |

This environment has no access to the `operations@a1creativeagency.com` Google Workspace /
Apps Script, so trigger install + live-model run are owner steps. Everything Airtable-side and
all decision/safety logic were executed and verified here.

## 1. Migration completed
- New table **Agent Activity Log** (`tblBFSgzCEsnQcWHI`) — 8 fields (audit sink, distinct from the Vercel `Automation Logs` table).
- **61 new fields** added to **Inbox Queue** (`tblUFUnImwgHhHyqP`): Group A capture/dedupe (4), B agent (11), C understanding (12, reusing existing *AI Summary*), D routing (8), E thread-risk (5), F draft/approval (10), G follow-up (6), H governance (5).
- **All 18 existing fields untouched**; migration was create-only (no update/delete). Existing 2 records intact.
- Code updated: `CFG_LOG_TBL` → `Agent Activity Log`.

## 2. Tests completed
- **Headless module suite** — `tests/headless-harness.cjs`: **40/40 pass** (routing bands, Green/Yellow/Red, validation, guards, redaction, dedupe, locks, governance, no-resend, auto-send off).
- **Shadow 20-email logic test** — `tests/shadow-20-sim.cjs`: **20/20 pass**, run through the real mask → validate → deriveTier → send-guard path.

## 3. Accuracy results (shadow 20-email logic test)
| Metric | Result | Gate |
|---|---|---|
| Final-tier accuracy | **20/20 (100%)** | ≥95% ✅ |
| **Missed Red** (Red routed low) | **0** | 0 (hard) ✅ |
| Deterministic backstop corrections | **9** model "Yellow" under-calls raised to Red | — |
| Unsafe Green candidates | 0 | ≤1 ✅ |
| Sends blocked (shadow) | **20/20** | all ✅ |
| PII masked before model (email #18) | **yes**, SSN + card removed | 0 leaks ✅ |
| Benign reply in Red thread (#20) | stayed **Red** (sticky floor) | ✅ |

Breakdown: #1–4 Green, #5–10 Yellow, #11–20 Red — all matched expected. The 9 corrections show
the deterministic layer catching a model that under-classified refund/discount/contract/gov/bank/
legal/media/PII items as Yellow → forced to Red. Fail-closed works.

## 4. Errors / issues
- **CFG_LOG_TBL name collision** — the base already had a Vercel `Automation Logs` table with a
  different schema. **Resolved:** Phase 2 logs to a new `Agent Activity Log` table; code updated.
- **Test-harness assertion bug** (checked the raw original for the SSN instead of the masked text) —
  **fixed**; redaction itself was always correct (re-run confirms PII masked = true).
- **Live-model accuracy not measured here** — the 100% figure is for the *routing/safety logic* given
  representative classifications; the live model's classification accuracy on real inbound email is
  measured during the owner-run live shadow window.
- No production Apps Script change was made from this environment (by design / access boundary).

## 5. Recommended corrections
- None blocking. Before the live shadow run: (a) set `MODEL_VALIDATED_FOR` = `AI_MODEL`; (b) seed the
  20 emails including the PII and Red-thread cases; (c) confirm one Approved row logs
  `SEND_BLOCKED: MANUAL_SEND_DISABLED` (proves zero sends).
- Optional: tune `RED_PATTERNS` after the live window if any real Red email is under-caught (none in test).

## 6. CEO graduation decision required
- **Graduating beyond shadow is NOT done** and requires new approval.
- Decision for Cecil: after the owner-run live shadow window (≥20 real emails) meets the gates
  (0 missed Red, ≥95% accuracy, ≥80% usable drafts, 0 PII leaks, 0 duplicates), approve flipping
  `MANUAL_SEND_ENABLED=true` to enter **supervised sending** (human Approve still required; Red still
  CEO-only; `AUTO_SEND_ENABLED` stays false). No code change to graduate.

**Shadow mode remains in force. No auto-send. No Green automation. Not merged.**
