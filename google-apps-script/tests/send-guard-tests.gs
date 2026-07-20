/** tests/send-guard-tests.gs — fail-closed send guards (29-32, 41, 42). */
function runSendGuardTests_() {
  var cfg = T_cfg();
  function g(over) {
    var f = {};
    f[FLD.decision] = 'Approve'; f[FLD.agentStatus] = 'Completed'; f[FLD.finalCopy] = 'hi';
    f[FLD.gmailThreadId] = 't'; f[FLD.decisionTier] = 'Yellow'; f[FLD.approvedByEmail] = 'krisha@a1creativeagency.com';
    if (over) for (var k in over) f[k] = over[k];
    return T_rec(f);
  }
  T_check(29, 'Approve+Failed blocked', evaluateSendGuards(g(T_mk(setk(FLD.agentStatus, 'Failed'))), cfg).reason === 'AGENT_NOT_COMPLETED', null);
  T_check(30, 'Approve+NotProcessed blocked', evaluateSendGuards(g(setk(FLD.agentStatus, 'Not Processed')), cfg).reason === 'AGENT_NOT_COMPLETED', null);
  T_check(31, 'Blank Final Copy blocked', evaluateSendGuards(g(setk(FLD.finalCopy, '')), cfg).reason === 'FINAL_COPY_BLANK', null);
  T_check(32, 'Red by non-CEO blocked', evaluateSendGuards(g(T_two(FLD.decisionTier, 'Red', FLD.approvedByEmail, 'krisha@a1creativeagency.com')), cfg).reason === 'RED_REQUIRES_CEO_APPROVER', null);
  T_check('32b', 'Red by CEO allowed', evaluateSendGuards(g(T_two(FLD.decisionTier, 'Red', FLD.approvedByEmail, 'cecil.trimble15@gmail.com')), cfg).allowed === true, null);
  T_check('32c', 'Clean Yellow allowed', evaluateSendGuards(g(), cfg).allowed === true, null);
  T_check(41, 'Already sent cannot resend', evaluateSendGuards(g(setk(FLD.sentAt, '2026-07-20T00:00:00Z')), cfg).reason === 'ALREADY_SENT', null);
  T_check('41b', 'Manual send disabled blocks all', evaluateSendGuards(g(), T_cfg({ manualSendEnabled: false })).reason === 'MANUAL_SEND_DISABLED', null);
  T_check(42, 'AUTO_SEND default false', getConfig().autoSendEnabled === false, null);
  T_check(43, 'SHADOW_MODE lock blocks send even if MANUAL_SEND on', evaluateSendGuards(g(), T_cfg({ shadowMode: true, manualSendEnabled: true })).reason === 'SHADOW_MODE_LOCK', null);

  function setk(k, v) { var o = {}; o[k] = v; return o; }
  function T_two(k1, v1, k2, v2) { var o = {}; o[k1] = v1; o[k2] = v2; return o; }
}
