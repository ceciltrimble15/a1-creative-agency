import {
  createLead,
  updateLead,
  findLead,
  createAssessment,
  logAutomation,
  createTask,
  LEAD_FIELDS,
} from './_lib/airtable.js';
import { notifyOps } from './_lib/notify.js';
import { evaluateAssessment, SCORED_QUESTIONS } from './_lib/assessment.js';

/* The A1 Creative homepage is served from Netlify while this endpoint lives
   on Vercel, so browser form posts arrive cross-origin. The hosted assessment
   page (/assessment) is served from this same Vercel project, so it posts
   same-origin, but the Vercel domain is listed too for direct loads. */
const ALLOWED_ORIGINS = [
  'https://a1creativeagency.com',
  'https://www.a1creativeagency.com',
  'https://a1creativeagency4.netlify.app',
  'https://a1-creative-agency.vercel.app',
];

function applyCors(req, res) {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Max-Age', '86400');
  }
}

export default async function handler(req, res) {
  applyCors(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // The Business Infrastructure Assessment posts { type: 'assessment', ... }.
  // Everything else stays on the original simple-lead path, untouched.
  if (req.body && req.body.type === 'assessment') {
    return handleAssessment(req, res);
  }

  return handleSimpleLead(req, res);
}

/* ─────────────────────────────────────────────────────────────────────────
   Simple website lead (existing behaviour — unchanged)
   ───────────────────────────────────────────────────────────────────────── */
async function handleSimpleLead(req, res) {
  const { name, phone, email, service, date, message, client, source } = req.body;

  if (!name || !phone || !email) {
    return res.status(400).json({ error: 'Name, phone, and email are required' });
  }

  const notesParts = [];
  if (service) notesParts.push(`Service: ${service}`);
  if (date) notesParts.push(`Preferred Date: ${date}`);
  if (message) notesParts.push(`Message: ${message}`);

  const fields = {
    'Lead Name': name,
    'Phone': phone,
    'Email ': email,
    'lead_status': 'new',
    // Caller-supplied so each site tags itself; defaults suit the A1 site
    // since a1creativeagency.com is this project's production domain.
    'Source': source || 'Website form ',
    'Client': client || 'A1 Creative Agency',
  };

  if (notesParts.length > 0) fields['Notes'] = notesParts.join('\n');
  if (date) fields['date'] = date;

  const lead = await createLead(fields);

  if (!lead.ok) {
    console.error('Airtable lead error:', lead.error);
    await logAutomation('website_lead_capture', `FAILED for ${name} (${phone}): ${lead.error}`, 'error');
    return res.status(502).json({ error: lead.error || 'Failed to create lead in Airtable' });
  }

  // Follow-up pipeline: task + ops notification + log. Best-effort — the
  // lead is already stored, so none of these should fail the submission.
  const [task, notify] = await Promise.all([
    createTask({
      'Name': `Follow up with ${name} (${phone})`,
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

  return res.status(200).json({ success: true, id: lead.id });
}

/* ─────────────────────────────────────────────────────────────────────────
   Business Infrastructure Assessment
   ───────────────────────────────────────────────────────────────────────── */

const CONSENT_TEXT_VERSION = 'a1-assessment-v2026-07';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function makeAssessmentId() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const stamp = `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}-${pad(
    d.getUTCHours()
  )}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}`;
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `ASMT-${stamp}-${rand}`;
}

function clientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd.length) return fwd.split(',')[0].trim();
  return req.socket?.remoteAddress || '';
}

async function handleAssessment(req, res) {
  const b = req.body || {};
  const answers = {
    fullName: (b.fullName || '').trim(),
    email: (b.email || '').trim(),
    phone: (b.phone || '').trim(),
    businessName: (b.businessName || '').trim(),
    service: (b.service || '').trim(),
    smsConsent: b.smsConsent === true || b.smsConsent === 'true' || b.smsConsent === 'on',
    websiteStatus: (b.websiteStatus || '').trim(),
    bookingSystem: (b.bookingSystem || '').trim(),
    missedCallHandling: (b.missedCallHandling || '').trim(),
    followUpProcess: (b.followUpProcess || '').trim(),
    crmStatus: (b.crmStatus || '').trim(),
    paymentsProcess: (b.paymentsProcess || '').trim(),
    biggestProblem: (b.biggestProblem || '').trim(),
    primaryGoal: (b.primaryGoal || '').trim(),
    source: (b.source || 'A1 Assessment').trim(),
    consentSourceUrl: (b.consentSourceUrl || '').trim(),
  };

  // ── Step 1: validate ────────────────────────────────────────────────────
  const missing = [];
  if (!answers.fullName) missing.push('full name');
  if (!answers.email) missing.push('email');
  if (!answers.phone) missing.push('phone');
  if (!answers.businessName) missing.push('business name');
  if (missing.length) {
    return res.status(400).json({ error: `Please complete the required fields: ${missing.join(', ')}.` });
  }
  if (!EMAIL_RE.test(answers.email)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }
  // Explicit SMS consent is required whenever a phone number is provided.
  const phoneDigits = answers.phone.replace(/\D/g, '');
  if (phoneDigits.length >= 7 && !answers.smsConsent) {
    return res
      .status(400)
      .json({ error: 'Please agree to receive text messages, or remove your phone number, to continue.' });
  }

  const nowIso = new Date().toISOString();

  // ── Step 2: find or create the Lead ──────────────────────────────────────
  const consentFields = answers.smsConsent
    ? {
        [LEAD_FIELDS.smsConsent]: true,
        [LEAD_FIELDS.smsConsentAt]: nowIso,
        [LEAD_FIELDS.smsConsentVersion]: CONSENT_TEXT_VERSION,
        [LEAD_FIELDS.consentSourceUrl]: answers.consentSourceUrl || undefined,
        [LEAD_FIELDS.consentIp]: clientIp(req) || undefined,
      }
    : {};

  let leadId = null;
  let leadOutcome = 'created';

  const found = await findLead({ email: answers.email, phone: answers.phone });
  if (found.ok && found.record) {
    leadId = found.record.id;
    leadOutcome = 'updated';
    const existing = found.record.fields || {};
    // Fill only blank contact fields; always refresh service + source; never
    // touch pipeline data (lead_status, Notes, links, dates).
    const updates = {};
    if (!existing[LEAD_FIELDS.name] && answers.fullName) updates[LEAD_FIELDS.name] = answers.fullName;
    if (!existing[LEAD_FIELDS.phone] && answers.phone) updates[LEAD_FIELDS.phone] = answers.phone;
    if (!existing[LEAD_FIELDS.email] && answers.email) updates[LEAD_FIELDS.email] = answers.email;
    if (!existing[LEAD_FIELDS.business] && answers.businessName) updates[LEAD_FIELDS.business] = answers.businessName;
    if (answers.service) updates[LEAD_FIELDS.service] = answers.service;
    updates[LEAD_FIELDS.source] = answers.source;
    Object.assign(updates, consentFields);
    const upd = await updateLead(leadId, updates);
    if (!upd.ok) console.error('Assessment: lead update failed:', upd.error);
  } else {
    const created = await createLead({
      [LEAD_FIELDS.name]: answers.fullName,
      [LEAD_FIELDS.email]: answers.email,
      [LEAD_FIELDS.phone]: answers.phone,
      [LEAD_FIELDS.business]: answers.businessName,
      [LEAD_FIELDS.service]: answers.service || undefined,
      [LEAD_FIELDS.status]: 'new',
      [LEAD_FIELDS.source]: answers.source,
      [LEAD_FIELDS.client]: 'A1 Creative Agency',
      ...consentFields,
    });
    if (created.ok) {
      leadId = created.id;
    } else {
      // Degrade gracefully: keep going and store the assessment unlinked so
      // the answers are never lost, then surface a partial log below.
      console.error('Assessment: lead create failed:', created.error);
      leadOutcome = 'lead_failed';
    }
  }

  // ── Steps 3–5: score, recommend, and store the assessment ────────────────
  const result = evaluateAssessment(answers);
  const assessmentId = makeAssessmentId();

  const assessmentFields = {
    'Assessment ID': assessmentId,
    'Submitted Date': nowIso,
    'Website Status': answers.websiteStatus || undefined,
    'Booking System': answers.bookingSystem || undefined,
    'Missed Call Handling': answers.missedCallHandling || undefined,
    'Follow-Up Process': answers.followUpProcess || undefined,
    'CRM Status': answers.crmStatus || undefined,
    'Payments / Deposits': answers.paymentsProcess || undefined,
    'Biggest Business Problem': answers.biggestProblem || undefined,
    '30–90 Day Goal': answers.primaryGoal || undefined,
    'Service Requested': answers.service || undefined,
    'Assessment Score': result.score,
    'Readiness Level': result.readiness,
    'Recommended Package': result.package,
    'Full Response Summary': result.summary,
    'SMS Consent': answers.smsConsent,
    'Source': answers.source,
    'Follow-Up Needed': result.followUpNeeded,
    'CEO Review Status': 'Pending Review',
    'Assessment Status': 'New',
  };
  if (leadId) assessmentFields['Linked Lead'] = [leadId];

  const assessment = await createAssessment(assessmentFields);

  if (!assessment.ok) {
    console.error('Assessment: create failed:', assessment.error);
    await logAutomation(
      'assessment_submission',
      `FAILED to store assessment for ${answers.fullName} (${answers.businessName}). Lead: ${leadId || 'none'} (${leadOutcome}). Error: ${assessment.error}`,
      'error'
    );
    return res.status(502).json({ error: 'We could not save your assessment. Please try again in a moment.' });
  }

  // ── Step 6: notify operations (best-effort — never blocks the record) ─────
  const notify = await notifyOps(
    `New Business Assessment: ${answers.businessName} (${result.package})`,
    [
      `Lead: ${answers.fullName}`,
      `Business: ${answers.businessName}`,
      `Phone: ${answers.phone}`,
      `Email: ${answers.email}`,
      `Service Requested: ${answers.service || '—'}`,
      `SMS Consent: ${answers.smsConsent ? 'Yes' : 'No'}`,
      '',
      `Assessment Score: ${result.score} / ${result.maxScore}`,
      `Readiness Level: ${result.readiness}`,
      `Recommended Package: ${result.package}`,
      `Follow-Up Needed: ${result.followUpNeeded ? 'Yes' : 'No'}`,
      '',
      `Airtable base: https://airtable.com/${process.env.AIRTABLE_BASE_ID || ''}`,
      `Lead record: ${leadId || 'not linked'}`,
      `Assessment record: ${assessment.id} (${assessmentId})`,
      '',
      '— Full responses —',
      result.summary,
    ].join('\n')
  ).catch((err) => ({ ok: false, error: err.message }));

  // ── Automation log ────────────────────────────────────────────────────────
  await logAutomation(
    'assessment_submission',
    `Assessment ${assessment.id} (${assessmentId}) for ${answers.fullName} / ${answers.businessName}. ` +
      `Lead ${leadId || 'unlinked'} (${leadOutcome}). Score ${result.score}/${result.maxScore}, ` +
      `${result.readiness}, ${result.package}. Ops email: ${notify.ok ? 'sent' : `failed (${notify.error})`}`,
    leadId && notify.ok ? 'ok' : 'partial'
  );

  // ── Step 7: safe public response (no tokens, IDs kept minimal) ────────────
  return res.status(200).json({
    success: true,
    assessment: {
      score: result.score,
      maxScore: result.maxScore,
      readiness: result.readiness,
      recommendedPackage: result.package,
    },
  });
}

// Exposed for reference/testing of the question set.
export { SCORED_QUESTIONS };
