import { processLead, corsHeaders } from '../../api/_lib/lead.js';

/* Netlify Functions v2 adapter. Routed directly at /api/submit-lead so the A1
   Creative homepage (served from this same Netlify site) posts same-origin.
   Shares the processLead() core with the Vercel handler (api/submit-lead.js). */
export const config = { path: '/api/submit-lead' };

export default async function handler(req) {
  const headers = {
    'Content-Type': 'application/json',
    ...corsHeaders(req.headers.get('origin')),
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers });
  }

  let input;
  try {
    input = await req.json();
  } catch {
    input = {};
  }

  const { status, body } = await processLead(input);
  return new Response(JSON.stringify(body), { status, headers });
}
