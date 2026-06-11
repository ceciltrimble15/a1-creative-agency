import { isValidTwilioRequest, sendTwiml, xmlEscape } from '../_lib/twilio.js';
import { logAutomation } from '../_lib/airtable.js';
import { notifyOps, alertOwner } from '../_lib/notify.js';

/* Recording-complete webhook. Pushes the voicemail link to the owner and
   operations@, and logs it. The lead/task were already created by
   /api/twilio/missed-call before recording started. */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!isValidTwilioRequest(req)) {
    return res.status(403).json({ error: 'Invalid Twilio signature' });
  }

  const { From, RecordingUrl, RecordingDuration, CallSid } = req.body || {};
  const recordingLink = RecordingUrl ? `${RecordingUrl}.mp3` : 'no recording URL';

  await Promise.all([
    alertOwner(`New voicemail from ${From} (${RecordingDuration || '?'}s): ${recordingLink}`),
    notifyOps(
      `Voicemail from ${From}`,
      `Caller: ${From}\nDuration: ${RecordingDuration || '?'}s\nRecording: ${recordingLink}\nCallSid: ${CallSid}`
    ),
    logAutomation('voicemail_received', `Voicemail from ${From}: ${recordingLink}`),
  ]);

  return sendTwiml(
    res,
    `<Response><Say voice="Polly.Joanna">${xmlEscape(
      'Thank you. Your message has been received and our team has been notified. Goodbye.'
    )}</Say></Response>`
  );
}
