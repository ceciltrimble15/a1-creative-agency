/* Business Infrastructure Assessment — scoring, readiness, and package logic.

   Everything here is pure and deterministic so it is trivial to read, test,
   and adjust. Change the numbers in NEED_POINTS or the bands in the two
   *_BANDS arrays and the whole recommendation shifts predictably — no other
   file needs to change.

   Scoring model
   -------------
   Six infrastructure questions each contribute a "need" score of 0–3:
     0 = fully handled  →  1 = mostly handled  →  2 = partial  →  3 = nothing.
   Higher total = bigger infrastructure gap = bigger recommended build.
   Max possible score = 6 questions × 3 = 18.

   The answer strings below are the single source of truth: the website form
   (public/assessment.html) and the Airtable single-select options use these
   exact same strings. Airtable writes use typecast, so if a value ever drifts
   it is added as a new option rather than rejected — but keep them aligned. */

// Each answer maps to a need score. First option (best) = 0, last (worst) = 3.
export const NEED_POINTS = {
  websiteStatus: {
    'Modern, fully functional website': 0,
    'Basic website': 1,
    'Outdated website': 2,
    'No website': 3,
  },
  bookingSystem: {
    'Full online booking system': 0,
    'Basic contact form': 1,
    'Phone or manual scheduling only': 2,
    'No online booking or contact form': 3,
  },
  missedCallHandling: {
    'Automated missed-call text-back': 0,
    'Voicemail only': 1,
    'Manual callback when we can': 2,
    'Missed calls are lost — no system': 3,
  },
  followUpProcess: {
    'Fully automated follow-up': 0,
    'Some reminders or automation': 1,
    'Manual and inconsistent': 2,
    'No follow-up process': 3,
  },
  crmStatus: {
    'Full CRM in active use': 0,
    'Basic CRM': 1,
    'Spreadsheet or notes': 2,
    'No CRM': 3,
  },
  paymentsProcess: {
    'Online payments and deposits': 0,
    'Payments accepted, no deposits': 1,
    'Manual invoicing': 2,
    'No online payments': 3,
  },
};

// The six scored questions, in display order, with the human labels used in
// the readable summary and the Airtable field they map to.
export const SCORED_QUESTIONS = [
  { key: 'websiteStatus', label: 'Website Status', field: 'Website Status' },
  { key: 'bookingSystem', label: 'Online Booking / Contact Process', field: 'Booking System' },
  { key: 'missedCallHandling', label: 'Missed Call Handling', field: 'Missed Call Handling' },
  { key: 'followUpProcess', label: 'Lead Follow-Up Process', field: 'Follow-Up Process' },
  { key: 'crmStatus', label: 'CRM Status', field: 'CRM Status' },
  { key: 'paymentsProcess', label: 'Payments / Deposit Process', field: 'Payments / Deposits' },
];

export const MAX_SCORE = SCORED_QUESTIONS.length * 3; // 18

/* Readiness + package bands, keyed off the total need score.
   Bands are checked top-to-bottom; the first whose `min` is met wins.
   Readiness and package share the same cut points so the two always agree. */
const BANDS = [
  { min: 15, readiness: 'Foundation Needed',    package: 'Full Infrastructure Build' },
  { min: 10, readiness: 'Developing',           package: 'Growth Infrastructure' },
  { min: 5,  readiness: 'Growth Ready',          package: 'Community Access System' },
  { min: 0,  readiness: 'Infrastructure Ready',  package: 'QuickLaunch Kit' },
];

/* Score one answer. Unknown/blank answers score the maximum need (3): a
   business that can't answer is treated as a gap, never as "handled". */
function pointsFor(key, answer) {
  const table = NEED_POINTS[key] || {};
  if (answer && Object.prototype.hasOwnProperty.call(table, answer)) return table[answer];
  return 3;
}

/* Compute the total need score (0–18) from an assessment answer object. */
export function scoreAssessment(answers) {
  return SCORED_QUESTIONS.reduce((sum, q) => sum + pointsFor(q.key, answers[q.key]), 0);
}

/* Map a score to its band (readiness + package). */
export function bandFor(score) {
  return BANDS.find((b) => score >= b.min) || BANDS[BANDS.length - 1];
}

/* Whether a human should follow up. Anything past "Infrastructure Ready"
   (score >= 5) has real gaps worth a call. */
export function needsFollowUp(score) {
  return score >= 5;
}

/* Build the human-readable "Full Response Summary" stored on the record and
   emailed to operations. Plain text, no secrets. */
export function buildSummary(answers, result) {
  const lines = [];
  lines.push(`ASSESSMENT SCORE: ${result.score} / ${MAX_SCORE}`);
  lines.push(`READINESS LEVEL: ${result.readiness}`);
  lines.push(`RECOMMENDED PACKAGE: ${result.package}`);
  lines.push('');
  lines.push('CONTACT');
  lines.push(`  Name: ${answers.fullName || '—'}`);
  lines.push(`  Business: ${answers.businessName || '—'}`);
  lines.push(`  Email: ${answers.email || '—'}`);
  lines.push(`  Phone: ${answers.phone || '—'}`);
  lines.push(`  Service Requested: ${answers.service || '—'}`);
  lines.push(`  SMS Consent: ${answers.smsConsent ? 'Yes' : 'No'}`);
  lines.push('');
  lines.push('INFRASTRUCTURE ANSWERS (need points)');
  SCORED_QUESTIONS.forEach((q) => {
    const answer = answers[q.key] || '—';
    lines.push(`  ${q.label}: ${answer}  [+${pointsFor(q.key, answers[q.key])}]`);
  });
  lines.push('');
  lines.push('OPEN QUESTIONS');
  lines.push(`  Biggest Business Problem: ${answers.biggestProblem || '—'}`);
  lines.push(`  Primary 30–90 Day Goal: ${answers.primaryGoal || '—'}`);
  return lines.join('\n');
}

/* One call that turns raw answers into everything downstream needs. */
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
