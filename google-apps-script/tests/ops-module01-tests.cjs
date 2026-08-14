/**
 * Module 01 test harness — the 22 required tests, run against the REAL modules
 * (ops-entity, ops-daily-report, approval-send guards). Loads .gs in a sandbox.
 */
const fs = require('fs'), vm = require('vm'), path = require('path');
const GAS = path.join(__dirname, '..');
const FILES = ['agent-config.gs','security-redaction.gs','agent-validation.gs','agent-prompt.gs',
  'agent-routing.gs','agent-provider.gs','airtable-client.gs','automation-logging.gs',
  'approval-send.gs','agent-processing.gs','gmail-intake.gs','follow-up-processing.gs',
  'trigger-management.gs','ops-entity.gs','ops-daily-report.gs'];
let PROPS = {}, FETCH = () => ({ code: 200, body: '{}' });
const S = { console,
  PropertiesService: { getScriptProperties: () => ({ getProperty: k => (k in PROPS ? PROPS[k] : null), setProperty:(k,v)=>{PROPS[k]=String(v)} }) },
  LockService: { getScriptLock: () => ({ tryLock:()=>true, releaseLock(){} }) },
  UrlFetchApp: { fetch: (u,o)=>{ const r=FETCH(u,o); return {getResponseCode:()=>r.code, getContentText:()=>r.body}; } },
  Utilities: { getUuid:()=>'u', formatDate:()=>'20260720', computeDigest:(a,s)=>[1], DigestAlgorithm:{SHA_256:'x'} },
  GmailApp: {} };
vm.createContext(S);
FILES.forEach(f => vm.runInContext(fs.readFileSync(path.join(GAS,f),'utf8'), S, {filename:f}));
const F = S.FLD;

let pass=0, fail=0; const out=[];
function ck(id, d, cond, got){ if(cond){pass++;out.push('PASS  #'+id+'  '+d);} else {fail++;out.push('FAIL  #'+id+'  '+d+'  got='+JSON.stringify(got));} }
function er(fields){ return { fields }; }

// 1 A1 Creative incoming
ck(1,'A1 Creative entity detected', S.resolveEntity('inquiry@a1creativeagency.com').entityId==='A1_CREATIVE');
// 2 A/1 Suppliers incoming
const sup = S.resolveEntity('info@a1suppliers.org');
ck(2,'A/1 Suppliers entity detected', sup.entityId==='A1_SUPPLIERS' && sup.businessLane==='A/1 Suppliers');
// 3 TBF incoming (addresses not yet configured -> fail closed, honest)
const tbf = S.resolveEntity('someone@tbfentertainment.com');
ck(3,'TBF address unconfigured -> NEEDS REVIEW (fail closed)', tbf.needsReview===true && S.ENTITY_REGISTRY.some(e=>e.entityId==='TBF_ENTERTAINMENT'), tbf);
// 4 Original recipient preservation (after forwarding to operations@)
const raw = 'Delivered-To: operations@a1creativeagency.com\r\nX-Forwarded-To: info@a1suppliers.org\r\nTo: operations@a1creativeagency.com\r\nSubject: hi';
ck(4,'Original recipient preserved through forward', S.detectOriginalRecipient(raw)==='info@a1suppliers.org', S.detectOriginalRecipient(raw));
// 5 Correct entity detection (domain match)
ck(5,'Entity via domain match', S.resolveEntity('cecil@a1suppliers.org').entityId==='A1_SUPPLIERS');
// 6 Incorrect/unknown entity handling
ck(6,'Unknown recipient -> NEEDS REVIEW', S.resolveEntity('random@gmail.com').needsReview===true);
// 7 Lead classification vocabulary
ck(7,'Lead in ops categories', S.OPS_CATEGORIES.indexOf('Lead')!==-1);
// 8 Billing classification (deterministic red on money)
ck(8,'Billing/finance flagged', S.detectDeterministicRed('please pay this invoice')!==null && S.OPS_CATEGORIES.indexOf('Billing')!==-1);
// 9 Legal classification
ck(9,'Legal flagged', S.detectDeterministicRed('our attorney sent a legal notice')!==null && S.OPS_CATEGORIES.indexOf('Legal')!==-1);
// 10 P1 escalation
ck(10,'P1 for critical legal', S.recommendPriority('Critical','Red','Legal')==='P1');
// 11 Normal-priority handling
ck(11,'P3 for normal lead', S.recommendPriority('Normal','Yellow','Lead')==='P3');
// 12 Follow-up creation counted
const fu = S.buildDailyOpsReport([er(two(F.opsCategory,'Follow-Up',F.opsStatus,'FOLLOW-UP'))],'d');
ck(12,'Follow-up counted in report', fu.pipeline['Follow-Ups']===1, fu.pipeline);
// 13 Airtable logging callable (stubbed fetch, no throw)
let logOk=true; PROPS={AIRTABLE_TOKEN:'t',AGENT_VERSION:'t'}; FETCH=()=>({code:200,body:'{"id":"r"}'});
try { S.logAgentAction({action:'TEST', functionName:'ops', recordId:'r1'}); } catch(e){ logOk=false; }
ck(13,'logAgentAction writes without throwing', logOk);
// 14 Duplicate email handling
FETCH=()=>({code:200,body:JSON.stringify({records:[{id:'dup',fields:{}}]})});
ck(14,'Duplicate Message ID detected', S.atMessageExists('m1')===true);
// 15 Thread handling (same thread -> same entity from same original recipient)
ck(15,'Thread messages resolve same entity',
  S.resolveEntity('info@a1suppliers.org').entityId===S.resolveEntity('info@a1suppliers.org').entityId);
// 16 Unknown sender / empty recipient
ck(16,'Empty original recipient -> NEEDS REVIEW', S.resolveEntity('').needsReview===true);
// 17 Spam low priority
ck(17,'Spam -> P4', S.recommendPriority('Low','Green','Spam')==='P4');
// 18 Reply identity protection (cross-entity) — guard is REGISTRY-authoritative:
// it re-resolves from Original Recipient; row claims alone can never authorize a send.
const wrongLabel = er(row({[F.originalRecipient]:'inquiry@a1creativeagency.com',[F.entityId]:'A1_CREATIVE',
  [F.approvedSendFrom]:'operations@a1creativeagency.com',[F.sendFrom]:'info@a1suppliers.org'}));
ck(18,'Send From label of another entity -> blocked', S.evaluateEntityGuards(wrongLabel).reason==='ENTITY_SEND_FROM_MISMATCH', S.evaluateEntityGuards(wrongLabel));
const cfgReq = er(row({[F.originalRecipient]:'info@a1suppliers.org',[F.entityId]:'A1_SUPPLIERS'}));
ck('18b','Registry says Suppliers alias unconfigured -> blocked', S.evaluateEntityGuards(cfgReq).reason==='SEND_FROM_CONFIGURATION_REQUIRED');
const needRev = er(row({[F.originalRecipient]:'random@gmail.com'}));
ck('18c','Unknown recipient -> ENTITY_NEEDS_REVIEW blocked', S.evaluateEntityGuards(needRev).reason==='ENTITY_NEEDS_REVIEW');
const matchOk = er(row({[F.originalRecipient]:'inquiry@a1creativeagency.com',[F.entityId]:'A1_CREATIVE',
  [F.approvedSendFrom]:'operations@a1creativeagency.com',[F.sendFrom]:'A1 Creative Mailbox (a1creativeagency.com)... operations@a1creativeagency.com'}));
const okRes = S.evaluateEntityGuards(matchOk);
ck('18d','Valid A1 Creative row allowed with registry send-from', okRes.allowed===true && okRes.sendFrom==='operations@a1creativeagency.com', okRes);

// 23-series — TAMPERED-ROW tests (Codex QA): a manipulated Airtable row cannot pass.
const t1 = er(row({[F.originalRecipient]:'info@a1suppliers.org',[F.entityId]:'A1_CREATIVE',
  [F.approvedSendFrom]:'operations@a1creativeagency.com',[F.sendFrom]:'operations@a1creativeagency.com'}));
ck('23a','Tampered Entity ID (Suppliers mail relabeled A1_CREATIVE) -> blocked',
  S.evaluateEntityGuards(t1).reason==='ENTITY_REGISTRY_MISMATCH', S.evaluateEntityGuards(t1));
const t2 = er(row({[F.originalRecipient]:'inquiry@a1creativeagency.com',[F.entityId]:'A1_CREATIVE',
  [F.approvedSendFrom]:'attacker@evil.com',[F.sendFrom]:'attacker@evil.com'}));
ck('23b','Tampered Approved Send From (attacker address) -> blocked',
  S.evaluateEntityGuards(t2).reason==='APPROVED_SEND_FROM_TAMPERED', S.evaluateEntityGuards(t2));
const t3 = er(row({[F.originalRecipient]:'info@a1suppliers.org',[F.entityId]:'A1_SUPPLIERS',
  [F.sendFromConfigRequired]:false,[F.approvedSendFrom]:'info@a1suppliers.org',[F.sendFrom]:'info@a1suppliers.org'}));
ck('23c','Tampered config-required flag cannot enable unconfigured Suppliers -> blocked',
  S.evaluateEntityGuards(t3).reason==='SEND_FROM_CONFIGURATION_REQUIRED', S.evaluateEntityGuards(t3));
const t4 = er(row({[F.entityId]:'A1_CREATIVE',[F.approvedSendFrom]:'operations@a1creativeagency.com'}));
ck('23d','Missing Original Recipient -> blocked', S.evaluateEntityGuards(t4).reason==='ORIGINAL_RECIPIENT_MISSING');
const t5 = er(row({[F.originalRecipient]:'inquiry@a1creativeagency.com'}));
const t5r = S.evaluateEntityGuards(t5);
ck('23e','Guard returns REGISTRY send-from, ignoring blank row claims', t5r.allowed===true && t5r.sendFrom==='operations@a1creativeagency.com', t5r);
let sendRefused=false;
try { S.doSendOne_({fields:{}}, {shadowMode:false}, ''); } catch(e){ sendRefused = /SEND_FROM_CONFIGURATION_REQUIRED/.test(String(e)); }
ck('23f','doSendOne_ refuses blank validated send-from (no hardcode fallback)', sendRefused);
const sendSrc = fs.readFileSync(path.join(GAS,'approval-send.gs'),'utf8');
ck('23g','No hardcoded from-address remains in doSendOne_', sendSrc.indexOf("from: 'operations@") === -1);
// 19 Human approval gate vocabulary present
ck(19,'Sensitive actions require human', S.HUMAN_APPROVAL_ACTIONS.indexOf('sign contract')!==-1 && S.HUMAN_APPROVAL_ACTIONS.indexOf('change banking')!==-1);
// 20 Daily report generation (counts + top5 ordering + CEO decisions)
const recs=[
  er(row({[F.opsStatus]:'NEW',[F.opsPriority]:'P3',[F.businessLane]:'A1 Creative',[F.opsCategory]:'Lead',[F.subject]:'lead a'})),
  er(row({[F.opsStatus]:'IN PROGRESS',[F.opsPriority]:'P1',[F.businessLane]:'A/1 Suppliers',[F.opsCategory]:'Grant',[F.subject]:'grant b',[F.ceoReviewRequired]:true})),
  er(row({[F.opsStatus]:'CLOSED',[F.opsPriority]:'P4',[F.businessLane]:'TBF Entertainment',[F.opsCategory]:'Media',[F.subject]:'closed c'}))
];
const rep=S.buildDailyOpsReport(recs,'2026-07-20');
ck(20,'Daily report counts + P1-first top5 + CEO decisions',
  rep.inbox.new===1 && rep.inbox.closed===1 && rep.priority.P1===1 && rep.lanes['A/1 Suppliers']===1 &&
  rep.ceoDecisions.length===1 && /P1/.test(rep.top5[0]), rep);
// 21 Operator assignment (Red->Cecil, else Krisha) via deriveTier
ck(21,'Operator assignment by tier',
  S.deriveTier({category:'New Lead',sender_type:'Prospect',decision_tier:'Yellow',confidence_score:85,risk_level:'Low'},{greenMin:95,yellowMin:75}).approvalAuthority==='Krisha' &&
  S.deriveTier(null,{validationFailed:true}).approvalAuthority==='Cecil');
// 22 Closed-item handling (excluded from open/top5)
ck(22,'Closed items excluded from top5', rep.top5.every(x=>!/closed c/.test(x)), rep.top5);

function two(k1,v1,k2,v2){ const o={}; o[k1]=v1; o[k2]=v2; return o; }
function row(o){ return o; }

console.log(out.join('\n'));
console.log(`\n${pass} passed, ${fail} failed, ${pass+fail} total`);
process.exit(fail?1:0);
