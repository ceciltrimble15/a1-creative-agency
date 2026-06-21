/* Identity & normalization helpers for the ingestion front door.

   source_event_id is the master dedup key. For channels that carry their own
   immutable id (Twilio CallSid/MessageSid, Outlook Message-ID, Calendly/PayPal/
   Stripe ids) the caller passes it straight through. Website forms have no
   natural id, so we derive a stable one: prefer a client-supplied submissionId
   (held in form state so a double-click reuses it); otherwise fall back to a
   content hash bucketed to the minute, which collapses rapid resubmits of the
   same content into one event. */

import crypto from 'node:crypto';

/* Best-effort E.164 normalization (US default). Stored consistently so phone
   matching/dedup is reliable. Returns '' when nothing usable. */
export function normalizePhone(raw) {
  if (!raw) return '';
  const trimmed = String(raw).trim();
  const hasPlus = trimmed.startsWith('+');
  const digits = trimmed.replace(/\D/g, '');
  if (!digits) return '';
  if (hasPlus) return `+${digits}`;
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  return `+${digits}`;
}

function sha256(input) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

/* Stable id for a website form submission. */
export function formSubmissionId({ submissionId, brand, email, phone, message } = {}) {
  if (submissionId) return `form_${submissionId}`;
  const minuteBucket = new Date().toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM
  const basis = [
    brand || '',
    String(email || '').toLowerCase(),
    normalizePhone(phone),
    String(message || '').trim(),
    minuteBucket,
  ].join('|');
  return `form_${sha256(basis).slice(0, 24)}`;
}

/* Channel id helpers — thin, but centralized so every caller derives the same
   shape and we can adjust one place if a provider changes. */
export const sourceEventId = {
  call: (callSid) => callSid || '',
  sms: (messageSid) => messageSid || '',
  voicemail: (recordingSid, callSid) => recordingSid || (callSid ? `${callSid}-vm` : ''),
  form: formSubmissionId,
  dailyReport: (brand, date) => `report_${brand}_${date}`,
  manual: (table) => `manual_${table}_${Date.now()}`,
};
