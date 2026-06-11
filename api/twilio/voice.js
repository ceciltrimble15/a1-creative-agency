import { isValidTwilioRequest, sendTwiml, xmlEscape } from '../_lib/twilio.js';

/* Incoming call webhook for (513) 440-3329.
   Greets the caller, then rings the owner's cell. The <Dial action> hands
   the outcome to /api/twilio/missed-call, which runs voicemail + recovery
   when the call isn't answered. */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!isValidTwilioRequest(req)) {
    return res.status(403).json({ error: 'Invalid Twilio signature' });
  }

  const greeting = 'Thank you for calling A 1 Creative Agency. Please hold while we connect you.';
  const ownerCell = process.env.OWNER_CELL;

  if (!ownerCell) {
    // No forward target configured — go straight to the voicemail flow.
    return sendTwiml(
      res,
      `<Response><Say voice="Polly.Joanna">${xmlEscape(greeting)}</Say><Redirect method="POST">/api/twilio/missed-call</Redirect></Response>`
    );
  }

  return sendTwiml(
    res,
    `<Response>` +
      `<Say voice="Polly.Joanna">${xmlEscape(greeting)}</Say>` +
      `<Dial action="/api/twilio/missed-call" method="POST" timeout="20" answerOnBridge="true">${xmlEscape(ownerCell)}</Dial>` +
      `</Response>`
  );
}
