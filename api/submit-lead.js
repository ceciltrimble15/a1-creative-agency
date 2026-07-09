import { processLead, corsHeaders } from './_lib/lead.js';

/* Vercel adapter. The A1 Creative homepage now posts same-origin to
   /api/submit-lead on Netlify (see netlify/functions/submit-lead.mjs); this
   Vercel copy stays for the Vercel deployment and for any cross-origin post —
   both share the same processLead() core. */
export default async function handler(req, res) {
  const origin = req.headers.origin;
  const cors = corsHeaders(origin);
  for (const [key, value] of Object.entries(cors)) res.setHeader(key, value);

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { status, body } = await processLead(req.body);
  return res.status(status).json(body);
}
