/* Incoming-call webhook for (513) 440-3329. Greets the caller, then rings the
   owner's cell. The <Dial action> hands the outcome to /api/twilio/missed-call,
   which runs voicemail + text-back recovery when the call isn't answered.

   Point the number's Voice webhook (A Call Comes In) here:
     https://a1creativeagency.com/api/twilio/voice   (HTTP POST) */

import {
  parseTwilioBody,
  isValidTwilioRequest,
  twiml,
  xmlEscape,
  methodNotAllowed,
  forbidden,
} from './_lib/twilio.mjs';

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return methodNotAllowed();

  const params = parseTwilioBody(event);
  if (!isValidTwilioRequest(event, params)) return forbidden();

  const greeting = 'Thank you for calling A 1 Creative Agency. Please hold while we connect you.';
  const ownerCell = process.env.OWNER_CELL;

  if (!ownerCell) {
    // No forward target configured — go straight to the voicemail flow.
    return twiml(
      `<Response><Say voice="Polly.Joanna">${xmlEscape(greeting)}</Say>` +
        `<Redirect method="POST">/api/twilio/missed-call</Redirect></Response>`
    );
  }

  return twiml(
    `<Response>` +
      `<Say voice="Polly.Joanna">${xmlEscape(greeting)}</Say>` +
      `<Dial action="/api/twilio/missed-call" method="POST" timeout="20" answerOnBridge="true">${xmlEscape(ownerCell)}</Dial>` +
      `</Response>`
  );
};
