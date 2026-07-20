/**
 * agent-validation.gs — strict validation of model output. Fail closed.
 * validateAgentResponse(obj) -> { valid:Boolean, errors:[String], value:Object }
 * Any failure => caller sets Agent Status=Failed, Decision Tier=Red, CEO Review Required=true.
 */

var REQUIRED_KEYS = ['category','sender_type','summary','response_required','urgency',
  'risk_level','opportunity_value','recommended_owner','recommended_next_action',
  'decision_tier','confidence_score','draft_reply'];

function validateAgentResponse(obj) {
  var errors = [];

  if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
    return { valid: false, errors: ['NOT_AN_OBJECT'], value: null };
  }

  REQUIRED_KEYS.forEach(function (k) {
    if (!(k in obj)) errors.push('MISSING_KEY:' + k);
  });

  if ('category' in obj && ENUM_CATEGORIES.indexOf(obj.category) === -1) errors.push('BAD_CATEGORY');
  if ('sender_type' in obj && ENUM_SENDER_TYPES.indexOf(obj.sender_type) === -1) errors.push('BAD_SENDER_TYPE');
  if ('decision_tier' in obj && ENUM_TIERS.indexOf(obj.decision_tier) === -1) errors.push('BAD_TIER');
  if ('urgency' in obj && ENUM_URGENCY.indexOf(obj.urgency) === -1) errors.push('BAD_URGENCY');
  if ('risk_level' in obj && ENUM_RISK.indexOf(obj.risk_level) === -1) errors.push('BAD_RISK');
  if ('opportunity_value' in obj && ENUM_OPPORTUNITY.indexOf(obj.opportunity_value) === -1) errors.push('BAD_OPPORTUNITY');
  if ('recommended_owner' in obj && ['Agent','Krisha','Cecil'].indexOf(obj.recommended_owner) === -1) errors.push('BAD_OWNER');

  if ('response_required' in obj && typeof obj.response_required !== 'boolean') errors.push('RESPONSE_REQUIRED_NOT_BOOL');

  var c = obj.confidence_score;
  if (typeof c !== 'number' || c !== Math.floor(c)) errors.push('CONFIDENCE_NOT_INTEGER');
  else if (c < 0 || c > 100) errors.push('CONFIDENCE_OUT_OF_RANGE');

  if ('summary' in obj && (typeof obj.summary !== 'string' || !obj.summary.trim())) errors.push('EMPTY_SUMMARY');
  if ('draft_reply' in obj && typeof obj.draft_reply !== 'string') errors.push('DRAFT_NOT_STRING');

  // Contradiction / unsafe-Green checks.
  if (errors.length === 0) {
    if (obj.decision_tier === 'Green') {
      if (obj.confidence_score < 95) errors.push('UNSAFE_GREEN_LOW_CONFIDENCE');
      if (NEVER_GREEN_CATEGORIES.indexOf(obj.category) !== -1) errors.push('UNSAFE_GREEN_CATEGORY');
      if (NEVER_GREEN_SENDERS.indexOf(obj.sender_type) !== -1) errors.push('UNSAFE_GREEN_SENDER');
      if (obj.risk_level && obj.risk_level !== 'Low') errors.push('UNSAFE_GREEN_RISK');
    }
    // Note: confidence->tier band enforcement (e.g. <75 must be Red) is applied
    // authoritatively in routeRecord(), which can only raise risk, never lower it.
    // Validation stays about structure, enums, range, and unsafe-Green integrity.
  }

  return { valid: errors.length === 0, errors: errors, value: errors.length === 0 ? obj : null };
}
