# A1 Operations — Setup (owner-side)

Prereq: Phase 2A shadow deployment steps (`docs/phase2a/09-apps-script-deployment-checklist.md`).
Module 01 adds these on top. Nothing here enables sending.

## 1. Code
Add `ops-entity.gs` and `ops-daily-report.gs` to the Apps Script project (with the other modules).

## 2. Airtable (already done in this build)
Entity Registry table + Inbox Queue entity/ops fields exist. Review the Entity Registry rows.

## 3. Entity configuration (required before any lane can reply)
- **A/1 Suppliers:** in Gmail (operations@) add a verified **Send-As** alias `info@a1suppliers.org`,
  then set Entity Registry → A/1 Suppliers → **Send-As Configured = true**.
- **TBF Entertainment:** give Cecil-supplied domains/addresses + approved send-from; fill the TBF
  Entity Registry row and set Send-As Configured = true. Until done, TBF = NEEDS REVIEW (fail closed).
- Keep the in-code `ENTITY_REGISTRY` in `ops-entity.gs` in sync with the table (or wire it to read
  the table at runtime in a later iteration).

## 4. Mail routing (owner, provider-side — do NOT cancel any hosting)
Forward/route each business address into the hub while preserving the original recipient header
(`Delivered-To` / `X-Forwarded-To`). Existing GoDaddy/M365/Google addresses keep working; the hub
only gains visibility (sections 16–17). Provider migration is a separate, later, Cecil-approved step.

## 5. Verify
Run `runAllPhase2Tests()` and the headless harnesses. Manually run `captureInbox()` on a labeled
test email per lane and confirm Entity/Original Recipient/Approved Send From populate correctly.

STOP before installing production triggers or changing any send switch — awaits CEO approval.
