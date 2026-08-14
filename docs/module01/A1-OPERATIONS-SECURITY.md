# A1 Operations — Security

Full agent-layer review: `docs/phase2a/05-security-review.md`. Module 01 additions:

- **Least privilege:** Shadow project manifest omits `gmail.send` (no send authority). Secrets only
  in Script Properties. No credentials in source (verified by scan).
- **Entity data separation:** every record is locked to one Entity; queries and the Daily Report
  never merge lanes. Cross-entity replies are blocked three ways (config-required, mismatch, needs-review).
- **PII/redaction:** sensitive data masked before any model call; only masked-categories stored; logs
  scrubbed. Tax IDs, banking, government IDs, credentials never exposed.
- **Audit trail:** `Agent Activity Log` records action, function, record/message id, result, safe
  detail, agent version — enough to reconstruct what happened, when, which entity, and whether a human
  approved. No sensitive values in logs.
- **Fail closed:** low entity confidence → NEEDS REVIEW; uncertain send-from → CONFIGURATION REQUIRED;
  uncertain legal/financial → escalate. Nothing sends under `SHADOW_MODE`.

Residual risks: regex redaction is best-effort (backstopped by no-attachments-to-model + human
approval); `UrlFetchApp` has no hard timeout (backstopped by daily/records/budget caps).
