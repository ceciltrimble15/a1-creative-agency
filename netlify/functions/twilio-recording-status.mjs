import { parseTwilioBody, voiceRequestError } from './_lib/twilio.mjs';
import { notifyOps } from './_lib/notify.mjs';
export const handler = async (event) => {
  const p = parseTwilioBody(event);
  const error = voiceRequestError(event, p);
  if (error) return error;
  if (!/^RE[a-f0-9]{32}$/i.test(p.RecordingSid || '')) return { statusCode: 400, body: 'Missing RecordingSid' };
  if (!['completed', 'absent'].includes(p.RecordingStatus)) return { statusCode: 204, body: '' };
  console.info(JSON.stringify({ event: 'a1_recording_status', callSid: p.CallSid, recordingSid: p.RecordingSid, status: p.RecordingStatus }));
  // Construct the account's authenticated recording URL; never trust an arbitrary supplied link.
  const url = `https://api.twilio.com/2010-04-01/Accounts/${p.AccountSid}/Recordings/${p.RecordingSid}.mp3`;
  const result = await notifyOps(`A1 voicemail: ${p.RecordingStatus}`, `CallSid: ${p.CallSid}\nRecording: ${p.RecordingSid}\nStatus: ${p.RecordingStatus}\nDuration: ${p.RecordingDuration || '0'}s\n${p.RecordingStatus === 'completed' ? url : 'No playable recording was produced.'}`, {
    idempotencyKey: `a1-recording-${p.RecordingSid}-${p.RecordingStatus}`, timeoutMs: 2500,
  });
  return { statusCode: result.ok ? 204 : 503, body: '' };
};
