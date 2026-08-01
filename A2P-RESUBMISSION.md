# A1 Creative — A2P 10DLC Resubmission Kit

**Why the campaign was rejected:** the carrier tested the opt-out and it "wasn't
going through" — texting **STOP** to the number got no reply, so they could not
verify that people could opt in/out. Two things caused that: (1) the number had
**no Messaging webhook**, so STOP/HELP were never answered; (2) the **Privacy
Policy and Terms links were dead 404s**. Both are now fixed in this build.

**What's fixed (live on the preview, pending your approval to go to production):**
- Inbound SMS handler that replies to **STOP / UNSUBSCRIBE / END / QUIT / CANCEL**
  (unsubscribe + confirmation), **HELP / INFO** (branded help), and **START / YES /
  UNSTOP** (resubscribe). Unit-tested.
- **/privacy** and **/terms** pages with full SMS-program disclosures, plus 301
  redirects so no legal link 404s.
- Voice greeting + owner forward, missed-call text-back, and voicemail handlers.

---

## Part A — 🟧 What you do in the consoles (in order)

### 1. Netlify — set the Twilio env vars (both contexts)
Site **a1creativeagency4** → Site configuration → Environment variables. Set for
**Production _and_ Deploy previews**:
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`  ← required, or the STOP/HELP handler rejects Twilio's request
- `TWILIO_PHONE_NUMBER` = `+15134403329`
- `OWNER_CELL` = the cell to forward calls / alerts to (E.164, e.g. `+1513…`)

(Never paste these values into chat, a commit, or a screenshot.)

### 2. Twilio — point the number's webhooks
Phone Numbers → Manage → Active numbers → **(513) 440-3329**:
- **Voice — "A Call Comes In":**  `https://a1creativeagency.com/api/twilio/voice`  · HTTP **POST**
- **Messaging — "A Message Comes In":**  `https://a1creativeagency.com/api/twilio/sms`  · HTTP **POST**

> To test **before** production merge, use the preview host instead:
> `https://deploy-preview-15--a1creativeagency4.netlify.app/api/twilio/sms`
> (env vars must be set for the Deploy-preview context — step 1).

### 3. Twilio — keep Advanced Opt-Out ON
Messaging Service → **Opt-Out Management**: leave **Advanced Opt-Out enabled**.
That is the carrier-level guarantee; our handler is the application-level backup
and provides the branded confirmation copy carriers look for.

### 4. Verify the opt-out cycle — in this exact order
Advanced Opt-Out sends the replies. **Deploy the `OptOutType` dedup fix first**
(see step 0 below) so each keyword produces exactly ONE reply. Then, from any
phone, text the number in THIS order — do **not** lead with STOP, because after
an opt-out Twilio may suppress further outbound (including HELP) to that number:

1. **HELP** → one branded help reply.
2. **STOP** → confirm **exactly one** opt-out reply.
3. **START** → confirm **exactly one** re-subscribe reply.
4. **HELP** again → confirms the number can receive messages after re-subscribing.

Only resubmit once each keyword returns exactly one reply.

### 0. Deploy the webhook dedup fix BEFORE testing (prerequisite)
With Advanced Opt-Out enabled, Twilio sends its own STOP/START/HELP reply **and**
forwards the inbound message to the webhook with `OptOutType=STOP|START|HELP`.
The webhook must NOT send a second reply. Rule: **if `OptOutType` is present →
record/log if needed, return HTTP 200, send no application response.** This is
implemented in `netlify/functions/twilio-sms.mjs` and must be live on production
before the phone test, or STOP/HELP/START each produce two replies.

### 5. Edit the campaign — do NOT delete it
Messaging → Regulatory Compliance → A2P 10DLC → your Campaign → **Edit**
(deleting forces a new brand vetting + re-fee). Update the fields with Part B,
then **Resubmit**.

---

## Part B — Exact copy to paste into the A2P Campaign

**Campaign use case:** use the type the **approved Brand is permitted to run** —
do not change it casually on resubmission:
- **Customer Care** — if messages are strictly inquiry responses, appointment
  reminders/confirmations, project follow-ups, and support (this is A1's case).
- **Low Volume Mixed** — only if the Brand is eligible AND messages also include
  promotional/mixed content. Not an automatic option for Sole Proprietors.
- **Sole Proprietor** — only if the Brand was registered as a Sole Proprietor
  (that registration is limited to the Sole Proprietor use case).

**Campaign description:**
> A1 Creative Agency sends customer-care and account messages to people who
> contacted us through our website or by phone: replies to quote/assessment
> requests, appointment reminders and confirmations, project follow-ups, and
> missed-call callbacks. Recipients opt in on our web forms or by replying to a
> text, and can opt out anytime by replying STOP.

**How do end users consent (opt-in)?**  *(Web-form opt-in only — there is no
text-to-join keyword, so do not describe or list one.)*
> End users opt in by voluntarily checking a separate, unchecked SMS-consent
> checkbox on A1 Creative Agency's public quote form or Business Infrastructure
> Assessment form at https://a1creativeagency.com. The box reads: "By checking
> this box I agree to receive SMS messages from A1 Creative Agency about my
> assessment and services (appointment, follow-up, and account messages), about
> 2–6 messages/month. Msg & data rates may apply. Reply STOP to opt out, HELP for
> help. Consent is not a condition of any purchase." The box sits beside links to
> the Privacy Policy and Terms, and consent is stored with a timestamp. Mobile
> opt-in data is never shared with third parties. Details:
> https://a1creativeagency.com/privacy

**Sample messages** (paste 2–3):
1. `A1 Creative Agency: Hi Jordan, thanks for requesting a build quote! Based on your assessment we recommend our Growth Infrastructure package. Reply here or call (513) 440-3329. Reply STOP to opt out, HELP for help.`
2. `A1 Creative Agency: Reminder — your discovery call is tomorrow at 2:00 PM. Reply C to confirm or R to reschedule. Msg & data rates may apply. Reply STOP to opt out.`
3. `Hi, this is A1 Creative Agency — sorry we missed your call! We'll call you right back, or reply to this text and we'll take care of you here. Reply STOP to opt out.`

**Re-subscribe keywords / message (START):** START, YES, UNSTOP — these let a
*previously opted-out* person opt back in; they are NOT the initial enrollment
method (enrollment is the web checkbox above) →
> `You are re-subscribed to A1 Creative Agency messages (about 2-6/month). Msg & data rates may apply. Reply HELP for help, STOP to unsubscribe.`

**Opt-out keywords / message (STOP):** STOP, UNSUBSCRIBE, END, QUIT, CANCEL →
> `You are unsubscribed from A1 Creative Agency and will receive no further messages. Reply HELP for help or START to resubscribe.`

**Help keywords / message (HELP):** HELP, INFO →
> `A1 Creative Agency: help at (513) 440-3329 or operations@a1creativeagency.com. Msg frequency varies (about 2-6/month). Msg & data rates may apply. Reply STOP to unsubscribe.`

**Message frequency:** Recurring, about 2–6 messages per month.
**Privacy Policy URL:** https://a1creativeagency.com/privacy
**Terms URL:** https://a1creativeagency.com/terms

---

## Notes
- **Status: the rejection fixes are LIVE on production (`a1creativeagency.com`).**
  The `a1-creative-production` branch already ships the inbound SMS handler
  (`netlify/functions/twilio-sms.mjs`), the `/privacy` and `/terms` pages, and the
  `/api/twilio/sms` + legal-variant redirects in `netlify.toml`. The handler's
  STOP / HELP / START replies match the "Opt-out / Help / Opt-in message" copy in
  Part B word-for-word. So the two things that caused the rejection — a dead STOP
  path and 404 legal links — are resolved on the live site. What remains is the
  console + carrier work in Part A (env vars, webhook, opt-out test, resubmit).
- The remaining Part A steps require the Twilio account credentials and the Twilio
  console, and A2P resubmission is a carrier process — those are owner actions and
  cannot be done from the codebase.
- **Website 2.0 note:** the redesigned site (branch `claude/a1-creative-website-2-fresh`)
  moves the opt-in forms to `/quote`, `/assessment`, and `/contact` and brands them
  "A/1 Creative Agency"; the required disclosures (sender, message types, frequency,
  rates, STOP, HELP, consent-not-a-condition, Privacy/Terms links) are materially the
  same. If you resubmit now, do it against the current production copy above. If you'd
  rather submit against 2.0, deploy it first and I'll align this kit's opt-in wording
  and URLs to the 2.0 forms.
- Until the campaign is carrier-approved, the missed-call text-back may be
  filtered. Voice greeting/forward/voicemail work regardless of A2P.
- Legal wording is a first draft in the site's design — have you or your attorney
  review `/privacy` and `/terms` before relying on them.
