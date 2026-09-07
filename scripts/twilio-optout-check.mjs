import assert from 'node:assert/strict';
import crypto from 'node:crypto';

process.env.AIRTABLE_API_KEY = 'test-token';
process.env.AIRTABLE_BASE_ID = 'app-test';
process.env.TWILIO_AUTH_TOKEN = 'test-twilio-auth-token';

const requests = [];

globalThis.fetch = async (url, options = {}) => {
  requests.push({ url: String(url), options });
  if (options.method === 'GET') {
    return {
      ok: true,
      status: 200,
      async json() {
        return {
          records: [
            {
              id: 'rec-lead',
              fields: {
                'SMS Consent': true,
                'SMS Consent Timestamp': '2026-08-24T12:00:00.000Z',
                'SMS Consent Text Version': 'A1-SMS-QUOTE-2026-01',
                'Consent Source URL': '/quote',
              },
            },
          ],
        };
      },
    };
  }
  return {
    ok: true,
    status: 200,
    async json() {
      return { id: 'rec-updated' };
    },
  };
};

const { handler } = await import('../netlify/functions/twilio-sms.mjs');
const rawUrl = 'https://a1creativeagency.com/api/twilio/sms';
const params = {
  Body: 'STOP',
  From: '+15135550100',
  OptOutType: 'STOP',
};
const encodedBody = new URLSearchParams(params).toString();
const signedData = Object.keys(params)
  .sort()
  .reduce((value, key) => value + key + params[key], rawUrl);
const signature = crypto
  .createHmac('sha1', process.env.TWILIO_AUTH_TOKEN)
  .update(Buffer.from(signedData, 'utf-8'))
  .digest('base64');

const response = await handler({
  httpMethod: 'POST',
  rawUrl,
  headers: { 'x-twilio-signature': signature },
  body: encodedBody,
});

assert.equal(response.statusCode, 200);
assert(!response.body.includes('<Message>'), 'The webhook must not duplicate Twilio Advanced Opt-Out replies.');

const leadUpdate = requests.find(({ url, options }) =>
  url.endsWith('/Leads/rec-lead') && options.method === 'PATCH'
);
assert(leadUpdate, 'STOP must update the known lead.');
assert.deepEqual(JSON.parse(leadUpdate.options.body).fields, {
  'SMS Consent': false,
});
assert(!requests.some(({ url }) => url.includes('api.twilio.com')), 'The webhook must not send an outbound SMS.');

console.log('Twilio opt-out check passed: consent disabled, original evidence preserved, no duplicate SMS.');
