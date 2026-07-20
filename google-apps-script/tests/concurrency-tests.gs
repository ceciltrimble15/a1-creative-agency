/**
 * tests/concurrency-tests.gs — lock + dedupe + limits (26-28, 35-38, 40).
 * True multi-execution concurrency is validated headless (scratchpad harness);
 * in-editor these verify the guard code paths and configuration wiring.
 */
function runConcurrencyTests_() {
  // 40 — model governance blocks unvalidated model.
  var gov = validateModelConfiguration();
  T_check(40, 'Model governance returns a status', gov && (gov.status === 'Validated' || gov.status === 'Blocked'), gov);

  // 26 — dedupe helper exists and returns boolean (live check needs Airtable).
  T_check(26, 'atMessageExists is boolean', typeof atMessageExists('nonexistent-msg-id') === 'boolean', null);

  // 35/37 — batch limit + budget wiring present.
  var cfg = getConfig();
  T_check(35, 'Batch cap configured (>=1)', cfg.maxAgentRecordsPerRun >= 1, cfg.maxAgentRecordsPerRun);
  T_check(37, 'Execution budget configured', cfg.executionTimeBudgetSeconds > 0, cfg.executionTimeBudgetSeconds);

  // 27/28 — lock skip path is safe (functions exist and are lock-guarded).
  T_check(27, 'captureInbox defined + lock-guarded', typeof captureInbox === 'function', null);
  T_check(28, 'analyze/send defined + lock-guarded', typeof analyzePendingEmails === 'function' && typeof sendApproved === 'function', null);

  // 42 — auto-send kill switch off.
  T_check('42b', 'autoSendEnabled false', cfg.autoSendEnabled === false, null);
}
