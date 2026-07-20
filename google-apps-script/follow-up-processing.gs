/**
 * follow-up-processing.gs — surface overdue follow-ups for supervision. Never sends.
 */

function processOverdueFollowUps() {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) { logAgentAction({ action: 'RUN_SKIPPED_LOCKED', functionName: 'processOverdueFollowUps' }); return; }
  try {
    var todayIso = new Date().toISOString().slice(0, 10);
    // Sent, not closed, with a Next Follow-Up date at//before today, not already Overdue.
    var formula = "AND(NOT({" + FLD.sentAt + "}=''), {" + FLD.closedAt + "}='', " +
      "NOT({" + FLD.nextFollowUpAt + "}=''), IS_BEFORE({" + FLD.nextFollowUpAt + "}, '" + todayIso + "T23:59:59') , " +
      "NOT({" + FLD.followUpStatus + "}='Overdue'))";
    var recs = atSelect(CFG_HUB_BASE, CFG_INBOX_TBL, formula, 25);
    recs.forEach(function (r) {
      var patch = {};
      patch[FLD.followUpStatus] = 'Overdue';
      patch[FLD.lastFollowUpAt] = new Date().toISOString();
      atUpdate(CFG_HUB_BASE, CFG_INBOX_TBL, r.id, patch);
      logAgentAction({ action: 'FOLLOWUP_OVERDUE', functionName: 'processOverdueFollowUps', recordId: r.id });
    });
    logAgentAction({ action: 'FOLLOWUP_RUN_DONE', functionName: 'processOverdueFollowUps', count: recs.length });
  } finally { lock.releaseLock(); }
}
