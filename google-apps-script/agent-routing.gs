/**
 * agent-routing.gs — deterministic Green/Yellow/Red routing + sticky thread risk.
 * The router is AUTHORITATIVE: it can only RAISE risk, never lower the model's tier.
 * Pure core `deriveTier` is unit-tested; `routeRecord` applies it with Airtable I/O.
 */

// Deterministic Red keyword triggers (scanned on subject+body).
var RED_PATTERNS = [
  { re: /\b(contract|agreement|sign(ed|ature)?|nda|terms and conditions|msa|sow)\b/i, why: 'Contract language' },
  { re: /\b(lawsuit|attorney|lawyer|legal|subpoena|cease and desist|litigation|liable|damages)\b/i, why: 'Legal matter' },
  { re: /\b(refund|charge ?back|money back|reimburse)\b/i, why: 'Refund' },
  { re: /\b(discount|coupon|price match|lower(ing)? (the )?price|reduce (the )?price)\b/i, why: 'Discount/pricing exception' },
  { re: /\b(invoice|payment|deposit|wire|ach|bank|routing|tax|w-?9|1099|ein|irs)\b/i, why: 'Financial/tax/banking' },
  { re: /\b(insurance|coi|certificate of insurance|liability coverage)\b/i, why: 'Insurance' },
  { re: /\b(sam\.gov|d-?u-?n-?s|duns|cage code|uei|federal registration)\b/i, why: 'Government registration' },
  { re: /\b(government|municipal|city of|county|state of|compliance|regulatory|audit)\b/i, why: 'Government/compliance' },
  { re: /\b(press|media|journalist|interview|public statement|comment for)\b/i, why: 'Media/PR' },
  { re: /\b(intellectual property|trademark|copyright|infringement|patent)\b/i, why: 'IP matter' },
  { re: /\b(security incident|breach|hacked|phishing|malware|ransomware|compromised)\b/i, why: 'Security incident' },
  { re: /\b(password|credential|2fa|mfa|verification code|access token)\b/i, why: 'Credentials/auth' },
  { re: /\b(cancel|terminate|end (the|our) (contract|agreement|service)|dispute|complaint|unacceptable|unhappy)\b/i, why: 'Cancellation/dispute' }
];

/** Scan text; return the first deterministic Red reason, or null. */
function detectDeterministicRed(text) {
  var t = String(text || '');
  for (var i = 0; i < RED_PATTERNS.length; i++) {
    if (RED_PATTERNS[i].re.test(t)) return RED_PATTERNS[i].why;
  }
  return null;
}

/**
 * Pure routing core. Inputs:
 *   output: validated agent object (or null if validation failed)
 *   ctx: { validationFailed, deterministicRed (string|null), threadFloor ('Green'|'Yellow'|'Red'|null),
 *          sensitive (bool), attachmentReview (bool), autoSendEnabled (bool),
 *          greenMin (int), yellowMin (int) }
 * Returns: { tier, owner, approvalAuthority, ceoReviewRequired, autoSendEligible,
 *            greenDenialReason, escalationReason }
 */
function deriveTier(output, ctx) {
  ctx = ctx || {};
  var greenMin = ctx.greenMin || 95, yellowMin = ctx.yellowMin || 75;
  var denial = null, escalation = null;
  var tier = 'Yellow';

  if (ctx.validationFailed || !output) {
    return finalize_('Red', 'Model output invalid — failing closed', 'Invalid/blocked model output', ctx);
  }

  var conf = output.confidence_score;
  var cat = output.category, sender = output.sender_type;

  // 1) Hard Red triggers (any one forces Red).
  if (ctx.deterministicRed) { escalation = ctx.deterministicRed; tier = 'Red'; }
  else if (NEVER_GREEN_CATEGORIES.indexOf(cat) !== -1 &&
           ['Government or Compliance','Legal','Contract','Complaint or Dispute','Refund','Billing or Payment','Media or Public Relations'].indexOf(cat) !== -1) {
    escalation = 'Category requires CEO: ' + cat; tier = 'Red';
  }
  else if (cat === 'Unknown' || sender === 'Unknown') { escalation = 'Unknown classification'; tier = 'Red'; }
  else if (conf < yellowMin) { escalation = 'Confidence below ' + yellowMin; tier = 'Red'; }
  else {
    // 2) Start from the model tier, then apply guards that can only raise risk.
    tier = (ENUM_TIERS.indexOf(output.decision_tier) !== -1) ? output.decision_tier : 'Yellow';

    // Never-Green senders/categories downgrade Green -> Yellow.
    if (tier === 'Green' && NEVER_GREEN_SENDERS.indexOf(sender) !== -1) { tier = 'Yellow'; denial = 'Sender type not eligible for Green'; }
    if (tier === 'Green' && NEVER_GREEN_CATEGORIES.indexOf(cat) !== -1) { tier = 'Yellow'; denial = 'Category not eligible for Green'; }
    if (tier === 'Green' && (ctx.sensitive || output.sensitive_content)) { tier = 'Yellow'; denial = 'Sensitive content present'; }
    if (tier === 'Green' && ctx.attachmentReview) { tier = 'Yellow'; denial = 'Attachment review required'; }
    if (tier === 'Green' && output.risk_level && output.risk_level !== 'Low') { tier = 'Yellow'; denial = 'Risk level above Low'; }
    if (tier === 'Green' && conf < greenMin) { tier = 'Yellow'; denial = 'Confidence below ' + greenMin; }

    // Confidence band ceiling: 75–94 can be at most Yellow.
    if (conf < greenMin && tier === 'Green') { tier = 'Yellow'; denial = denial || 'Confidence below ' + greenMin; }
  }

  // 3) Sticky thread risk floor can only raise.
  if (ctx.threadFloor === 'Red') { tier = 'Red'; escalation = escalation || 'Thread risk floor is Red'; }
  else if (ctx.threadFloor === 'Yellow' && tier === 'Green') { tier = 'Yellow'; denial = denial || 'Thread risk floor is Yellow'; }

  return finalize_(tier, denial, escalation, ctx);
}

function finalize_(tier, denial, escalation, ctx) {
  var owner = tier === 'Red' ? 'Cecil' : (tier === 'Yellow' ? 'Krisha' : 'Krisha'); // Green still human-approved in 2A
  var approvalAuthority = tier === 'Red' ? 'Cecil' : 'Krisha';
  var greenClean = tier === 'Green';
  return {
    tier: tier,
    owner: owner,
    approvalAuthority: approvalAuthority,
    ceoReviewRequired: tier === 'Red',
    autoSendEligible: !!(greenClean && ctx.autoSendEnabled), // false in Phase 2A (autoSendEnabled=false)
    greenDenialReason: tier === 'Green' ? null : (denial || escalation || 'Not a Green candidate'),
    escalationReason: escalation || null
  };
}

// ── Thread risk floor persistence (sticky) ───────────────────────────────
var _TIER_RANK = { Green: 0, Yellow: 1, Red: 2 };

/** Highest tier seen on any record in this Gmail thread (the sticky floor). */
function getThreadRiskFloor(threadId) {
  if (!threadId) return null;
  var f = '{' + FLD.gmailThreadId + '}=' + atQuote(threadId);
  var recs = atSelect(CFG_HUB_BASE, CFG_INBOX_TBL, f, 50);
  var floor = null, rank = -1;
  recs.forEach(function (r) {
    ['threadRiskFloor','decisionTier'].forEach(function (key) {
      var v = r.fields[FLD[key]];
      if (v && _TIER_RANK[v] !== undefined && _TIER_RANK[v] > rank) { rank = _TIER_RANK[v]; floor = v; }
    });
  });
  return floor;
}

/** Raise the thread floor. Never lowers. Only Cecil may clear Red (via override fields). */
function setThreadRiskFloor(recordId, threadId, tier, reason) {
  var current = getThreadRiskFloor(threadId);
  if (current && _TIER_RANK[current] >= _TIER_RANK[tier]) return; // never lower
  var fields = {};
  fields[FLD.threadRiskFloor] = tier;
  if (tier === 'Red') fields[FLD.threadRedReason] = reason || 'Red-classified message in thread';
  fields[FLD.threadRiskSetAt] = new Date().toISOString();
  atUpdate(CFG_HUB_BASE, CFG_INBOX_TBL, recordId, fields);
}

/**
 * routeRecord(recordId, output, ctx) — apply deriveTier and write routing fields.
 * ctx should carry threadFloor/sensitive/attachmentReview/deterministicRed/validationFailed.
 */
function routeRecord(recordId, output, ctx) {
  var cfg = getConfig();
  ctx = ctx || {};
  ctx.autoSendEnabled = cfg.autoSendEnabled;
  ctx.greenMin = cfg.greenMinConfidence;
  ctx.yellowMin = cfg.yellowMinConfidence;

  var d = deriveTier(output, ctx);

  var fields = {};
  fields[FLD.decisionTier] = d.tier;
  fields[FLD.recommendedOwner] = d.owner;
  fields[FLD.approvalAuthorityRequired] = d.approvalAuthority;
  fields[FLD.ceoReviewRequired] = d.ceoReviewRequired;
  fields[FLD.autoSendEligible] = d.autoSendEligible;
  if (d.greenDenialReason) fields[FLD.greenDenialReason] = d.greenDenialReason;
  if (d.escalationReason) fields[FLD.escalationReason] = d.escalationReason;
  if (output) {
    fields[FLD.recommendedNextAction] = output.recommended_next_action || '';
  }
  atUpdate(CFG_HUB_BASE, CFG_INBOX_TBL, recordId, fields);

  // Sticky: if Red, raise the thread floor.
  if (d.tier === 'Red') setThreadRiskFloor(recordId, ctx.threadId, 'Red', d.escalationReason);
  else if (d.tier === 'Yellow') setThreadRiskFloor(recordId, ctx.threadId, 'Yellow', null);

  logAgentAction({ action: 'ROUTED', functionName: 'routeRecord', recordId: recordId,
    tier: d.tier, reason: d.escalationReason || d.greenDenialReason || 'ok' });

  return d;
}

/** Create an ACOS 04 – CEO Approval Queue record for a Red item (only when needed). */
function escalateRedToAcos(recordId, record) {
  var f = record.fields;
  var fields = {
    'Approval Item': 'A1 Creative Email — RED: ' + (f[FLD.subject] || '(no subject)'),
    'Submitted By': 'Communications Agent (Phase 2A)',
    'Decision Needed': 'Red-tier email requires CEO decision. Review Inbox Queue ' + recordId +
      '. Reason: ' + (f[FLD.escalationReason] || 'high-risk classification') + '. Nothing sends until CEO approves.',
    'Recommendation': f[FLD.recommendedNextAction] || 'CEO review required.',
    'CEO Decision': 'Pending', 'Final Status': 'Awaiting CEO', 'Company': 'A1 Creative Agency',
    'Files / Links': 'Inbox Queue ' + CFG_HUB_BASE + '/' + CFG_INBOX_TBL + '/' + recordId
  };
  var acos = atCreate(CFG_ACOS_BASE, CFG_ACOS_APPRV_TBL, fields);
  var back = {}; back[FLD.acosRef] = 'ACOS 04 – CEO Approval Queue: ' + acos.id;
  back[FLD.acosEscalatedAt] = new Date().toISOString();
  atUpdate(CFG_HUB_BASE, CFG_INBOX_TBL, recordId, back);
  logAgentAction({ action: 'ACOS_ESCALATED', functionName: 'escalateRedToAcos', recordId: recordId });
  return acos.id;
}
