/* A1 Creative — website lead + assessment intake (Netlify Function).

   Two payloads, one same-origin endpoint (/api/submit-lead via netlify.toml):
   - default             → simple "Get a Quote" lead (unchanged behaviour).
   - { type:'assessment'} → Business Infrastructure Assessment: validate,
       find-or-create the Lead (dedupe), create a linked Business Assessments
       record, score it, recommend a package, follow-up Task, ops email.

   SMS compliance: phone is OPTIONAL and SMS consent NEVER blocks a submission.
   A phone with no consent still becomes a Lead — just not SMS opted-in. */

import {
  createLead,
  updateLead,
  findLead,
  createAssessment,
  createTask,
  logAutomation,
  hasAirtableConfig,
  LEAD_FIELDS,
} from './_lib/airtable.mjs';
import { notifyOps } from './_lib/notify.mjs';
import { evaluateAssessment } from './_lib/assessment.mjs';

const json = (statusCode, obj) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(obj),
});

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, body: '' };
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return json(400, { error: 'Invalid JSON body' });
  }

  if (body && body.type === 'assessment') return handleAssessment(body, event);
  return handleSimpleLead(body, event);
};

/* ─── Simple "Get a Quote" lead ───────────────────────────────────────────
   Now captures Business Name and SMS consent evidence, matching the same
   compliance rules as the assessment path: phone is optional, and SMS
   consent NEVER blocks a submission — a phone with no consent still
   becomes a Lead, just not SMS opted-in. */
const QUOTE_CONSENT_TEXT_VERSION = 'v2026-06b';

async function handleSimpleLead(body, event) {
  const {
    name,
    phone,
    email,
    service,
    date,
    message,
    client,
    source,
    businessName,
    smsConsent,
    smsConsentTextVersion,
    consentSourceUrl,
  } = body;

  // Phone is OPTIONAL — the quote form marks it optional, and our SMS rule is
  // that a phone is never required to become a lead. Require only name + email.
  if (!name || !email) {
    return json(400, { error: 'Name and email are required' });
  }

  if (!hasAirtableConfig()) {
    console.error('Quote lead: Airtable env vars missing in this deploy context.');
    return json(503, {
      error:
        "This form isn't fully connected yet (backend not configured for this environment). " +
        'Please email operations@a1creativeagency.com and we will fix it right away.',
      code: 'config_missing',
    });
  }

  const notesParts = [];
  if (date) notesParts.push(`Preferred Date: ${date}`);
  if (message) notesParts.push(`Message: ${message}`);

  // SMS opt-in only counts when a phone is present AND consent is checked —
  // same rule as the assessment path. Consent is optional and never blocks.
  const hasPhone = !!(phone && String(phone).replace(/\D/g, '').length >= 7);
  const smsOptIn = hasPhone && (smsConsent === true || smsConsent === 'true' || smsConsent === 'on');
  const consentFields = smsOptIn
    ? {
        [LEAD_FIELDS.smsConsent]: true,
        [LEAD_FIELDS.smsConsentAt]: new Date().toISOString(),
        [LEAD_FIELDS.smsConsentVersion]: smsConsentTextVersion || QUOTE_CONSENT_TEXT_VERSION,
        [LEAD_FIELDS.consentSourceUrl]: consentSourceUrl || undefined,
        [LEAD_FIELDS.consentIp]: clientIp(event) || undefined,
      }
    : { [LEAD_FIELDS.smsConsent]: false };

  const fields = {
    [LEAD_FIELDS.name]: name,
    [LEAD_FIELDS.email]: email,
    [LEAD_FIELDS.status]: 'new',
    [LEAD_FIELDS.source]: source || 'Website form ',
    [LEAD_FIELDS.client]: client || 'A1 Creative Agency',
    ...consentFields,
  };
  if (phone) fields[LEAD_FIELDS.phone] = phone; // optional
  if (businessName) fields[LEAD_FIELDS.business] = businessName;
  if (service) fields[LEAD_FIELDS.service] = service;
  if (notesParts.length > 0) fields[LEAD_FIELDS.notes] = notesParts.join('\n');
  if (date) fields['date'] = date;

  const lead = await createLead(fields);

  if (!lead.ok) {
    console.error('Airtable lead error:', lead.error);
    await logAutomation('website_lead_capture', `FAILED for ${name} (${phone}): ${lead.error}`, 'error');
    return json(502, { error: lead.error || 'Failed to create lead in Airtable' });
  }

  const [task, notify] = await Promise.all([
    createTask({
      'Task Title': `Follow up with ${name}${businessName ? ` (${businessName})` : ''}`,
      'Status': 'To Do',
      'Notes': `Website lead${service ? ` — ${service}` : ''}${date ? `, preferred date ${date}` : ''}. Email: ${email}. Phone: ${phone || '—'}. SMS opt-in: ${smsOptIn ? 'Yes' : 'No'}.`,
    }),
    notifyOps(
      `New website lead: ${name}`,
      `Name: ${name}\nBusiness: ${businessName || '—'}\nPhone: ${phone || '—'}\nEmail: ${email}\nService: ${service || '—'}\nPreferred date: ${date || '—'}\nSMS opt-in: ${smsOptIn ? 'Yes' : 'No'}\nMessage: ${message || '—'}\n\nAirtable lead: ${lead.id}`
    ),
  ]);

  await logAutomation(
    'website_lead_capture',
    `Lead ${lead.id} for ${name} (${phone}). Task: ${task.ok ? task.id : `failed (${task.error})`}. Ops email: ${notify.ok ? 'sent' : `failed (${notify.error})`}`,
    task.ok && notify.ok ? 'ok' : 'partial'
  );

  return json(200, { success: true, id: lead.id });
}

/* ─── Business Infrastructure Assessment ────────────────────────────────── */

const CONSENT_TEXT_VERSION = 'a1-assessment-v2026-07';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function makeAssessmentId() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  const stamp = `${d.getUTCFullYear()}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}-${p(d.getUTCHours())}${p(d.getUTCMinutes())}${p(d.getUTCSeconds())}`;
  return `ASMT-${stamp}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

function clientIp(event) {
  const h = event.headers || {};
  return h['x-nf-client-connection-ip'] || (h['x-forwarded-for'] || '').split(',')[0].trim() || '';
}

async function handleAssessment(body, event) {
  const a = {
    name: (body.name || '').trim(),
    email: (body.email || '').trim(),
    phone: (body.phone || '').trim(), // OPTIONAL
    businessName: (body.businessName || '').trim(),
    service: (body.service || 'Business Infrastructure Assessment').trim(),
    smsConsent: body.sms_consent === true || body.sms_consent === 'true' || body.sms_consent === 'on',
    website: (body.website || '').trim(),
    lead_capture: (body.lead_capture || '').trim(),
    booking: (body.booking || '').trim(),
    crm: (body.crm || '').trim(),
    follow_up: (body.follow_up || '').trim(),
    missed_calls: (body.missed_calls || '').trim(),
    goal: (body.goal || '').trim(),
    biggest_problem: (body.biggest_problem || '').trim(),
    source: (body.source || 'Website form — Business Infrastructure Assessment').trim(),
    consentSourceUrl: (body.consentSourceUrl || '').trim(),
  };

  // Step 1 — validate. Phone is OPTIONAL; consent is OPTIONAL and never blocks.
  const missing = [];
  if (!a.name) missing.push('name');
  if (!a.email) missing.push('email');
  if (!a.businessName) missing.push('business name');
  if (missing.length) return json(400, { error: `Please complete: ${missing.join(', ')}.` });
  if (!EMAIL_RE.test(a.email)) return json(400, { error: 'Please enter a valid email address.' });

  // Fail fast with a clear message if this deploy context has no Airtable
  // credentials (the usual cause: env vars set for Production but not Deploy
  // previews). Distinct from a real Airtable API error so it's self-diagnosing.
  if (!hasAirtableConfig()) {
    console.error('Assessment: Airtable env vars missing in this deploy context.');
    return json(503, {
      error:
        "This form isn't fully connected yet (backend not configured for this environment). " +
        'Please email operations@a1creativeagency.com and we will fix it right away.',
      code: 'config_missing',
    });
  }

  // SMS opt-in only counts when a phone is present AND consent is checked.
  const hasPhone = a.phone.replace(/\D/g, '').length >= 7;
  const smsOptIn = hasPhone && a.smsConsent;

  const nowIso = new Date().toISOString();
  // Consent evidence is written only when the user actually opted in.
  const consentFields = smsOptIn
    ? {
        [LEAD_FIELDS.smsConsent]: true,
        [LEAD_FIELDS.smsConsentAt]: nowIso,
        [LEAD_FIELDS.smsConsentVersion]: CONSENT_TEXT_VERSION,
        [LEAD_FIELDS.consentSourceUrl]: a.consentSourceUrl || undefined,
        [LEAD_FIELDS.consentIp]: clientIp(event) || undefined,
      }
    : { [LEAD_FIELDS.smsConsent]: false };

  // Step 2 — find or create the Lead
  let leadId = null;
  let leadOutcome = 'created';
  const found = await findLead({ email: a.email, phone: a.phone });
  if (found.ok && found.record) {
    leadId = found.record.id;
    leadOutcome = 'updated';
    const existing = found.record.fields || {};
    const updates = {};
    if (!existing[LEAD_FIELDS.name] && a.name) updates[LEAD_FIELDS.name] = a.name;
    if (!existing[LEAD_FIELDS.phone] && a.phone) updates[LEAD_FIELDS.phone] = a.phone;
    if (!existing[LEAD_FIELDS.email] && a.email) updates[LEAD_FIELDS.email] = a.email;
    if (!existing[LEAD_FIELDS.business] && a.businessName) updates[LEAD_FIELDS.business] = a.businessName;
    updates[LEAD_FIELDS.service] = a.service;
    updates[LEAD_FIELDS.source] = a.source;
    // Only upgrade consent to true; never overwrite an existing opt-in with false.
    if (smsOptIn) Object.assign(updates, consentFields);
    const upd = await updateLead(leadId, updates);
    if (!upd.ok) console.error('Assessment: lead update failed:', upd.error);
  } else {
    const created = await createLead({
      [LEAD_FIELDS.name]: a.name,
      [LEAD_FIELDS.email]: a.email,
      [LEAD_FIELDS.phone]: a.phone || undefined,
      [LEAD_FIELDS.business]: a.businessName,
      [LEAD_FIELDS.service]: a.service,
      [LEAD_FIELDS.status]: 'new',
      [LEAD_FIELDS.source]: a.source,
      [LEAD_FIELDS.client]: 'A1 Creative Agency',
      ...consentFields,
    });
    if (created.ok) leadId = created.id;
    else {
      console.error('Assessment: lead create failed:', created.error);
      leadOutcome = 'lead_failed';
    }
  }

  // Steps 3–5 — score, recommend, store
  const result = evaluateAssessment(a);
  const assessmentId = makeAssessmentId();
  const fields = {
    'Assessment ID': assessmentId,
    'Submitted Date': nowIso,
    'Website Status': a.website || undefined,
    'Lead Capture Status': a.lead_capture || undefined,
    'Booking System': a.booking || undefined,
    'CRM Status': a.crm || undefined,
    'Follow-Up Process': a.follow_up || undefined,
    'Missed Call Handling': a.missed_calls || undefined,
    'Biggest Business Problem': a.biggest_problem || undefined,
    '30–90 Day Goal': a.goal || undefined,
    'Service Requested': a.service || undefined,
    'Assessment Score': result.score,
    'Readiness Level': result.readiness,
    'Recommended Package': result.package,
    'Full Response Summary': result.summary,
    'SMS Consent': smsOptIn,
    'Source': a.source,
    'Follow-Up Needed': result.followUpNeeded,
    'CEO Review Status': 'Pending Review',
    'Assessment Status': 'New',
  };
  if (leadId) fields['Linked Lead'] = [leadId];

  const assessment = await createAssessment(fields);
  if (!assessment.ok) {
    console.error('Assessment: create failed:', assessment.error);
    await logAutomation(
      'assessment_submission',
      `FAILED to store assessment for ${a.name} (${a.businessName}). Lead: ${leadId || 'none'} (${leadOutcome}). Error: ${assessment.error}`,
      'error'
    );
    // Surface the Airtable reason (safe — no token/IDs) so a failed submission
    // is diagnosable on-screen instead of a generic "something went wrong".
    return json(502, {
      error: `We couldn't save your assessment (reason: ${assessment.error || 'unknown'}). Please email operations@a1creativeagency.com and we'll take care of you.`,
      code: 'save_failed',
    });
  }

  // Step 6 — follow-up task + ops email (best-effort; neither blocks the record)
  const [task, notify] = await Promise.all([
    createTask({
      'Task Title': `Assessment follow-up: ${a.name} (${a.businessName})`,
      'Status': 'To Do',
      'Notes':
        `Business Infrastructure Assessment — score ${result.score}/${result.maxScore}, ` +
        `${result.readiness}, recommend ${result.package} (${result.price}). ` +
        `Phone: ${a.phone || '—'}, email: ${a.email}. SMS opt-in: ${smsOptIn ? 'Yes' : 'No'}. Assessment ${assessmentId}.`,
    }),
    notifyOps(
      `New Business Assessment: ${a.businessName} (${result.package})`,
      [
        `Lead: ${a.name}`,
        `Business: ${a.businessName}`,
        `Phone: ${a.phone || '— (not provided)'}`,
        `Email: ${a.email}`,
        `SMS opt-in: ${smsOptIn ? 'Yes' : 'No'}`,
        '',
        `Assessment Score: ${result.score} / ${result.maxScore}`,
        `Readiness Level: ${result.readiness}`,
        `Recommended Package: ${result.package} (${result.price})`,
        `Follow-Up Needed: ${result.followUpNeeded ? 'Yes' : 'No'}`,
        '',
        `Lead record: ${leadId || 'not linked'}`,
        `Assessment record: ${assessment.id} (${assessmentId})`,
        '',
        '— Full responses —',
        result.summary,
      ].join('\n')
    ).catch((err) => ({ ok: false, error: err.message })),
  ]);

  await logAutomation(
    'assessment_submission',
    `Assessment ${assessment.id} (${assessmentId}) for ${a.name} / ${a.businessName}. Lead ${leadId || 'unlinked'} (${leadOutcome}). ` +
      `Score ${result.score}/${result.maxScore}, ${result.readiness}, ${result.package}. SMS opt-in ${smsOptIn ? 'yes' : 'no'}. ` +
      `Task: ${task.ok ? task.id : `failed (${task.error})`}. Ops email: ${notify.ok ? 'sent' : `failed (${notify.error})`}`,
    leadId && task.ok && notify.ok ? 'ok' : 'partial'
  );

  // Step 7 — safe public response (no tokens/IDs)
  return json(200, {
    success: true,
    assessment: {
      score: result.score,
      maxScore: result.maxScore,
      readiness: result.readiness,
      recommendedPackage: result.package,
      price: result.price,
    },
  });
}
