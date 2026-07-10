/* A1 Creative — website lead + assessment intake (Netlify Function).

   Two payloads, one same-origin endpoint (/api/submit-lead via netlify.toml):
   - default            → simple "Get a Quote" lead (unchanged behaviour).
   - { type:'assessment'} → Business Infrastructure Assessment: validate,
       find-or-create the Lead (dedupe), create a linked Business Assessments
       record, score it, recommend a package, notify ops. The Lead/Assessment
       are the critical path; the ops email is best-effort and never fails it. */

import {
  createLead,
  updateLead,
  findLead,
  createAssessment,
  createTask,
  logAutomation,
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
  return handleSimpleLead(body);
};

/* ─── Simple "Get a Quote" lead (existing behaviour — unchanged) ─────────── */
async function handleSimpleLead(body) {
  const { name, phone, email, service, date, message, client, source } = body;

  if (!name || !phone || !email) {
    return json(400, { error: 'Name, phone, and email are required' });
  }

  const notesParts = [];
  if (service) notesParts.push(`Service: ${service}`);
  if (date) notesParts.push(`Preferred Date: ${date}`);
  if (message) notesParts.push(`Message: ${message}`);

  const fields = {
    'Lead Name': name,
    'Phone': phone,
    'Email ': email, // Airtable field name has a trailing space (verified in base)
    'lead_status': 'new',
    'Source': source || 'Website form ',
    'Client': client || 'A1 Creative Agency',
  };
  if (notesParts.length > 0) fields['Notes'] = notesParts.join('\n');
  if (date) fields['date'] = date;

  const lead = await createLead(fields);

  if (!lead.ok) {
    console.error('Airtable lead error:', lead.error);
    await logAutomation('website_lead_capture', `FAILED for ${name} (${phone}): ${lead.error}`, 'error');
    return json(502, { error: lead.error || 'Failed to create lead in Airtable' });
  }

  const [task, notify] = await Promise.all([
    createTask({
      'Task Title': `Follow up with ${name} (${phone})`,
      'Status': 'To Do',
      'Notes': `Website lead${service ? ` — ${service}` : ''}${date ? `, preferred date ${date}` : ''}. Email: ${email}`,
    }),
    notifyOps(
      `New website lead: ${name}`,
      `Name: ${name}\nPhone: ${phone}\nEmail: ${email}\nService: ${service || '—'}\nPreferred date: ${date || '—'}\nMessage: ${message || '—'}\n\nAirtable lead: ${lead.id}`
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
    phone: (body.phone || '').trim(),
    businessName: (body.businessName || '').trim(),
    service: (body.service || 'Business Infrastructure Assessment').trim(),
    smsConsent: body.sms_consent === true || body.sms_consent === 'true' || body.sms_consent === 'on',
    website: (body.website || '').trim(),
    booking: (body.booking || '').trim(),
    missed_calls: (body.missed_calls || '').trim(),
    follow_up: (body.follow_up || '').trim(),
    crm: (body.crm || '').trim(),
    payments: (body.payments || '').trim(),
    biggest_problem: (body.biggest_problem || '').trim(),
    goal: (body.goal || '').trim(),
    source: (body.source || 'Website form — Business Infrastructure Assessment').trim(),
    consentSourceUrl: (body.consentSourceUrl || '').trim(),
  };

  // Step 1 — validate
  const missing = [];
  if (!a.name) missing.push('name');
  if (!a.email) missing.push('email');
  if (!a.phone) missing.push('phone');
  if (!a.businessName) missing.push('business name');
  if (missing.length) return json(400, { error: `Please complete: ${missing.join(', ')}.` });
  if (!EMAIL_RE.test(a.email)) return json(400, { error: 'Please enter a valid email address.' });

  const phoneDigits = a.phone.replace(/\D/g, '');
  if (phoneDigits.length >= 7 && !a.smsConsent) {
    return json(400, { error: 'Please agree to receive text messages, or remove your phone number, to continue.' });
  }

  const nowIso = new Date().toISOString();
  const consentFields = a.smsConsent
    ? {
        [LEAD_FIELDS.smsConsent]: true,
        [LEAD_FIELDS.smsConsentAt]: nowIso,
        [LEAD_FIELDS.smsConsentVersion]: CONSENT_TEXT_VERSION,
        [LEAD_FIELDS.consentSourceUrl]: a.consentSourceUrl || undefined,
        [LEAD_FIELDS.consentIp]: clientIp(event) || undefined,
      }
    : {};

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
    Object.assign(updates, consentFields);
    const upd = await updateLead(leadId, updates);
    if (!upd.ok) console.error('Assessment: lead update failed:', upd.error);
  } else {
    const created = await createLead({
      [LEAD_FIELDS.name]: a.name,
      [LEAD_FIELDS.email]: a.email,
      [LEAD_FIELDS.phone]: a.phone,
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
    'Booking System': a.booking || undefined,
    'Missed Call Handling': a.missed_calls || undefined,
    'Follow-Up Process': a.follow_up || undefined,
    'CRM Status': a.crm || undefined,
    'Payments / Deposits': a.payments || undefined,
    'Biggest Business Problem': a.biggest_problem || undefined,
    '30–90 Day Goal': a.goal || undefined,
    'Service Requested': a.service || undefined,
    'Assessment Score': result.score,
    'Readiness Level': result.readiness,
    'Recommended Package': result.package,
    'Full Response Summary': result.summary,
    'SMS Consent': a.smsConsent,
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
    return json(502, { error: 'We could not save your assessment. Please try again in a moment.' });
  }

  // Step 6 — follow-up task + ops email (best-effort; neither blocks the
  // record, which is already stored).
  const [task, notify] = await Promise.all([
    createTask({
      'Task Title': `Assessment follow-up: ${a.name} (${a.businessName})`,
      'Status': 'To Do',
      'Notes':
        `Business Infrastructure Assessment — score ${result.score}/${result.maxScore}, ` +
        `${result.readiness}, recommend ${result.package}. Phone: ${a.phone}, email: ${a.email}. ` +
        `Assessment ${assessmentId}.`,
    }),
    notifyOps(
      `New Business Assessment: ${a.businessName} (${result.package})`,
      [
        `Lead: ${a.name}`,
        `Business: ${a.businessName}`,
        `Phone: ${a.phone}`,
        `Email: ${a.email}`,
        `SMS Consent: ${a.smsConsent ? 'Yes' : 'No'}`,
        '',
        `Assessment Score: ${result.score} / ${result.maxScore}`,
        `Readiness Level: ${result.readiness}`,
        `Recommended Package: ${result.package}`,
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
      `Score ${result.score}/${result.maxScore}, ${result.readiness}, ${result.package}. ` +
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
    },
  });
}
