/* Business Infrastructure Assessment — scoring, readiness, and package logic.

   Pure and deterministic so it is easy to read, test, and adjust. The answer
   strings below are the SAME wording used by the homepage form
   (index.html #bia-form) and by the Airtable single-select options, so the
   three stay aligned.

   Model: six questions, each 0–3 need points (0 = handled, 3 = big gap).
   Higher total = bigger infrastructure gap = bigger recommended build.
   Max score = 6 × 3 = 18. */

// Answer wording matches the homepage <select> options exactly.
export const NEED_POINTS = {
  website: {
    'Modern and converting well': 0,
    'Decent site, but underperforming': 1,
    'Outdated / needs a rebuild': 2,
    'No website yet': 3,
  },
  lead_capture: {
    'Automated capture into a CRM': 0,
    'A contact form or spreadsheet': 1,
    'Manual — notes or memory': 2,
    'No system — leads slip through': 3,
  },
  booking: {
    'Full online booking / scheduling': 0,
    'Basic contact form': 1,
    'Phone & text only': 2,
    'No online booking': 3,
  },
  crm: {
    'CRM fully in use': 0,
    'A CRM, but underused': 1,
    'Spreadsheet or notes': 2,
    'No CRM': 3,
  },
  follow_up: {
    'Fully automated follow-up': 0,
    'Some reminders / templates': 1,
    'Manual, when I remember': 2,
    'No follow-up today': 3,
  },
  missed_calls: {
    'Automated missed-call text-back': 0,
    'Voicemail only': 1,
    'We call back when we can': 2,
    'Missed calls are lost': 3,
  },
};

// Six scored questions: payload key → human label → Airtable field name.
export const SCORED_QUESTIONS = [
  { key: 'website', label: 'Website status', field: 'Website Status' },
  { key: 'lead_capture', label: 'Lead-capture status', field: 'Lead Capture Status' },
  { key: 'booking', label: 'Booking / scheduling status', field: 'Booking System' },
  { key: 'crm', label: 'CRM / customer tracking', field: 'CRM Status' },
  { key: 'follow_up', label: 'Follow-up automation', field: 'Follow-Up Process' },
  { key: 'missed_calls', label: 'Missed-call recovery', field: 'Missed Call Handling' },
];

export const MAX_SCORE = SCORED_QUESTIONS.length * 3; // 18

/* Readiness + package bands, keyed off the total need score. First band whose
   `min` is met wins. Prices are the approved A1 Creative package prices. */
const BANDS = [
  { min: 15, readiness: 'Foundation Needed',   package: 'Full Infrastructure Build', price: 'custom' },
  { min: 10, readiness: 'Developing',          package: 'Growth Infrastructure',     price: '$3,500+' },
  { min: 5,  readiness: 'Growth Ready',         package: 'Community Access System',   price: '$1,500' },
  { min: 0,  readiness: 'Infrastructure Ready', package: 'QuickLaunch Kit',           price: '$500' },
];

// A blank/unknown answer scores the maximum need (3): a gap, never "handled".
function pointsFor(key, answer) {
  const table = NEED_POINTS[key] || {};
  if (answer && Object.prototype.hasOwnProperty.call(table, answer)) return table[answer];
  return 3;
}

export function scoreAssessment(answers) {
  return SCORED_QUESTIONS.reduce((sum, q) => sum + pointsFor(q.key, answers[q.key]), 0);
}

export function bandFor(score) {
  return BANDS.find((b) => score >= b.min) || BANDS[BANDS.length - 1];
}

// Anything past "Infrastructure Ready" (score >= 5) has real gaps worth a call.
export function needsFollowUp(score) {
  return score >= 5;
}

export function buildSummary(answers, result) {
  const lines = [];
  lines.push(`ASSESSMENT SCORE: ${result.score} / ${MAX_SCORE}`);
  lines.push(`READINESS LEVEL: ${result.readiness}`);
  lines.push(`RECOMMENDED PACKAGE: ${result.package} (${result.price})`);
  lines.push('');
  lines.push('CONTACT');
  lines.push(`  Name: ${answers.name || '—'}`);
  lines.push(`  Business: ${answers.businessName || '—'}`);
  lines.push(`  Email: ${answers.email || '—'}`);
  lines.push(`  Phone: ${answers.phone || '— (not provided)'}`);
  lines.push(`  SMS Consent: ${answers.smsConsent ? 'Yes (opted in)' : 'No'}`);
  lines.push('');
  lines.push('INFRASTRUCTURE ANSWERS (need points)');
  SCORED_QUESTIONS.forEach((q) => {
    lines.push(`  ${q.label}: ${answers[q.key] || '—'}  [+${pointsFor(q.key, answers[q.key])}]`);
  });
  lines.push('');
  lines.push('OPEN QUESTIONS');
  lines.push(`  Main business goal: ${answers.goal || '—'}`);
  lines.push(`  Biggest infrastructure problem: ${answers.biggest_problem || '—'}`);
  return lines.join('\n');
}

export function evaluateAssessment(answers) {
  const score = scoreAssessment(answers);
  const band = bandFor(score);
  const result = {
    score,
    maxScore: MAX_SCORE,
    readiness: band.readiness,
    package: band.package,
    price: band.price,
    followUpNeeded: needsFollowUp(score),
  };
  result.summary = buildSummary(answers, result);
  return result;
}
