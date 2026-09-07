# A/1 Creative Agency — A2P 10DLC Resubmission Source of Truth

Effective: August 24, 2026

## Locked consent architecture

- The only initial SMS consent source is `https://a1creativeagency.com/quote`.
- The checkbox is optional and unchecked by default.
- A quote submits successfully without SMS consent.
- `/assessment` and `/contact` do not collect SMS consent.
- A phone number, call, voicemail, missed call, inbound text, or verbal statement is not SMS consent.
- No purchased, rented, imported, or third-party list creates consent.
- No keyword is advertised or accepted as an initial enrollment method.
- The customer is never sent an automatic missed-call text.
- Public sender name: **A/1 Creative Agency**.
- Public number: **(513) 440-3329**.
- Support email: **operations@a1creativeagency.com**.

## Exact quote-form disclosure

> I agree to receive text messages from A/1 Creative Agency about my quote request and appointments. Message frequency varies. Msg & data rates may apply. Reply STOP to opt out or HELP for help.

Supporting line:

> SMS consent is optional and is not a condition of receiving a quote or purchasing services.

Disclosure version stored with qualifying consent:

`A1-SMS-QUOTE-2026-01`

## Consent evidence

For a qualifying `/quote` opt-in, the backend stores:

- SMS consent = true
- server-generated consent timestamp
- Airtable record creation time as the submission timestamp
- source = `/quote`
- disclosure version = `A1-SMS-QUOTE-2026-01`
- IP address when available
- preferred contact method
- normal lead fields

For quote submissions without consent, SMS consent is false and no consent timestamp, version, source, or IP evidence is created.

## Twilio behavior

- Keep Twilio Advanced Opt-Out enabled for carrier handling of STOP and HELP.
- The inbound webhook sends no automatic application reply.
- STOP downgrades a known lead's consent to false while preserving the original consent timestamp, disclosure version, and source as evidence. The opt-out event and time are stored in the Automation Log.
- START does not create or restore consent in A/1's records.
- Ordinary inbound texts are routed to operations for review and do not create consent.
- The missed-call handler creates internal callback work and voicemail only; it does not text the caller.

## Campaign copy

### Campaign description

> A/1 Creative Agency sends customer-care text messages only to people who voluntarily opt in through the optional, unchecked SMS checkbox on our quote form at https://a1creativeagency.com/quote. Messages concern the person's quote request and appointments. Consent is not required to receive a quote or purchase services. Message frequency varies. Message and data rates may apply. Recipients may reply STOP to opt out or HELP for help.

### How end users consent

> End users opt in only at https://a1creativeagency.com/quote by voluntarily checking a separate SMS-consent checkbox that is unchecked by default. The checkbox states: “I agree to receive text messages from A/1 Creative Agency about my quote request and appointments. Message frequency varies. Msg & data rates may apply. Reply STOP to opt out or HELP for help.” The supporting line states: “SMS consent is optional and is not a condition of receiving a quote or purchasing services.” The quote can be submitted without checking the box. The assessment and contact forms do not collect SMS consent. A phone number, call, voicemail, missed call, inbound text, or verbal statement is not consent. Consent evidence is stored with a timestamp, source, disclosure version, and IP when available.

### Sample messages

1. `A/1 Creative Agency: Hi Jordan, we received your quote request. When is a good time to discuss the project? Msg frequency varies. Msg & data rates may apply. Reply STOP to opt out or HELP for help.`
2. `A/1 Creative Agency: Reminder — your project call is tomorrow at 2:00 PM. Reply to confirm or call (513) 440-3329. Reply STOP to opt out or HELP for help.`
3. `A/1 Creative Agency: Your requested quote update is ready. Please check your email or call (513) 440-3329 with questions. Reply STOP to opt out or HELP for help.`

### Public URLs

- Opt-in form: https://a1creativeagency.com/quote
- Privacy Policy: https://a1creativeagency.com/privacy
- Terms & Conditions: https://a1creativeagency.com/terms

## Required preview QA before resubmission

1. Confirm `/quote` shows exactly one SMS checkbox and it is unchecked.
2. Submit `/quote` once with SMS consent and once without it.
3. Confirm both submissions create leads.
4. Confirm only the opted-in record has the consent timestamp, source, version, and IP evidence.
5. Confirm `/assessment` and `/contact` contain no SMS checkbox.
6. Confirm a missed call produces voicemail/internal callback work but no customer SMS.
7. Confirm the site contains no unverified `A/1 Creative Agency LLC` branding.
8. Confirm Privacy and Terms describe the single `/quote` path.
9. Verify STOP and HELP through Twilio Advanced Opt-Out.
10. Capture screenshots and Airtable evidence for the resubmission record.

## CEO-only steps

Cecil handles only the login, account verification, payment, and final resubmission approval in Twilio/Netlify. The system prepares the copy, preview, QA evidence, and deployment package. Do not deploy production without CEO approval.

This file is operational guidance, not legal advice. Have final legal language reviewed if counsel is available.
