/**
 * A1 Creative — Email Spine (Phase 1)
 * DIRECT architecture. No Make.com. No new platforms.
 *
 * Stack in use:
 *   Google Workspace / Gmail (operations@a1creativeagency.com)  ← this script is bound here
 *   Google Apps Script (native to Workspace — the direct connector)
 *   Airtable REST API (already the authorized Airtable connection)
 *
 * Flow:
 *   operations@ Gmail  →  captureInbox()  →  A1 Creative Agency Hub / Inbox Queue
 *                       →  (summary / priority / draft: Priority auto-set here;
 *                           AI Summary + Draft filled by the existing Claude step)
 *                       →  Cecil approval in Airtable (Approve / Edit / Reject)
 *                       →  sendApproved()  →  in-thread reply FROM operations@
 *                       →  Sent At + Follow-Up writeback
 *                       →  escalateToAcos()  →  ACOS 04 CEO Approval Queue (only when needed)
 *
 * Nothing auto-sends. sendApproved() only touches rows Cecil marked "Approve".
 *
 * ── SETUP ─────────────────────────────────────────────────────────────────
 * 1. Sign in to Google as operations@a1creativeagency.com → script.google.com → New project.
 * 2. Paste this file. Project Settings → Script properties → add:
 *      AIRTABLE_TOKEN   = <Airtable personal access token, scopes: data.records:read/write, schema.bases:read>
 * 3. Run installTriggers() once; approve the Gmail + external-request scopes.
 * 4. Apply the Gmail label "A1C/Intake" to messages you want captured
 *    (or change INTAKE_QUERY below). Captured threads get "A1C/Captured".
 */

// ── CONFIG ───────────────────────────────────────────────────────────────
var HUB_BASE   = 'appvfR20qp1dh5bT0';        // A1 Creative Agency Hub
var INBOX_TBL  = 'tblUFUnImwgHhHyqP';        // Inbox Queue
var ACOS_BASE  = 'appbJeQpEUFRV1Dim';        // A1 Colossal Operating System (ACOS)
var ACOS_APPRV = 'tblcgxEvHsyNQujL1';        // 04 – CEO Approval Queue

var MAILBOX    = 'operations@a1creativeagency.com';
var SEND_ALIAS = MAILBOX;                      // send FROM this mailbox only

// Which Gmail messages become intake rows. Label-driven = predictable + safe.
var INTAKE_QUERY   = 'label:A1C/Intake -label:A1C/Captured';
var LABEL_CAPTURED = 'A1C/Captured';
var FOLLOWUP_DAYS  = 3;                         // default next-touch if none set

// Inbox Queue field IDs (writes use field IDs so renames never break this).
var F = {
  subject:   'fldgR4R59HlzzeZE8',
  from:      'fldamXc4SRNDXljyW',
  brand:     'fld3guVnL7cwnPCL7',
  priority:  'fldBlJrkf69nJ5yaX',
  preview:   'fld9VWJxqrpRDWtJK',
  recAction: 'fldVFTEOmfzjzicsa',
  draft:     'fldLfR24jvaC24OHk',
  status:    'fldC4l802EkuLzYDt',
  receivedAt:'flds4SjtKIsxdKt53',
  summary:   'fldqohDB6p66wfigf',
  decision:  'fldc74yGeJKKXLlnx',
  finalCopy: 'fldnjMXUj83sWCEXK',
  sendFrom:  'fldhQQkksxGqYhqXT',
  sentAt:    'fldbaBOIu8eABtMgd',
  followUp:  'fldRewinbCeNVs0FU',
  acosRef:   'fldHGGJDRVZMmJLUt',
  threadId:  'fldLyb6ChOeVmF9r2'
};

// Select-option values (must match the base exactly).
var V = {
  brandA1:       'A1 Creative',
  sendMailbox:   'A1 Creative Mailbox (a1creativeagency.com)', // = operations@a1creativeagency.com
  statusPending: 'Pending Review',
  statusApproved:'Approved & Sent',
  statusEdited:  'Edited & Sent',
  statusDiscard: 'Discarded',
  prioUrgent:    'Urgent',
  prioReview:    'Review',
  prioFYI:       'FYI',
  decApprove:    'Approve',
  decEdit:       'Edit',
  decReject:     'Reject'
};

// ── AIRTABLE REST HELPERS ────────────────────────────────────────────────
function atToken_() {
  var t = PropertiesService.getScriptProperties().getProperty('AIRTABLE_TOKEN');
  if (!t) throw new Error('Missing Script Property AIRTABLE_TOKEN');
  return t;
}
function atUrl_(base, table, qs) {
  return 'https://api.airtable.com/v0/' + base + '/' + encodeURIComponent(table) + (qs ? '?' + qs : '');
}
function atGet_(base, table, qs) {
  var res = UrlFetchApp.fetch(atUrl_(base, table, qs), {
    method: 'get',
    headers: { Authorization: 'Bearer ' + atToken_() },
    muteHttpExceptions: true
  });
  if (res.getResponseCode() >= 300) throw new Error('Airtable GET ' + res.getResponseCode() + ': ' + res.getContentText());
  return JSON.parse(res.getContentText());
}
function atPost_(base, table, fieldsById) {
  var res = UrlFetchApp.fetch(atUrl_(base, table), {
    method: 'post',
    contentType: 'application/json',
    headers: { Authorization: 'Bearer ' + atToken_() },
    muteHttpExceptions: true,
    payload: JSON.stringify({ fields: fieldsById, typecast: true })
  });
  if (res.getResponseCode() >= 300) throw new Error('Airtable POST ' + res.getResponseCode() + ': ' + res.getContentText());
  return JSON.parse(res.getContentText());
}
function atPatch_(base, table, id, fieldsById) {
  var res = UrlFetchApp.fetch(atUrl_(base, table) + '/' + id, {
    method: 'patch',
    contentType: 'application/json',
    headers: { Authorization: 'Bearer ' + atToken_() },
    muteHttpExceptions: true,
    payload: JSON.stringify({ fields: fieldsById, typecast: true })
  });
  if (res.getResponseCode() >= 300) throw new Error('Airtable PATCH ' + res.getResponseCode() + ': ' + res.getContentText());
  return JSON.parse(res.getContentText());
}

// ── 1) CAPTURE: Gmail → Inbox Queue ──────────────────────────────────────
function captureInbox() {
  var threads = GmailApp.search(INTAKE_QUERY, 0, 25);
  if (!threads.length) return;
  var captured = getOrCreateLabel_(LABEL_CAPTURED);

  threads.forEach(function (thread) {
    try {
      var msg = thread.getMessages()[thread.getMessageCount() - 1]; // latest inbound
      var body = (msg.getPlainBody() || '').trim();
      var preview = body.length > 1500 ? body.substring(0, 1500) + '…' : body;

      var fields = {};
      fields[F.subject]    = thread.getFirstMessageSubject() || '(no subject)';
      fields[F.from]       = extractEmail_(msg.getFrom());
      fields[F.brand]      = V.brandA1;                 // Phase 1: A1 Creative lane only
      fields[F.priority]   = guessPriority_(fields[F.subject], body);
      fields[F.preview]    = preview;
      fields[F.receivedAt] = msg.getDate().toISOString();
      fields[F.status]     = V.statusPending;          // never auto-sends
      fields[F.sendFrom]   = V.sendMailbox;            // enforce single outbound mailbox
      fields[F.threadId]   = thread.getId();

      var rec = atPost_(HUB_BASE, INBOX_TBL, fields).id;

      // Escalate to ACOS only when needed (Urgent inbound).
      if (fields[F.priority] === V.prioUrgent) escalateOne_(rec, fields[F.subject], fields[F.from]);

      thread.addLabel(captured);
    } catch (e) {
      console.error('capture failed for thread ' + thread.getId() + ': ' + e);
    }
  });
}

// ── 2) SEND: approved rows → in-thread reply FROM operations@ ─────────────
function sendApproved() {
  var formula = "AND({Brand}='" + V.brandA1 + "', {Approve / Edit / Reject}='" + V.decApprove +
                "', {Sent At}='', NOT({Gmail Thread ID}=''))";
  var data = atGet_(HUB_BASE, INBOX_TBL, 'filterByFormula=' + encodeURIComponent(formula) + '&pageSize=25');

  (data.records || []).forEach(function (r) {
    try {
      var f = r.fields;
      var threadId = f['Gmail Thread ID'];
      var finalCopy = (f['Final Copy'] || '').trim();
      var draft = (f['Claude Draft'] || '').trim();
      var replyBody = finalCopy || draft;
      if (!replyBody) throw new Error('no Final Copy or Claude Draft to send');

      var thread = GmailApp.getThreadById(threadId);
      if (!thread) throw new Error('thread not found: ' + threadId);

      thread.replyAll(replyBody, { from: SEND_ALIAS });   // reply FROM operations@ only

      var patch = {};
      patch[F.status] = finalCopy ? V.statusEdited : V.statusApproved;
      patch[F.sentAt] = new Date().toISOString();
      if (!f['Follow-Up Date']) patch[F.followUp] = addDays_(new Date(), FOLLOWUP_DAYS);
      atPatch_(HUB_BASE, INBOX_TBL, r.id, patch);
    } catch (e) {
      console.error('send failed for ' + r.id + ': ' + e);
    }
  });
}

// ── 2b) REJECT housekeeping (no send) ────────────────────────────────────
function processRejects() {
  var formula = "AND({Approve / Edit / Reject}='" + V.decReject + "', NOT({Status}='" + V.statusDiscard + "'), {Sent At}='')";
  var data = atGet_(HUB_BASE, INBOX_TBL, 'filterByFormula=' + encodeURIComponent(formula) + '&pageSize=25');
  (data.records || []).forEach(function (r) {
    var patch = {}; patch[F.status] = V.statusDiscard;
    atPatch_(HUB_BASE, INBOX_TBL, r.id, patch);
  });
}

// ── 3) ESCALATE to ACOS command layer (only when needed) ─────────────────
function escalateOne_(inboxRecId, subject, from) {
  var fields = {
    'fldXoYXo9wJEm7kog': 'A1 Creative Email — URGENT: ' + subject,           // Approval Item
    'fldchftEhWWhlVPEP': 'Email Spine (Apps Script @ operations@)',           // Submitted By
    'fld5ZojquTvgpyKD1': 'Urgent inbound email from ' + from + '. Review draft in Inbox Queue → ' + inboxRecId + ' and Approve/Edit/Reject.',
    'fldqgcKynfCv8J1Yg': 'Triage now; reply is sent from operations@ only after CEO Approve.',
    'fldv4KgnnmvW2hLST': 'Pending',                                          // CEO Decision
    'fldRw8kImuCJQT7uR': 'Awaiting CEO',                                      // Final Status
    'fld1cn1suiFRqeeIl': 'A1 Creative Agency',                               // Company
    'fldX85BAPlOsLsFra': 'Inbox Queue ' + HUB_BASE + '/' + INBOX_TBL + '/' + inboxRecId
  };
  try {
    var acosId = atPost_(ACOS_BASE, ACOS_APPRV, fields).id;
    var back = {}; back[F.acosRef] = 'ACOS 04 – CEO Approval Queue: ' + acosId;
    atPatch_(HUB_BASE, INBOX_TBL, inboxRecId, back);
  } catch (e) {
    console.error('escalation failed for ' + inboxRecId + ': ' + e);
  }
}

// ── HELPERS ──────────────────────────────────────────────────────────────
function guessPriority_(subject, body) {
  var t = ((subject || '') + ' ' + (body || '')).toLowerCase();
  if (/\b(urgent|asap|emergency|immediately|today|deadline|angry|refund|complaint)\b/.test(t)) return V.prioUrgent;
  if (/\b(unsubscribe|newsletter|receipt|no-reply|noreply)\b/.test(t)) return V.prioFYI;
  return V.prioReview;
}
function extractEmail_(from) {
  var m = /<([^>]+)>/.exec(from || '');
  return m ? m[1] : (from || '').trim();
}
function addDays_(d, n) {
  var x = new Date(d.getTime()); x.setDate(x.getDate() + n);
  return Utilities.formatDate(x, Session.getScriptTimeZone(), 'yyyy-MM-dd');
}
function getOrCreateLabel_(name) {
  return GmailApp.getUserLabelByName(name) || GmailApp.createLabel(name);
}

// ── TRIGGERS ─────────────────────────────────────────────────────────────
function installTriggers() {
  ScriptApp.getProjectTriggers().forEach(function (t) { ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('captureInbox').timeBased().everyMinutes(10).create();
  ScriptApp.newTrigger('sendApproved').timeBased().everyMinutes(10).create();
  ScriptApp.newTrigger('processRejects').timeBased().everyMinutes(30).create();
  console.log('Triggers installed: captureInbox/10m, sendApproved/10m, processRejects/30m');
}
