# Inbox_Events Live Verification — how to run

Run this **in an environment that can reach `api.airtable.com`** (your local
machine or Vercel). Claude Web cannot reach Airtable, so it cannot run this —
that is expected and by design.

The script proves, against the real base:

1. Required tables exist (`Inbox_Events`, `Leads`, `Tasks`, `Escalations`, `Daily_Reports`)
2. `Inbox_Events` live write
3. Duplicate prevention (same `source_event_id` → exactly one row)
4. Brand routing writes the correct `brand` value (A/1 Suppliers via origin, A1 Creative via phone)
5. Failed dedup lookup creates **no** record (fail-safe)
6. Rollback: `INBOX_ENABLED` off keeps the layer dormant

It creates clearly-marked test rows (`contact_name = "VERIFY TEST (safe to
delete)"`, `source_event_id` prefixed `verify_`) and **deletes them in a
cleanup step**. It exits non-zero if any check fails.

## Required environment variables (set the VALUES yourself — never paste them here)

| Variable | Purpose |
|---|---|
| `AIRTABLE_API_KEY` | Airtable Personal Access Token with **data records read + write** on the base |
| `AIRTABLE_BASE_ID` | Target base id (`appXXXXXXXXXXXXXX`) |

Optional, only if your table names differ from the defaults:

| Variable | Default |
|---|---|
| `AIRTABLE_EVENTS_TABLE` | `Inbox_Events` |
| `AIRTABLE_LEADS_TABLE` | `Leads` |
| `AIRTABLE_TASKS_TABLE` | `Tasks` |
| `AIRTABLE_ESCALATIONS_TABLE` | `Escalations` |
| `AIRTABLE_REPORTS_TABLE` | `Daily_Reports` |

## Exact commands

Local (replace nothing in these lines except by exporting the vars first):

```bash
npm install
export AIRTABLE_API_KEY=...      # your PAT — not shown anywhere
export AIRTABLE_BASE_ID=...      # your base id
npm run verify:inbox
```

Vercel (run as a one-off where the project env vars already exist):

```bash
vercel env pull .env.local       # pulls AIRTABLE_* into .env.local (gitignored)
node --env-file=.env.local scripts/verify-inbox.mjs
```

## Expected output

```
── Inbox_Events live verification ──
PASS  Table exists: Inbox_Events
... (all five tables)
PASS  Live write created an Inbox_Events row
PASS  Duplicate prevented (deduped, exactly one row)
PASS  Brand routed A/1 Suppliers (origin a1suppliers.org)
PASS  Brand routed A1 Creative (phone +15134403329)
PASS  Failed lookup created NO record (returned at dedup gate)
PASS  Rollback flag works (off by default and when "false"; on only when set)

7 passed, 0 failed
```

Exit codes: `0` all passed · `1` a check failed (or harness threw) · `2`
missing env vars · `3` cannot reach api.airtable.com.

## Notes

- **Step 1 prerequisite:** the five tables must already exist per
  `airtable-setup.md`. Test 1 will FAIL clearly if any is missing — that is the
  signal to finish physical table creation first.
- The script never prints the PAT or base id.
- It does not wire any handler and does not depend on `INBOX_ENABLED`; the
  ingestion layer remains dormant in production until handlers are wired in a
  later, separately-approved step.
- Step 5 (Lead migration) stays blocked until this passes `7 passed, 0 failed`.
