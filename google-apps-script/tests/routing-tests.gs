/** tests/routing-tests.gs — deterministic Green/Yellow/Red + confidence bands + sticky risk. */
function runRoutingTests_() {
  var clean = { deterministicRed: null, threadFloor: null, autoSendEnabled: false, greenMin: 95, yellowMin: 75 };

  // Green candidates (1-3)
  T_check(1, 'Green candidate (doc)', deriveTier(T_out({ category: 'Document Submission', decision_tier: 'Green', confidence_score: 97, risk_level: 'Low' }), clean).tier === 'Green', null);
  T_check(2, 'Green candidate (scheduling)', deriveTier(T_out({ category: 'Scheduling', sender_type: 'Active Client', decision_tier: 'Green', confidence_score: 96, risk_level: 'Low' }), clean).tier === 'Green', null);
  T_check(3, 'Green never auto-sends in 2A', deriveTier(T_out({ category: 'New Lead', decision_tier: 'Green', confidence_score: 99, risk_level: 'Low' }), clean).autoSendEligible === false, null);

  // Yellow (4-7)
  T_check(4, 'Yellow lead → Krisha', deriveTier(T_out({ decision_tier: 'Yellow', confidence_score: 88 }), clean).approvalAuthority === 'Krisha', null);
  T_check(7, 'Attachment downgrades Green→Yellow', deriveTier(T_out({ category: 'Project Support', decision_tier: 'Green', confidence_score: 97, risk_level: 'Low' }), { attachmentReview: true, greenMin: 95, yellowMin: 75 }).tier === 'Yellow', null);

  // Red (8-16)
  var redSubjects = ['refund', 'discount please', 'government compliance', 'contract to sign', 'bank routing number',
    'attorney litigation', 'security breach', 'public statement to press'];
  redSubjects.forEach(function (s, i) {
    var d = deriveTier(T_out({ decision_tier: 'Yellow', confidence_score: 90 }), { deterministicRed: detectDeterministicRed(s), greenMin: 95, yellowMin: 75 });
    T_check(8 + i, 'Red (' + s + ') → Cecil', d.tier === 'Red' && d.approvalAuthority === 'Cecil' && d.autoSendEligible === false, d);
  });
  T_check(14, 'Unknown low-confidence → Red', deriveTier(T_out({ category: 'Unknown', sender_type: 'Unknown', decision_tier: 'Yellow', confidence_score: 40 }), clean).tier === 'Red', null);

  // Confidence bands (19-22)
  T_check(19, 'conf 74 → Red', deriveTier(T_out({ decision_tier: 'Yellow', confidence_score: 74 }), clean).tier === 'Red', null);
  T_check(20, 'conf 75 → Yellow', deriveTier(T_out({ decision_tier: 'Yellow', confidence_score: 75 }), clean).tier === 'Yellow', null);
  T_check(21, 'conf 94 → Yellow', deriveTier(T_out({ decision_tier: 'Yellow', confidence_score: 94 }), clean).tier === 'Yellow', null);
  T_check(22, 'conf 95 clean → Green', deriveTier(T_out({ category: 'Scheduling', decision_tier: 'Green', confidence_score: 95, risk_level: 'Low' }), clean).tier === 'Green', null);

  // Sticky thread risk (34)
  T_check(34, 'Benign reply in Red thread stays Red', deriveTier(T_out({ decision_tier: 'Green', confidence_score: 99, risk_level: 'Low' }), { threadFloor: 'Red', greenMin: 95, yellowMin: 75 }).tier === 'Red', null);

  // Validation-failure fail-closed
  T_check('34b', 'Invalid output → Red', deriveTier(null, { validationFailed: true }).tier === 'Red', null);
}
