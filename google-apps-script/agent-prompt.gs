/**
 * agent-prompt.gs — deterministic prompt construction + versioning.
 * The prompt forces JSON-only output constrained to the controlled enums.
 */

var PROMPT_VERSION = 'p2a-2026-07-20';

/** Build the system + user messages for the model from an already-masked payload. */
function buildAgentPrompt(masked) {
  var sys = [
    'You are the A/1 Creative Agency email triage agent.',
    'Classify ONE inbound email for a supervised human-approval workflow.',
    'Return a SINGLE JSON object and nothing else. No prose, no markdown, no code fences.',
    '',
    'Allowed "category" values: ' + ENUM_CATEGORIES.join(' | '),
    'Allowed "sender_type" values: ' + ENUM_SENDER_TYPES.join(' | '),
    'Allowed "decision_tier": Green | Yellow | Red',
    'Allowed "urgency": Low | Normal | High | Critical',
    'Allowed "risk_level": Low | Medium | High | Critical',
    'Allowed "opportunity_value": None | Low | Medium | High',
    '',
    'Routing rules:',
    '- Red (route to Cecil only): contracts, legal, lawsuits/threats, complaints, disputes,',
    '  refunds, discounts, pricing changes, financial/bank/tax/insurance, SAM.gov, D-U-N-S,',
    '  government registration, public statements, media, IP, security incidents, credentials,',
    '  cancellation threats, high-value partnerships, or ANY money commitment. Also Red if',
    '  confidence < 75 or the message is unknown/unsafe.',
    '- Yellow (route to Krisha): ordinary leads, routine client comms, status, quote prep',
    '  without final price authority, normal partnership inquiry, scheduling, unclear requests,',
    '  ordinary attachment review, or confidence 75–94.',
    '- Green candidate (still human-approved in Phase 2A): only genuinely routine, low-risk,',
    '  no money, no legal, no sensitive data, confidence 95–100.',
    '',
    'confidence_score MUST be an integer 0–100. If unsure, LOWER it. Fail safe: prefer Red.',
    'Never invent categories or sender types. Never promise money, discounts, or contracts in the draft.',
    'draft_reply is a suggestion only; a human approves before anything sends.'
  ].join('\n');

  var threadNote = masked.threadRiskFloor
    ? ('\n\nIMPORTANT: This Gmail thread already has a risk floor of "' + masked.threadRiskFloor +
       '". You may not route below that floor.')
    : '';

  var user = [
    'Subject: ' + (masked.subject || '(none)'),
    'From: ' + (masked.from || '(unknown)'),
    'Received: ' + (masked.receivedAt || '(unknown)'),
    'Has attachments: ' + (masked.hasAttachments ? 'yes' : 'no'),
    '',
    'Body (sensitive data already redacted):',
    masked.body || '(empty)',
    threadNote,
    '',
    'Respond with the JSON object now.'
  ].join('\n');

  return { system: sys, user: user, promptVersion: PROMPT_VERSION };
}

/** Stable hash of the exact payload sent to the model (for audit; no content stored). */
function payloadHash(masked) {
  var s = JSON.stringify(masked);
  var bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, s);
  return bytes.map(function (b) { return ('0' + (b & 0xff).toString(16)).slice(-2); }).join('').slice(0, 32);
}
