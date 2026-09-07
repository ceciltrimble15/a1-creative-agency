import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = new URL('..', import.meta.url).pathname;

function filesUnder(dir, extension) {
  const found = [];
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === '.git') continue;
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) found.push(...filesUnder(path, extension));
    else if (path.endsWith(extension)) found.push(path);
  }
  return found;
}

const htmlFiles = filesUnder(root, '.html');
const html = new Map(
  htmlFiles.map((path) => [relative(root, path), readFileSync(path, 'utf8')])
);
const quote = html.get('quote.html');
const assessment = html.get('assessment.html');
const contact = html.get('contact.html');
const privacy = html.get('privacy.html');
const terms = html.get('terms.html');
const submitLead = readFileSync(join(root, 'netlify/functions/submit-lead.mjs'), 'utf8');
const missedCall = readFileSync(join(root, 'netlify/functions/twilio-missed-call.mjs'), 'utf8');
const inboundSms = readFileSync(join(root, 'netlify/functions/twilio-sms.mjs'), 'utf8');

const exactDisclosure =
  'I agree to receive text messages from A/1 Creative Agency about my quote request and appointments. Message frequency varies. Msg &amp; data rates may apply. Reply STOP to opt out or HELP for help.';
const supportingLine =
  'SMS consent is optional and is not a condition of receiving a quote or purchasing services.';

assert(quote.includes(exactDisclosure), 'Quote must contain the exact locked SMS disclosure.');
assert(quote.includes(supportingLine), 'Quote must contain the exact optional-consent line.');
assert.match(quote, /name="sms_consent" type="checkbox"(?![^>]*checked)/, 'Quote checkbox must default unchecked.');
assert.equal((quote.match(/name="sms_consent"/g) || []).length, 1, 'Quote must contain exactly one SMS checkbox.');
assert(!assessment.includes('name="sms_consent"'), 'Assessment must not collect SMS consent.');
assert(!contact.includes('name="sms_consent"'), 'Contact must not collect SMS consent.');
assert(quote.includes("formType: 'quote'"), 'Quote payload must identify the quote form.');
assert(quote.includes("consentSourceUrl: '/quote'"), 'Quote payload must declare /quote as the source.');
assert(quote.includes("smsConsentTextVersion: 'A1-SMS-QUOTE-2026-01'"), 'Quote must use the locked disclosure version.');
assert(!/if\s*\(\s*!consent\s*\)/.test(quote), 'Quote submission must not require SMS consent.');
assert(!/name="sms_consent"[^>]*\brequired\b/.test(quote), 'SMS checkbox must remain optional.');
assert(quote.includes("if (consent && val('phone').replace(/\\D/g, '').length < 10)"), 'Checked SMS consent must require a usable phone number.');

for (const [path, source] of html) {
  if (path !== 'quote.html') {
    assert(!source.includes('name="sms_consent"'), `${path} must not contain an SMS consent checkbox.`);
  }
  assert(!/A\/1 Creative Agency LLC/.test(source), `${path} contains unverified LLC branding.`);
  assert(!/call or text|phone \/ text/i.test(source), `${path} contains a public call-or-text CTA.`);
  assert(!/instant text-back|missed-call text-back|text back missed calls/i.test(source), `${path} implies automatic missed-call SMS.`);
}

assert(privacy.includes('only through the optional, unchecked checkbox'), 'Privacy must describe the single consent path.');
assert(privacy.includes('href="/quote"'), 'Privacy must identify /quote.');
assert(terms.includes('opt in only by checking the optional, unchecked SMS-consent box'), 'Terms must describe the single consent path.');
assert(terms.includes('href="/quote"'), 'Terms must identify /quote.');

assert(submitLead.includes("const QUOTE_CONSENT_TEXT_VERSION = 'A1-SMS-QUOTE-2026-01'"), 'Backend must lock the disclosure version.');
assert(submitLead.includes("formType === 'quote'"), 'Backend must restrict consent to quote payloads.');
assert(submitLead.includes("consentSourceUrl === '/quote'"), 'Backend must restrict consent to /quote.');
assert(submitLead.includes("referrerPath === '/quote'"), 'Backend must verify the browser source path.');
assert(!missedCall.includes('sendSms('), 'Missed-call handler must not text the caller.');
assert(missedCall.includes('a missed call is not consent'), 'Missed-call handler must document the consent boundary.');
assert(inboundSms.includes('[LEAD_FIELDS.smsConsent]: false'), 'STOP must downgrade SMS consent.');
assert(!inboundSms.includes('[LEAD_FIELDS.smsConsentAt]:'), 'STOP must preserve the original consent timestamp.');
assert(!inboundSms.includes('[LEAD_FIELDS.consentSourceUrl]:'), 'STOP must preserve the original consent source.');

console.log(`Compliance checks passed for ${html.size} HTML pages and the SMS/voice backend.`);
