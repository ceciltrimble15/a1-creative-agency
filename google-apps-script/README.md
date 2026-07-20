# A1 Creative — Email Spine (Google Apps Script)

Direct email spine for **operations@a1creativeagency.com**. No Make.com.
No new platforms. Runs entirely on Google Workspace + Airtable.

## Why Apps Script (direct method selected)

The current stack was checked for a direct connection to the operations@
Gmail mailbox:

| Candidate | Available? | Verdict |
|---|---|---|
| Gmail connector (MCP/Zapier/etc.) | No | Not in the authorized stack — would be a new platform |
| Existing Vercel serverless (`/api`) | Yes, but | Can send via Resend, but cannot **read** or **reply as** the operations@ Gmail mailbox without adding Google OAuth infra |
| **Google Apps Script** (bound to operations@) | **Yes** | **Native to Google Workspace. Reads Gmail, writes Airtable REST, replies in-thread from operations@. Zero new platforms. Selected.** |

Apps Script is part of the Google Workspace account you already own, so it is
the smallest direct architecture that satisfies "capture and reply **from**
operations@a1creativeagency.com."

## Files
- `a1-creative-email-spine.gs` — module manifest / orchestration header.
- **Phase 2A supervised-intelligence layer** (modules + `tests/`) — classify, summarize,
  draft, route Green/Yellow/Red, PII redaction, fail-closed send guards, sticky thread risk.
  Not deployed. See `docs/phase2a/` (audit, migration, test results, deployment, security).
  Nothing auto-sends; `AUTO_SEND_ENABLED` stays false in Phase 2A.

## Deploy (one time, ~10 min)
1. Sign in to Google as **operations@a1creativeagency.com**.
2. Go to **script.google.com → New project**, paste `a1-creative-email-spine.gs`.
3. **Project Settings → Script properties**, add `AIRTABLE_TOKEN` = an Airtable
   personal access token with `data.records:read`, `data.records:write`,
   `schema.bases:read` on the A1 Creative Agency Hub and ACOS bases.
4. Run **`installTriggers`** once and approve the Gmail + external-request scopes.
5. In Gmail, create/apply the label **`A1C/Intake`** to the messages that should
   become intake rows (or edit `INTAKE_QUERY` in the script). Captured threads are
   tagged `A1C/Captured` so nothing is processed twice.

## What each function does
- `captureInbox()` — pulls labeled Gmail threads → creates Inbox Queue rows
  (Subject, From, Preview, Received At, Brand=A1 Creative, Priority auto-set,
  Status=Pending Review, Send From=operations@, Gmail Thread ID). Urgent mail
  also escalates to ACOS.
- `sendApproved()` — finds rows Cecil marked **Approve** with no Sent At →
  replies **in the original Gmail thread, from operations@** using Final Copy
  (or Claude Draft) → writes Status, Sent At, and a Follow-Up date.
- `processRejects()` — marks **Reject** rows Discarded; never sends.
- `escalateToAcos` / `escalateOne_()` — creates an ACOS **04 – CEO Approval
  Queue** record for urgent items and writes the ref back.

## Guardrails
- **Nothing auto-sends.** `sendApproved()` only touches rows explicitly Approved.
- **One outbound mailbox:** replies always go `from: operations@a1creativeagency.com`.
- **A1 Creative lane only.** TBF / A/1 Suppliers / Holdings untouched.
- Summary + draft remain the existing Claude step; the script only auto-sets a
  coarse Priority so no AI platform is added.
