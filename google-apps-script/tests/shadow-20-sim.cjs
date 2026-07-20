/**
 * Shadow 20-email test — runs the canonical 20 emails through the REAL modules
 * (mask -> validate -> deriveTier -> send-guard). Live-model classification is the
 * owner step; here each email carries a representative model output so the DECISION
 * LOGIC and SAFETY are measured. Red items deliberately use an under-called model
 * tier (Yellow) to prove the deterministic Red backstop catches model misses.
 */
const fs = require('fs'), vm = require('vm'), path = require('path');
const GAS = path.join(__dirname, '..');
const FILES = ['agent-config.gs','security-redaction.gs','agent-validation.gs','agent-prompt.gs',
  'agent-routing.gs','agent-provider.gs','airtable-client.gs','automation-logging.gs',
  'approval-send.gs','agent-processing.gs','gmail-intake.gs','follow-up-processing.gs','trigger-management.gs'];
let PROPS = {}, FETCH = () => ({ code: 200, body: '{}' });
const S = { console,
  PropertiesService: { getScriptProperties: () => ({ getProperty: k => (k in PROPS ? PROPS[k] : null), setProperty: (k,v)=>{PROPS[k]=String(v)} }) },
  LockService: { getScriptLock: () => ({ tryLock: () => true, releaseLock(){} }) },
  UrlFetchApp: { fetch: (u,o) => { const r = FETCH(u,o); return { getResponseCode:()=>r.code, getContentText:()=>r.body }; } },
  Utilities: { getUuid:()=>'u', formatDate:()=>new Date().toISOString().slice(0,10).replace(/-/g,''),
    computeDigest:(a,s)=>{const o=[];for(let i=0;i<32;i++)o.push((s.charCodeAt(i%s.length)+i)&0xff);return o;}, DigestAlgorithm:{SHA_256:'x'} },
  GmailApp: {} };
vm.createContext(S);
FILES.forEach(f => vm.runInContext(fs.readFileSync(path.join(GAS,f),'utf8'), S, {filename:f}));

function out(o){return Object.assign({category:'New Lead',sender_type:'Prospect',summary:'s',response_required:true,
  urgency:'Normal',risk_level:'Low',opportunity_value:'Medium',recommended_owner:'Krisha',
  recommended_next_action:'x',decision_tier:'Yellow',confidence_score:85,draft_reply:'hi'},o);}

// id, raw text, simulated model output, expected final tier
const E = [
 [1,'Thanks, we received your documents. Confirming receipt.',out({category:'Document Submission',decision_tier:'Green',confidence_score:97}),'Green'],
 [2,'Are you open on Saturday? What are your office hours?',out({category:'Scheduling',decision_tier:'Green',confidence_score:96}),'Green'],
 [3,'Thanks for the intake form confirmation, all set.',out({category:'New Lead',decision_tier:'Green',confidence_score:96}),'Green'],
 [4,'Thank you so much, got it, appreciate it!',out({category:'Document Submission',decision_tier:'Green',confidence_score:98}),'Green'],
 [5,'I run a salon and want a website with online booking. Ballpark?',out({category:'New Lead',decision_tier:'Yellow',confidence_score:88}),'Yellow'],
 [6,'Can I get a status update on my project this week?',out({category:'Existing Client',sender_type:'Active Client',decision_tier:'Yellow',confidence_score:90}),'Yellow'],
 [7,'We should set up a partner meeting to explore working together.',out({category:'Partnership',sender_type:'Partner',decision_tier:'Yellow',confidence_score:85}),'Yellow'],
 [8,'Could you put together a quote for a 5-page website?',out({category:'Quote or Pricing Request',decision_tier:'Yellow',confidence_score:84}),'Yellow'],
 [9,'I need to reschedule our call, there is a conflict.',out({category:'Scheduling',sender_type:'Active Client',decision_tier:'Yellow',confidence_score:89}),'Yellow'],
 [10,'Please review the attached brand brief and let me know.',out({category:'Project Support',sender_type:'Active Client',decision_tier:'Yellow',confidence_score:83,attachment_review_required:true}),'Yellow'],
 [11,'I want a refund for last month, this did not work.',out({category:'Refund',decision_tier:'Yellow',confidence_score:90}),'Red'],
 [12,'Any discount available if I sign up for a year?',out({category:'Quote or Pricing Request',decision_tier:'Yellow',confidence_score:88}),'Red'],
 [13,'Attached is the contract and NDA for signature, from our attorney.',out({category:'Contract',sender_type:'Legal Representative',decision_tier:'Yellow',confidence_score:91}),'Red'],
 [14,'Your SAM.gov registration and federal compliance needs updating.',out({category:'Government or Compliance',sender_type:'Government Agency',decision_tier:'Yellow',confidence_score:92}),'Red'],
 [15,'Please complete the W-9 and confirm your bank routing number for tax.',out({category:'Billing or Payment',sender_type:'Financial Institution',decision_tier:'Yellow',confidence_score:90}),'Red'],
 [16,'Our attorney will pursue litigation and we are cancelling service.',out({category:'Legal',sender_type:'Legal Representative',decision_tier:'Yellow',confidence_score:93}),'Red'],
 [17,'Press request: we need a public statement for an interview.',out({category:'Media or Public Relations',sender_type:'Media',decision_tier:'Yellow',confidence_score:90}),'Red'],
 [18,'Here is my SSN 123-45-6789 and card 4111 1111 1111 1111 for the deposit.',out({category:'Billing or Payment',decision_tier:'Yellow',confidence_score:80,sensitive_content:true}),'Red'],
 [19,'asdf ??? not sure what this is about',out({category:'Unknown',sender_type:'Unknown',decision_tier:'Red',confidence_score:45}),'Red'],
 [20,'Thank you!',out({category:'Existing Client',sender_type:'Active Client',decision_tier:'Green',confidence_score:98}),'Red'] // inside Red thread
];

let pass=0, fail=0, corrected=0, sendsBlocked=0, piiOk=true; const rows=[];
const cfgShadow = { manualSendEnabled:false, autoSendEnabled:false, ceoApproverEmail:'cecil.trimble15@gmail.com',
  greenMinConfidence:95, yellowMinConfidence:75 };
const FLD = S.FLD;

E.forEach(e => {
  const [id, raw, model, expect] = e;
  const masked = S.maskSensitiveData(raw);
  const v = S.validateAgentResponse(model);
  const detRed = S.detectDeterministicRed(raw);
  const ctx = { deterministicRed: detRed, threadFloor: id===20?'Red':null,
    sensitive: masked.pii || model.sensitive_content===true, attachmentReview: !!model.attachment_review_required,
    autoSendEnabled:false, greenMin:95, yellowMin:75, validationFailed: !v.valid };
  const d = S.deriveTier(v.valid?model:null, ctx);
  if (model.decision_tier!=='Red' && d.tier==='Red') corrected++;
  const okTier = d.tier===expect;
  const okOwner = (expect==='Red'? d.approvalAuthority==='Cecil' : d.approvalAuthority==='Krisha');
  // shadow send guard: build an "approved" record and confirm it is BLOCKED (no send)
  const f={}; f[FLD.decision]='Approve'; f[FLD.agentStatus]='Completed'; f[FLD.finalCopy]='draft';
  f[FLD.gmailThreadId]='t'; f[FLD.decisionTier]=d.tier; f[FLD.approvedByEmail]='cecil.trimble15@gmail.com';
  const g = S.evaluateSendGuards({fields:f}, cfgShadow);
  if (!g.allowed && g.reason==='MANUAL_SEND_DISABLED') sendsBlocked++;
  if (id===18 && (!masked.pii || masked.text.indexOf('123-45-6789')!==-1 || masked.text.indexOf('4111 1111 1111 1111')!==-1)) piiOk=false;
  const ok = okTier && okOwner && !g.allowed;
  ok?pass++:fail++;
  rows.push(`#${String(id).padStart(2)}  model=${model.decision_tier.padEnd(6)} -> final=${d.tier.padEnd(6)} exp=${expect.padEnd(6)} ${okTier?'tier✓':'tier✗'} ${okOwner?'owner✓':'owner✗'} send=${g.allowed?'ALLOWED✗':'BLOCKED✓'}`);
});
console.log(rows.join('\n'));
console.log(`\nTier accuracy: ${E.filter((e,i)=>true).length? '' : ''}${pass}/20 emails fully correct`);
console.log(`Deterministic backstop corrected ${corrected} model under-calls to Red`);
console.log(`Sends blocked (shadow): ${sendsBlocked}/20   PII masked on #18: ${piiOk}`);
console.log(`\n${pass} passed, ${fail} failed, 20 total`);
process.exit(fail?1:0);
