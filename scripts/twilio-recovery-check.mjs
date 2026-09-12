import assert from 'node:assert/strict';
import twilio from 'twilio';
process.env.TWILIO_ACCOUNT_SID = 'AC' + 'a'.repeat(32);
process.env.TWILIO_AUTH_TOKEN = 'local-test-only';
process.env.TWILIO_PHONE_NUMBER = '+15134403329';
process.env.OWNER_CELL = '+15135550200';
process.env.AIRTABLE_API_KEY = 'test';
process.env.AIRTABLE_BASE_ID = 'test';
process.env.RESEND_API_KEY = 'test';
const { handler: voice } = await import('../netlify/functions/twilio-voice.mjs');
const { handler: missed } = await import('../netlify/functions/twilio-missed-call.mjs');
const { handler: recording } = await import('../netlify/functions/twilio-recording-status.mjs');
const { handler: status } = await import('../netlify/functions/twilio-dial-status.mjs');
const { handler: voicemail } = await import('../netlify/functions/twilio-voicemail.mjs');
const base = { AccountSid: process.env.TWILIO_ACCOUNT_SID, CallSid: 'CA' + 'b'.repeat(32), To: '+15134403329', From: '+15135550100' };
function event(path, extra = {}) {
  const params = { ...base, ...extra };
  const rawUrl = `https://a1creativeagency.com/api/twilio/${path}`;
  return { httpMethod: 'POST', rawUrl, headers: { 'X-Twilio-Signature': twilio.getExpectedTwilioSignature(process.env.TWILIO_AUTH_TOKEN, rawUrl, params) }, body: new URLSearchParams(params).toString() };
}
let requests = [], records = new Map(), fail = false, slow = false;
globalThis.fetch = async (url, options) => {
  url = String(url); requests.push({ url, ...options });
  assert(options.signal, 'External requests must have a deadline');
  if (slow) return new Promise((_, reject) => options.signal.addEventListener('abort', () => reject(new Error('deadline')), { once: true }));
  if (fail) return { ok: false, status: 503, json: async () => ({ error: { message: 'offline' } }) };
  const data = options.headers['Content-Type'] === 'application/json' ? JSON.parse(options.body) : null;
  if (url.includes('api.airtable.com') && data.performUpsert) {
    const key = data.performUpsert.fieldsToMergeOn[0];
    const fields = data.records[0].fields;
    const identity = key + fields[key];
    const created = !records.has(identity);
    if (created) records.set(identity, { id: 'rec' + records.size, fields });
    const record = records.get(identity);
    assert(!('Status' in fields) && !('lead_status' in fields), 'Retry must not reopen work');
    return { ok: true, json: async () => ({ records: [record], createdRecords: created ? [record.id] : [], updatedRecords: created ? [] : [record.id] }) };
  }
  return { ok: true, json: async () => ({ id: 'mock', sid: 'SMmock' }) };
};

assert.equal((await voice({ ...event('voice'), httpMethod: 'GET' })).statusCode, 405);
assert.equal((await voice({ ...event('voice'), headers: {} })).statusCode, 403);
assert.equal((await voice(event('voice', { AccountSid: 'AC' + 'c'.repeat(32) }))).statusCode, 403);
assert.equal((await voice(event('voice', { To: '+15135550200' }))).statusCode, 403);
assert.equal((await voice(event('voice', { CallSid: 'bad' }))).statusCode, 400);
const wrongUrl = event('voice'); wrongUrl.rawUrl += '?changed=1';
assert.equal((await voice(wrongUrl)).statusCode, 403);
const encoded = event('voice'); encoded.body = Buffer.from(encoded.body).toString('base64'); encoded.isBase64Encoded = true;
const connected = await voice(encoded);
assert.equal(connected.statusCode, 200);
assert(connected.body.includes('>+15135550200</Number>'));
assert(connected.body.includes('callerId="+15134403329"'));
assert(connected.body.includes('https://a1creativeagency.com/api/twilio/dial-status'));
assert.equal(requests.length, 0, 'No network work before dialing');
for (const badOwner of ['+5135550200', '+15134403329', '', '+442071234567']) {
  process.env.OWNER_CELL = badOwner;
  const response = await voice(event('voice'));
  assert(!response.body.includes('<Dial'));
  assert(response.body.includes('<Redirect method="POST">https://a1creativeagency.com/api/twilio/missed-call'));
}
process.env.OWNER_CELL = '+15135550200';
for (const outcome of ['completed', 'answered', 'canceled']) {
  assert((await missed(event('missed-call', { DialCallStatus: outcome }))).body.includes('<Hangup/>'));
}
assert.equal(requests.length, 0, 'Answered calls must not create callback work');
for (const outcome of ['no-answer', 'busy', 'failed']) {
  requests = []; records.clear();
  const e = event('missed-call', { DialCallStatus: outcome });
  const response = await missed(e);
  assert.equal(response.statusCode, 200);
  assert(response.body.includes('<Record '));
  assert(response.body.includes('recordingStatusCallback="https://a1creativeagency.com/api/twilio/recording-status"'));
  assert.equal(records.size, 2, 'One lead and one task');
  assert([...records.keys()].some(key => key.startsWith('Task TitleCall back')));
  assert(![...records.values()].some(r => 'SMS Consent' in r.fields));
  const sms = requests.filter(r => r.url.includes('api.twilio.com'));
  assert.equal(sms.length, 1);
  assert.equal(new URLSearchParams(sms[0].body).get('To'), process.env.OWNER_CELL);
  const emailKey = requests.find(r => r.url.includes('resend.com')).headers['Idempotency-Key'];
  requests = [];
  await missed(e);
  assert.equal(records.size, 2, 'Repeated callback must not duplicate records');
  assert(!requests.some(r => r.url.includes('api.twilio.com')), 'Repeated callback must not duplicate owner text');
  assert.equal(requests.find(r => r.url.includes('resend.com')).headers['Idempotency-Key'], emailKey);
  assert(!requests.some(r => /\/(Leads|Tasks)\/rec/.test(r.url)), 'Retry must not reset existing statuses');
}
fail = true;
assert((await missed(event('missed-call', { DialCallStatus: 'failed' }))).body.includes('<Record '), 'CRM/email failure must still allow voicemail');
fail = false;
const rec = { RecordingSid: 'RE' + 'd'.repeat(32), RecordingStatus: 'completed', RecordingDuration: '15' };
requests = [];
assert.equal((await voicemail(event('voicemail', rec))).statusCode, 200);
assert.equal(requests.length, 0, 'Caller response does not depend on notification services');
assert.equal((await recording(event('recording-status', rec))).statusCode, 204);
const mail = JSON.parse(requests[0].body);
assert(mail.text.includes(`${rec.RecordingSid}.mp3`));
assert(mail.to.includes('operations@a1creativeagency.com'));
assert.equal((await recording(event('recording-status', { ...rec, RecordingStatus: 'absent' }))).statusCode, 204);
fail = true;
assert.equal((await recording(event('recording-status', rec))).statusCode, 503);
fail = false;
assert.equal((await recording(event('recording-status', { ...rec, RecordingSid: 'bad' }))).statusCode, 400);
requests = [];
assert.equal((await status(event('dial-status', { To: process.env.OWNER_CELL, CallStatus: 'failed', ErrorCode: '21215' }))).statusCode, 204);
assert.equal(requests.length, 0);
// Exercise actual AbortSignal deadlines, including simultaneous failed dependencies.
slow = true;
const keepAlive = setInterval(() => {}, 100);
const start = Date.now();
try {
  assert((await missed(event('missed-call', { DialCallStatus: 'no-answer' }))).body.includes('<Record '));
  assert(Date.now() - start < 9000, 'Recovery must leave headroom below Twilio 15s timeout');
} finally { clearInterval(keepAlive); }
console.log('Voice recovery checks passed: signatures, destination, answered/missed calls, retry deduplication, owner-only SMS, recording readiness, and failure deadlines.');
