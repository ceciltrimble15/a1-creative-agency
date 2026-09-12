/* Shared Twilio helpers for the A1 Creative voice + SMS webhooks, adapted for
   Netlify Functions (event/response objects, not Express req/res). Runtime-
   agnostic: uses the official Twilio SDK + global fetch + env. Server-side only —
   the auth token never reaches the browser. */

import twilio from 'twilio';

/* Parse a Netlify Function event body into a plain params object. Twilio POSTs
   application/x-www-form-urlencoded; Netlify may base64-encode the body. */
export function parseTwilioBody(event) {
  const raw = event.isBase64Encoded
    ? Buffer.from(event.body || '', 'base64').toString('utf-8')
    : event.body || '';
  const params = {};
  for (const [k, v] of new URLSearchParams(raw)) params[k] = v;
  return params;
}

/* Reconstruct the exact public URL Twilio signed. Twilio signs the URL it was
   configured with (e.g. https://a1creativeagency.com/api/twilio/voice).
   Netlify's event.rawUrl preserves that original request URL through the
   rewrite, so prefer it; fall back to forwarded headers + path. */
function requestUrl(event) {
  if (event.rawUrl) return event.rawUrl;
  const headers = lowerHeaders(event.headers);
  const proto = headers['x-forwarded-proto'] || 'https';
  const host = headers['x-forwarded-host'] || headers.host;
  const path = event.path || (event.rawPath || '');
  const query = event.rawQuery ? `?${event.rawQuery}` : '';
  return `${proto}://${host}${path}${query}`;
}

function lowerHeaders(headers = {}) {
  const out = {};
  for (const [k, v] of Object.entries(headers)) out[k.toLowerCase()] = v;
  return out;
}

/* Use Twilio's maintained validator; never accept unsigned callbacks. */
export function isValidTwilioRequest(event, params) {
  const token = process.env.TWILIO_AUTH_TOKEN;
  const signature = lowerHeaders(event.headers)['x-twilio-signature'];
  if (!token || !signature || !/^AC[a-f0-9]{32}$/i.test(process.env.TWILIO_ACCOUNT_SID || '')) return false;
  if (params.AccountSid !== process.env.TWILIO_ACCOUNT_SID) return false;
  try { return twilio.validateRequest(token, signature, requestUrl(event), params); }
  catch { return false; }
}

export const A1_NUMBER = '+15134403329';
export const VOICE_ORIGIN = 'https://a1creativeagency.com';
export const voiceUrl = (path) => `${VOICE_ORIGIN}/api/twilio/${path}`;

// A1's forwarding destination is a US number. Reject malformed/international
// values and forwarding back to the business number rather than guessing.
export function ownerNumber() {
  const number = (process.env.OWNER_CELL || '').trim();
  return /^\+1[2-9]\d{2}[2-9]\d{6}$/.test(number) && number !== A1_NUMBER ? number : null;
}

export function voiceRequestError(event, params) {
  if (event.httpMethod !== 'POST') return methodNotAllowed();
  if (!isValidTwilioRequest(event, params)) return forbidden();
  if (!/^CA[a-f0-9]{32}$/i.test(params.CallSid || '')) return { statusCode: 400, body: 'Missing valid CallSid' };
  // Recording callbacks omit To. Validate it on entry/action requests when present.
  if (params.To && params.To !== A1_NUMBER) return { statusCode: 403, body: 'Wrong business number' };
  return null;
}

/* Send an outbound SMS from the A1 number via the Twilio REST API. */
export async function sendSms(to, body) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE_NUMBER;

  if (!sid || !authToken || !from) {
    return { ok: false, error: 'Missing TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, or TWILIO_PHONE_NUMBER' };
  }

  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
      {
        method: 'POST',
        signal: AbortSignal.timeout(2500),
        headers: {
          Authorization: 'Basic ' + Buffer.from(`${sid}:${authToken}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ To: to, From: from, Body: body }),
      }
    );
    const data = await response.json();
    if (!response.ok) return { ok: false, error: data.message || `Twilio ${response.status}`, code: data.code };
    return { ok: true, sid: data.sid };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

export function xmlEscape(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/* Build a Netlify Function TwiML (XML) response. */
export function twiml(xml) {
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'text/xml; charset=utf-8' },
    body: `<?xml version="1.0" encoding="UTF-8"?>${xml}`,
  };
}

/* Build a Netlify Function messaging (TwiML <Response>) reply for inbound SMS. */
export function smsReply(message) {
  return twiml(`<Response><Message>${xmlEscape(message)}</Message></Response>`);
}

export function emptyTwiml() {
  return twiml('<Response></Response>');
}

export function methodNotAllowed() {
  return { statusCode: 405, body: 'Method not allowed' };
}

export function forbidden() {
  return { statusCode: 403, body: 'Invalid Twilio signature' };
}
