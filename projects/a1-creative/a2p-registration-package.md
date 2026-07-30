# A/1 Creative Agency — A2P 10DLC Registration Package

**Prepared:** July 30, 2026
**Purpose:** Everything needed to complete the Twilio A2P 10DLC **Brand** and
**Campaign** registration for the (513) 440-3329 messaging number, and to verify
the Twilio-side legal information matches our records.

> **Submission is Cecil's protected action.** This session has no Twilio access.
> This package is written so Cecil (or whoever holds Twilio Console access) can
> submit/repair Brand + Campaign directly, and so the values can be checked line-
> by-line against what is already in Twilio.

Legend: ✅ = confirmed from records · ⚠️ = **Cecil must confirm/supply** before submit.

---

## 1. Brand (Business Profile) — A2P Brand Registration

| Field | Value | Source |
|---|---|---|
| Legal business name | **A/1 Creative Agency** ✅ (forward slash, **no "LLC"** — confirmed by owner 2026-07-30; add "LLC" only if the IRS EIN letter shows it) | Owner-confirmed |
| DBA / brand name | A/1 Creative Agency | Brand system |
| Business type | Private company ⚠️ (confirm sole-prop vs LLC against the EIN letter) | Cecil |
| EIN / U.S. Tax ID | ⚠️ **PROVIDE** — must match the IRS EIN letter exactly | Cecil |
| Business registration country | United States ✅ | — |
| Business industry | Professional Services (Marketing / Advertising / Technology) ✅ | — |
| Website | https://a1creativeagency.com ✅ | Live |
| Business address (street) | ⚠️ **PROVIDE** street address | Cecil |
| City / State / ZIP | Cincinnati, OH ⚠️ (confirm ZIP — Avondale) | Brand system |
| Business contact — name | Cecil Trimble ✅ | Brand system |
| Business contact — email | cecil@a1creativeagency.com ✅ | Brand system |
| Business contact — phone | +1 513 440 3329 ✅ | Brand system |
| Stock symbol / exchange | N/A (private) ✅ | — |

**Critical match note:** The owner has confirmed the legal business name is
**`A/1 Creative Agency`** — with the slash, and **no "LLC"**. Register the Brand
with this exact string across the Twilio Customer Profile, A2P Brand, and
Campaign. Do **not** use "A1 Creative Agency" and do **not** append "LLC" unless
the IRS EIN letter itself shows it. The Brand legal name + EIN + address must
match the IRS EIN record exactly or the Brand fails vetting, so verify the EIN
letter letter-for-letter before submitting.

---

## 2. Campaign — A2P Campaign Registration

| Field | Value |
|---|---|
| Use case | **Mixed** (a.k.a. Low Volume Mixed) — customer care + account/lead notifications ✅ |
| Campaign description | "A/1 Creative Agency sends service and follow-up texts to people who contact us or request a quote: quote and appointment updates, lead and inquiry follow-up, missed-call recovery, and account or service notifications. Recipients opt in on our website form or by contacting our business line. We do not send third-party marketing." |
| Message sample 1 (missed-call recovery) | "A/1 Creative Agency: Sorry we missed your call! What can we help you build — website, leads, or automation? Reply here and we'll get right back. Msg&data rates may apply. Reply STOP to opt out, HELP for help." |
| Message sample 2 (lead follow-up) | "Hi {Name}, thanks for your quote request with A/1 Creative Agency. Is now a good time for a quick 15-min infrastructure call this week? Reply STOP to opt out, HELP for help." |
| Message sample 3 (appointment) | "A/1 Creative Agency: your infrastructure call is set for {Date} at {Time}. Reply C to confirm or R to reschedule. Msg&data rates may apply. Reply STOP to opt out." |
| Message sample 4 (service notification) | "A/1 Creative Agency: your website build is live and your lead form is now capturing to your CRM. Questions? Reply here. Reply STOP to opt out, HELP for help." |
| Uses embedded links? | No (or a first-party a1creativeagency.com link only) — **no public URL shorteners** |
| Uses embedded phone numbers? | Yes — our own (513) 440-3329 only |
| Age-gated content? | No |
| Direct lending / loans? | No |

---

## 3. Opt-in / Consent — how end users subscribe (the CTA reviewers check)

**Primary opt-in (documented, web):** End users submit the quote form at
`https://a1creativeagency.com/sms-consent` (and the site contact form). The form
has an **unchecked** consent checkbox with this exact wording, tagged
**consent text version `v2026-07-30`**:

> *I agree to receive SMS text messages from **A/1 Creative Agency** at the mobile
> number I provided, including quote and appointment updates, lead follow-up,
> missed-call recovery, and account or service notifications. Message frequency
> varies. Message & data rates may apply. Reply STOP to opt out or HELP for help.
> Consent is not a condition of purchase. See our Privacy Policy and Terms of
> Service.*

- Consent is **not** pre-checked and **not** a condition of purchase. ✅
- The checkbox links to the Privacy Policy (`/privacy`) and Terms (`/terms`). ✅
- Every opt-in is stored in the CRM (Airtable Leads) with: `SMS Consent` = true,
  server `SMS Consent Timestamp`, `SMS Consent Text Version` = v2026-07-30,
  `Consent Source URL`, and `Consent IP`. ✅ (verified — fields accept these values)

**Secondary opt-in (verbal / existing relationship):** Callers to (513) 440-3329
who reach voicemail or miss us receive a one-time missed-call recovery text as a
direct response to their own inbound contact.

**Opt-in screenshot for submission:** ⚠️ Once `/sms-consent` is live, capture a
screenshot of the form + checkbox wording and attach it to the campaign — Twilio
reviewers frequently request visual proof of the CTA.

**Privacy Policy SMS clause (required, present):** the Privacy Policy at
`/privacy` states: *"No mobile information will be shared with third parties or
affiliates for marketing or promotional purposes … this information will not be
shared with any third parties."* ✅

---

## 4. Opt-out (STOP) & Help (HELP) handling — configure on the Messaging Service

| Keyword | Auto-reply to configure |
|---|---|
| **STOP** (also STOPALL, UNSUBSCRIBE, CANCEL, END, QUIT) | "You are unsubscribed from A/1 Creative Agency messages and will receive no more messages. Reply HELP for help." |
| **HELP** (also INFO) | "A/1 Creative Agency: For help email support@a1creativeagency.com or call (513) 440-3329. Msg&data rates may apply. Reply STOP to unsubscribe." |
| **START / UNSTOP** | Resubscribe confirmation. |

Backend already tracks `opted_out` on the Leads table — ensure the Twilio
Advanced Opt-Out (or the Make.com/automation) sets `opted_out = true` on STOP so
no further sends go out.

---

## 5. Number → Messaging Service → Campaign wiring (order of operations)

1. **Brand** registered & approved (Section 1).
2. **Campaign** registered & approved (Sections 2–4).
3. Create/confirm a **Messaging Service**; enable **Advanced Opt-Out** with the
   STOP/HELP copy above.
4. **Attach (513) 440-3329** (+15134403329) as the sender in that Messaging
   Service's Sender Pool.
5. Link the Messaging Service to the approved Campaign.
6. Point inbound webhooks (STOP/HELP + replies) at the existing automation.

---

## 6. Twilio ↔ records match checklist (for verification step)

Have Cecil read these off the Twilio Console so we can confirm they match:

- [ ] Brand legal name in Twilio == IRS EIN name (and our records)
- [ ] EIN in Twilio == IRS EIN letter
- [ ] Business address in Twilio == records
- [ ] Website in Twilio == https://a1creativeagency.com
- [ ] Campaign use case == Mixed (or the intended use case)
- [ ] Campaign sample messages present and match Section 2
- [ ] Opt-in description references the website consent form + STOP/HELP
- [ ] (513) 440-3329 attached to the Messaging Service linked to this Campaign
- [ ] Current Brand status: __________  · Campaign status: __________

---

## 7. Open items only Cecil can close

1. ⚠️ **EIN** and the **exact** legal-name spelling on the IRS record.
2. ⚠️ **Street address** (+ ZIP) for the business profile.
3. ⚠️ Current **Twilio Brand / Campaign status** (new, failed, pending, approved?)
   so we know whether this is a fresh submit or a repair.
4. ⚠️ Confirm the intended **use case** (Mixed vs. Customer Care) if different
   from the recommendation above.
