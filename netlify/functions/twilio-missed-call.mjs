/* Dial action: recover only missed calls; all external work is time-bounded.
   A caller is never automatically texted: a missed call is not consent. */
import { parseTwilioBody, voiceRequestError, twiml, voiceUrl } from './_lib/twilio.mjs';
import { upsertMissedCallLead, upsertCallbackTask, logAutomation } from './_lib/airtable.mjs';
import { notifyOps, alertOwner } from './_lib/notify.mjs';
export const handler = async (event) => {
  const p = parseTwilioBody(event);
  const error = voiceRequestError(event, p);
  if (error) return error;
  const status = p.DialCallStatus || 'not-dialed';
  console.info(JSON.stringify({ event: 'a1_dial_outcome', callSid: p.CallSid, status }));
  if (status === 'completed' || status === 'answered' || status === 'canceled') return twiml('<Response><Hangup/></Response>');
  if (!['busy', 'no-answer', 'failed', 'not-dialed'].includes(status)) return { statusCode: 400, body: 'Unexpected dial status' };
  const [lead, task] = await Promise.all([
    upsertMissedCallLead(p.CallSid, p.From, p.To),
    upsertCallbackTask(p.CallSid, p.From),
  ]);
  const summary = `CallSid: ${p.CallSid}\nFrom: ${p.From}\nTo: ${p.To}\nDial status: ${status}\n` +
    `Lead: ${lead.ok ? lead.id : 'FAILED: ' + lead.error}\nTask: ${task.ok ? task.id : 'FAILED: ' + task.error}\nCustomer SMS: not sent.`;
  // Stable email content/key lets provider deduplicate callback retries.
  const emailText = `Missed call from ${p.From} to ${p.To}. CallSid: ${p.CallSid}. Dial status: ${status}. Check Lead Operations for callback work; check function logs if missing.`;
  const [email, sms] = await Promise.all([
    notifyOps(`Missed call: ${p.From}`, emailText, { idempotencyKey: `a1-missed-${p.CallSid}`, timeoutMs: 2500 }),
    // Only on the newly-created task. Never text the customer or invent consent.
    task.created ? alertOwner(`Missed call from ${p.From}. Check Lead Operations. Call ${p.CallSid}.`) : Promise.resolve({ ok: true, skipped: true }),
    logAutomation('missed_call_follow_up', summary, lead.ok && task.ok ? 'ok' : 'partial'),
  ]);
  console.info(JSON.stringify({ event: 'a1_recovery_result', callSid: p.CallSid, lead: lead.ok, task: task.ok, email: email.ok, ownerSms: sms.skipped ? 'skipped' : sms.ok, smsCode: sms.code }));
  return twiml(`<Response><Say>Sorry we missed you. Please leave your name, callback number, and message after the tone.</Say>` +
    `<Record action="${voiceUrl('voicemail')}" method="POST" maxLength="120" playBeep="true" recordingStatusCallback="${voiceUrl('recording-status')}" recordingStatusCallbackMethod="POST" recordingStatusCallbackEvent="completed absent"/>` +
    `</Response>`);
};
