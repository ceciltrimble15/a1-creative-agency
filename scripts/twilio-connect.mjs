/* Run locally with credentials supplied through the environment, never arguments.
   Default is read-only. --apply-voice changes ONLY A1's incoming voice routing. */
import twilio from 'twilio';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { A1_NUMBER, voiceUrl, ownerNumber } from '../netlify/functions/_lib/twilio.mjs';

const args = process.argv.slice(2);
if (args.some(arg => arg !== '--apply-voice')) throw new Error('Usage: node scripts/twilio-connect.mjs [--apply-voice]');
const sid = process.env.TWILIO_ACCOUNT_SID;
const token = process.env.TWILIO_AUTH_TOKEN;
if (!/^AC[a-f0-9]{32}$/i.test(sid || '') || !token) {
  console.error('Connection unavailable: supply TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN securely in this process environment. No Twilio settings changed.');
  process.exit(1);
}
const client = twilio(sid, token, { timeout: 10000, autoRetry: false });
const desired = {
  voiceUrl: voiceUrl('voice'), voiceMethod: 'POST', voiceApplicationSid: '',
  statusCallback: voiceUrl('dial-status'), statusCallbackMethod: 'POST',
};
try {
  const account = await client.api.v2010.accounts(sid).fetch();
  if (account.status !== 'active') throw new Error(`Account status is ${account.status}. Resolve this with Twilio before changing routing.`);
  const matches = await client.incomingPhoneNumbers.list({ phoneNumber: A1_NUMBER, limit: 2 });
  const number = matches.find(n => n.phoneNumber === A1_NUMBER && n.accountSid === sid);
  if (!number || !number.capabilities?.voice) throw new Error('A1 number is not voice-capable in this account. No changes made.');
  console.log(JSON.stringify({
    accountStatus: account.status, phoneNumber: number.phoneNumber,
    canonicalVoiceConnected: number.voiceUrl === desired.voiceUrl && number.voiceMethod === 'POST' && !number.voiceApplicationSid,
    callStatusConnected: number.statusCallback === desired.statusCallback,
    smsHandlerPresent: !!number.smsUrl, smsApplicationPresent: !!number.smsApplicationSid,
    note: 'An active account API status does not prove Twilio security restrictions are cleared. Messaging Service overrides need a separate audit.',
  }, null, 2));
  if (args.includes('--apply-voice')) {
    // Verify deployed code and its actual OWNER_CELL before touching routing.
    // This request returns TwiML only; it does not place a call or send a message.
    const expectedOwner = ownerNumber();
    if (!expectedOwner) throw new Error('Supply the verified owner destination as OWNER_CELL in the process environment before applying. No settings changed.');
    const params = { AccountSid: sid, CallSid: 'CA' + '0'.repeat(32), To: A1_NUMBER, From: '+15135550100' };
    const response = await fetch(desired.voiceUrl, {
      method: 'POST', redirect: 'error', signal: AbortSignal.timeout(10000),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Twilio-Signature': twilio.getExpectedTwilioSignature(token, desired.voiceUrl, params) },
      body: new URLSearchParams(params),
    });
    const xml = await response.text();
    if (!response.ok || !xml.includes(`>${expectedOwner}</Number>`) || !xml.includes(voiceUrl('dial-status')) || !xml.includes(`action="${voiceUrl('missed-call')}"`)) {
      throw new Error(`Production voice preflight failed (HTTP ${response.status}). Deploy recovery code and verify production OWNER_CELL matches the verified destination first. No number settings changed.`);
    }
    const backupDir = await mkdtemp(join(tmpdir(), 'a1-twilio-routing-'));
    const previous = Object.fromEntries(Object.keys(desired).map(key => [key, number[key] || '']));
    await writeFile(join(backupDir, 'routing.json'), JSON.stringify({ numberSid: number.sid, previous }, null, 2), { mode: 0o600 });
    console.log(`Previous voice settings saved in ${join(backupDir, 'routing.json')}`);
    await client.incomingPhoneNumbers(number.sid).update(desired);
    const saved = await client.incomingPhoneNumbers(number.sid).fetch();
    if (Object.entries(desired).some(([key, value]) => (saved[key] || '') !== value)) throw new Error('Routing read-back mismatch. Inspect the number before testing.');
    console.log('A1 voice routing saved and read back. SMS and other business numbers were not changed. Real answered-call and missed-call tests are still required.');
  }
} catch (error) {
  // Provider errors may include request objects/credentials. Print only safe identifiers.
  console.error(error.code ? `Twilio API error ${error.code} (HTTP ${error.status || 'unknown'}). Check Twilio account restrictions and Debugger.` : error.message);
  process.exitCode = 1;
}
