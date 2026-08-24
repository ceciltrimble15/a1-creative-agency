/* Dial-outcome webhook. If the owner answered, hang up cleanly. Otherwise:
   log the lead + follow-up task in Airtable, alert the owner and operations@,
   then offer voicemail. A missed call never creates SMS consent and this
   handler never texts the caller.

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
import { createLead, createTask, logAutomation, LEAD_FIELDS } from './_lib/airtable.mjs';
import { notifyOps, alertOwner } from './_lib/notify.mjs';

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return methodNotAllowed();

  const params = parseTwilioBody(event);
  if (!isValidTwilioRequest(event, params)) return forbidden();

  const { DialCallStatus, From, To, CallSid } = params;

  if (DialCallStatus === 'completed') {
    await logAutomation('call_answered', `Call from ${From} answered (${CallSid})`);
    return twiml('<Response><Hangup/></Response>');
  }

  // Missed call — create internal recovery work before returning TwiML so the serverless runtime
  // doesn't freeze the work mid-flight.
  const [leadResult, taskResult] = await Promise.all([
    createLead({
      [LEAD_FIELDS.name]: `Missed call ${From || 'unknown'}`,
      [LEAD_FIELDS.phone]: From || '',
      [LEAD_FIELDS.status]: 'new',
      [LEAD_FIELDS.source]: 'Missed call',
      [LEAD_FIELDS.client]: 'A/1 Creative Agency',
      [LEAD_FIELDS.notes]: `Missed call to ${To} (status: ${DialCallStatus || 'no dial'}, CallSid: ${CallSid})`,
    }),
    createTask({
      Name: `Call back ${From || 'unknown caller'} (missed call)`,
      Status: 'To Do',
      Notes: `Missed call to ${To}. Call the customer back; no automated customer SMS was sent.`,
    }),
  ]);

  const summary =
    `Missed call from ${From} to ${To}.\n` +
    `Customer SMS: not sent — a missed call is not consent.\n` +
    `Airtable lead: ${leadResult.ok ? leadResult.id : `failed (${leadResult.error})`}\n` +
    `Follow-up task: ${taskResult.ok ? taskResult.id : `failed (${taskResult.error})`}`;

  await Promise.all([
    alertOwner(
      `Missed call from ${From}. Customer was not texted; callback work was logged in Airtable.`
    ),
    notifyOps(`Missed call: ${From}`, summary),
    logAutomation(
      'missed_call_follow_up',
      summary,
      leadResult.ok && taskResult.ok ? 'ok' : 'partial'
    ),
  ]);

  return twiml(
    `<Response>` +
      `<Say voice="Polly.Joanna">${xmlEscape(
        "Sorry we missed you. Please leave a message after the tone and we'll get right back to you."
      )}</Say>` +
      `<Record action="/api/twilio/voicemail" method="POST" maxLength="120" playBeep="true"/>` +
      `<Say voice="Polly.Joanna">We did not receive a recording. Goodbye.</Say>` +
      `</Response>`
  );
};
