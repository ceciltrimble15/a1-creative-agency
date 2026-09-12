/* Return immediately. Recording-ready callback handles notification even if caller hangs up. */
import { parseTwilioBody, voiceRequestError, twiml } from './_lib/twilio.mjs';
export const handler = async (event) => {
  const p = parseTwilioBody(event);
  const error = voiceRequestError(event, p);
  if (error) return error;
  return twiml('<Response><Say>Thank you for calling A 1 Creative Agency. Goodbye.</Say><Hangup/></Response>');
};
