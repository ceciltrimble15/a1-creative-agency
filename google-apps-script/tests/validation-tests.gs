/** tests/validation-tests.gs — strict model-output validation. */
function runValidationTests_() {
  T_check(17, 'Invalid JSON rejected (not an object)', validateAgentResponse(null).valid === false, null);
  T_check(18, 'Invalid category rejected', validateAgentResponse(T_out({ category: 'Made Up' })).valid === false, null);
  T_check('18b', 'Invalid sender type rejected', validateAgentResponse(T_out({ sender_type: 'Wizard' })).valid === false, null);
  T_check('18c', 'Missing required key rejected', (function () { var o = T_out(); delete o.summary; return validateAgentResponse(o).valid === false; })(), null);
  T_check('18d', 'Non-integer confidence rejected', validateAgentResponse(T_out({ confidence_score: 88.5 })).valid === false, null);
  T_check('18e', 'Confidence out of range rejected', validateAgentResponse(T_out({ confidence_score: 140 })).valid === false, null);
  T_check('18f', 'Unsafe Green (low confidence) rejected', validateAgentResponse(T_out({ decision_tier: 'Green', confidence_score: 80 })).valid === false, null);
  T_check('18g', 'Unsafe Green (refund category) rejected', validateAgentResponse(T_out({ decision_tier: 'Green', confidence_score: 98, category: 'Refund' })).valid === false, null);
  T_check('18h', 'Valid Yellow accepted', validateAgentResponse(T_out({ decision_tier: 'Yellow', confidence_score: 85 })).valid === true, null);
}
