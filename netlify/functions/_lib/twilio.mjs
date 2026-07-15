/* Shared Twilio helpers for the A1 Creative voice + SMS webhooks, adapted for
   Netlify Functions (event/response objects, not Express req/res). Runtime-
   agnostic: uses only global fetch + Node's crypto + env. Server-side only —
   the auth token never reaches the browser. */

import crypto from 'node:crypto';

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
  return `${proto}://${host}${path}`;
}

function lowerHeaders(headers = {}) {
  const out = {};
  for (const [k, v] of Object.entries(headers)) out[k.toLowerCase()] = v;
  return out;
}

/* Validates X-Twilio-Signature so only Twilio can hit the webhooks.
   Twilio signs: full request URL + POST params concatenated in sorted key
   order, HMAC-SHA1 with the account auth token, base64-encoded. Returns true
   only on a verified signature. If TWILIO_AUTH_TOKEN is unset we cannot verify,
   so we fail closed (return false). */
export function isValidTwilioRequest(event, params) {
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const headers = lowerHeaders(event.headers);
  const signature = headers['x-twilio-signature'];
  if (!authToken || !signature) return false;

  const url = requestUrl(event);
  const data = Object.keys(params)
    .sort()
    .reduce((acc, key) => acc + key + params[key], url);

  const expected = crypto
    .createHmac('sha1', authToken)
    .update(Buffer.from(data, 'utf-8'))
    .digest('base64');

  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
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
        headers: {
          Authorization: 'Basic ' + Buffer.from(`${sid}:${authToken}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ To: to, From: from, Body: body }),
      }
    );
    const data = await response.json();
    if (!response.ok) return { ok: false, error: data.message || `Twilio ${response.status}` };
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
