import crypto from 'node:crypto';

/* Validates X-Twilio-Signature so only Twilio can hit the voice webhooks.
   Twilio signs: full request URL + POST params concatenated in sorted key
   order, HMAC-SHA1 with the account auth token, base64-encoded. */
export function isValidTwilioRequest(req) {
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const signature = req.headers['x-twilio-signature'];
  if (!authToken || !signature) return false;

  const proto = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const url = `${proto}://${host}${req.url}`;

  const params = req.body || {};
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

export function sendTwiml(res, twiml) {
  res.setHeader('Content-Type', 'text/xml');
  return res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?>${twiml}`);
}
