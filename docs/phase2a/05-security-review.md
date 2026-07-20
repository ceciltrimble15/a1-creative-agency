# Phase 2A — Security Review

## Secrets
- No secret is in source. `AIRTABLE_TOKEN`, `AI_API_KEY` come only from Script Properties.
- Logging scrubs SSNs, long digit runs, `sk-…`, `Bearer …`, `pat…` before writing (`_scrub_`).
- `git grep` for tokens/keys on this branch returns nothing (verified pre-commit).

## PII / sensitive data
- `maskSensitiveData()` runs inside `buildAgentPayload()` **before** any model call.
- Masks SSN, EIN, card, bank account, routing, credentials/tokens, auth codes → placeholders.
- Only the **categories** masked are stored (`Masked Fields`); original values never reach the
  model, logs, Airtable audit fields, tests, or the repo.
- Attachments are **not** sent to the model in Phase 2A (`hasAttachments:false` in payload;
  attachments only set `Attachment Review Required`).

## Permissions / approval authority
- Send guard is fail-closed: 9 conditions must all pass (`evaluateSendGuards`).
- Red requires `Approved By Email == CEO_APPROVER_EMAIL`; Krisha cannot approve Red.
- Agent writes `AI Draft` only; `Final Copy` is human-controlled and never overwritten.
- `Human Edited` is derived (Final Copy ≠ AI Draft), not a trust-the-checkbox flag.

## Data separation
- Phase 2A operates on the **A1 Creative** lane only (`Brand='A1 Creative'` in every query,
  capture, and send filter). TBF, A/1 Suppliers, and Holdings data are never read or written.
- Outbound is locked to `operations@a1creativeagency.com` (single mailbox in `doSendOne_`).

## Model governance
- `validateModelConfiguration()` blocks processing when the running model ≠ the validated model.
- Provider is pluggable via `AI_PROVIDER` with isolated adapters (no provider logic leaks).

## Remaining risks / notes
- `UrlFetchApp` has no per-request timeout API; `MODEL_TIMEOUT_SECONDS` is advisory. Mitigated by
  `DAILY_AGENT_CALL_LIMIT`, `MAX_AGENT_RECORDS_PER_RUN`, and `EXECUTION_TIME_BUDGET_SECONDS`.
- Redaction is regex-based (best-effort); it reduces but cannot guarantee elimination of every
  sensitive token. Attachments-excluded + human approval are the backstops.
- Reply uses the latest inbound message's `reply()` (sender only), not `replyAll` — avoids CC leakage.
- Thread risk floor can only be lowered by a logged CEO override (`Thread Risk Override` fields).
