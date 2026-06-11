# A1 Creative — Backend Infrastructure Audit & Wiring Guide

Audit date: 2026-06-11. Status legend: 🟢 GREEN working · 🟡 YELLOW needs verification · 🔴 RED broken/missing.

## Audit results

### 1. Twilio (513) 440-3329

| Item | Status | Finding |
|---|---|---|
| Call routing | 🔴 → code shipped | No routing code existed anywhere. `api/twilio/voice.js` now greets and forwards to `OWNER_CELL`. Needs console wiring (below). |
| Voicemail | 🔴 → code shipped | No voicemail handling existed. `api/twilio/missed-call.js` + `api/twilio/voicemail.js` record and alert. |
| Missed-call recovery | 🔴 → code shipped | Nothing existed. Unanswered calls now: text the caller back, create an Airtable Lead + Task, alert owner + operations@. |
| A2P / SMS status | 🟡 | Account-side; cannot be read without Twilio console/API access. **If A2P 10DLC registration isn't approved, recovery texts will be filtered.** Check Console → Messaging → Regulatory Compliance. |
| Customer-facing greeting | 🔴 → code shipped | Now in `voice.js`: "Thank you for calling A1 Creative Agency…" |

### 2. Airtable

| Item | Status | Finding |
|---|---|---|
| Active base | 🟡 | Referenced only via `AIRTABLE_BASE_ID` env var on Vercel. No API access from this session to confirm. |
| Leads table | 🟡 | Code writes fields: `Lead Name`, `Phone`, `Email ` *(trailing space)*, `lead_status`, `Source` *(value has trailing space: `Website form `)*, `Client`, `Notes`, `date`. Confirm these match the base exactly. |
| Tasks table | 🔴 → code shipped | No code touched it before. New code writes: `Name`, `Status` (`To Do`), `Notes`. Align the table to these fields (or set `AIRTABLE_TASKS_TABLE`). |
| Automation Logs | 🔴 → code shipped | No code touched it before. New code writes: `Event`, `Details`, `Status`. Align the table (or set `AIRTABLE_LOGS_TABLE`). |
| Lead statuses | 🟡 | Code only ever writes `new`. Verify the base's `lead_status` options cover the pipeline you want (new → contacted → booked → closed, etc.). |

### 3. Website lead capture

| Item | Status | Finding |
|---|---|---|
| Netlify form submission | 🔴 | **The Netlify account (admin@a1creativeagency.com) has zero sites.** Nothing is deployed on Netlify. Production lead capture actually runs on **Vercel** (`/api/submit-lead`). No fix needed if Vercel is the intended platform — but stop counting on a Netlify form; it doesn't exist. |
| Lead storage | 🟡 | `ContactForm.jsx → /api/submit-lead → Airtable Leads` is correctly coded. Couldn't verify Vercel env vars or hit the live endpoint from this session (network egress blocked). Submit a test through the live form to confirm. |
| Notification to operations@ | 🔴 → code shipped | Did not exist. `notifyOps()` now emails operations@a1creativeagency.com on every lead/missed call/voicemail. Requires `RESEND_API_KEY` (free tier at resend.com). |

### 4. Follow-up system

| Item | Status | Finding |
|---|---|---|
| Missed-call follow-up | 🔴 → code shipped | `api/twilio/missed-call.js` |
| Website lead follow-up | 🔴 → code shipped | Task + notification + log added to `api/submit-lead.js` |
| Task creation | 🔴 → code shipped | Airtable Tasks row on every missed call and website lead |
| Alert system | 🔴 → code shipped | SMS to `OWNER_CELL` + email to operations@ on missed calls, voicemails, and new leads |

## To activate (one-time setup)

### Vercel env vars (project that serves this repo)

Already expected: `AIRTABLE_API_KEY`, `AIRTABLE_BASE_ID`.

Add:

| Var | Value |
|---|---|
| `TWILIO_ACCOUNT_SID` | from Twilio Console |
| `TWILIO_AUTH_TOKEN` | from Twilio Console |
| `TWILIO_PHONE_NUMBER` | `+15134403329` |
| `OWNER_CELL` | Cecil's cell, E.164 (e.g. `+1513…`) — forward target + SMS alerts |
| `RESEND_API_KEY` | from resend.com (free) — powers operations@ emails |
| `NOTIFY_FROM` | optional; verified sender, e.g. `A1 Creative <alerts@a1creativeagency.com>` |

Optional overrides: `NOTIFY_EMAIL` (default `operations@a1creativeagency.com`), `AIRTABLE_LEADS_TABLE` / `AIRTABLE_TASKS_TABLE` / `AIRTABLE_LOGS_TABLE` (defaults `Leads` / `Tasks` / `Automation Logs`).

### Twilio Console (Phone Numbers → (513) 440-3329 → Voice Configuration)

- **A call comes in** → Webhook → `https://<production-domain>/api/twilio/voice` → HTTP POST

That single setting activates routing, greeting, voicemail, and missed-call recovery (the rest chains via TwiML `action` URLs).

### Verify end-to-end

1. Call (513) 440-3329 from another phone; don't answer the forward → expect greeting, voicemail prompt, recovery text to the caller, SMS alert to `OWNER_CELL`, email to operations@, new Lead + Task + Automation Log rows.
2. Submit the live website form → expect Lead + Task + Automation Log rows and an operations@ email.

## Flow summary

```
Caller → (513) 440-3329 → /api/twilio/voice (greeting + forward to OWNER_CELL)
  answered → log "call_answered"
  missed   → /api/twilio/missed-call
               ├─ SMS the caller back
               ├─ Airtable: Lead + Task
               ├─ SMS owner + email operations@
               ├─ log "missed_call_recovery"
               └─ voicemail → /api/twilio/voicemail → alerts + log

Website form → /api/submit-lead
  ├─ Airtable: Lead (unchanged fields) + Task
  ├─ email operations@
  └─ log "website_lead_capture"
```
