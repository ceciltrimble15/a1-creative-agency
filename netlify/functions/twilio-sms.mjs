/* Inbound SMS webhook for the A1 Creative number (513) 440-3329.

   Twilio Advanced Opt-Out is ENABLED on the Messaging Service and is the SOLE
   owner of the STOP / START / HELP replies (and any configured secondary opt-out
   keyword replies). When Advanced Opt-Out processes one of those keywords it:
     (a) sends the single, carrier-compliant reply itself, and
     (b) forwards the inbound message to this webhook with an `OptOutType`
         parameter set to STOP, START, or HELP.

   To avoid sending a DUPLICATE confirmation, this webhook NEVER sends an SMS of
   its own. On an OptOutType event it only records/logs the consent change and
   returns an empty 200 TwiML (no <Message>). Ordinary inbound messages (no
   OptOutType — e.g. a reply to a missed-call text-back) are logged and forwarded
   to operations@, also without an auto-reply. The handler imports no SMS-send
   helper, so it is structurally incapable of generating an outbound message.

   Point the number's Messaging webhook (A Message Comes In) here:
     https://a1creativeagency.com/api/twilio/sms   (HTTP POST)

   Keep Twilio "Advanced Opt-Out" enabled at the Messaging Service — that is the
   carrier-level guarantee and the single source of the compliant reply copy. */

import {
  parseTwilioBody,
  isValidTwilioRequest,
  emptyTwiml,
  methodNotAllowed,
  forbidden,
} from './_lib/twilio.mjs';
import { findLead, updateLead, logAutomation, LEAD_FIELDS } from './_lib/airtable.mjs';
import { notifyOps } from './_lib/notify.mjs';

/* Flip the Lead's SMS Consent flag when a known contact opts in/out, so the
   record reflects the caller's latest choice. Best-effort — never blocks the
   TwiML response and never sends a message. */
async function recordConsentChange(from, optedIn) {
  try {
    const found = await findLead({ phone: from });
    if (found.ok && found.record) {
      await updateLead(found.record.id, {
        [LEAD_FIELDS.smsConsent]: optedIn,
        [LEAD_FIELDS.smsConsentAt]: new Date().toISOString(),
        [LEAD_FIELDS.consentSourceUrl]: 'SMS keyword reply (Twilio Advanced Opt-Out)',
      });
    }
  } catch (err) {
    console.error('recordConsentChange failed:', err.message);
  }
}

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return methodNotAllowed();

  const params = parseTwilioBody(event);
  if (!isValidTwilioRequest(event, params)) return forbidden();

  const from = params.From || '';
  const bodyText = (params.Body || '').trim();

  // Advanced Opt-Out sets OptOutType (STOP | START | HELP, or a configured
  // secondary keyword's category) once it has handled the keyword and sent its
  // own reply. When present, Twilio owns the reply — we must NOT send a second
  // message. Record/log the event and acknowledge with an empty 200.
  const optOutType = (params.OptOutType || '').trim().toUpperCase();

  if (optOutType) {
    if (optOutType === 'STOP') {
      await Promise.all([
        recordConsentChange(from, false),
        logAutomation('sms_opt_out', `${from} opted out — Twilio Advanced Opt-Out sent the reply`),
      ]);
    } else if (optOutType === 'START') {
      await Promise.all([
        recordConsentChange(from, true),
        logAutomation('sms_opt_in', `${from} re-subscribed — Twilio Advanced Opt-Out sent the reply`),
      ]);
    } else if (optOutType === 'HELP') {
      await logAutomation('sms_help', `${from} requested help — Twilio Advanced Opt-Out sent the reply`);
    } else {
      await logAutomation('sms_optout_other', `${from} OptOutType=${optOutType} — Twilio Advanced Opt-Out sent the reply`);
    }
    // Twilio Advanced Opt-Out owns the reply. Send nothing; acknowledge with 200.
    return emptyTwiml();
  }

  // Ordinary inbound message (no OptOutType) — e.g. a reply to a missed-call
  // text-back. Forward to ops and log; do not auto-reply (avoids unsolicited
  // messaging and any duplicate).
  await Promise.all([
    notifyOps(
      `SMS reply from ${from}`,
      `From: ${from}\nMessage: ${bodyText || '(no text)'}`
    ),
    logAutomation('sms_inbound', `Reply from ${from}: ${bodyText}`),
  ]);
  return emptyTwiml();
};
