import { sendSms } from './twilio.js';

const OPS_EMAIL = process.env.NOTIFY_EMAIL || 'operations@a1creativeagency.com';

/* Email notification to operations@ via Resend (free tier, plain HTTPS API).
   No-ops with a logged warning until RESEND_API_KEY is set. */
export async function notifyOps(subject, text) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('notifyOps skipped: RESEND_API_KEY not set');
    return { ok: false, error: 'RESEND_API_KEY not set' };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.NOTIFY_FROM || 'A1 Creative Alerts <onboarding@resend.dev>',
        to: [OPS_EMAIL],
        subject,
        text,
      }),
    });
    const data = await response.json();
    if (!response.ok) return { ok: false, error: data.message || `Resend ${response.status}` };
    return { ok: true, id: data.id };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/* SMS alert to the owner's cell (OWNER_CELL) via the Twilio number. */
export async function alertOwner(text) {
  const ownerCell = process.env.OWNER_CELL;
  if (!ownerCell) {
    console.error('alertOwner skipped: OWNER_CELL not set');
    return { ok: false, error: 'OWNER_CELL not set' };
  }
  return sendSms(ownerCell, text);
}
