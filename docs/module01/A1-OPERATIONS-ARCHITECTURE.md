# A1 Operations Command Center — Architecture (Module 01)

**Centralized operations, permanently separated business identities.**
Hub mailbox: `operations@a1creativeagency.com`. Each company keeps its own addresses,
customers, records, and sender identity — the hub only gives centralized visibility.

## Locked flow
Business email address → A1 Operations Hub → **detect original recipient** →
**identify entity** → **lock ENTITY_ID (system data)** → classify → priority (P1–P4) →
required action → assign owner → create follow-up/task → log → prepare response →
**send only from the correct business identity** → track outcome → close/continue → CEO report.

## Entity lock (non-negotiable)
- Every record carries **Entity** (ENTITY_ID) as Airtable data, not just a Gmail label.
- **Original Recipient (ORIGINAL_TO)** is preserved through forwarding to the hub.
- **Approved Send From** is resolved from the **Entity Registry** table; if none is verified,
  **Send-From Config Required = true** and the send guard blocks (never fake an identity).
- Cross-entity replies are impossible: `evaluateEntityGuards()` blocks `ENTITY_SEND_FROM_MISMATCH`,
  `SEND_FROM_CONFIGURATION_REQUIRED`, or `ENTITY_NEEDS_REVIEW`.

## Reuse (no new OS, no duplicate base)
Built on the existing Phase 2A spine and the **A1 Creative Agency Hub** base
(`appvfR20qp1dh5bT0`, table Inbox Queue). Module 01 adds the entity layer + Entity Registry +
ops category/priority/status + Daily Ops Report. All send-locks remain: `SHADOW_MODE`,
`MANUAL_SEND_ENABLED=false`, `AUTO_SEND_ENABLED=false`.

## Code modules (Google Apps Script)
`ops-entity.gs` (registry, resolveEntity, detectOriginalRecipient, evaluateEntityGuards,
recommendPriority, vocabularies) · `ops-daily-report.gs` (buildDailyOpsReport, render, generate)
· `gmail-intake.gs` (entity-aware capture) · `approval-send.gs` (entity guard in send path) ·
plus all Phase 2A modules. See `docs/phase2a/` for the agent/routing/safety layer.
