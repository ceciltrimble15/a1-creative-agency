import { createLead, createTask, logEvent, airtableRecordUrl } from './_lib/airtable.js';
import { notifyOps } from './_lib/notify.js';
import { nextBusinessDayISO, brandLabel } from './_lib/util.js';

/* The A1 Creative homepage is served separately from this endpoint, so
   browser form posts arrive cross-origin. */
const ALLOWED_ORIGINS = [
  'https://a1creativeagency.com',
  'https://www.a1creativeagency.com',
  'https://a1creativeagency4.netlify.app',
];

// Default lead status / source align with the mission spec. Overridable per
// deployment so the values can match the live base exactly.
const NEW_LEAD_STATUS = process.env.LEAD_STATUS_NEW || 'New Lead';
const DEFAULT_SOURCE = process.env.LEAD_SOURCE_DEFAULT || 'A1 Creative Intake Form';

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

  const resolvedSource = source || DEFAULT_SOURCE;

  // --- 1. New Lead Intake -------------------------------------------------
  const notesParts = [];
  if (service) notesParts.push(`Service: ${service}`);
  if (date) notesParts.push(`Preferred Date: ${date}`);
  if (message) notesParts.push(`Message: ${message}`);

  const leadFields = {
    'Lead Name': name,
    'Phone': phone,
    'Email ': email,
    'lead_status': NEW_LEAD_STATUS,
    'Source': resolvedSource,
    'Client': client || 'A1 Creative Agency',
  };
  if (notesParts.length > 0) leadFields['Notes'] = notesParts.join('\n');
  if (date) leadFields['date'] = date;

  const lead = await createLead(leadFields);

  if (!lead.ok) {
    console.error('Airtable lead error:', lead.error);
    await logEvent({
      eventType: 'New Lead Captured',
      status: 'Error',
      notes: `FAILED to create lead for ${name} (${phone}): ${lead.error}`,
    });
    return res.status(502).json({ error: lead.error || 'Failed to create lead in Airtable' });
  }

  const recordUrl = airtableRecordUrl(lead.id);

  // Follow-up pipeline runs in parallel. Best-effort — the lead is already
  // stored, so none of these failing should fail the submission.
  // --- 2. Follow-Up Task --------------------------------------------------
  const taskNotes = [
    `Phone: ${phone}`,
    `Email: ${email}`,
    `Service: ${service || '—'}`,
    `Message: ${message || '—'}`,
  ].join('\n');

  const [task, notify] = await Promise.all([
    createTask({
      'Task Name': `Follow up with ${name}`,
      'Related Lead': [lead.id],
      'Priority': 'High',
      'Status': 'Open',
      'Due Date': nextBusinessDayISO(),
      'Notes': taskNotes,
    }),
    // --- 3. Operations Email Notification ---------------------------------
    notifyOps(
      `New ${brandLabel(client)} Lead: ${name}`,
      [
        `Name: ${name}`,
        `Phone: ${phone}`,
        `Email: ${email}`,
        `Service: ${service || '—'}`,
        `Message: ${message || '—'}`,
        `Source: ${resolvedSource}`,
        '',
        `Airtable record: ${recordUrl || lead.id}`,
      ].join('\n')
    ),
  ]);

  // --- 4. Automation Log --------------------------------------------------
  await logEvent({
    eventType: 'New Lead Captured',
    relatedLeadId: lead.id,
    status: task.ok && notify.ok ? 'Success' : 'Partial',
    notes:
      'Lead captured from A1 Creative intake form and follow-up task created. ' +
      `Task: ${task.ok ? task.id : `failed (${task.error})`}. ` +
      `Ops email: ${notify.ok ? 'sent' : `failed (${notify.error})`}.`,
  });

  return res.status(200).json({ success: true, id: lead.id });
}
