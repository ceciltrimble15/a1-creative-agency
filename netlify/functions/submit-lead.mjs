/* A1 Creative — website "Get a Quote" lead intake (Netlify Function).

   Flow: validate → create Airtable Lead → (best-effort) follow-up Task +
   ops email + automation log. The Lead is the critical path; the follow-ups
   never fail the submission. Served same-origin at /api/submit-lead via the
   redirect in netlify.toml, so no CORS is required. */

import { createLead, createTask, logAutomation } from './_lib/airtable.mjs';
import { notifyOps } from './_lib/notify.mjs';

const json = (statusCode, obj) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(obj),
});

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, body: '' };
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return json(400, { error: 'Invalid JSON body' });
  }

  const { name, phone, email, service, date, message, client, source } = body;

  if (!name || !phone || !email) {
    return json(400, { error: 'Name, phone, and email are required' });
  }

  const notesParts = [];
  if (service) notesParts.push(`Service: ${service}`);
  if (date) notesParts.push(`Preferred Date: ${date}`);
  if (message) notesParts.push(`Message: ${message}`);

  const fields = {
    'Lead Name': name,
    'Phone': phone,
    'Email ': email, // Airtable field name has a trailing space (verified in base)
    'lead_status': 'new',
    'Source': source || 'Website form ',
    'Client': client || 'A1 Creative Agency',
  };
  if (notesParts.length > 0) fields['Notes'] = notesParts.join('\n');
  if (date) fields['date'] = date;

  const lead = await createLead(fields);

  if (!lead.ok) {
    console.error('Airtable lead error:', lead.error);
    await logAutomation('website_lead_capture', `FAILED for ${name} (${phone}): ${lead.error}`, 'error');
    return json(502, { error: lead.error || 'Failed to create lead in Airtable' });
  }

  // Follow-up pipeline: task + ops email + log. Best-effort — the lead is
  // already stored, so none of these should fail the submission.
  const [task, notify] = await Promise.all([
    createTask({
      'Task Title': `Follow up with ${name} (${phone})`,
      'Status': 'To Do',
      'Notes': `Website lead${service ? ` — ${service}` : ''}${date ? `, preferred date ${date}` : ''}. Email: ${email}`,
    }),
    notifyOps(
      `New website lead: ${name}`,
      `Name: ${name}\nPhone: ${phone}\nEmail: ${email}\nService: ${service || '—'}\nPreferred date: ${date || '—'}\nMessage: ${message || '—'}\n\nAirtable lead: ${lead.id}`
    ),
  ]);

  await logAutomation(
    'website_lead_capture',
    `Lead ${lead.id} for ${name} (${phone}). Task: ${task.ok ? task.id : `failed (${task.error})`}. Ops email: ${notify.ok ? 'sent' : `failed (${notify.error})`}`,
    task.ok && notify.ok ? 'ok' : 'partial'
  );

  return json(200, { success: true, id: lead.id });
};
