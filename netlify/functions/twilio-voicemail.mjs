/* Recording-complete webhook. Pushes the voicemail link to the owner and
   operations@, and logs it. The lead/task were already created by
   twilio-missed-call.mjs before recording started.

   Reached via the <Record action> in twilio-missed-call.mjs. */

import {
  parseTwilioBody,
  isValidTwilioRequest,
  twiml,
  xmlEscape,
  methodNotAllowed,
  forbidden,
} from './_lib/twilio.mjs';
import { logAutomation } from './_lib/airtable.mjs';
import { notifyOps, alertOwner } from './_lib/notify.mjs';

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return methodNotAllowed();

  const params = parseTwilioBody(event);
  if (!isValidTwilioRequest(event, params)) return forbidden();

  const { From, RecordingUrl, RecordingDuration, CallSid } = params;
  const recordingLink = RecordingUrl ? `${RecordingUrl}.mp3` : 'no recording URL';

  await Promise.all([
    alertOwner(`New voicemail from ${From} (${RecordingDuration || '?'}s): ${recordingLink}`),
    notifyOps(
      `Voicemail from ${From}`,
      `Caller: ${From}\nDuration: ${RecordingDuration || '?'}s\nRecording: ${recordingLink}\nCallSid: ${CallSid}`
    ),
    logAutomation('voicemail_received', `Voicemail from ${From}: ${recordingLink}`),
  ]);

  return twiml(
    `<Response><Say voice="Polly.Joanna">${xmlEscape(
      'Thank you. Your message has been received and our team has been notified. Goodbye.'
    )}</Say></Response>`
  );
};
