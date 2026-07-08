/* Email notification to operations@ via Resend (plain HTTPS API).
   Self-contained (no Twilio dependency) so the marketing-site lead path
   has no extra runtime requirements. No-ops with a logged warning until
   RESEND_API_KEY is set — email is best-effort and never fails the lead. */

const OPS_EMAIL = process.env.NOTIFY_EMAIL || 'operations@a1creativeagency.com';

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
        // NOTIFY_FROM must be a Resend-verified sender to reach operations@.
        // The default resend.dev sender only delivers to the account owner.
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
