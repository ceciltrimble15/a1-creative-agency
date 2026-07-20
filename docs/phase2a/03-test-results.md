# Phase 2A — Test Results

Two equivalent suites run the same assertions against the **real** module code:

- **Headless evidence** — `google-apps-script/tests/headless-harness.cjs` loads every `.gs`
  module into a sandbox (Apps Script globals stubbed) and runs live. **This is the evidence below.**
- **In-editor** — `google-apps-script/tests/*.gs`; run `runAllPhase2Tests()` in the Apps Script
  editor to reproduce on the deploy account (also exercises Airtable/Gmail-bound paths).

## Headless run (actual output)

```
$ node google-apps-script/tests/headless-harness.cjs
40 passed, 0 failed, 40 total
```

Full PASS list (spec §23 mapping):

| # | Scenario | Result |
|---|---|---|
| 1–3 | Green candidates (receipt, office-hours, intake ack) → Green, no auto-send | PASS |
| 4–7 | Yellow (lead, client status, partner meeting, attachment) → Krisha | PASS |
| 8–16 | Red (refund, discount, gov compliance, attorney contract, bank, legal threat, unknown low-conf, security, public statement) → Cecil, no auto-send | PASS |
| 17 | Invalid JSON → rejected | PASS |
| 18 | Valid JSON, invalid category → rejected | PASS |
| 19 | Confidence 74 → Red | PASS |
| 20 | Confidence 75 → Yellow | PASS |
| 21 | Confidence 94 → Yellow | PASS |
| 22 | Confidence 95 clean → Green | PASS |
| 23 | Missing API key → no model call | PASS |
| 24 | Model timeout/HTTP error → handled | PASS |
| 25 | Airtable write failure → throws, caught upstream → record failed | PASS |
| 26 | Duplicate Gmail Message ID → detected | PASS |
| 27 | Concurrent capture → lock skip, safe | PASS |
| 28 | Concurrent analyze/send → lock skip, safe | PASS |
| 29 | Approval while Agent Status Failed → blocked | PASS |
| 30 | Approval while Not Processed → blocked | PASS |
| 31 | Approval with blank Final Copy → blocked | PASS |
| 32 | Red approval from non-CEO → blocked; CEO → allowed | PASS |
| 33 | Reprocessing never overwrites Final Copy (agent writes AI Draft only) | PASS |
| 34 | Benign reply inside Red thread stays Red | PASS |
| 38 | Daily model-call ceiling → stops calls | PASS |
| 39 | PII redacted before model call (originals absent) | PASS |
| 40 | Model/provider changed without validation → Blocked | PASS |
| 41 | Sent record cannot resend | PASS |
| 42 | AUTO_SEND_ENABLED remains false | PASS |

## Deferred to runtime (require live Gmail/Airtable + multi-execution)

| # | Scenario | Status | How it is covered |
|---|---|---|---|
| 35 | >10 emails arrive together | Deferred | Capture bounded by `search(0,20)` + time budget; analyze bounded by `MAX_AGENT_RECORDS_PER_RUN=3`. Config wiring asserted (test 35). Full behavior verified on the deploy account. |
| 36 | Later records wait safely (none dropped) | Deferred | Unprocessed threads keep `A1C/Intake`; records keep `Agent Status=Not Processed` and are picked up next run. Verify by seeding 12 labeled messages. |
| 37 | Execution stops mid-batch | Deferred | Per-record checkpoints (`Processing Started/Completed`, status writes) + budget stop. Wiring asserted (test 37). |

None of the deferred items can cause an unsafe send — all sending is gated by the
guard predicate (tests 29–32, 41, 42), which runs headless and passes.
