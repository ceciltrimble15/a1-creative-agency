import { isValidTwilioRequest, sendSms, sendTwiml, xmlEscape } from '../_lib/twilio.js';
import { createLead, createTask, logAutomation } from '../_lib/airtable.js';
import { notifyOps, alertOwner } from '../_lib/notify.js';

const RECOVERY_TEXT =
  "Hi, this is A1 Creative Agency — sorry we missed your call! We'll call you back shortly, or you can reply to this text and we'll take care of you right here.";

/* Dial-outcome webhook. If the owner answered, hang up cleanly. Otherwise:
   text the caller back, log the lead + follow-up task in Airtable, alert
   the owner and operations@, then offer voicemail. */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!isValidTwilioRequest(req)) {
    return res.status(403).json({ error: 'Invalid Twilio signature' });
  }

  const { DialCallStatus, From, To, CallSid } = req.body || {};

  if (DialCallStatus === 'completed') {
    await logAutomation('call_answered', `Call from ${From} answered (${CallSid})`);
    return sendTwiml(res, '<Response><Hangup/></Response>');
  }

  // Missed call — run recovery before returning TwiML so the serverless
  // runtime doesn't freeze the work mid-flight.
  const callerIsTextable = /^\+\d{8,15}$/.test(From || '');

  const [smsResult, leadResult, taskResult] = await Promise.all([
    callerIsTextable ? sendSms(From, RECOVERY_TEXT) : Promise.resolve({ ok: false, error: 'Caller not textable' }),
    createLead({
      'Lead Name': `Missed call ${From || 'unknown'}`,
      'Phone': From || '',
      'lead_status': 'new',
      'Source': 'Missed call',
      'Client': 'A1 Creative Agency',
      'Notes': `Missed call to ${To} (status: ${DialCallStatus || 'no dial'}, CallSid: ${CallSid})`,
    }),
    createTask({
      'Name': `Call back ${From || 'unknown caller'} (missed call)`,
      'Status': 'To Do',
      'Notes': `Missed call to ${To}. Recovery text ${From ? 'sent' : 'not possible'}.`,
    }),
  ]);

  const summary =
    `Missed call from ${From} to ${To}.\n` +
    `Recovery SMS: ${smsResult.ok ? 'sent' : `failed (${smsResult.error})`}\n` +
    `Airtable lead: ${leadResult.ok ? leadResult.id : `failed (${leadResult.error})`}\n` +
    `Follow-up task: ${taskResult.ok ? taskResult.id : `failed (${taskResult.error})`}`;

  await Promise.all([
    alertOwner(`Missed call from ${From}. Recovery text ${smsResult.ok ? 'sent' : 'FAILED'} — caller logged in Airtable.`),
    notifyOps(`Missed call: ${From}`, summary),
    logAutomation(
      'missed_call_recovery',
      summary,
      smsResult.ok && leadResult.ok && taskResult.ok ? 'ok' : 'partial'
    ),
  ]);

  return sendTwiml(
    res,
    `<Response>` +
      `<Say voice="Polly.Joanna">${xmlEscape(
        "Sorry we missed you. Please leave a message after the tone and we'll get right back to you. We've also sent you a text."
      )}</Say>` +
      `<Record action="/api/twilio/voicemail" method="POST" maxLength="120" playBeep="true"/>` +
      `<Say voice="Polly.Joanna">We did not receive a recording. Goodbye.</Say>` +
      `</Response>`
  );
}
