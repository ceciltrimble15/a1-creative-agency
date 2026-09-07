/* Inbound SMS webhook for the A1 Creative number (513) 440-3329.

   Twilio Advanced Opt-Out is ENABLED on the Messaging Service and is the SOLE
   owner of the STOP / START / HELP replies (and any configured secondary opt-out
   keyword replies). When Advanced Opt-Out processes one of those keywords it:
     (a) sends the single, carrier-compliant reply itself, and
     (b) forwards the inbound message to this webhook with an `OptOutType`
         parameter set to STOP, START, or HELP.

   To avoid sending a DUPLICATE confirmation, this webhook NEVER sends an SMS of
   its own. On an OptOutType event it records opt-outs and logs other keyword events,
   returns an empty 200 TwiML (no <Message>). Ordinary inbound messages (no
   OptOutType) are logged and forwarded
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

/* Record an opt-out against a known contact. This webhook never upgrades
   consent: initial SMS consent is accepted only through /quote. */
async function recordOptOut(from) {
  try {
    const found = await findLead({ phone: from });
    if (found.ok && found.record) {
      // Preserve the original consent timestamp, disclosure version, and source.
      // They are evidence of how consent was obtained and must not be replaced
      // by the later opt-out event. The Automation Log records the STOP time.
      await updateLead(found.record.id, {
        [LEAD_FIELDS.smsConsent]: false,
      });
    }
  } catch (err) {
    console.error('recordOptOut failed:', err.message);
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
        recordOptOut(from),
        logAutomation('sms_opt_out', `${from} opted out — Twilio Advanced Opt-Out sent the reply`),
      ]);
    } else if (optOutType === 'START') {
      await logAutomation('sms_keyword_ignored', `${from} sent START — no consent was recorded; /quote is the only opt-in source`);
    } else if (optOutType === 'HELP') {
      await logAutomation('sms_help', `${from} requested help — Twilio Advanced Opt-Out sent the reply`);
    } else {
      await logAutomation('sms_optout_other', `${from} OptOutType=${optOutType} — Twilio Advanced Opt-Out sent the reply`);
    }
    // Twilio Advanced Opt-Out owns the reply. Send nothing; acknowledge with 200.
    return emptyTwiml();
  }

  // Ordinary inbound message (no OptOutType). Forward to ops and log; do not
  // auto-reply and do not treat the inbound message as consent.
  await Promise.all([
    notifyOps(
      `SMS reply from ${from}`,
      `From: ${from}\nMessage: ${bodyText || '(no text)'}`
    ),
    logAutomation('sms_inbound', `Reply from ${from}: ${bodyText}`),
  ]);
  return emptyTwiml();
};
