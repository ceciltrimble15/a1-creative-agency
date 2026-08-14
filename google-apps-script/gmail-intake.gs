/**
 * gmail-intake.gs — Phase 2A capture with per-message dedupe and fail-closed handshake.
 * Unique key = Gmail Message ID. Thread ID groups the conversation.
 * Label handshake: Intake -> Processing -> (create record) -> Captured, remove Processing/Intake.
 */

function captureInbox() {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) { logAgentAction({ action: 'RUN_SKIPPED_LOCKED', functionName: 'captureInbox' }); return; }
  try {
    var cfg = getConfig();
    var lblIntake = getOrCreateLabel_(LBL_INTAKE);
    var lblProcessing = getOrCreateLabel_(LBL_PROCESSING);
    var lblCaptured = getOrCreateLabel_(LBL_CAPTURED);

    var threads = GmailApp.search('label:' + LBL_INTAKE + ' -label:' + LBL_CAPTURED, 0, 20);
    var started = new Date().getTime();

    for (var t = 0; t < threads.length; t++) {
      if ((new Date().getTime() - started) / 1000 > cfg.executionTimeBudgetSeconds) {
        logAgentAction({ action: 'CAPTURE_BUDGET_STOP', functionName: 'captureInbox', count: t }); break;
      }
      var thread = threads[t];
      var msgs = thread.getMessages();
      var msg = msgs[msgs.length - 1];
      var messageId = msg.getId();
      var attemptId = Utilities.getUuid();

      // Skip spam/trash before any processing.
      if (thread.isInSpam() || thread.isInTrash()) { thread.removeLabel(lblIntake); continue; }

      try {
        // (2) dedupe by Gmail Message ID.
        if (atMessageExists(messageId)) {
          thread.addLabel(lblCaptured); thread.removeLabel(lblIntake);
          logAgentAction({ action: 'CAPTURE_DUPLICATE_PREVENTED', functionName: 'captureInbox', messageId: messageId });
          continue;
        }
        // (3) mark Processing.
        thread.addLabel(lblProcessing);

        // (4) create the record.
        var body = String(msg.getPlainBody() || '').trim();
        var preview = body.length > 1500 ? body.substring(0, 1500) + '…' : body;
        // Module 01 ENTITY LOCK: detect the ORIGINAL recipient, resolve+lock the entity.
        var originalTo = detectOriginalRecipient(msg.getRawContent()) || extractEmail_(msg.getTo());
        var ent = resolveEntity(originalTo);

        var fields = {};
        fields[FLD.subject] = thread.getFirstMessageSubject() || '(no subject)';
        fields[FLD.from] = extractEmail_(msg.getFrom());
        fields[FLD.originalRecipient] = originalTo;         // ORIGINAL_TO preserved (section 5)
        fields[FLD.entity] = ent.needsReview ? 'NEEDS REVIEW' : ent.entityName;      // ENTITY_ID as system data
        fields[FLD.businessLane] = ent.needsReview ? 'NEEDS REVIEW' : ent.businessLane;
        fields[FLD.approvedSendFrom] = ent.approvedSendFrom;                          // never faked
        fields[FLD.sendFromConfigRequired] = ent.sendFromConfigRequired;
        fields[FLD.brand] = ent.needsReview ? 'Personal' : laneToBrand(ent.businessLane);
        fields[FLD.preview] = preview;
        fields[FLD.receivedAt] = msg.getDate().toISOString();
        fields[FLD.status] = 'Pending Review';             // never auto-sends
        fields[FLD.sendFrom] = 'A1 Creative Mailbox (a1creativeagency.com)';
        fields[FLD.gmailThreadId] = thread.getId();
        fields[FLD.gmailMessageId] = messageId;
        fields[FLD.captureState] = 'Captured';
        fields[FLD.captureAttemptId] = attemptId;
        fields[FLD.agentStatus] = 'Not Processed';
        fields[FLD.attachmentReviewRequired] = msg.getAttachments().length > 0;

        var created = atCreate(CFG_HUB_BASE, CFG_INBOX_TBL, fields);
        if (!created || !created.id) throw new Error('record create returned no id');

        // (6-8) success handshake.
        thread.addLabel(lblCaptured);
        thread.removeLabel(lblProcessing);
        thread.removeLabel(lblIntake);
        logAgentAction({ action: 'CAPTURED', functionName: 'captureInbox', recordId: created.id, messageId: messageId });
      } catch (e) {
        // Fail closed: drop Processing, keep Intake for safe retry, record error, NO duplicate.
        try { thread.removeLabel(lblProcessing); } catch (e2) {}
        try { thread.addLabel(lblIntake); } catch (e3) {}
        logAgentAction({ action: 'CAPTURE_FAILED', functionName: 'captureInbox', messageId: messageId, errorSummary: safeErr_(e) });
      }
    }
  } finally { lock.releaseLock(); }
}

function getOrCreateLabel_(name) { return GmailApp.getUserLabelByName(name) || GmailApp.createLabel(name); }
function extractEmail_(from) { var m = /<([^>]+)>/.exec(from || ''); return m ? m[1] : String(from || '').trim(); }
