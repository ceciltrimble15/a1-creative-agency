/**
 * ops-entity.gs — Module 01 ENTITY LOCK core.
 * Centralized operations (operations@a1creativeagency.com) with PERMANENTLY separated
 * business identities. Every message carries an ENTITY_ID as system data (not just a label).
 * Fail closed: unknown entity -> NEEDS REVIEW; missing send-from -> CONFIGURATION REQUIRED.
 *
 * The in-code registry MIRRORS the Airtable "Entity Registry" table (source of truth).
 * DO NOT FAKE a send-from identity: entities without a verified alias are marked
 * sendAsConfigured:false so the send guard blocks and routes to human setup.
 */

var ENTITY_REGISTRY = [
  { entityId: 'A1_CREATIVE', name: 'A1 Creative Agency', lane: 'A1 Creative',
    domains: ['a1creativeagency.com'],
    addresses: ['operations@a1creativeagency.com','cecil@a1creativeagency.com','inquiry@a1creativeagency.com'],
    approvedSendFrom: 'operations@a1creativeagency.com', sendAsConfigured: true },

  { entityId: 'A1_SUPPLIERS', name: 'A/1 Suppliers', lane: 'A/1 Suppliers',
    domains: ['a1suppliers.org'],
    addresses: ['info@a1suppliers.org','shuri@a1suppliers.org','cecil@a1suppliers.org'],
    approvedSendFrom: 'info@a1suppliers.org', sendAsConfigured: false }, // alias not yet verified

  { entityId: 'TBF_ENTERTAINMENT', name: 'TBF Entertainment', lane: 'TBF Entertainment',
    domains: [],                 // OWNER MUST SUPPLY real TBF domains/addresses (config required)
    addresses: [],
    approvedSendFrom: '', sendAsConfigured: false }
];

var ENTITY_NEEDS_REVIEW = { entityId: 'NEEDS_REVIEW', name: 'NEEDS REVIEW', lane: 'NEEDS REVIEW',
  approvedSendFrom: '', sendAsConfigured: false };

// Module 01 controlled vocabularies.
var OPS_CATEGORIES = ['Lead','Customer','Partnership','Grant','Donor','Vendor','Billing','Finance',
  'Legal','Government','Internal','Support','Appointment','Media','Publishing','School','Community',
  'Follow-Up','Spam','Unknown'];
var OPS_PRIORITIES = ['P1','P2','P3','P4'];
var OPS_STATUSES = ['NEW','TRIAGED','NEEDS REVIEW','ASSIGNED','IN PROGRESS','WAITING',
  'WAITING ON CECIL','WAITING ON OPERATOR','DRAFT READY','APPROVAL REQUIRED','RESPONDED',
  'FOLLOW-UP','CLOSED'];

// Sensitive actions that ALWAYS require a human (section 12).
var HUMAN_APPROVAL_ACTIONS = ['sign contract','accept terms','financial commitment','authorize payment',
  'refund above limit','sensitive legal response','file government document','change dns','change ownership',
  'delete account','cancel critical service','change banking','release confidential document',
  'executive commitment','change business architecture'];

/**
 * Resolve the owning entity from the ORIGINAL recipient address (not operations@).
 * Returns a locked entity descriptor + configuration status. Fail closed.
 */
function resolveEntity(originalTo) {
  var addr = String(originalTo || '').trim().toLowerCase();
  if (!addr) return lock_(ENTITY_NEEDS_REVIEW, true, 'No original recipient');
  var domain = addr.indexOf('@') !== -1 ? addr.split('@')[1] : '';

  for (var i = 0; i < ENTITY_REGISTRY.length; i++) {
    var e = ENTITY_REGISTRY[i];
    var byAddr = e.addresses.indexOf(addr) !== -1;
    var byDomain = domain && e.domains.indexOf(domain) !== -1;
    if (byAddr || byDomain) {
      var configReq = !e.sendAsConfigured || !e.approvedSendFrom;
      return lock_(e, false, configReq ? 'SEND-FROM CONFIGURATION REQUIRED' : null);
    }
  }
  return lock_(ENTITY_NEEDS_REVIEW, true, 'Unrecognized recipient — entity uncertain');
}

function lock_(e, needsReview, note) {
  return {
    entityId: e.entityId, entityName: e.name, businessLane: e.lane,
    approvedSendFrom: e.approvedSendFrom || '', sendAsConfigured: !!e.sendAsConfigured,
    needsReview: !!needsReview,
    sendFromConfigRequired: !e.approvedSendFrom || !e.sendAsConfigured,
    note: note || ''
  };
}

/**
 * Detect the ORIGINAL recipient from raw headers even after forwarding to operations@.
 * Header preference: Delivered-To (non-operations) > X-Original-To > X-Forwarded-To > To.
 * `headerText` is raw header text (msg.getRawContent()) or a joined header string.
 */
function detectOriginalRecipient(headerText) {
  var text = String(headerText || '');
  var ops = 'operations@a1creativeagency.com';
  var order = ['Delivered-To','X-Original-To','X-Forwarded-To','To','Cc'];
  for (var i = 0; i < order.length; i++) {
    var re = new RegExp('^' + order[i] + ':\\s*(.*)$', 'im');
    var m = re.exec(text);
    if (m) {
      var addrs = extractAddrs_(m[1]);
      for (var j = 0; j < addrs.length; j++) {
        if (addrs[j].toLowerCase() !== ops) return addrs[j]; // prefer the non-hub address
      }
      if (addrs.length && order[i] !== 'Delivered-To') return addrs[0];
    }
  }
  return ''; // unknown -> caller sets NEEDS REVIEW
}

function extractAddrs_(s) {
  var out = [], re = /[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}/g, m;
  while ((m = re.exec(String(s || '')))) out.push(m[0]);
  return out;
}

/**
 * Module 01 cross-entity RESPONSE IDENTITY PROTECTION (section 6 — non-negotiable).
 * Separate from evaluateSendGuards so the Phase 2A guard suite is unaffected.
 * A message may only be sent from its own entity's approved identity. Fail closed.
 * record.fields keyed by NAME. Returns { allowed, reason }.
 */
function evaluateEntityGuards(record) {
  var f = (record && record.fields) || {};
  function blank(v){ return v === undefined || v === null || String(v).trim() === ''; }
  var entity = String(f[FLD.entity] || '').trim();
  if (blank(entity) || entity === 'NEEDS REVIEW' || entity === 'NEEDS_REVIEW') return { allowed:false, reason:'ENTITY_NEEDS_REVIEW' };
  if (f[FLD.sendFromConfigRequired] === true || blank(f[FLD.approvedSendFrom])) return { allowed:false, reason:'SEND_FROM_CONFIGURATION_REQUIRED' };
  var approved = String(f[FLD.approvedSendFrom]).trim().toLowerCase();
  var sendFrom = String(f[FLD.sendFrom] || '').trim().toLowerCase();
  // sendFrom may be a label containing the address; require the approved address to appear in it.
  if (approved.indexOf('@') !== -1 && sendFrom.indexOf(approved) === -1) return { allowed:false, reason:'ENTITY_SEND_FROM_MISMATCH' };
  return { allowed:true, reason:'OK' };
}

/**
 * Recommend a P1–P4 priority (AI recommends; a human may override). Deterministic + testable.
 */
function recommendPriority(urgency, tier, category) {
  urgency = String(urgency || ''); tier = String(tier || ''); category = String(category || '');
  if (category === 'Spam') return 'P4';
  if (urgency === 'Critical') return 'P1';
  if (tier === 'Red' && (urgency === 'High' || urgency === 'Critical')) return 'P1';
  if (['Legal', 'Government', 'Finance'].indexOf(category) !== -1 && (urgency === 'High' || urgency === 'Critical')) return 'P1';
  if (urgency === 'High' || tier === 'Red') return 'P2';
  if (urgency === 'Low') return 'P4';
  return 'P3';
}

/** Map an entity lane to the existing Brand select value (backward compat with Phase 1/2A). */
function laneToBrand(lane) {
  if (lane === 'A1 Creative') return 'A1 Creative';
  if (lane === 'A/1 Suppliers') return 'A1 Suppliers';
  if (lane === 'TBF Entertainment') return 'TBF Entertainment';
  return 'Personal';
}
