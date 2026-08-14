/**
 * ops-daily-report.gs — Module 01 A1 OPERATIONS DAILY REPORT.
 * buildDailyOpsReport(records, dateStr) is pure (testable). generateDailyOpsReport()
 * reads Airtable and writes the report to the Agent Activity Log (no sending).
 */

/** records: array of {fields:{...by NAME}}. Returns the structured daily report. */
function buildDailyOpsReport(records, dateStr) {
  records = records || [];
  var r = {
    date: dateStr || '',
    inbox: { new: 0, processed: 0, closed: 0, open: 0 },
    priority: { P1: 0, P2: 0, P3: 0, P4: 0 },
    lanes: { 'A1 Creative': 0, 'A/1 Suppliers': 0, 'TBF Entertainment': 0, Other: 0 },
    pipeline: { 'New Leads': 0, 'Customer Issues': 0, Partnerships: 0, Grants: 0, Billing: 0, Legal: 0, 'Follow-Ups': 0 },
    people: { 'Waiting On Cecil': 0, 'Waiting On Krisha/Cretia': 0, 'Waiting On External Party': 0 },
    ceoDecisions: [], top5: []
  };
  var openScored = [];

  records.forEach(function (rec) {
    var f = rec.fields || {};
    var status = String(f[FLD.opsStatus] || f[FLD.status] || '').toUpperCase();
    var prio = String(f[FLD.opsPriority] || '').toUpperCase();
    var lane = String(f[FLD.businessLane] || '');
    var cat = String(f[FLD.opsCategory] || f[FLD.messageCategory] || '');

    if (status === 'NEW') r.inbox.new++;
    if (status === 'CLOSED') r.inbox.closed++; else r.inbox.open++;
    if (status !== 'NEW' && status !== 'CLOSED') r.inbox.processed++;

    if (r.priority[prio] !== undefined) r.priority[prio]++;
    if (r.lanes[lane] !== undefined) r.lanes[lane]++; else r.lanes.Other++;

    if (cat === 'Lead') r.pipeline['New Leads']++;
    else if (cat === 'Customer' || cat === 'Support') r.pipeline['Customer Issues']++;
    else if (cat === 'Partnership') r.pipeline.Partnerships++;
    else if (cat === 'Grant' || cat === 'Donor') r.pipeline.Grants++;
    else if (cat === 'Billing' || cat === 'Finance') r.pipeline.Billing++;
    else if (cat === 'Legal' || cat === 'Government') r.pipeline.Legal++;
    if (cat === 'Follow-Up' || String(f[FLD.followUpStatus] || '') === 'Overdue') r.pipeline['Follow-Ups']++;

    if (status === 'WAITING ON CECIL') r.people['Waiting On Cecil']++;
    else if (status === 'WAITING ON OPERATOR') r.people['Waiting On Krisha/Cretia']++;
    else if (status === 'WAITING') r.people['Waiting On External Party']++;

    if (f[FLD.ceoReviewRequired] === true || f[FLD.decisionTier] === 'Red' || status === 'APPROVAL REQUIRED') {
      r.ceoDecisions.push(short_(f));
    }
    if (status !== 'CLOSED') openScored.push({ rank: prioRank_(prio), label: short_(f) });
  });

  openScored.sort(function (a, b) { return a.rank - b.rank; });
  r.top5 = openScored.slice(0, 5).map(function (x) { return x.label; });
  r.ceoDecisions = r.ceoDecisions.slice(0, 20);
  return r;
}

function prioRank_(p) { return p === 'P1' ? 0 : p === 'P2' ? 1 : p === 'P3' ? 2 : p === 'P4' ? 3 : 4; }
function short_(f) {
  return (f[FLD.opsPriority] ? f[FLD.opsPriority] + ' · ' : '') +
    (f[FLD.businessLane] ? f[FLD.businessLane] + ' · ' : '') +
    (f[FLD.subject] || '(no subject)');
}

/** Render the report object to plain text (for the log / email later). */
function renderDailyOpsReport(r) {
  var L = [];
  L.push('A1 OPERATIONS DAILY REPORT — ' + r.date);
  L.push('INBOX  New:' + r.inbox.new + '  Processed:' + r.inbox.processed + '  Closed:' + r.inbox.closed + '  Open:' + r.inbox.open);
  L.push('PRIORITY  P1:' + r.priority.P1 + '  P2:' + r.priority.P2 + '  P3:' + r.priority.P3 + '  P4:' + r.priority.P4);
  L.push('LANES  A1 Creative:' + r.lanes['A1 Creative'] + '  A/1 Suppliers:' + r.lanes['A/1 Suppliers'] +
    '  TBF:' + r.lanes['TBF Entertainment'] + '  Other:' + r.lanes.Other);
  L.push('CEO DECISIONS NEEDED: ' + (r.ceoDecisions.length ? r.ceoDecisions.join(' | ') : 'none'));
  L.push('TOP 5 NEXT ACTIONS: ' + (r.top5.length ? r.top5.join(' | ') : 'none'));
  return L.join('\n');
}

/** Scheduled/owner-run: build today's report from Airtable and log it. Never sends. */
function generateDailyOpsReport() {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) { logAgentAction({ action: 'RUN_SKIPPED_LOCKED', functionName: 'generateDailyOpsReport' }); return; }
  try {
    var recs = atSelect(CFG_HUB_BASE, CFG_INBOX_TBL, '', 200);
    var report = buildDailyOpsReport(recs.map(function (x) { return { fields: x.fields }; }),
      new Date().toISOString().slice(0, 10));
    logAgentAction({ action: 'DAILY_OPS_REPORT', functionName: 'generateDailyOpsReport',
      result: 'ok', count: recs.length, reason: 'P1=' + report.priority.P1 + ' open=' + report.inbox.open });
    return report;
  } finally { lock.releaseLock(); }
}
