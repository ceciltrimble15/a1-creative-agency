/**
 * trigger-management.gs — safe, idempotent trigger install/rollback.
 * Do NOT run these during the repository build. Run only on the deploy account.
 */

var PHASE1_TRIGGERS = [
  { fn: 'captureInbox', mins: 10 },
  { fn: 'sendApproved', mins: 10 },
  { fn: 'processRejects', mins: 30 }
];
var PHASE2_TRIGGERS = [
  { fn: 'analyzePendingEmails', mins: 10 },
  { fn: 'processOverdueFollowUps', mins: 60 }
];

function _existingTriggerFns_() {
  return ScriptApp.getProjectTriggers().map(function (t) { return t.getHandlerFunction(); });
}
function _ensureTrigger_(fn, mins, existing, report) {
  if (existing.indexOf(fn) !== -1) { report.skipped.push(fn); return; }
  if (mins === 60) ScriptApp.newTrigger(fn).timeBased().everyHours(1).create();
  else ScriptApp.newTrigger(fn).timeBased().everyMinutes(mins).create();
  report.added.push(fn);
}

/** Phase 1 only (kept for compatibility / rollback). */
function installTriggers() {
  var existing = _existingTriggerFns_();
  var report = { added: [], skipped: [], retained: existing.slice() };
  PHASE1_TRIGGERS.forEach(function (t) { _ensureTrigger_(t.fn, t.mins, existing, report); });
  logAgentAction({ action: 'INSTALL_PHASE1_TRIGGERS', functionName: 'installTriggers', reason: JSON.stringify(report) });
  return report;
}

/** Phase 2A: adds analyze + follow-up, preserves Phase 1, never duplicates. */
function installPhase2Triggers() {
  var existing = _existingTriggerFns_();
  var report = { added: [], skipped: [], retained: existing.slice() };
  PHASE1_TRIGGERS.forEach(function (t) { _ensureTrigger_(t.fn, t.mins, existing, report); });
  PHASE2_TRIGGERS.forEach(function (t) { _ensureTrigger_(t.fn, t.mins, existing, report); });
  logAgentAction({ action: 'INSTALL_PHASE2_TRIGGERS', functionName: 'installPhase2Triggers', reason: JSON.stringify(report) });
  return report;
}

/** Rollback: remove ONLY Phase 2 triggers, leave Phase 1 running. */
function removePhase2Triggers() {
  var removed = [];
  var p2 = PHASE2_TRIGGERS.map(function (t) { return t.fn; });
  ScriptApp.getProjectTriggers().forEach(function (tr) {
    if (p2.indexOf(tr.getHandlerFunction()) !== -1) { ScriptApp.deleteTrigger(tr); removed.push(tr.getHandlerFunction()); }
  });
  logAgentAction({ action: 'REMOVE_PHASE2_TRIGGERS', functionName: 'removePhase2Triggers', reason: JSON.stringify({ removed: removed }) });
  return { removed: removed };
}

/** Full kill switch for triggers (emergency). Leaves data intact. */
function removeAllTriggers() {
  var removed = [];
  ScriptApp.getProjectTriggers().forEach(function (tr) { removed.push(tr.getHandlerFunction()); ScriptApp.deleteTrigger(tr); });
  logAgentAction({ action: 'REMOVE_ALL_TRIGGERS', functionName: 'removeAllTriggers', reason: JSON.stringify({ removed: removed }) });
  return { removed: removed };
}
