/**
 * automation-logging.gs — structured, safe audit logging.
 * Writes to the Automation Logs table AND console. NEVER logs secrets, PII,
 * full email bodies, tokens, or credentials — callers pass safe summaries only.
 */

var _SAFE_LOG_KEYS = ['action','functionName','recordId','messageId','result',
  'reason','errorSummary','tier','category','confidence','maskedCategories',
  'agentVersion','count'];

/**
 * logAgentAction(entry) — entry is a plain object; only whitelisted keys persist.
 * Example: logAgentAction({action:'SEND_BLOCKED', functionName:'sendApproved',
 *   recordId:rec, reason:'Final Copy blank'});
 */
function logAgentAction(entry) {
  entry = entry || {};
  var safe = {};
  _SAFE_LOG_KEYS.forEach(function (k) {
    if (entry[k] !== undefined && entry[k] !== null) safe[k] = _scrub_(String(entry[k]));
  });
  var ts = new Date().toISOString();
  var cfg;
  try { cfg = getConfig(); } catch (e) { cfg = { agentVersion: 'unknown' }; }
  if (!safe.agentVersion) safe.agentVersion = cfg.agentVersion;

  // Console (always).
  try { console.log('[A1C] ' + ts + ' ' + JSON.stringify(safe)); } catch (e) {}

  // Airtable sink (best-effort; never throws into caller).
  try {
    var fields = {};
    fields[LOG_FLD.timestamp] = ts;
    fields[LOG_FLD.functionName] = safe.functionName || '';
    fields[LOG_FLD.action] = safe.action || '';
    fields[LOG_FLD.recordId] = safe.recordId || '';
    fields[LOG_FLD.messageId] = safe.messageId || '';
    fields[LOG_FLD.result] = safe.result || '';
    fields[LOG_FLD.detail] = _summaryFrom_(safe);
    fields[LOG_FLD.agentVersion] = safe.agentVersion || '';
    atCreate(CFG_HUB_BASE, CFG_LOG_TBL, fields);
  } catch (e) {
    try { console.error('[A1C] log-sink failed: ' + e); } catch (e2) {}
  }
}

// Automation Logs field names (migration-documented; see Automation Logs table).
var LOG_FLD = {
  timestamp: 'Logged At', functionName: 'Function', action: 'Action',
  recordId: 'Record ID', messageId: 'Message ID', result: 'Result',
  detail: 'Detail', agentVersion: 'Agent Version'
};

// Defense in depth: strip anything that looks like a secret/PII from log strings.
function _scrub_(s) {
  if (!s) return s;
  return s
    .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN]')
    .replace(/\b\d{13,19}\b/g, '[NUM]')
    .replace(/\bsk-[A-Za-z0-9_\-]{10,}\b/g, '[KEY]')
    .replace(/\bBearer\s+[A-Za-z0-9_\-\.]+/gi, 'Bearer [KEY]')
    .replace(/\bpat[A-Za-z0-9]{10,}\b/g, '[KEY]');
}
function _summaryFrom_(safe) {
  var parts = [];
  ['reason','errorSummary','tier','category','confidence','maskedCategories','count'].forEach(function (k) {
    if (safe[k] !== undefined) parts.push(k + '=' + safe[k]);
  });
  return parts.join('; ');
}
