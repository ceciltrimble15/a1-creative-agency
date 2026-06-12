import { createLead, createTask, logAutomation } from './_lib/airtable.js';
import { notifyOps } from './_lib/notify.js';

/* The A1 Creative homepage is served from Netlify while this endpoint lives
   on Vercel, so browser form posts arrive cross-origin. */
const ALLOWED_ORIGINS = [
  'https://a1creativeagency.com',
  'https://www.a1creativeagency.com',
  'https://a1creativeagency4.netlify.app',
];

function applyCors(req, res) {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Max-Age', '86400');
  }
}

export default async function handler(req, res) {
  applyCors(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, phone, email, service, date, message, client, source } = req.body;

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
