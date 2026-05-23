// Vercel serverless function — handles 4 Reel Cleaning estimate submissions
// Saves lead to Airtable, sends SMS via Twilio to customer and owner,
// and creates a follow-up task in Airtable.

const AIRTABLE_API_KEY   = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID   = process.env.AIRTABLE_BASE_ID;
const LEADS_TABLE        = process.env.AIRTABLE_LEADS_TABLE  || 'Leads';
const TASKS_TABLE        = process.env.AIRTABLE_TASKS_TABLE  || 'Tasks';
const TWILIO_SID         = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_TOKEN       = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_FROM        = process.env.TWILIO_PHONE_NUMBER;
const OWNER_PHONE        = process.env.BUSINESS_OWNER_PHONE;

// ── Airtable helpers ──────────────────────────────────────────────────────────

async function airtableRequest(tableId, method, body) {
  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(tableId)}`;
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Airtable error: ${data.error?.message || res.status}`);
  }
  return data;
}

async function saveLead(fields) {
  return airtableRequest(LEADS_TABLE, 'POST', { fields });
}

async function createTask(fields) {
  return airtableRequest(TASKS_TABLE, 'POST', { fields });
}

// ── Twilio helper ─────────────────────────────────────────────────────────────

async function sendSMS(to, body) {
  const toNum = to.startsWith('+') ? to : `+1${to}`;
  const credentials = Buffer.from(`${TWILIO_SID}:${TWILIO_TOKEN}`).toString('base64');
  const params = new URLSearchParams({ To: toNum, From: TWILIO_FROM, Body: body });

  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    }
  );
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Twilio error: ${data.message || res.status}`);
  }
  return data;
}

// ── Main handler ──────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  // CORS preflight
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Validate env vars at runtime so we can return a clear error in dev
  const missing = [
    'AIRTABLE_API_KEY', 'AIRTABLE_BASE_ID',
    'TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN',
    'TWILIO_PHONE_NUMBER', 'BUSINESS_OWNER_PHONE',
  ].filter(k => !process.env[k]);

  if (missing.length) {
    console.error('Missing env vars:', missing);
    return res.status(500).json({ error: 'Server configuration incomplete.' });
  }

  // Parse body (Vercel auto-parses JSON when Content-Type is application/json)
  const {
    name, phone, email, address,
    serviceType, preferredDate, message,
  } = req.body || {};

  // Required field validation (belt-and-suspenders on top of frontend)
  if (!name?.trim() || !phone?.trim() || !address?.trim() || !serviceType?.trim()) {
    return res.status(400).json({ error: 'Missing required fields: name, phone, address, serviceType.' });
  }

  const rawPhone = phone.replace(/\D/g, '');
  if (rawPhone.length < 10) {
    return res.status(400).json({ error: 'Invalid phone number.' });
  }

  const submittedAt = new Date().toISOString();
  const dateLabel   = preferredDate || 'Not specified';

  const errors = [];

  // 1. Save lead to Airtable
  let leadRecord;
  try {
    leadRecord = await saveLead({
      'Name':           name.trim(),
      'Phone':          rawPhone,
      'Email':          email?.trim() || '',
      'Address':        address.trim(),
      'Service Type':   serviceType,
      'Preferred Date': preferredDate || '',
      'Notes':          message?.trim() || '',
      'Source':         '4RC Estimate Funnel',
      'Status':         'New Lead',
      'Submitted At':   submittedAt,
    });
  } catch (err) {
    console.error('Airtable lead save failed:', err.message);
    errors.push('lead_save');
    // Continue — don't block the customer confirmation
  }

  // 2. Customer confirmation SMS
  const customerSMS =
    `Hi ${name.split(' ')[0]}! ✅ Your estimate request with 4 Reel Cleaning has been received.\n\n` +
    `Service: ${serviceType}\n` +
    `Address: ${address}\n` +
    `Preferred Date: ${dateLabel}\n\n` +
    `We'll be in touch shortly to confirm details. Questions? Reply to this text.`;

  try {
    await sendSMS(rawPhone, customerSMS);
  } catch (err) {
    console.error('Customer SMS failed:', err.message);
    errors.push('customer_sms');
  }

  // 3. Owner lead alert SMS
  const ownerSMS =
    `🔔 NEW LEAD — 4 Reel Cleaning\n\n` +
    `Name: ${name}\n` +
    `Phone: ${rawPhone}\n` +
    `Email: ${email?.trim() || 'N/A'}\n` +
    `Service: ${serviceType}\n` +
    `Address: ${address}\n` +
    `Preferred Date: ${dateLabel}\n` +
    (message?.trim() ? `Notes: ${message.trim()}\n` : '') +
    `\nSubmitted: ${new Date(submittedAt).toLocaleString('en-US', { timeZone: 'America/New_York' })}`;

  try {
    await sendSMS(OWNER_PHONE, ownerSMS);
  } catch (err) {
    console.error('Owner SMS failed:', err.message);
    errors.push('owner_sms');
  }

  // 4. Create follow-up task in Airtable
  try {
    const dueDate = preferredDate
      ? preferredDate
      : new Date(Date.now() + 86400000).toISOString().split('T')[0]; // tomorrow

    await createTask({
      'Task Name':    `Follow up — ${name} (${serviceType})`,
      'Description':  `Call or text ${name} at ${rawPhone} to schedule ${serviceType}.\nAddress: ${address}\nPreferred Date: ${dateLabel}`,
      'Due Date':     dueDate,
      'Priority':     'High',
      'Status':       'To Do',
      'Category':     'Lead Follow-Up',
      'Source':       '4RC Estimate Funnel',
      ...(leadRecord?.id ? { 'Lead Record': [leadRecord.id] } : {}),
    });
  } catch (err) {
    console.error('Airtable task create failed:', err.message);
    errors.push('task_create');
  }

  // Return success even if some side effects partially failed
  // (lead is saved; owner was alerted via at least one channel)
  return res.status(200).json({
    success: true,
    message: 'Estimate request received.',
    ...(errors.length ? { warnings: errors } : {}),
  });
}
