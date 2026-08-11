/* Email notification to operations@ via Resend (plain HTTPS API), plus an
   optional owner SMS alert for the Twilio voice flows. The Resend path stays
   dependency-light — email is best-effort and never fails the lead. The SMS
   alert imports the Twilio helper lazily so the marketing-site lead path never
   loads it. Both no-op with a logged warning until their env vars are set. */

import { sendSms } from './twilio.mjs';

// operations@a1creativeagency.com is the permanent, fixed recipient — per
// Cecil (Aug 7 2026), this address must never be replaced by an env var.
// NOTIFY_CC is an optional temporary addition (e.g. for verifying delivery
// during the Resend domain-verification fix) and only ever adds a copy;
// it can never substitute for the primary destination.
const OPS_EMAIL = 'operations@a1creativeagency.com';

export async function notifyOps(subject, text) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('notifyOps skipped: RESEND_API_KEY not set');
    return { ok: false, error: 'RESEND_API_KEY not set' };
  }

  const ccRaw = process.env.NOTIFY_CC || '';
  // TEMPORARY DIAGNOSTIC (remove once NOTIFY_CC is confirmed working) —
  // logs presence/length only, never the actual value, so this is safe to
  // leave in function logs even though they may be visible to others.
  console.log('[notify diagnostic] NOTIFY_CC present:', !!process.env.NOTIFY_CC, '| length:', ccRaw.length);
  const cc = ccRaw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  try {
    const body = {
      // NOTIFY_FROM must be a Resend-verified sender to reach operations@.
      // The default resend.dev sender only delivers to the account owner.
      from: process.env.NOTIFY_FROM || 'A1 Creative Alerts <onboarding@resend.dev>',
      to: [OPS_EMAIL],
      subject,
      text,
    };
    if (cc.length > 0) body.cc = cc;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    if (!response.ok) return { ok: false, error: data.message || `Resend ${response.status}` };
    return { ok: true, id: data.id };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/* SMS alert to the owner's cell (OWNER_CELL) via the Twilio number. Used by the
   missed-call / voicemail flows. No-ops until OWNER_CELL is set. */
export async function alertOwner(text) {
  const ownerCell = process.env.OWNER_CELL;
  if (!ownerCell) {
    console.error('alertOwner skipped: OWNER_CELL not set');
    return { ok: false, error: 'OWNER_CELL not set' };
  }
  return sendSms(ownerCell, text);
}
