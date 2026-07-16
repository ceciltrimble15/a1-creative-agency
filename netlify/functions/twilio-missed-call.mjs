/* Dial-outcome webhook. If the owner answered, hang up cleanly. Otherwise:
   text the caller back, log the lead + follow-up task in Airtable, alert the
   owner and operations@, then offer voicemail.

   Reached via the <Dial action> in twilio-voice.mjs — not configured directly
   on the number. */

import {
  parseTwilioBody,
  isValidTwilioRequest,
  twiml,
  xmlEscape,
  methodNotAllowed,
  forbidden,
} from './_lib/twilio.mjs';
import { sendSms } from './_lib/twilio.mjs';
import { createLead, createTask, logAutomation, LEAD_FIELDS } from './_lib/airtable.mjs';
import { notifyOps, alertOwner } from './_lib/notify.mjs';

// Conversational reply to a caller we missed. Branded + opt-out for compliance.
const RECOVERY_TEXT =
  "Hi, this is A1 Creative Agency — sorry we missed your call! We'll call you " +
  "right back, or reply to this text and we'll take care of you here. " +
  'Reply STOP to opt out.';

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return methodNotAllowed();

  const params = parseTwilioBody(event);
  if (!isValidTwilioRequest(event, params)) return forbidden();

  const { DialCallStatus, From, To, CallSid } = params;

  if (DialCallStatus === 'completed') {
    await logAutomation('call_answered', `Call from ${From} answered (${CallSid})`);
    return twiml('<Response><Hangup/></Response>');
  }

  // Missed call — run recovery before returning TwiML so the serverless runtime
  // doesn't freeze the work mid-flight.
  const callerIsTextable = /^\+\d{8,15}$/.test(From || '');

  const [smsResult, leadResult, taskResult] = await Promise.all([
    callerIsTextable
      ? sendSms(From, RECOVERY_TEXT)
      : Promise.resolve({ ok: false, error: 'Caller not textable' }),
    createLead({
      [LEAD_FIELDS.name]: `Missed call ${From || 'unknown'}`,
      [LEAD_FIELDS.phone]: From || '',
      [LEAD_FIELDS.status]: 'new',
      [LEAD_FIELDS.source]: 'Missed call',
      [LEAD_FIELDS.client]: 'A1 Creative Agency',
      [LEAD_FIELDS.notes]: `Missed call to ${To} (status: ${DialCallStatus || 'no dial'}, CallSid: ${CallSid})`,
    }),
    createTask({
      Name: `Call back ${From || 'unknown caller'} (missed call)`,
      Status: 'To Do',
      Notes: `Missed call to ${To}. Recovery text ${From ? 'sent' : 'not possible'}.`,
    }),
  ]);

  const summary =
    `Missed call from ${From} to ${To}.\n` +
    `Recovery SMS: ${smsResult.ok ? 'sent' : `failed (${smsResult.error})`}\n` +
    `Airtable lead: ${leadResult.ok ? leadResult.id : `failed (${leadResult.error})`}\n` +
    `Follow-up task: ${taskResult.ok ? taskResult.id : `failed (${taskResult.error})`}`;

  await Promise.all([
    alertOwner(
      `Missed call from ${From}. Recovery text ${smsResult.ok ? 'sent' : 'FAILED'} — caller logged in Airtable.`
    ),
    notifyOps(`Missed call: ${From}`, summary),
    logAutomation(
      'missed_call_recovery',
      summary,
      smsResult.ok && leadResult.ok && taskResult.ok ? 'ok' : 'partial'
    ),
  ]);

  return twiml(
    `<Response>` +
      `<Say voice="Polly.Joanna">${xmlEscape(
        "Sorry we missed you. Please leave a message after the tone and we'll get right back to you. We've also sent you a text."
      )}</Say>` +
      `<Record action="/api/twilio/voicemail" method="POST" maxLength="120" playBeep="true"/>` +
      `<Say voice="Polly.Joanna">We did not receive a recording. Goodbye.</Say>` +
      `</Response>`
  );
};
