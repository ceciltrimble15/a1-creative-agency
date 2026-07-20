# Phase 2A — Deployment Package

**Do not deploy as part of this build.** This is the owner's runbook to deploy later,
under `operations@a1creativeagency.com`, after CEO approval. Phase 1 keeps running the
whole time; Phase 2A is additive and fully removable.

## 1. Pre-deployment checklist
- [ ] CEO approval to enable the agent layer (classification/drafting only; no auto-send).
- [ ] AI provider account + key ready (default provider `anthropic`, model `claude-sonnet-5`).
- [ ] Airtable personal access token with read/write on Hub + ACOS bases.
- [ ] Confirm `CEO_APPROVER_EMAIL` (default `cecil.trimble15@gmail.com`).
- [ ] Backup: export the Inbox Queue view (CSV) before schema changes.
- [ ] Confirm Phase 1 is currently green (send one manual test through the live spine).

## 2. Airtable field migration (do first)
Follow `docs/phase2a/02-airtable-migration.md` **exactly**, in the "safe order of creation":
1. Create the **Automation Logs** table (8 fields).
2. Add Group A (capture/dedupe) → B (agent) → C/D/E (understanding/routing/thread) → F (draft/approval) → G/H (follow-up/governance).
All fields are additive and blank-default; Phase 1 keeps working after each step.
> Nothing here is created automatically. A human adds these fields (or authorizes a scripted migration).

## 3. Script Property checklist (Project Settings → Script properties)
| Property | Value (Phase 2A) |
|---|---|
| `AIRTABLE_TOKEN` | (secret) |
| `AI_PROVIDER` | anthropic |
| `AI_API_KEY` | (secret) |
| `AI_MODEL` | claude-sonnet-5 |
| `AGENT_VERSION` | phase2a-1.0.0 |
| `MODEL_VALIDATED_FOR` | claude-sonnet-5  (must equal AI_MODEL) |
| `AGENT_ENABLED` | true |
| `MANUAL_SEND_ENABLED` | true |
| `AUTO_SEND_ENABLED` | **false** |
| `CEO_APPROVER_EMAIL` | cecil.trimble15@gmail.com |
| `GREEN_MIN_CONFIDENCE` | 95 |
| `YELLOW_MIN_CONFIDENCE` | 75 |
| `MAX_AGENT_RECORDS_PER_RUN` | 3 |
| `DAILY_AGENT_CALL_LIMIT` | 50 |
| `MODEL_TIMEOUT_SECONDS` | 60 |
| `EXECUTION_TIME_BUDGET_SECONDS` | 240 |
| `POST_SEND_AUDIT_PERCENT` | 10 |

Never commit these values to source.

## 4. Code deployment steps
1. In the `A1 Creative Email Spine` Apps Script project, add each `.gs` file from
   `google-apps-script/` (all modules + the manifest). Do **not** paste the `tests/` files
   into production (optional: a separate test project).
2. Because Apps Script shares one namespace, confirm there are no duplicate function names
   (there are none — the monolith was refactored into modules).
3. Save. Do not install triggers yet.

## 5. Model configuration + validation
1. Set `AI_PROVIDER`, `AI_API_KEY`, `AI_MODEL`, and `MODEL_VALIDATED_FOR` (= AI_MODEL).
2. Run `testAgentConnection()` — expect `{ ok: true }` and a valid JSON classification.
3. Run `runAllPhase2Tests()` in a test project (or review the headless results).
4. Any provider/model change later re-blocks processing until `MODEL_VALIDATED_FOR` is updated + CEO re-approves.

## 6. Trigger installation
1. Run `installPhase2Triggers()` once. It preserves Phase 1 triggers, adds
   `analyzePendingEmails` (10m) and `processOverdueFollowUps` (60m), and never duplicates.
2. Review its return value (added / skipped / retained).

## 7. Controlled test (supervised)
1. Send/label **one** real A1 Creative email with `A1C/Intake`.
2. Within ~10 min: a row appears (captured, deduped), then `Agent Status=Completed`,
   with Category/Tier/Summary/AI Draft filled and routing set.
3. Verify a Red test email escalates to ACOS and is CEO-only.
4. Approve a Yellow as Krisha → confirm the reply sends **in-thread from operations@**,
   `Sent At` stamped, Follow-Up set. Confirm a Red cannot be sent without the CEO email.
5. Run 20 real messages over the Phase 2A period; track accuracy + corrections.

## 8. Rollback (Phase 2 off, Phase 1 intact)
- **Fastest:** set `AGENT_ENABLED=false` (agent stops analyzing; capture + manual send continue).
- **Triggers:** run `removePhase2Triggers()` (leaves Phase 1 triggers running).
- **Full stop of automation:** `removeAllTriggers()` then re-run `installTriggers()` to restore Phase 1 only.
- New Airtable fields can stay (harmless) or be hidden; **do not delete** to preserve data.
- Rollback preserves: Gmail capture, Inbox Queue, human approval, Phase 1 sending, labels, all data.

## 9. Emergency kill switches
| Need | Action |
|---|---|
| Stop AI analysis now | `AGENT_ENABLED=false` |
| Stop ALL sending now | `MANUAL_SEND_ENABLED=false` (guards block every send) |
| Ensure no auto-send | `AUTO_SEND_ENABLED=false` (already the default; never true in 2A) |
| Stop all scheduled work | `removeAllTriggers()` |
| Block model after change | leave `MODEL_VALIDATED_FOR` ≠ `AI_MODEL` |

## 10. Production verification checklist
- [ ] `testAgentConnection()` returns ok.
- [ ] Capture creates exactly one row per message (no duplicates on re-run).
- [ ] Green/Yellow/Red routing matches the test emails.
- [ ] Red escalates to ACOS and cannot be approved by Krisha.
- [ ] A sent record cannot resend; blank Final Copy never sends.
- [ ] `AUTO_SEND_ENABLED` is false in Script Properties.
- [ ] Automation Logs table is receiving entries (no secrets/PII in them).
