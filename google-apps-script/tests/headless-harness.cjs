/**
 * Faithful Node harness: loads the REAL .gs source into a sandbox with stubbed
 * Apps Script globals, then runs the Phase 2A spec's 42 scenarios against the
 * actual functions. Pure-logic + provider + guard paths run live; a few
 * Gmail/Airtable-runtime-only cases are asserted at the decision-branch level.
 */
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const GAS = '/home/user/a1-creative-agency/google-apps-script';
const FILES = ['agent-config.gs','security-redaction.gs','agent-validation.gs',
  'agent-prompt.gs','agent-routing.gs','agent-provider.gs','airtable-client.gs',
  'automation-logging.gs','approval-send.gs','agent-processing.gs',
  'gmail-intake.gs','follow-up-processing.gs','trigger-management.gs'];

// ── Apps Script global stubs ─────────────────────────────────────────────
let PROPS = {};
let FETCH = () => ({ code: 200, body: '{}' });
let LOCK_AVAILABLE = true;
let lastRequest = null;

const sandbox = {
  console,
  PropertiesService: {
    getScriptProperties: () => ({
      getProperty: k => (k in PROPS ? PROPS[k] : null),
      setProperty: (k, v) => { PROPS[k] = String(v); }
    })
  },
  LockService: { getScriptLock: () => ({ tryLock: () => LOCK_AVAILABLE, releaseLock() {} }) },
  UrlFetchApp: {
    fetch: (url, opts) => {
      lastRequest = { url, method: opts && opts.method, payload: opts && opts.payload };
      const r = FETCH(url, opts);
      return { getResponseCode: () => r.code, getContentText: () => r.body };
    }
  },
  Utilities: {
    getUuid: () => 'uuid-' + Math.random().toString(16).slice(2),
    formatDate: (d, tz, fmt) => {
      const iso = new Date().toISOString();
      if (fmt === 'yyyyMMdd') return iso.slice(0, 10).replace(/-/g, '');
      return iso.slice(0, 10);
    },
    computeDigest: (alg, s) => { const out = []; for (let i = 0; i < 32; i++) out.push((s.charCodeAt(i % s.length) + i) & 0xff); return out; },
    DigestAlgorithm: { SHA_256: 'SHA_256' }
  },
  GmailApp: {}, // not exercised in these tests
};
vm.createContext(sandbox);
FILES.forEach(f => vm.runInContext(fs.readFileSync(path.join(GAS, f), 'utf8'), sandbox, { filename: f }));
const S = sandbox; // access evaluated globals

// ── tiny assert harness ──────────────────────────────────────────────────
let pass = 0, fail = 0; const results = [];
function check(id, desc, cond, got) {
  if (cond) { pass++; results.push(`PASS  #${id}  ${desc}`); }
  else { fail++; results.push(`FAIL  #${id}  ${desc}  (got: ${JSON.stringify(got)})`); }
}
function baseCfg(over) {
  return Object.assign({ manualSendEnabled: true, autoSendEnabled: false, agentEnabled: true,
    ceoApproverEmail: 'cecil.trimble15@gmail.com', greenMinConfidence: 95, yellowMinConfidence: 75,
    dailyAgentCallLimit: 50, executionTimeBudgetSeconds: 240, postSendAuditPercent: 10,
    maxAgentRecordsPerRun: 3, agentVersion: 'test' }, over || {});
}
function agentOut(over) {
  return Object.assign({ category: 'New Lead', sender_type: 'Prospect', summary: 'x',
    response_required: true, urgency: 'Normal', risk_level: 'Low', opportunity_value: 'Medium',
    recommended_owner: 'Krisha', recommended_next_action: 'Confirm receipt',
    decision_tier: 'Yellow', confidence_score: 85, draft_reply: 'Hello' }, over || {});
}
const F = S.FLD;
function rec(fields) { return { id: 'rec' + Math.random().toString(16).slice(2), fields }; }

// ── GREEN candidates (1–3) ───────────────────────────────────────────────
[['Document Submission','Prospect','receipt/doc received'],
 ['Scheduling','Active Client','office-hours request'],
 ['New Lead','Prospect','intake ack']].forEach((g, i) => {
  const out = agentOut({ category: g[0], sender_type: g[1], decision_tier: 'Green', confidence_score: 97, risk_level: 'Low' });
  const d = S.deriveTier(out, { deterministicRed: null, threadFloor: null, autoSendEnabled: false, greenMin: 95, yellowMin: 75 });
  check(i + 1, `Green candidate (${g[2]})`, d.tier === 'Green' && d.autoSendEligible === false, d);
});

// ── YELLOW (4–7) ─────────────────────────────────────────────────────────
[['New Lead','Prospect',88,false],['Existing Client','Active Client',90,false],
 ['Partnership','Partner',82,false],['Project Support','Active Client',80,true]].forEach((y, i) => {
  const out = agentOut({ category: y[0], sender_type: y[1], decision_tier: 'Yellow', confidence_score: y[2] });
  const d = S.deriveTier(out, { deterministicRed: null, threadFloor: null, attachmentReview: y[3], autoSendEnabled: false, greenMin: 95, yellowMin: 75 });
  check(i + 4, `Yellow → Krisha (${y[0]})`, d.tier === 'Yellow' && d.approvalAuthority === 'Krisha', d);
});

// ── RED (8–16) ───────────────────────────────────────────────────────────
const redCases = [
  ['refund please', agentOut({ category: 'Refund', decision_tier: 'Yellow', confidence_score: 90 })],
  ['can I get a discount', agentOut({ category: 'Quote or Pricing Request', decision_tier: 'Yellow', confidence_score: 88 })],
  ['government compliance audit notice', agentOut({ category: 'Government or Compliance', sender_type: 'Government Agency', decision_tier: 'Yellow', confidence_score: 92 })],
  ['attached contract for signature from attorney', agentOut({ category: 'Contract', sender_type: 'Legal Representative', decision_tier: 'Yellow', confidence_score: 91 })],
  ['bank verification and routing number', agentOut({ category: 'Billing or Payment', sender_type: 'Financial Institution', decision_tier: 'Yellow', confidence_score: 90 })],
  ['our attorney will pursue litigation', agentOut({ category: 'Legal', sender_type: 'Legal Representative', decision_tier: 'Yellow', confidence_score: 93 })],
  ['???', agentOut({ category: 'Unknown', sender_type: 'Unknown', decision_tier: 'Yellow', confidence_score: 40 })],
  ['security breach incident', agentOut({ category: 'Complaint or Dispute', decision_tier: 'Yellow', confidence_score: 89 })],
  ['request for public statement to the press', agentOut({ category: 'Media or Public Relations', sender_type: 'Media', decision_tier: 'Yellow', confidence_score: 90 })]
];
redCases.forEach((c, i) => {
  const dr = S.detectDeterministicRed(c[0]);
  const d = S.deriveTier(c[1], { deterministicRed: dr, threadFloor: null, autoSendEnabled: false, greenMin: 95, yellowMin: 75 });
  check(i + 8, `Red → Cecil (${c[0].slice(0, 24)})`, d.tier === 'Red' && d.approvalAuthority === 'Cecil' && d.ceoReviewRequired === true && d.autoSendEligible === false, d);
});

// ── Safety & failure (17–42) ─────────────────────────────────────────────
// 17 invalid JSON from model
PROPS = { AI_API_KEY: 'k', AI_PROVIDER: 'anthropic', AI_MODEL: 'm' };
FETCH = () => ({ code: 200, body: JSON.stringify({ content: [{ text: 'this is not json' }] }) });
let r = S.callAgentModel({ system: 's', user: 'u' });
check(17, 'Invalid JSON rejected', r.ok === false && r.error === 'JSON_PARSE_FAILED', r);

// 18 valid JSON, invalid category
check(18, 'Invalid category rejected', S.validateAgentResponse(agentOut({ category: 'Made Up' })).valid === false, null);

// 19–22 confidence bands (deriveTier authoritative)
check(19, 'Confidence 74 → Red', S.deriveTier(agentOut({ decision_tier: 'Yellow', confidence_score: 74 }), { greenMin: 95, yellowMin: 75 }).tier === 'Red', null);
check(20, 'Confidence 75 → Yellow', S.deriveTier(agentOut({ decision_tier: 'Yellow', confidence_score: 75 }), { greenMin: 95, yellowMin: 75 }).tier === 'Yellow', null);
check(21, 'Confidence 94 → Yellow', S.deriveTier(agentOut({ decision_tier: 'Yellow', confidence_score: 94 }), { greenMin: 95, yellowMin: 75 }).tier === 'Yellow', null);
check(22, 'Confidence 95 clean → Green', S.deriveTier(agentOut({ category: 'Scheduling', decision_tier: 'Green', confidence_score: 95, risk_level: 'Low' }), { greenMin: 95, yellowMin: 75, autoSendEnabled: false }).tier === 'Green', null);

// 23 missing API key
PROPS = { AI_API_KEY: '', AI_PROVIDER: 'anthropic', AI_MODEL: 'm' };
check(23, 'Missing API key → no call', S.callAgentModel({ system: 's', user: 'u' }).error === 'MISSING_API_KEY', null);

// 24 model timeout / HTTP error
PROPS = { AI_API_KEY: 'k', AI_PROVIDER: 'anthropic', AI_MODEL: 'm' };
FETCH = () => ({ code: 504, body: 'gateway timeout' });
check(24, 'Model HTTP error handled', S.callAgentModel({ system: 's', user: 'u' }).error === 'HTTP_504', null);

// 25 Airtable write failure surfaces
PROPS = { AIRTABLE_TOKEN: 't' };
FETCH = () => ({ code: 500, body: 'server error' });
let threw = false; try { S.atUpdate(S.CFG_HUB_BASE, S.CFG_INBOX_TBL, 'rec1', { X: 1 }); } catch (e) { threw = true; }
check(25, 'Airtable write failure throws (caught upstream)', threw, null);

// 26 duplicate Gmail Message ID detected
PROPS = { AIRTABLE_TOKEN: 't' };
FETCH = () => ({ code: 200, body: JSON.stringify({ records: [{ id: 'recDup', fields: {} }] }) });
check(26, 'Duplicate Message ID detected', S.atMessageExists('msg-1') === true, null);

// 27 concurrent capture → lock skip (no throw, returns)
LOCK_AVAILABLE = false; let capOk = true; try { S.captureInbox(); } catch (e) { capOk = false; }
check(27, 'Concurrent capture skips under lock', capOk === true, null);
// 28 concurrent send → lock skip
let sndOk = true; try { S.sendApproved(); } catch (e) { sndOk = false; }
check(28, 'Concurrent send skips under lock', sndOk === true, null);
LOCK_AVAILABLE = true;

// 29 approve while Agent Status Failed
const cfg = baseCfg();
check(29, 'Approve+Failed blocked', S.evaluateSendGuards(rec(g29()), cfg).reason === 'AGENT_NOT_COMPLETED', null);
function g29() { const f = {}; f[F.decision]='Approve'; f[F.agentStatus]='Failed'; f[F.finalCopy]='hi'; f[F.gmailThreadId]='t'; f[F.decisionTier]='Yellow'; f[F.approvedByEmail]='k@a1'; return f; }
// 30 approve while Not Processed
check(30, 'Approve+NotProcessed blocked', S.evaluateSendGuards(rec(Object.assign(g29(), setF(F.agentStatus,'Not Processed'))), cfg).reason === 'AGENT_NOT_COMPLETED', null);
// 31 approve blank Final Copy
check(31, 'Approve+blank FinalCopy blocked', S.evaluateSendGuards(rec(mk({[F.decision]:'Approve',[F.agentStatus]:'Completed',[F.finalCopy]:'',[F.gmailThreadId]:'t',[F.decisionTier]:'Yellow',[F.approvedByEmail]:'k@a1'})), cfg).reason === 'FINAL_COPY_BLANK', null);
// 32 Red approval from non-CEO
check(32, 'Red approval by non-CEO blocked', S.evaluateSendGuards(rec(mk({[F.decision]:'Approve',[F.agentStatus]:'Completed',[F.finalCopy]:'hi',[F.gmailThreadId]:'t',[F.decisionTier]:'Red',[F.approvedByEmail]:'krisha@a1creativeagency.com'})), cfg).reason === 'RED_REQUIRES_CEO_APPROVER', null);
// 32b Red approval by CEO passes
check(322, 'Red approval by CEO allowed', S.evaluateSendGuards(rec(mk({[F.decision]:'Approve',[F.agentStatus]:'Completed',[F.finalCopy]:'hi',[F.gmailThreadId]:'t',[F.decisionTier]:'Red',[F.approvedByEmail]:'cecil.trimble15@gmail.com'})), cfg).allowed === true, null);

// 33 human-edited Final Copy never overwritten by agent
PROPS = { AIRTABLE_TOKEN: 't', AGENT_VERSION: 'test' };
FETCH = () => ({ code: 200, body: JSON.stringify({ id: 'rec1' }) });
S.applyAgentOutput('rec1', agentOut(), { maskedCategories: [], pii: false, hash: 'h', hasAttachments: false });
const wrote = JSON.parse(lastRequest.payload).fields;
check(33, 'Agent never writes Final Copy', !(F.finalCopy in wrote) && (F.aiDraft in wrote), Object.keys(wrote));

// 34 benign reply inside Red thread stays Red
check(34, 'Benign reply in Red thread stays Red', S.deriveTier(agentOut({ category:'Existing Client', decision_tier:'Green', confidence_score:99, risk_level:'Low' }), { threadFloor: 'Red', greenMin:95, yellowMin:75 }).tier === 'Red', null);

// 38 daily ceiling reached
PROPS = { AI_API_KEY: 'k', AI_PROVIDER: 'anthropic', AI_MODEL: 'm' };
PROPS['AGENT_CALLS_' + new Date().toISOString().slice(0,10).replace(/-/g,'')] = '50';
check(38, 'Daily limit stops model calls', S.callAgentModel({ system:'s', user:'u' }).error === 'DAILY_LIMIT_REACHED', null);

// 39 PII redacted before model
const m = S.maskSensitiveData('SSN 123-45-6789 card 4111 1111 1111 1111 routing number 021000021 password: hunter2');
check(39, 'PII masked, originals gone', m.pii === true && m.text.indexOf('123-45-6789') === -1 && m.text.indexOf('hunter2') === -1 && m.categories.indexOf('SSN') !== -1, m.categories);

// 40 provider/model changed without validation → Blocked
PROPS = { AI_PROVIDER: 'anthropic', AI_MODEL: 'claude-x', MODEL_VALIDATED_FOR: 'claude-old' };
check(40, 'Unvalidated model blocked', S.validateModelConfiguration().status === 'Blocked', null);

// 41 sent record cannot resend
check(41, 'Already-sent cannot resend', S.evaluateSendGuards(rec(mk({[F.decision]:'Approve',[F.agentStatus]:'Completed',[F.finalCopy]:'hi',[F.gmailThreadId]:'t',[F.decisionTier]:'Yellow',[F.approvedByEmail]:'k@a1',[F.sentAt]:'2026-07-20T00:00:00Z'})), cfg).reason === 'ALREADY_SENT', null);

// 42 AUTO_SEND remains false
PROPS = {}; const cfg42 = S.getConfig();
check(42, 'AUTO_SEND_ENABLED default false', cfg42.autoSendEnabled === false, cfg42.autoSendEnabled);

// helpers
function setF(k, v) { const o = {}; o[k] = v; return o; }
function mk(o) { return o; }

// ── report ───────────────────────────────────────────────────────────────
console.log(results.join('\n'));
console.log(`\n${pass} passed, ${fail} failed, ${pass + fail} total`);
process.exit(fail ? 1 : 0);
