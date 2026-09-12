/* Both inbound and outbound call-leg status; do not create duplicate recovery tasks here. */
import { parseTwilioBody, isValidTwilioRequest, methodNotAllowed, forbidden } from './_lib/twilio.mjs';
export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return methodNotAllowed();
  const p = parseTwilioBody(event);
  if (!isValidTwilioRequest(event, p)) return forbidden();
  if (!/^CA[a-f0-9]{32}$/i.test(p.CallSid || '')) return { statusCode: 400, body: 'Missing CallSid' };
  console.info(JSON.stringify({ event: 'a1_call_status', callSid: p.CallSid, parentCallSid: p.ParentCallSid, status: p.CallStatus, errorCode: p.ErrorCode, sipCode: p.SipResponseCode, duration: p.CallDuration }));
  return { statusCode: 204, body: '' };
};
