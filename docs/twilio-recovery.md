# A1 voice connection and missed-call recovery

This change covers the existing A1 website's phone integration. It does not change website pages, TRHUE's number, or a shared Messaging Service.

## Production wiring

Business number: **+15134403329**. Owner destination: the verified private `OWNER_CELL` environment value.
Production website: `https://a1creativeagency.com`.
Production Git branch: `claude/a1-creative-website-2-fresh`.

| Event | POST URL |
| --- | --- |
| A call comes in | https://a1creativeagency.com/api/twilio/voice |
| Dial completes (generated in TwiML) | https://a1creativeagency.com/api/twilio/missed-call |
| Call status changes / outbound leg status | https://a1creativeagency.com/api/twilio/dial-status |
| Caller finishes recording (generated in TwiML) | https://a1creativeagency.com/api/twilio/voicemail |
| Recording ready or absent (generated in TwiML) | https://a1creativeagency.com/api/twilio/recording-status |

The incoming number must use **Webhook**, not the old `ForwardCall` TwiML Bin, to use the canonical voice implementation. The existing fallback greeting can remain configured. Fallback handlers cover webhook execution errors; the Dial action handles unanswered/busy/failed destinations.

## Environment

Supply secrets using Netlify's Functions environment scope. Do not commit them or paste them into chat.

- `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN`: the account that owns the A1 number. Both are required to authenticate webhooks.
- `TWILIO_PHONE_NUMBER=+15134403329`
- `OWNER_CELL`: verified owner number in full US E.164 format (`+1` plus ten digits).
- `AIRTABLE_BASE_ID` for the existing Lead Operations base, `AIRTABLE_API_KEY` or `AIRTABLE_TOKEN` with write access to Leads, Tasks and Automation Logs.
- Existing `RESEND_API_KEY` and a verified `NOTIFY_FROM` sender. Operations mail goes to `operations@a1creativeagency.com`; `NOTIFY_CC` only adds copies.

Deploy after environment changes. A saved environment value alone does not update an older deployment.

## Connect safely

Run `npm ci` and `npm test` first. After the production deploy is published, supply the Twilio credentials securely to the local process environment.

```sh
npm run twilio:audit
node scripts/twilio-connect.mjs --apply-voice
```

Audit is read-only. Apply verifies the account owns the voice-capable number, checks the signed production voice response dials the correct owner and includes the recovery callbacks, saves a routing backup in the OS temporary directory, updates only A1's voice URL/application selection/status callback, and reads back the result. It does not send messages or place calls. Keep the backup until real-call acceptance passes. It preserves the existing fallback and SMS settings.

Any account restriction must be resolved through Twilio’s account/support process. An `active` API status and valid XML do not prove those restrictions have been lifted. A routing change cannot remove a carrier or account restriction.

## Behavior and limits

- Incoming voice authenticates the request and immediately returns forwarding TwiML. An invalid destination goes to recovery instead of dialing a malformed number or creating a loop.
- A completed connection hangs up normally. Busy, no-answer, or failed forwarding creates/upserts a lead and callback task keyed by CallSid, emails operations, attempts one owner SMS when a new task is created, then offers voicemail.
- Tasks use the actual `Task Title` field. Retries preserve an existing task's status and lead status. Initial status writes are separately logged on failure. They are not retried automatically to avoid reopening completed work.
- Each remote operation is capped at 2.5 seconds. CRM and notification failures still return voicemail. These notifications are best-effort, not a durable background queue: an aborted caller connection, unavailable dependencies, or a failed first SMS can require manual recovery from function/call logs. Owner SMS delivery requires a working Twilio account and approved messaging configuration.
- Operations voicemail email is driven by recording-ready events, including when callers hang up while recording. The recording link requires Twilio authorization; recordings are not made public.
- No automatic caller text is sent. A missed call never creates customer SMS consent. Existing inbound SMS/STOP behavior is preserved.
- Cellphone carrier voicemail counts as an answered call to Twilio. Set the forwarding timeout shorter than the cell's voicemail pickup and verify it in a real call. A caller who hangs up before the Dial action runs may appear only in call status logs; this implementation does not create callback tasks from status events.
- Resend idempotency keys reduce duplicate emails on callback retries within the provider's retention window. There is no guarantee of exactly-once external delivery.

## Real-call acceptance (required before claiming service restored)

1. Call the owner cell directly from another phone. Confirm it accepts calls.
2. Call **513-440-3329** from a separate phone, answer on the owner cell, and confirm two-way audio and clean hangup. Do not call the business number from the forwarding destination for this test.
3. Repeat and leave the owner cell unanswered. Hear the business voicemail prompt, record a short test message, and hang up. Confirm one Lead, one callback Task, operations missed-call email, and the subsequent playable voicemail notification. Check owner SMS delivery separately.
4. In Twilio call logs, match parent and child CallSid. In Netlify logs look for `a1_voice_received`, `a1_call_status`, `a1_dial_outcome`, `a1_recovery_result`, and `a1_recording_status`. The logs report provider failures without credentials.
5. An unsigned HTTP request returning 403 proves only the authentication gate is responding. It does not verify forwarding, the owner cell, CRM, email, or SMS.

Local tests use signed synthetic requests and mocked providers. They cover routing, wrong signatures/accounts, invalid destination, answered vs missed outcomes, task field correctness, retry deduplication, owner-only SMS, recording-ready notifications, and dependency timeouts. They never call customers.

References: [Twilio Dial](https://www.twilio.com/docs/voice/twiml/dial), [Twilio Record](https://www.twilio.com/docs/voice/twiml/record), [Netlify function environment](https://docs.netlify.com/build/functions/environment-variables/).
