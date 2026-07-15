/* Inbound SMS webhook for the A1 Creative number (513) 440-3329.
   THIS IS THE A2P OPT-OUT FIX: it guarantees STOP unsubscribes and HELP returns
   help, with branded confirmations, so carrier review can verify the opt-out
   path works. Also records the consent change in Airtable and forwards genuine
   replies (e.g. answers to a missed-call text-back) to operations@.

   Point the number's Messaging webhook (A Message Comes In) here:
     https://a1creativeagency.com/api/twilio/sms   (HTTP POST)

   Keep Twilio "Advanced Opt-Out" enabled at the Messaging Service too — that is
   the carrier-level guarantee. This handler is the application-level backup and
   the branded copy carriers look for. */

import {
  parseTwilioBody,
  isValidTwilioRequest,
  smsReply,
  emptyTwiml,
  methodNotAllowed,
  forbidden,
} from './_lib/twilio.mjs';
import { findLead, updateLead, logAutomation, LEAD_FIELDS } from './_lib/airtable.mjs';
import { notifyOps } from './_lib/notify.mjs';

const BRAND = 'A1 Creative Agency';
const HELP_PHONE = '(513) 440-3329';
const HELP_EMAIL = 'operations@a1creativeagency.com';

// Carrier-recognized keyword sets (case-insensitive, whitespace-trimmed).
const STOP_WORDS = new Set(['STOP', 'STOPALL', 'UNSUBSCRIBE', 'END', 'QUIT', 'CANCEL']);
const HELP_WORDS = new Set(['HELP', 'INFO']);
const START_WORDS = new Set(['START', 'YES', 'UNSTOP']);

const STOP_REPLY =
  `You are unsubscribed from ${BRAND} and will receive no further messages. ` +
  `Reply HELP for help or START to resubscribe.`;
const HELP_REPLY =
  `${BRAND}: help at ${HELP_PHONE} or ${HELP_EMAIL}. ` +
  `Msg frequency varies (about 2-6/month). Msg & data rates may apply. ` +
  `Reply STOP to unsubscribe.`;
const START_REPLY =
  `You are re-subscribed to ${BRAND} messages (about 2-6/month). ` +
  `Msg & data rates may apply. Reply HELP for help, STOP to unsubscribe.`;

/* Flip the Lead's SMS Consent flag when a known contact opts in/out, so the
   record reflects the caller's latest choice. Best-effort — never blocks the
   TwiML reply the carrier is waiting for. */
async function recordConsentChange(from, optedIn) {
  try {
    const found = await findLead({ phone: from });
    if (found.ok && found.record) {
      await updateLead(found.record.id, {
        [LEAD_FIELDS.smsConsent]: optedIn,
        [LEAD_FIELDS.smsConsentAt]: new Date().toISOString(),
        [LEAD_FIELDS.consentSourceUrl]: 'SMS keyword reply',
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
  const keyword = bodyText.toUpperCase().replace(/[^A-Z]/g, '');

  if (STOP_WORDS.has(keyword)) {
    await Promise.all([
      recordConsentChange(from, false),
      logAutomation('sms_opt_out', `${from} sent "${bodyText}" — unsubscribed`),
    ]);
    return smsReply(STOP_REPLY);
  }

  if (HELP_WORDS.has(keyword)) {
    await logAutomation('sms_help', `${from} requested help`);
    return smsReply(HELP_REPLY);
  }

  if (START_WORDS.has(keyword)) {
    await Promise.all([
      recordConsentChange(from, true),
      logAutomation('sms_opt_in', `${from} sent "${bodyText}" — resubscribed`),
    ]);
    return smsReply(START_REPLY);
  }

  // A genuine reply (e.g. answering a missed-call text-back). Forward to ops and
  // log it; do not auto-reply, to avoid unsolicited messaging.
  await Promise.all([
    notifyOps(
      `SMS reply from ${from}`,
      `From: ${from}\nMessage: ${bodyText || '(no text)'}`
    ),
    logAutomation('sms_inbound', `Reply from ${from}: ${bodyText}`),
  ]);
  return emptyTwiml();
};
