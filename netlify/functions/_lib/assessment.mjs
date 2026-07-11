/* Business Infrastructure Assessment — scoring, readiness, and package logic.

   Pure and deterministic so it is easy to read, test, and adjust. The answer
   strings below are the SAME wording used by the approved homepage form
   (index.html #bia-form) and by the Airtable single-select options, so the
   three stay aligned. Change a number in NEED_POINTS or a band in BANDS and the
   recommendation shifts predictably — nothing else needs to change.

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
  booking: {
    'Online booking tool': 0,
    'Phone & text only': 2,
    'Social media DMs': 2,
    'No real system': 3,
  },
  missed_calls: {
    'Rarely': 0,
    'A few a week': 1,
    'Not sure': 2,
    'Several a day': 3,
  },
  follow_up: {
    'Automated system in place': 0,
    'Some templates / reminders': 1,
    'Manually, when I remember': 2,
    'No follow-up today': 3,
  },
  crm: {
    'CRM fully in use': 0,
    'A CRM, but underused': 1,
    'Spreadsheet or notes': 2,
    'None': 3,
  },
  payments: {
    'Deposits required online': 0,
    'Online payments': 1,
    'Manual invoices': 2,
    'Cash / in person': 3,
  },
};

// Six scored questions: payload key → human label → Airtable field name.
export const SCORED_QUESTIONS = [
  { key: 'website', label: 'Website status', field: 'Website Status' },
  { key: 'booking', label: 'Booking / contact process', field: 'Booking System' },
  { key: 'missed_calls', label: 'Missed calls', field: 'Missed Call Handling' },
  { key: 'follow_up', label: 'Lead follow-up', field: 'Follow-Up Process' },
  { key: 'crm', label: 'CRM / contact management', field: 'CRM Status' },
  { key: 'payments', label: 'Payments / deposits', field: 'Payments / Deposits' },
];

export const MAX_SCORE = SCORED_QUESTIONS.length * 3; // 18

/* Readiness + package bands, keyed off the total need score. First band whose
   `min` is met wins. Readiness and package share cut points so they agree. */
const BANDS = [
  { min: 15, readiness: 'Foundation Needed',   package: 'Full Infrastructure Build' },
  { min: 10, readiness: 'Developing',          package: 'Growth Infrastructure' },
  { min: 5,  readiness: 'Growth Ready',         package: 'Community Access System' },
  { min: 0,  readiness: 'Infrastructure Ready', package: 'QuickLaunch Kit' },
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
  lines.push(`RECOMMENDED PACKAGE: ${result.package}`);
  lines.push('');
  lines.push('CONTACT');
  lines.push(`  Name: ${answers.name || '—'}`);
  lines.push(`  Business: ${answers.businessName || '—'}`);
  lines.push(`  Email: ${answers.email || '—'}`);
  lines.push(`  Phone: ${answers.phone || '—'}`);
  lines.push(`  SMS Consent: ${answers.smsConsent ? 'Yes' : 'No'}`);
  lines.push('');
  lines.push('INFRASTRUCTURE ANSWERS (need points)');
  SCORED_QUESTIONS.forEach((q) => {
    lines.push(`  ${q.label}: ${answers[q.key] || '—'}  [+${pointsFor(q.key, answers[q.key])}]`);
  });
  lines.push('');
  lines.push('OPEN QUESTIONS');
  lines.push(`  Biggest problem: ${answers.biggest_problem || '—'}`);
  lines.push(`  30–90 day goal: ${answers.goal || '—'}`);
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
    followUpNeeded: needsFollowUp(score),
  };
  result.summary = buildSummary(answers, result);
  return result;
}
