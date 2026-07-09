/* Shared lead-intake orchestration.

   Both the Vercel handler (api/submit-lead.js) and the Netlify function
   (netlify/functions/submit-lead.mjs) call processLead() so the two platforms
   behave identically. processLead returns a plain { status, body } result and
   the caller adapts it to its platform response.

   The A1 Creative homepage now posts same-origin to /api/submit-lead on
   Netlify; the ALLOWED_ORIGINS list still covers the apex/www/legacy hosts so
   any cross-origin post (e.g. from the Vercel deployment) keeps working. */

import { createLead, createTask, logAutomation } from './airtable.js';
import { notifyOps } from './notify.js';

export const ALLOWED_ORIGINS = [
  'https://a1creativeagency.com',
  'https://www.a1creativeagency.com',
  'https://a1creativeagency4.netlify.app',
];

/* CORS headers for an allowed origin (empty object otherwise). Same-origin
   requests don't need these; they only matter for cross-origin posts. */
export function corsHeaders(origin) {
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    return {
      'Access-Control-Allow-Origin': origin,
      'Vary': 'Origin',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    };
  }
  return {};
}

export async function processLead(input) {
  const { name, phone, email, service, date, message, client, source } = input || {};

  // Phone is optional: the A1 quote form lets a visitor request a quote by
  // email only (SMS consent is required client-side only when a phone is given).
  if (!name || !email) {
    return { status: 400, body: { error: 'Name and email are required' } };
  }

  const notesParts = [];
  if (service) notesParts.push(`Service: ${service}`);
  if (date) notesParts.push(`Preferred Date: ${date}`);
  if (message) notesParts.push(`Message: ${message}`);

  const fields = {
    'Lead Name': name,
    'Phone': phone || '',
    'Email ': email,
    'lead_status': 'new',
    // Caller-supplied so each site tags itself; defaults suit the A1 site
    // since a1creativeagency.com is this project's production domain.
    'Source': source || 'Website form ',
    'Client': client || 'A1 Creative Agency',
  };

  if (notesParts.length > 0) fields['Notes'] = notesParts.join('\n');
  if (date) fields['date'] = date;

  const lead = await createLead(fields);

  if (!lead.ok) {
    console.error('Airtable lead error:', lead.error);
    await logAutomation('website_lead_capture', `FAILED for ${name} (${phone || email}): ${lead.error}`, 'error');
    return { status: 502, body: { error: lead.error || 'Failed to create lead in Airtable' } };
  }

  // Follow-up pipeline: task + ops notification + log. Best-effort — the
  // lead is already stored, so none of these should fail the submission.
  const [task, notify] = await Promise.all([
    createTask({
      'Name': `Follow up with ${name} (${phone || email})`,
      'Status': 'To Do',
      'Notes': `Website lead${service ? ` — ${service}` : ''}${date ? `, preferred date ${date}` : ''}. Email: ${email}`,
    }),
    notifyOps(
      `New website lead: ${name}`,
      `Name: ${name}\nPhone: ${phone || '—'}\nEmail: ${email}\nService: ${service || '—'}\nPreferred date: ${date || '—'}\nMessage: ${message || '—'}\n\nAirtable lead: ${lead.id}`
    ),
  ]);

  await logAutomation(
    'website_lead_capture',
    `Lead ${lead.id} for ${name} (${phone || email}). Task: ${task.ok ? task.id : `failed (${task.error})`}. Ops email: ${notify.ok ? 'sent' : `failed (${notify.error})`}`,
    task.ok && notify.ok ? 'ok' : 'partial'
  );

  return { status: 200, body: { success: true, id: lead.id } };
}
