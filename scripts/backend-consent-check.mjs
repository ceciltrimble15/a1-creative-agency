import assert from 'node:assert/strict';

process.env.AIRTABLE_API_KEY = 'test-token';
process.env.AIRTABLE_BASE_ID = 'app-test';
process.env.RESEND_API_KEY = 'test-resend-token';

const requests = [];
let recordNumber = 0;

globalThis.fetch = async (url, options = {}) => {
  requests.push({ url: String(url), options });
  recordNumber += 1;
  return {
    ok: true,
    status: 200,
    async json() {
      return String(url).includes('api.resend.com')
        ? { id: `email-${recordNumber}` }
        : { id: `rec-${recordNumber}` };
    },
  };
};

const { handler } = await import('../netlify/functions/submit-lead.mjs');

function leadRequest() {
  const request = requests.find(({ url, options }) =>
    url.endsWith('/Leads') && options.method === 'POST'
  );
  assert(request, 'Expected the backend to create a Lead record.');
  return JSON.parse(request.options.body).fields;
}

async function submitQuote(overrides = {}, referrer = 'https://a1creativeagency.com/quote') {
  requests.length = 0;
  const body = {
    name: 'Test Lead',
    email: 'lead@example.com',
    phone: '(513) 555-0100',
    formType: 'quote',
    consentSourceUrl: '/quote',
    smsConsent: false,
    source: 'Website form — Quote request',
    client: 'A/1 Creative Agency',
    ...overrides,
  };
  const response = await handler({
    httpMethod: 'POST',
    headers: {
      referer: referrer,
      'x-nf-client-connection-ip': '203.0.113.10',
    },
    body: JSON.stringify(body),
  });
  assert.equal(response.statusCode, 200);
  return leadRequest();
}

const noConsent = await submitQuote();
assert.equal(noConsent['SMS Consent'], false);
assert.equal(noConsent['SMS Consent Timestamp'], undefined);
assert.equal(noConsent['SMS Consent Text Version'], undefined);
assert.equal(noConsent['Consent Source URL'], undefined);
assert.equal(noConsent['Consent IP'], undefined);

const validConsent = await submitQuote({ smsConsent: true });
assert.equal(validConsent['SMS Consent'], true);
assert.match(validConsent['SMS Consent Timestamp'], /^\d{4}-\d{2}-\d{2}T/);
assert.equal(validConsent['SMS Consent Text Version'], 'A1-SMS-QUOTE-2026-01');
assert.equal(validConsent['Consent Source URL'], '/quote');
assert.equal(validConsent['Consent IP'], '203.0.113.10');

const wrongPage = await submitQuote(
  { smsConsent: true },
  'https://a1creativeagency.com/contact'
);
assert.equal(wrongPage['SMS Consent'], false);
assert.equal(wrongPage['SMS Consent Timestamp'], undefined);

const noPhone = await submitQuote({ smsConsent: true, phone: '' });
assert.equal(noPhone['SMS Consent'], false);
assert.equal(noPhone['SMS Consent Timestamp'], undefined);

console.log('Backend consent checks passed: unchecked, valid quote, wrong page, and no-phone cases.');
