# A1 Operations — Automation Map

All automation runs in **Google Apps Script** (bound to operations@) + **Airtable REST**.
No Make.com. No new platforms. Nothing sends while `SHADOW_MODE`/send switches are locked.

| Trigger (future, owner-installed) | Function | Effect | Sends? |
|---|---|---|---|
| every 10 min | `captureInbox()` | Gmail(`A1C/Shadow`/`A1C/Intake`) → Inbox Queue; **detect original recipient → lock Entity → resolve Approved Send From**; dedupe by Gmail Message ID | no |
| every 10 min | `analyzePendingEmails()` | classify, summarize, draft (AI Draft), route Green/Yellow/Red, escalate Red to ACOS | no |
| every 10 min | `sendApproved()` | send guards + **entity guard**; blocked by `SHADOW_MODE_LOCK` in shadow | no (locked) |
| every 30 min | `processRejects()` | mark Reject → Discarded | no |
| hourly | `processOverdueFollowUps()` | flag overdue follow-ups | no |
| daily | `generateDailyOpsReport()` | build + log the A1 Operations Daily Report | no |

Manual (owner runs from editor during shadow): `validateModelConfiguration`, `testAgentConnection`,
`runAllPhase2Tests`, one-shot `captureInbox`/`analyzePendingEmails`.

**Not installed yet** — triggers await CEO approval (section 30). Reuse over replacement: existing
Twilio/website automations (Vercel) are unrelated and untouched.
