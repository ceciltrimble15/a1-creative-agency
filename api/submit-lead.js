import { createLead, createTask, logAutomation } from './_lib/airtable.js';
import { notifyOps } from './_lib/notify.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, phone, email, service, date, message } = req.body;

  if (!name || !phone || !email) {
    return res.status(400).json({ error: 'Name, phone, and email are required' });
  }

  const notesParts = [];
  if (service) notesParts.push(`Service: ${service}`);
  if (date) notesParts.push(`Preferred Date: ${date}`);
  if (message) notesParts.push(`Message: ${message}`);

  const fields = {
    'Lead Name': name,
    'Phone': phone,
    'Email ': email,
    'lead_status': 'new',
    'Source': 'Website form ',
    'Client': 'TRHUE Hair Care',
  };

  if (notesParts.length > 0) fields['Notes'] = notesParts.join('\n');
  if (date) fields['date'] = date;

  const lead = await createLead(fields);

  if (!lead.ok) {
    console.error('Airtable lead error:', lead.error);
    await logAutomation('website_lead_capture', `FAILED for ${name} (${phone}): ${lead.error}`, 'error');
    return res.status(502).json({ error: lead.error || 'Failed to create lead in Airtable' });
  }

  // Follow-up pipeline: task + ops notification + log. Best-effort — the
  // lead is already stored, so none of these should fail the submission.
  const [task, notify] = await Promise.all([
    createTask({
      'Name': `Follow up with ${name} (${phone})`,
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

  return res.status(200).json({ success: true, id: lead.id });
}
