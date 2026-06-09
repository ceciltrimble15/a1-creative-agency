/**
 * /.netlify/functions/a1-lead
 *
 * Accepts a JSON POST from the A1 Creative contact form.
 * 1. Writes a lead record to Airtable
 * 2. Sends an email notification via Resend
 *
 * Required env vars (set in Netlify → Site settings → Environment variables):
 *   AIRTABLE_API_KEY       Personal access token from airtable.com/account
 *   AIRTABLE_BASE_ID       Base ID from the Airtable URL (starts with "app")
 *   AIRTABLE_TABLE_NAME    Table name — defaults to "Leads"
 *   RESEND_API_KEY         API key from resend.com
 *   NOTIFY_EMAIL           Override notify address — defaults to operations@a1creativeagency.com
 *   FROM_EMAIL             Verified sending address in Resend — defaults to leads@a1creativeagency.com
 */

const NOTIFY_DEFAULT = 'operations@a1creativeagency.com';
const FROM_DEFAULT   = 'A1 Creative <leads@a1creativeagency.com>';

// ─── helpers ─────────────────────────────────────────────────────────────────

function htmlEmail(data) {
  const {
    name, businessName, email, phone,
    service, budget, timeline, message,
    timestamp,
  } = data;
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
  body { font-family: Arial, sans-serif; background:#060A12; color:#E2E8F0; margin:0; padding:24px; }
  .card { background:#0D1420; border:1px solid rgba(27,126,255,.2); border-radius:8px; padding:24px; max-width:560px; margin:0 auto; }
  h2 { color:#1B7EFF; margin-top:0; font-size:18px; }
  table { width:100%; border-collapse:collapse; margin-top:16px; }
  td { padding:8px 0; vertical-align:top; }
  td:first-child { color:#94A3B8; width:130px; font-size:13px; font-weight:600; text-transform:uppercase; letter-spacing:.05em; }
  td:last-child { color:#E2E8F0; font-size:14px; }
  .footer { margin-top:20px; font-size:11px; color:#475569; text-align:center; }
</style></head>
<body>
<div class="card">
  <h2>New Lead — A1 Creative Website</h2>
  <table>
    <tr><td>Name</td><td>${esc(name)}</td></tr>
    <tr><td>Business</td><td>${esc(businessName || '—')}</td></tr>
    <tr><td>Email</td><td>${esc(email)}</td></tr>
    <tr><td>Phone</td><td>${esc(phone)}</td></tr>
    <tr><td>Service</td><td>${esc(service || '—')}</td></tr>
    <tr><td>Budget</td><td>${esc(budget || '—')}</td></tr>
    <tr><td>Timeline</td><td>${esc(timeline || '—')}</td></tr>
    <tr><td>Message</td><td>${esc(message || '—')}</td></tr>
    <tr><td>Submitted</td><td>${esc(timestamp)}</td></tr>
  </table>
  <div class="footer">A1 Creative Lead Notification · a1creativeagency.com</div>
</div>
</body>
</html>`;
}

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ─── Airtable ─────────────────────────────────────────────────────────────────

async function writeAirtable(data) {
  const key   = process.env.AIRTABLE_API_KEY;
  const base  = process.env.AIRTABLE_BASE_ID;
  const table = process.env.AIRTABLE_TABLE_NAME || 'Leads';

  if (!key || !base) {
    console.warn('[a1-lead] Airtable env vars not set — skipping CRM write');
    return { success: false, reason: 'env_not_configured' };
  }

  const notes = [
    data.service   && `Service: ${data.service}`,
    data.budget    && `Budget: ${data.budget}`,
    data.timeline  && `Timeline: ${data.timeline}`,
    data.message   && `Message:\n${data.message}`,
  ].filter(Boolean).join('\n\n');

  const fields = {
    'Name':      data.name,
    'Email':     data.email,
    'Phone':     data.phone,
    'Company':   data.businessName || '',
    'Message':   notes,
    'Timestamp': data.timestamp,
    'Source':    'Website',
    'Status':    'New',
  };

  const res = await fetch(
    `https://api.airtable.com/v0/${base}/${encodeURIComponent(table)}`,
    {
      method:  'POST',
      headers: {
        Authorization:  `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fields }),
    }
  );

  const json = await res.json();

  if (!res.ok) {
    const msg = json?.error?.message || JSON.stringify(json);
    console.error('[a1-lead] Airtable error:', msg);
    return { success: false, reason: msg };
  }

  console.log('[a1-lead] Airtable record created:', json.id);
  return { success: true, id: json.id };
}

// ─── Email via Resend ─────────────────────────────────────────────────────────

async function sendEmail(data) {
  const key  = process.env.RESEND_API_KEY;
  const to   = process.env.NOTIFY_EMAIL || NOTIFY_DEFAULT;
  const from = process.env.FROM_EMAIL   || FROM_DEFAULT;

  if (!key) {
    console.warn('[a1-lead] RESEND_API_KEY not set — skipping email');
    return { success: false, reason: 'env_not_configured' };
  }

  const res = await fetch('https://api.resend.com/emails', {
    method:  'POST',
    headers: {
      Authorization:  `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to:      [to],
      subject: `New Lead: ${data.businessName || data.name} — A1 Creative`,
      html:    htmlEmail(data),
    }),
  });

  const json = await res.json();

  if (!res.ok) {
    const msg = JSON.stringify(json);
    console.error('[a1-lead] Resend error:', msg);
    return { success: false, reason: msg };
  }

  console.log('[a1-lead] Email sent via Resend, id:', json.id);
  return { success: true, id: json.id };
}

// ─── Handler ──────────────────────────────────────────────────────────────────

exports.handler = async (event) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin':  '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type':                 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  // ── parse body ──────────────────────────────────────────────────────────────
  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Invalid JSON body' }),
    };
  }

  const { name, email, phone, businessName, service, budget, timeline, message } = body;

  if (!name || !email || !phone) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'name, email, and phone are required' }),
    };
  }

  const data = {
    name, email, phone,
    businessName: businessName || '',
    service:      service      || '',
    budget:       budget       || '',
    timeline:     timeline     || '',
    message:      message      || '',
    timestamp:    new Date().toISOString(),
  };

  console.log('[a1-lead] Processing lead:', name, '|', email, '|', new Date().toISOString());

  // ── run both channels concurrently ──────────────────────────────────────────
  const [airtableResult, emailResult] = await Promise.allSettled([
    writeAirtable(data),
    sendEmail(data),
  ]);

  const at = airtableResult.status === 'fulfilled'
    ? airtableResult.value
    : { success: false, reason: airtableResult.reason?.message };

  const em = emailResult.status === 'fulfilled'
    ? emailResult.value
    : { success: false, reason: emailResult.reason?.message };

  const anySuccess   = at.success || em.success;
  const neitherConf  = at.reason === 'env_not_configured' && em.reason === 'env_not_configured';

  console.log('[a1-lead] Result — airtable:', JSON.stringify(at), '| email:', JSON.stringify(em));

  // Return 200 if at least one channel captured the lead,
  // OR if neither is configured yet (don't block form UX during setup).
  if (anySuccess || neitherConf) {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        channels: { airtable: at, email: em },
      }),
    };
  }

  return {
    statusCode: 500,
    headers: corsHeaders,
    body: JSON.stringify({
      error:    'Lead capture failed on all configured channels',
      channels: { airtable: at, email: em },
    }),
  };
};
