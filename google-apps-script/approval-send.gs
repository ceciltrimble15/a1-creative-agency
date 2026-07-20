/**
 * approval-send.gs — human-approved sending with hard fail-closed guards.
 * Nothing sends unless EVERY guard passes. Red requires the CEO approver email.
 * Reply goes in-thread FROM operations@ only. AUTO_SEND is never used here.
 */

// Statuses that mean "already handled" and must NOT resend:
var TERMINAL_STATUSES = ['Approved & Sent', 'Edited & Sent', 'Discarded', 'Archived'];

/**
 * Pure guard predicate — testable without Gmail/Airtable.
 * record: { fields:{...} } (values by field NAME). cfg: getConfig() snapshot.
 * Returns { allowed:Boolean, reason:String }.
 */
function evaluateSendGuards(record, cfg) {
  var f = record.fields || {};
  function blank(v) { return v === undefined || v === null || String(v).trim() === ''; }

  if (cfg.shadowMode) return no_('SHADOW_MODE_LOCK');          // hard lock — never sends in shadow
  if (!cfg.manualSendEnabled) return no_('MANUAL_SEND_DISABLED');
  if (f[FLD.decision] !== 'Approve') return no_('NOT_APPROVED');
  if (f[FLD.agentStatus] !== 'Completed') return no_('AGENT_NOT_COMPLETED');
  if (blank(f[FLD.finalCopy])) return no_('FINAL_COPY_BLANK');
  if (blank(f[FLD.gmailThreadId])) return no_('NO_THREAD_ID');
  if (!blank(f[FLD.sentAt])) return no_('ALREADY_SENT');
  if (TERMINAL_STATUSES.indexOf(f[FLD.status]) !== -1) return no_('TERMINAL_STATUS');
  if (blank(f[FLD.decisionTier])) return no_('NO_DECISION_TIER');

  // Approver authority.
  var tier = f[FLD.decisionTier];
  if (tier === 'Red') {
    var email = String(f[FLD.approvedByEmail] || '').trim().toLowerCase();
    if (email !== String(cfg.ceoApproverEmail || '').trim().toLowerCase()) return no_('RED_REQUIRES_CEO_APPROVER');
  } else {
    if (blank(f[FLD.approvedByEmail]) && blank(f[FLD.approvedBy])) return no_('MISSING_APPROVER');
  }
  return { allowed: true, reason: 'OK' };

  function no_(r) { return { allowed: false, reason: r }; }
}

/** Scheduled: send every Approved+guard-passing A1 Creative record. Lock-protected. */
function sendApproved() {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) { logAgentAction({ action: 'RUN_SKIPPED_LOCKED', functionName: 'sendApproved' }); return; }
  try {
    var cfg = getConfig();
    var started = new Date().getTime();
    var formula = "AND({" + FLD.brand + "}='A1 Creative', {" + FLD.decision + "}='Approve', {" + FLD.sentAt + "}='')";
    var recs = atSelect(CFG_HUB_BASE, CFG_INBOX_TBL, formula, 25);

    for (var i = 0; i < recs.length; i++) {
      if ((new Date().getTime() - started) / 1000 > cfg.executionTimeBudgetSeconds) {
        logAgentAction({ action: 'SEND_BUDGET_STOP', functionName: 'sendApproved', count: i }); break;
      }
      var r = recs[i];
      var guard = evaluateSendGuards(r, cfg);
      if (!guard.allowed) {
        logAgentAction({ action: 'SEND_BLOCKED', functionName: 'sendApproved', recordId: r.id, reason: guard.reason });
        continue;
      }
      try { doSendOne_(r, cfg); }
      catch (e) { logAgentAction({ action: 'SEND_ERROR', functionName: 'sendApproved', recordId: r.id, errorSummary: safeErr_(e) }); }
    }
  } finally { lock.releaseLock(); }
}

function doSendOne_(r, cfg) {
  if (cfg.shadowMode) throw new Error('SHADOW_MODE_LOCK: sending is physically disabled in the Shadow project');
  var f = r.fields;
  var finalCopy = String(f[FLD.finalCopy]).trim();
  var aiDraft = String(f[FLD.aiDraft] || '');
  var thread = GmailApp.getThreadById(f[FLD.gmailThreadId]);
  if (!thread) throw new Error('thread not found');

  var msgs = thread.getMessages();
  msgs[msgs.length - 1].reply(finalCopy, { from: 'operations@a1creativeagency.com' }); // single mailbox

  var humanEdited = finalCopy !== aiDraft.trim();
  var audit = (Math.abs(hashInt_(r.id)) % 100) < cfg.postSendAuditPercent;

  var patch = {};
  patch[FLD.status] = humanEdited ? 'Edited & Sent' : 'Approved & Sent';
  patch[FLD.humanEdited] = humanEdited;
  patch[FLD.sentAt] = new Date().toISOString();
  patch[FLD.approvedAt] = f[FLD.approvedAt] || new Date().toISOString();
  patch[FLD.postSendAuditRequired] = audit;
  if (!f[FLD.followUpDate]) patch[FLD.followUpDate] = addDaysISO_(new Date(), 3);
  if (!f[FLD.nextFollowUpAt]) patch[FLD.nextFollowUpAt] = addDaysISO_(new Date(), 3);
  patch[FLD.followUpStatus] = 'Scheduled';
  atUpdate(CFG_HUB_BASE, CFG_INBOX_TBL, r.id, patch);

  logAgentAction({ action: 'SENT', functionName: 'sendApproved', recordId: r.id,
    tier: f[FLD.decisionTier], result: humanEdited ? 'edited' : 'approved' });
}

/** Scheduled: mark Reject rows Discarded. Never sends. Lock-protected. */
function processRejects() {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) { logAgentAction({ action: 'RUN_SKIPPED_LOCKED', functionName: 'processRejects' }); return; }
  try {
    var formula = "AND({" + FLD.decision + "}='Reject', NOT({" + FLD.status + "}='Discarded'), {" + FLD.sentAt + "}='')";
    var recs = atSelect(CFG_HUB_BASE, CFG_INBOX_TBL, formula, 25);
    recs.forEach(function (r) {
      var patch = {}; patch[FLD.status] = 'Discarded'; patch[FLD.outcome] = 'Closed'; patch[FLD.closedAt] = new Date().toISOString();
      atUpdate(CFG_HUB_BASE, CFG_INBOX_TBL, r.id, patch);
      logAgentAction({ action: 'REJECTED', functionName: 'processRejects', recordId: r.id });
    });
  } finally { lock.releaseLock(); }
}

// helpers
function addDaysISO_(d, n) { var x = new Date(d.getTime()); x.setDate(x.getDate() + n); return x.toISOString().slice(0, 10); }
function hashInt_(s) { var h = 0; s = String(s); for (var i = 0; i < s.length; i++) { h = (h * 31 + s.charCodeAt(i)) | 0; } return h; }
