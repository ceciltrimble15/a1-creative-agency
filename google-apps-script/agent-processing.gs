/**
 * agent-processing.gs — the supervised analysis loop.
 * capture -> [this] classify/summarize/draft/route -> human approval (elsewhere).
 * Idempotent, lock-protected, budget-aware. Writes AI Draft, NEVER Final Copy.
 */

function analyzePendingEmails() {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) { logAgentAction({ action: 'RUN_SKIPPED_LOCKED', functionName: 'analyzePendingEmails' }); return; }
  try {
    var cfg = getConfig();
    if (!cfg.agentEnabled) { logAgentAction({ action: 'AGENT_DISABLED', functionName: 'analyzePendingEmails' }); return; }

    var gov = validateModelConfiguration();
    if (gov.status === 'Blocked') { logAgentAction({ action: 'MODEL_BLOCKED', functionName: 'analyzePendingEmails', reason: gov.reason }); return; }

    var started = new Date().getTime();
    // Candidates: A1 Creative, captured, not yet completed (or flagged for reprocess), not sent.
    var formula = "AND({" + FLD.brand + "}='A1 Creative', {" + FLD.captureState + "}='Captured', " +
      "OR({" + FLD.agentStatus + "}='', {" + FLD.agentStatus + "}='Not Processed', {" + FLD.reprocessAgent + "}=1), " +
      "{" + FLD.sentAt + "}='')";
    var recs = atSelect(CFG_HUB_BASE, CFG_INBOX_TBL, formula, cfg.maxAgentRecordsPerRun);

    var processed = 0;
    for (var i = 0; i < recs.length; i++) {
      if (processed >= cfg.maxAgentRecordsPerRun) break;
      if ((new Date().getTime() - started) / 1000 > cfg.executionTimeBudgetSeconds) {
        logAgentAction({ action: 'ANALYZE_BUDGET_STOP', functionName: 'analyzePendingEmails', count: processed }); break;
      }
      if (dailyLimitReached_(cfg)) {
        markDailyLimit_(recs[i].id);
        logAgentAction({ action: 'DAILY_LIMIT_REACHED', functionName: 'analyzePendingEmails' });
        break;
      }
      try { analyzeOne_(recs[i], cfg); processed++; }
      catch (e) { failRecord_(recs[i].id, 'ANALYZE_EXCEPTION: ' + safeErr_(e)); }
    }
    logAgentAction({ action: 'ANALYZE_RUN_DONE', functionName: 'analyzePendingEmails', count: processed });
  } finally { lock.releaseLock(); }
}

function analyzeOne_(rec, cfg) {
  var attemptId = Utilities.getUuid();
  // Checkpoint: mark Processing (idempotency guard).
  var start = {};
  start[FLD.agentStatus] = 'Processing';
  start[FLD.processingAttemptId] = attemptId;
  start[FLD.processingStartedAt] = new Date().toISOString();
  start[FLD.processingAttempts] = (rec.fields[FLD.processingAttempts] || 0) + 1;
  atUpdate(CFG_HUB_BASE, CFG_INBOX_TBL, rec.id, start);

  var built = buildAgentPayload(rec);
  logAgentAction({ action: 'AGENT_CALL_START', functionName: 'analyzeOne_', recordId: rec.id,
    maskedCategories: built.maskedCategories.join(',') || 'none' });

  var prompt = buildAgentPrompt(built.masked);
  var r = callAgentModel(prompt);

  if (!r.ok) {
    // Provider/parse/limit failure -> fail closed to Red.
    failRecord_(rec.id, 'MODEL_' + r.error);
    routeRecord(rec.id, null, { validationFailed: true, threadId: rec.fields[FLD.gmailThreadId] });
    return;
  }

  var v = validateAgentResponse(r.data);
  if (!v.valid) {
    failRecord_(rec.id, 'VALIDATION:' + v.errors.join(','));
    routeRecord(rec.id, null, { validationFailed: true, threadId: rec.fields[FLD.gmailThreadId] });
    logAgentAction({ action: 'AGENT_VALIDATION_FAILED', functionName: 'analyzeOne_', recordId: rec.id, reason: v.errors.join(',') });
    return;
  }

  applyAgentOutput(rec.id, v.value, built);

  // Deterministic routing (authoritative).
  var threadId = rec.fields[FLD.gmailThreadId];
  var ctx = {
    threadId: threadId,
    threadFloor: getThreadRiskFloor(threadId),
    deterministicRed: detectDeterministicRed((rec.fields[FLD.subject] || '') + ' ' + (built.rawBody || '')),
    sensitive: built.pii || v.value.sensitive_content === true,
    attachmentReview: !!built.hasAttachments,
    validationFailed: false
  };
  var d = routeRecord(rec.id, v.value, ctx);

  if (d.tier === 'Red') {
    try { escalateRedToAcos(rec.id, { fields: rec.fields }); }
    catch (e) { logAgentAction({ action: 'ACOS_ESCALATE_ERROR', functionName: 'analyzeOne_', recordId: rec.id, errorSummary: safeErr_(e) }); }
  }
  logAgentAction({ action: 'AGENT_COMPLETED', functionName: 'analyzeOne_', recordId: rec.id,
    tier: d.tier, category: v.value.category, confidence: v.value.confidence_score });
}

/** Build the masked, minimal payload sent to the model. No attachments in Phase 2A. */
function buildAgentPayload(rec) {
  var f = rec.fields;
  var rawBody = String(f[FLD.preview] || '');
  var masked = maskSensitiveData(rawBody);
  var payload = {
    subject: String(f[FLD.subject] || ''),
    from: String(f[FLD.from] || ''),
    receivedAt: String(f[FLD.receivedAt] || ''),
    hasAttachments: false, // attachments are never sent to the model in Phase 2A
    body: masked.text,
    threadRiskFloor: getThreadRiskFloor(f[FLD.gmailThreadId])
  };
  return {
    masked: payload, rawBody: rawBody, hasAttachments: !!f[FLD.attachmentReviewRequired],
    maskedCategories: masked.categories, pii: masked.pii, hash: payloadHash(payload)
  };
}

/** Write agent understanding + AI Draft. NEVER writes Final Copy. */
function applyAgentOutput(recordId, o, built) {
  var now = new Date().toISOString();
  var fields = {};
  fields[FLD.agentStatus] = 'Completed';
  fields[FLD.agentProcessedAt] = now;
  fields[FLD.processingCompletedAt] = now;
  fields[FLD.agentVersion] = getConfig().agentVersion;
  fields[FLD.promptVersion] = PROMPT_VERSION;
  fields[FLD.reprocessAgent] = false;
  fields[FLD.agentError] = '';

  fields[FLD.messageCategory] = o.category;
  fields[FLD.senderType] = o.sender_type;
  fields[FLD.aiSummary] = o.summary;
  fields[FLD.responseRequired] = !!o.response_required;
  fields[FLD.urgency] = o.urgency;
  fields[FLD.riskLevel] = o.risk_level;
  fields[FLD.opportunityValue] = o.opportunity_value;
  fields[FLD.confidenceScore] = o.confidence_score;
  if (o.detected_deadline) fields[FLD.detectedDeadline] = o.detected_deadline;

  fields[FLD.sensitiveContent] = !!(o.sensitive_content || built.pii);
  fields[FLD.piiDetected] = !!built.pii;
  fields[FLD.maskedFields] = built.maskedCategories.join(', ');
  fields[FLD.modelPayloadHash] = built.hash;
  fields[FLD.attachmentReviewRequired] = !!(o.attachment_review_required || built.hasAttachments);

  fields[FLD.aiDraft] = String(o.draft_reply || '');
  fields[FLD.aiDraftLastModified] = now;
  fields[FLD.originalAiOutput] = JSON.stringify(o).slice(0, 90000);

  atUpdate(CFG_HUB_BASE, CFG_INBOX_TBL, recordId, fields);
}

// helpers
function failRecord_(recordId, reason) {
  var fields = {};
  fields[FLD.agentStatus] = 'Failed';
  fields[FLD.agentError] = _scrub_(reason).slice(0, 900);
  fields[FLD.decisionTier] = 'Red';
  fields[FLD.ceoReviewRequired] = true;
  atUpdate(CFG_HUB_BASE, CFG_INBOX_TBL, recordId, fields);
  logAgentAction({ action: 'AGENT_FAILED', functionName: 'analyzeOne_', recordId: recordId, reason: reason });
}
function markDailyLimit_(recordId) {
  var fields = {}; fields[FLD.dailyLimitReached] = true;
  try { atUpdate(CFG_HUB_BASE, CFG_INBOX_TBL, recordId, fields); } catch (e) {}
}
