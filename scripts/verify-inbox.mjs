/* Live Airtable verification for the Inbox_Events front door (Phase 2).

   Run this in an environment that HAS egress to api.airtable.com (local or
   Vercel). It proves, against the real base:
     1. Required tables exist
     2. Inbox_Events live write
     3. Duplicate prevention (same source_event_id → one row)
     4. Brand routing writes the correct brand value
     5. Failed dedup lookup creates NO record (fail-safe)
     6. Rollback: INBOX_ENABLED off keeps the layer dormant

   Security: credentials are read ONLY from environment variables and are never
   printed. The script creates clearly-marked test rows and deletes them in a
   finally block. Exits non-zero if any check fails.

   Required env vars (names only — set the values yourself):
     AIRTABLE_API_KEY   Airtable Personal Access Token (data read+write)
     AIRTABLE_BASE_ID   target base id (appXXXXXXXX)
   Optional table-name overrides (defaults shown):
     AIRTABLE_EVENTS_TABLE=Inbox_Events
     AIRTABLE_LEADS_TABLE=Leads
     AIRTABLE_TASKS_TABLE=Tasks
     AIRTABLE_ESCALATIONS_TABLE=Escalations
     AIRTABLE_REPORTS_TABLE=Daily_Reports
*/

import { ingestEvent, inboxEnabled } from '../api/_lib/inbox.js';
import { findEventBySourceId } from '../api/_lib/airtable.js';
import { BRANDS } from '../api/_lib/brand.js';

const EVENTS = process.env.AIRTABLE_EVENTS_TABLE || 'Inbox_Events';
const TABLES = {
  events: EVENTS,
  leads: process.env.AIRTABLE_LEADS_TABLE || 'Leads',
  tasks: process.env.AIRTABLE_TASKS_TABLE || 'Tasks',
  escalations: process.env.AIRTABLE_ESCALATIONS_TABLE || 'Escalations',
  reports: process.env.AIRTABLE_REPORTS_TABLE || 'Daily_Reports',
};

const results = [];
const createdRecordIds = []; // { table, id } for cleanup
const pass = (n, d = '') => results.push({ ok: true, n, d });
const fail = (n, d = '') => results.push({ ok: false, n, d });

function requireCreds() {
  const missing = ['AIRTABLE_API_KEY', 'AIRTABLE_BASE_ID'].filter((v) => !process.env[v]);
  if (missing.length) {
    console.error(`\nMissing required env vars: ${missing.join(', ')}`);
    console.error('Set them (values are never printed) and re-run. Aborting.\n');
    process.exit(2);
  }
}

// Minimal Airtable REST client — local to this script (never prints the key).
async function at(method, table, suffix = '', body) {
  const baseId = process.env.AIRTABLE_BASE_ID;
  let url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(table)}`;
  if (suffix.startsWith('?')) url += suffix;
  else if (suffix) url += `/${suffix}`;
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try { data = await res.json(); } catch { /* empty body (e.g. DELETE) */ }
  return { status: res.status, ok: res.ok, data };
}

function fitem(value) {
  return `"${String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

async function rowsBySourceId(table, id) {
  const r = await at('GET', table, `?maxRecords=10&filterByFormula=${encodeURIComponent(`{source_event_id} = ${fitem(id)}`)}`);
  return r.ok ? (r.data.records || []) : null;
}

async function probeEgress() {
  try {
    const r = await at('GET', TABLES.events, '?maxRecords=1');
    if (r.status === 403) {
      console.error('\nReceived 403 reaching api.airtable.com. This usually means the');
      console.error('environment blocks egress, or the token lacks access to the base.');
      console.error('Run this where api.airtable.com is reachable. Aborting.\n');
      process.exit(3);
    }
  } catch (err) {
    console.error(`\nCould not reach api.airtable.com (${err.message}). Aborting.\n`);
    process.exit(3);
  }
}

const uniq = () => `verify_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

async function run() {
  requireCreds();
  await probeEgress();

  // ── TEST 1: required tables exist ──────────────────────────────────────
  for (const [label, name] of Object.entries(TABLES)) {
    const r = await at('GET', name, '?maxRecords=1');
    if (r.ok) pass(`Table exists: ${name}`);
    else fail(`Table exists: ${name}`, `status ${r.status} (${r.data?.error?.type || 'not found'})`);
  }

  // ── TEST 2: Inbox_Events live write ────────────────────────────────────
  const idSuppliers = uniq();
  const write = await ingestEvent({
    sourceEventId: idSuppliers,
    eventType: 'Form',
    sourcePlatform: 'Manual',
    brandSignals: { originHost: 'a1suppliers.org' },
    contact: { name: 'VERIFY TEST (safe to delete)', email: 'verify@example.com', phone: '5135550000' },
    message: 'verification live write',
  });
  if (write.ok && !write.deduped && write.id) {
    createdRecordIds.push({ table: EVENTS, id: write.id });
    pass('Live write created an Inbox_Events row');
  } else {
    fail('Live write created an Inbox_Events row', JSON.stringify(write));
  }

  // ── TEST 3: duplicate prevention ───────────────────────────────────────
  const dup = await ingestEvent({
    sourceEventId: idSuppliers,
    eventType: 'Form',
    sourcePlatform: 'Manual',
    brandSignals: { originHost: 'a1suppliers.org' },
    contact: { name: 'VERIFY TEST duplicate', email: 'verify@example.com', phone: '5135550000' },
    message: 'verification duplicate attempt',
  });
  const rows = await rowsBySourceId(EVENTS, idSuppliers);
  if (dup.ok && dup.deduped === true && dup.id === write.id && rows && rows.length === 1) {
    pass('Duplicate prevented (deduped, exactly one row)');
  } else {
    fail('Duplicate prevented (deduped, exactly one row)', `deduped=${dup.deduped} sameId=${dup.id === write.id} rowCount=${rows ? rows.length : 'n/a'}`);
  }

  // ── TEST 4: brand routing writes correct value ─────────────────────────
  const suppliersRow = rows && rows[0];
  if (suppliersRow && suppliersRow.fields.brand === BRANDS.SUPPLIERS) {
    pass(`Brand routed A/1 Suppliers (origin a1suppliers.org)`);
  } else {
    fail('Brand routed A/1 Suppliers (origin a1suppliers.org)', `stored brand=${suppliersRow?.fields?.brand}`);
  }

  const idA1 = uniq();
  const a1 = await ingestEvent({
    sourceEventId: idA1,
    eventType: 'Call',
    sourcePlatform: 'Twilio',
    brandSignals: { toPhone: '+15134403329' },
    contact: { name: 'VERIFY TEST (safe to delete)', phone: '5135550001' },
    message: 'verification brand A1',
  });
  if (a1.ok && a1.id) createdRecordIds.push({ table: EVENTS, id: a1.id });
  const a1rows = await rowsBySourceId(EVENTS, idA1);
  if (a1.brand === BRANDS.A1 && a1rows && a1rows[0]?.fields.brand === BRANDS.A1) {
    pass('Brand routed A1 Creative (phone +15134403329)');
  } else {
    fail('Brand routed A1 Creative (phone +15134403329)', `return=${a1.brand} stored=${a1rows?.[0]?.fields?.brand}`);
  }

  // ── TEST 5: failed lookup creates NO record (fail-safe) ────────────────
  const sentinel = uniq();
  const savedKey = process.env.AIRTABLE_API_KEY;
  process.env.AIRTABLE_API_KEY = ''; // force the dedup lookup to fail
  const failsafe = await ingestEvent({
    sourceEventId: sentinel,
    eventType: 'Form',
    sourcePlatform: 'Manual',
    brandSignals: { originHost: 'a1creativeagency.com' },
    contact: { name: 'VERIFY TEST should-not-exist' },
    message: 'verification failed-lookup',
  });
  process.env.AIRTABLE_API_KEY = savedKey; // restore before reading back
  const lookedBackAfterFail = await findEventBySourceId(sentinel);
  const noRowAfterFail = lookedBackAfterFail.ok && lookedBackAfterFail.record === null;
  if (failsafe.ok === false && /dedup check failed/.test(failsafe.error || '') && noRowAfterFail) {
    pass('Failed lookup created NO record (returned at dedup gate)');
  } else {
    fail('Failed lookup created NO record (returned at dedup gate)', `ret=${JSON.stringify(failsafe)} rowExists=${!noRowAfterFail}`);
  }

  // ── TEST 6: rollback — INBOX_ENABLED off keeps layer dormant ───────────
  const savedFlag = process.env.INBOX_ENABLED;
  delete process.env.INBOX_ENABLED;
  const offDefault = inboxEnabled() === false;
  process.env.INBOX_ENABLED = 'false';
  const offExplicit = inboxEnabled() === false;
  process.env.INBOX_ENABLED = '1';
  const on = inboxEnabled() === true;
  if (savedFlag === undefined) delete process.env.INBOX_ENABLED;
  else process.env.INBOX_ENABLED = savedFlag;
  if (offDefault && offExplicit && on) {
    pass('Rollback flag works (off by default and when "false"; on only when set)');
  } else {
    fail('Rollback flag works', `default=${offDefault} explicitOff=${offExplicit} on=${on}`);
  }
}

async function cleanup() {
  for (const { table, id } of createdRecordIds) {
    try {
      const r = await at('DELETE', table, id);
      if (!r.ok) console.error(`  cleanup: failed to delete ${table}/${id} (status ${r.status})`);
    } catch (err) {
      console.error(`  cleanup: error deleting ${table}/${id}: ${err.message}`);
    }
  }
}

(async () => {
  let crashed = false;
  try {
    await run();
  } catch (err) {
    crashed = true;
    fail('Harness completed without throwing', err.message);
  } finally {
    if (createdRecordIds.length) {
      console.log('\nCleaning up test rows...');
      await cleanup();
    }
  }

  console.log('\n── Inbox_Events live verification ──');
  for (const r of results) {
    console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.n}${r.d ? `  — ${r.d}` : ''}`);
  }
  const failed = results.filter((r) => !r.ok).length;
  console.log(`\n${results.length - failed} passed, ${failed} failed`);
  process.exit(failed || crashed ? 1 : 0);
})();
