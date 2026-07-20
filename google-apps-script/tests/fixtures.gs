/**
 * tests/fixtures.gs — shared helpers for the Phase 2A in-editor test suite.
 * Run runAllPhase2Tests() from the Apps Script editor to get a report.
 * These call the REAL functions; the same assertions run headless in
 * scratchpad/phase2a-logic-tests.js (see docs/phase2a/06-test-results.md).
 */

var _T = { pass: 0, fail: 0, lines: [] };
function _reset_() { _T = { pass: 0, fail: 0, lines: [] }; }
function T_check(id, desc, cond, got) {
  if (cond) { _T.pass++; _T.lines.push('PASS  #' + id + '  ' + desc); }
  else { _T.fail++; _T.lines.push('FAIL  #' + id + '  ' + desc + '  got=' + JSON.stringify(got)); }
}
function T_report() {
  var s = _T.lines.join('\n') + '\n\n' + _T.pass + ' passed, ' + _T.fail + ' failed, ' + (_T.pass + _T.fail) + ' total';
  Logger.log(s); return s;
}

function T_cfg(over) {
  var base = { manualSendEnabled: true, autoSendEnabled: false, agentEnabled: true,
    ceoApproverEmail: 'cecil.trimble15@gmail.com', greenMinConfidence: 95, yellowMinConfidence: 75,
    dailyAgentCallLimit: 50, executionTimeBudgetSeconds: 240, postSendAuditPercent: 10,
    maxAgentRecordsPerRun: 3, agentVersion: 'test' };
  if (over) for (var k in over) base[k] = over[k];
  return base;
}
function T_out(over) {
  var o = { category: 'New Lead', sender_type: 'Prospect', summary: 'x', response_required: true,
    urgency: 'Normal', risk_level: 'Low', opportunity_value: 'Medium', recommended_owner: 'Krisha',
    recommended_next_action: 'Confirm receipt', decision_tier: 'Yellow', confidence_score: 85, draft_reply: 'Hello' };
  if (over) for (var k in over) o[k] = over[k];
  return o;
}
function T_rec(fields) { return { id: 'recTEST', fields: fields }; }
function T_mk(obj) { return obj; }

/** Master runner. */
function runAllPhase2Tests() {
  _reset_();
  runValidationTests_();
  runRoutingTests_();
  runRedactionTests_();
  runSendGuardTests_();
  runConcurrencyTests_();
  return T_report();
}
