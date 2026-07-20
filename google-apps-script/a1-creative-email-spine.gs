/**
 * a1-creative-email-spine.gs — MANIFEST / ORCHESTRATION HEADER (Phase 2A).
 *
 * The proven Phase 1 transport (capture → approve → send → follow-up → escalate)
 * is preserved, but refactored out of this single file into focused modules so the
 * Phase 2A supervised-intelligence layer can be added without one uncontrolled file.
 * Apps Script shares ONE global namespace across all .gs files, so each function is
 * defined exactly once, in the module named below.
 *
 * ── Transport (Phase 1 behavior, guarded) ────────────────────────────────
 *   gmail-intake.gs        captureInbox()            Gmail(operations@) → Inbox Queue
 *   approval-send.gs       sendApproved()            human-approved, in-thread reply
 *                          processRejects()          mark Reject → Discarded
 *   follow-up-processing.gs processOverdueFollowUps()
 *   agent-routing.gs       escalateRedToAcos()       ACOS 04 – CEO Approval Queue
 *   trigger-management.gs  installTriggers()         Phase 1 triggers (rollback)
 *
 * ── Supervised intelligence (Phase 2A) ───────────────────────────────────
 *   agent-config.gs        getConfig(), FLD map, enums, kill switches
 *   agent-processing.gs    analyzePendingEmails(), buildAgentPayload(), applyAgentOutput()
 *   agent-provider.gs      callAgentModel(), validateModelConfiguration(), testAgentConnection()
 *   agent-prompt.gs        buildAgentPrompt(), PROMPT_VERSION, payloadHash()
 *   agent-validation.gs    validateAgentResponse()
 *   agent-routing.gs       deriveTier(), routeRecord(), get/setThreadRiskFloor()
 *   security-redaction.gs  maskSensitiveData()
 *   airtable-client.gs     atSelect/atCreate/atUpdate, atMessageExists()
 *   automation-logging.gs  logAgentAction()
 *   trigger-management.gs  installPhase2Triggers(), removePhase2Triggers(), removeAllTriggers()
 *
 * ── Operating flow ───────────────────────────────────────────────────────
 *   capture → classify → summarize → draft → route → approve → send → follow up → escalate → remember
 *
 * ── Safety invariants (enforced in code) ─────────────────────────────────
 *   • Nothing sends unless a human set Approve AND all send guards pass.
 *   • AUTO_SEND_ENABLED is false in Phase 2A; the agent never sends.
 *   • Agent writes AI Draft, never Final Copy.
 *   • Red requires the CEO approver email; Krisha cannot approve Red.
 *   • PII is masked before any model call.
 *   • Red risk is sticky across a Gmail thread.
 *   • Every scheduled function takes a ScriptLock; fail closed on uncertainty.
 *
 * No secrets live in source — all config comes from Script Properties (see agent-config.gs).
 */

var A1C_SPINE_VERSION = 'phase2a-manifest-1.0.0';
