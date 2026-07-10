# A1 Creative — Business Infrastructure Assessment

End-to-end system that captures a business's infrastructure gaps, scores them,
recommends the right A1 Creative package, and files everything in Airtable —
linked to the existing sales pipeline.

## Pieces

| Piece | Location |
|---|---|
| Public assessment page | `public/assessment.html` → served at `/assessment` on the Vercel project |
| Submission endpoint | `POST /api/submit-lead` with `{ "type": "assessment", ... }` |
| Scoring + package logic | `api/_lib/assessment.js` (pure, documented, testable) |
| Airtable helpers | `api/_lib/airtable.js` (find/create/update Lead, create Assessment) |
| Leads table | `Leads` — `tblp6BvYflT2xl6xT` (existing, reused) |
| Business Assessments table | `Business Assessments` — `tbl32Rz60XERXfg6V` (created for this system) |
| Base | `A1 Creative Agency Hub` — `appvfR20qp1dh5bT0` |

The A1 homepage (a1creativeagency.com, hosted on Netlify) links to
`https://a1-creative-agency.vercel.app/assessment`. Nothing on the approved
homepage design changes — the assessment is a standalone, same-origin page on
the Vercel project that already hosts the lead backend.

## Submission flow

1. **Validate** — full name, email, business name, and phone are required.
   When a phone number is present, explicit SMS consent is mandatory
   (unchecked box → the submission is blocked). No implied consent.
2. **Find or create the Lead** — searches `Leads` by email (case-insensitive)
   and phone (last-10-digits match). A match is **updated** (blank contact
   fields filled, Service Requested + Source refreshed, consent recorded) and
   never duplicated; pipeline data (`lead_status`, `Notes`, links) is left
   untouched. No match → a new Lead is created.
3. **Create the Assessment** — one `Business Assessments` row with every
   answer, linked to the Lead via the `Linked Lead` field.
4. **Score** — see below.
5. **Recommend a package** — derived from the score.
6. **Notify** — emails operations@ via Resend with the score, readiness,
   package, and record IDs. Email failure never blocks the Airtable writes.
7. **Respond** — the page shows the visitor their readiness level, score, and
   recommended build. Internal errors, tokens, and IDs are never exposed.

## Scoring (transparent + easy to change)

Six questions each score a "need" value of **0–3** (0 = fully handled,
3 = nothing in place). Total range **0–18**; higher = bigger gap. All the
numbers live in `NEED_POINTS` and `BANDS` in `api/_lib/assessment.js` — change
them there and the whole recommendation shifts predictably.

| Total score | Readiness Level | Recommended Package |
|---|---|---|
| 15–18 | Foundation Needed | Full Infrastructure Build |
| 10–14 | Developing | Growth Infrastructure |
| 5–9 | Growth Ready | Community Access System |
| 0–4 | Infrastructure Ready | QuickLaunch Kit |

`Follow-Up Needed` is set when the score is ≥ 5.

## Business Assessments table fields

Assessment ID (text, server-generated `ASMT-YYYYMMDD-HHMMSS-XXXX`) ·
Linked Lead (link → Leads) · Submitted Date (dateTime, server-stamped) ·
Website Status · Booking System · Missed Call Handling · Follow-Up Process ·
CRM Status · Payments / Deposits (single selects) · Biggest Business Problem ·
30–90 Day Goal (long text) · Service Requested (text) · Assessment Score
(number) · Readiness Level · Recommended Package (single selects) · Full
Response Summary (long text) · SMS Consent · Follow-Up Needed (checkboxes) ·
Source (text) · CEO Review Status · Assessment Status (single selects).

> Note: Airtable's metadata API cannot create `autoNumber` or `createdTime`
> field types via automation, so **Assessment ID** is a server-generated unique
> text value and **Submitted Date** is a server-stamped `dateTime`. Both are
> functionally equivalent and fully controlled by the backend.

## Environment variables (server-side only — never in the frontend)

Already in use: `AIRTABLE_API_KEY`, `AIRTABLE_BASE_ID`, `RESEND_API_KEY`,
`NOTIFY_FROM`, `NOTIFY_EMAIL`.

Optional overrides (sensible defaults, no change required):
`AIRTABLE_LEADS_TABLE` (`Leads`), `AIRTABLE_ASSESSMENTS_TABLE`
(`Business Assessments`).

## Tests

`node` harness stubs `fetch` and drives the real handler through: new lead,
existing-lead dedupe/update, missing field, phone-without-consent, email
failure, safe error on write failure, and the original simple-lead regression —
plus scoring unit checks. All green. The live base was also verified by
creating and then deleting a real linked Lead + Assessment pair.
