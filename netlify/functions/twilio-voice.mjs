/* Canonical incoming voice route for A1; no remote API calls before dialing. */
import { parseTwilioBody, voiceRequestError, twiml, xmlEscape, ownerNumber, voiceUrl, A1_NUMBER } from './_lib/twilio.mjs';
export const handler = async (event) => {
  const params = parseTwilioBody(event);
  const error = voiceRequestError(event, params);
  if (error) return error;
  const owner = ownerNumber();
  console.info(JSON.stringify({ event: 'a1_voice_received', callSid: params.CallSid, destinationValid: !!owner }));
  if (!owner) {
    console.error('A1 OWNER_CELL must be a US E.164 number and must not equal the business number');
    return twiml(`<Response><Redirect method="POST">${voiceUrl('missed-call')}</Redirect></Response>`);
  }
  return twiml(`<Response><Say>Thank you for calling A 1 Creative Agency. Please hold while we connect you.</Say>` +
    `<Dial callerId="${A1_NUMBER}" action="${voiceUrl('missed-call')}" method="POST" timeout="20" answerOnBridge="true">` +
    `<Number statusCallback="${voiceUrl('dial-status')}" statusCallbackMethod="POST" statusCallbackEvent="initiated ringing answered completed">${xmlEscape(owner)}</Number>` +
    `</Dial></Response>`);
};
