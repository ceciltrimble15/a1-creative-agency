/**
 * agent-config.gs — Phase 2A central configuration, constants, enums.
 * All environment-specific values come from Script Properties. No secrets here.
 */

// ── Airtable resource IDs (stable) ───────────────────────────────────────
var CFG_HUB_BASE  = 'appvfR20qp1dh5bT0';   // A1 Creative Agency Hub
var CFG_INBOX_TBL = 'tblUFUnImwgHhHyqP';   // Inbox Queue
var CFG_LOG_TBL   = 'Automation Logs';     // logging sink (by name; migration-documented)
var CFG_ACOS_BASE = 'appbJeQpEUFRV1Dim';   // ACOS
var CFG_ACOS_APPRV_TBL = 'tblcgxEvHsyNQujL1'; // 04 – CEO Approval Queue

// Gmail labels
var LBL_INTAKE     = 'A1C/Intake';
var LBL_PROCESSING = 'A1C/Processing';
var LBL_CAPTURED   = 'A1C/Captured';

// ── Script Property access ───────────────────────────────────────────────
function prop_(key, dflt) {
  var v = PropertiesService.getScriptProperties().getProperty(key);
  return (v === null || v === undefined || v === '') ? dflt : v;
}
function propBool_(key, dflt) {
  var v = prop_(key, null);
  if (v === null) return dflt;
  return String(v).toLowerCase() === 'true';
}
function propInt_(key, dflt) {
  var v = prop_(key, null);
  if (v === null) return dflt;
  var n = parseInt(v, 10);
  return isNaN(n) ? dflt : n;
}

/** Snapshot of all runtime config with Phase 2A defaults. */
function getConfig() {
  return {
    airtableToken: prop_('AIRTABLE_TOKEN', ''),          // required; never logged
    aiProvider:    prop_('AI_PROVIDER', 'anthropic'),
    aiApiKey:      prop_('AI_API_KEY', ''),               // required for agent; never logged
    aiModel:       prop_('AI_MODEL', 'claude-sonnet-5'),
    agentVersion:  prop_('AGENT_VERSION', 'phase2a-1.0.0'),

    // Kill switches
    agentEnabled:      propBool_('AGENT_ENABLED', true),       // model analysis on/off
    manualSendEnabled: propBool_('MANUAL_SEND_ENABLED', true), // human-approved sending on/off
    autoSendEnabled:   propBool_('AUTO_SEND_ENABLED', false),  // MUST stay false in Phase 2A

    ceoApproverEmail: prop_('CEO_APPROVER_EMAIL', 'cecil.trimble15@gmail.com'),

    greenMinConfidence:  propInt_('GREEN_MIN_CONFIDENCE', 95),
    yellowMinConfidence: propInt_('YELLOW_MIN_CONFIDENCE', 75),

    maxAgentRecordsPerRun:     propInt_('MAX_AGENT_RECORDS_PER_RUN', 3),
    dailyAgentCallLimit:       propInt_('DAILY_AGENT_CALL_LIMIT', 50),
    modelTimeoutSeconds:       propInt_('MODEL_TIMEOUT_SECONDS', 60),
    executionTimeBudgetSeconds:propInt_('EXECUTION_TIME_BUDGET_SECONDS', 240),
    postSendAuditPercent:      propInt_('POST_SEND_AUDIT_PERCENT', 10)
  };
}

// ── Airtable field NAMES (Phase 2 writes by name; robust before migration) ─
// Existing (Phase 1) fields:
var FLD = {
  subject: 'Subject', from: 'From', brand: 'Brand', priority: 'Priority',
  preview: 'Preview', recommendation: 'Recommended Action', claudeDraft: 'Claude Draft',
  status: 'Status', receivedAt: 'Received At', aiSummary: 'AI Summary',
  decision: 'Approve / Edit / Reject', finalCopy: 'Final Copy', sendFrom: 'Send From',
  sentAt: 'Sent At', followUpDate: 'Follow-Up Date', acosRef: 'ACOS Ref',
  gmailThreadId: 'Gmail Thread ID',
  // New (Phase 2A) — created via migration before deploy:
  gmailMessageId: 'Gmail Message ID', captureState: 'Capture State',
  captureAttemptId: 'Capture Attempt ID', captureError: 'Capture Error',
  agentStatus: 'Agent Status', agentProcessedAt: 'Agent Processed At',
  agentVersion: 'Agent Version', agentError: 'Agent Error',
  processingAttemptId: 'Processing Attempt ID', processingStartedAt: 'Processing Started At',
  processingCompletedAt: 'Processing Completed At', processingAttempts: 'Processing Attempts',
  dailyLimitReached: 'Daily Limit Reached', confidenceScore: 'Confidence Score',
  promptVersion: 'Prompt Version', originalAiOutput: 'Original AI Output',
  messageCategory: 'Message Category', senderType: 'Sender Type',
  responseRequired: 'Response Required', detectedDeadline: 'Detected Deadline',
  urgency: 'Urgency', riskLevel: 'Risk Level', opportunityValue: 'Opportunity Value',
  sensitiveContent: 'Sensitive Content', piiDetected: 'PII Detected',
  maskedFields: 'Masked Fields', modelPayloadHash: 'Model Payload Hash',
  attachmentReviewRequired: 'Attachment Review Required',
  decisionTier: 'Decision Tier', recommendedOwner: 'Recommended Owner',
  recommendedNextAction: 'Recommended Next Action', escalationReason: 'Escalation Reason',
  greenDenialReason: 'Green Denial Reason', autoSendEligible: 'Auto-Send Eligible',
  ceoReviewRequired: 'CEO Review Required', acosEscalatedAt: 'ACOS Escalated At',
  threadRiskFloor: 'Thread Risk Floor', threadRedReason: 'Thread Red Reason',
  threadRiskSetAt: 'Thread Risk Set At', threadRiskOverride: 'Thread Risk Override',
  threadRiskOverrideBy: 'Thread Risk Override By',
  aiDraft: 'AI Draft', aiDraftLastModified: 'AI Draft Last Modified',
  finalCopyLastModified: 'Final Copy Last Modified', humanEdited: 'Human Edited',
  humanEditor: 'Human Editor', approvalAuthorityRequired: 'Approval Authority Required',
  approvedBy: 'Approved By', approvedByEmail: 'Approved By Email',
  approvedAt: 'Approved At', draftApprovedAt: 'Draft Approved At',
  outcome: 'Outcome', closedAt: 'Closed At', followUpStatus: 'Follow-Up Status',
  lastFollowUpAt: 'Last Follow-Up At', nextFollowUpAt: 'Next Follow-Up At',
  postSendAuditRequired: 'Post-Send Audit Required',
  reprocessAgent: 'Reprocess Agent', reprocessReason: 'Reprocess Reason',
  modelValidationStatus: 'Model Validation Status', modelValidationDate: 'Model Validation Date',
  modelApprovedBy: 'Model Approved By'
};

// ── Controlled enums (any out-of-enum value fails validation) ─────────────
var ENUM_CATEGORIES = ['New Lead','Existing Client','Project Support','Scheduling',
  'Quote or Pricing Request','Billing or Payment','Partnership','Vendor',
  'Government or Compliance','Legal','Contract','Complaint or Dispute','Refund',
  'Document Submission','Media or Public Relations','Internal Operations',
  'Newsletter or Marketing','Spam or Irrelevant','Unknown'];

var ENUM_SENDER_TYPES = ['Prospect','Active Client','Former Client','Partner','Vendor',
  'Government Agency','Financial Institution','Legal Representative','Media',
  'Internal Team','Automated System','Unknown'];

var ENUM_TIERS = ['Green','Yellow','Red'];
var ENUM_URGENCY = ['Low','Normal','High','Critical'];
var ENUM_RISK = ['Low','Medium','High','Critical'];
var ENUM_OPPORTUNITY = ['None','Low','Medium','High'];

// Categories / sender types that can NEVER be Green (force Red).
var NEVER_GREEN_CATEGORIES = ['Government or Compliance','Legal','Contract',
  'Complaint or Dispute','Refund','Billing or Payment','Media or Public Relations','Unknown'];
var NEVER_GREEN_SENDERS = ['Government Agency','Financial Institution',
  'Legal Representative','Unknown'];
