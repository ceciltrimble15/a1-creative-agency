# A1 Creative — Lead Automation Build Report

**Date:** 2026-06-12
**Mission:** Turn *A1 Lead Connector* into a working agency-grade lead automation system.
**Scope note:** This repo holds (a) the shared **Vercel lead backend** (`/api/*`), (b) the
**A1 Creative project assets / drop-ins** (`projects/a1-creative/`), and (c) the TRHUE site.
The public A1 Creative homepage (Get-A-Quote form + View Project buttons) is hosted
**outside this repo**, so those items ship as paste-in drop-ins plus hosted pages.

Status legend: ✅ **PASS** (done & self-contained) · 🟡 **READY** (built — needs one
external switch flipped) · ⏳ **VERIFY** (run the live test to confirm).

---

## Scorecard

| # | Deliverable | Status | Where |
|---|---|---|---|
| 1 | New Lead Intake automation | 🟡 READY | `api/submit-lead.js` + `automation/airtable-new-lead.js` |
| 2 | Follow-Up Task creation | ✅ PASS (code) | `api/submit-lead.js`, `automation/airtable-new-lead.js` |
| 3 | Operations email notification | 🟡 READY | `api/_lib/notify.js` (needs `RESEND_API_KEY`) |
| 4 | Automation Log | ✅ PASS (code) | `api/_lib/airtable.js` `logEvent()` |
| 5 | QR code destination | 🟡 READY | `projects/a1-creative/intake.html` (paste form URL) |
| 6 | Website Get-A-Quote form | 🟡 READY | `projects/a1-creative/quote-form-fix.html` |
| 7 | View Project buttons | 🟡 READY | `projects/a1-creative/view-projects-fix.html` + `/portfolio/*` |
| 8 | Full end-to-end test | ⏳ VERIFY | run the checklist below |

Nothing here is a dead form or dead button **in code** — every path is wired. The
remaining 🟡 items are external switches I can't flip from here (no Airtable base
access, no Vercel env access, no access to the externally-hosted homepage).

---

## What was built (this commit)

### Pipeline aligned to the exact spec
`api/submit-lead.js` now performs all four steps on every website lead:

1. **Intake** — creates the Lead with `Status = "New Lead"` and `Source` defaulting to
   `"A1 Creative Intake Form"` when blank.
2. **Follow-Up Task** — `Task Name: Follow up with [Lead Name]`, **Related Lead** linked,
   **Priority: High**, **Status: Open**, **Due Date:** today or next business day,
   **Notes:** phone + email + service + message.
3. **Ops email** — subject `New A1 Creative Lead: [Lead Name]`, body includes Name, Phone,
   Email, Service, Message, Source, **and a link to the Airtable record**.
4. **Automation Log** — `Event Type: New Lead Captured`, **Related Lead** linked,
   `Status: Success`, `Timestamp`, Notes: *"Lead captured from A1 Creative intake form and
   follow-up task created."*

The Twilio missed-call / voicemail flows were updated to write the same spec-aligned
Task and Automation Log fields.

### Airtable-native automation (covers the QR / public-form path)
`automation/airtable-new-lead.js` is a paste-in **Run-a-script** automation. Leads that
arrive through the published intake form / QR **bypass the Vercel endpoint**, so this runs
steps 1–4 *inside Airtable*. Install guide is in the file header.

### Reprint-proof QR destination
`projects/a1-creative/intake.html` is a redirect page. Point the website **and** flyer QR at
`https://a1creativeagency.com/intake`; it forwards to the Airtable form now and can be
repointed to the website form later **without reprinting the QR**.

### View Project buttons
`projects/a1-creative/view-projects-fix.html` wires each button by project name:
- **True Hair Care → https://www.trhuehaircare.com** (live)
- **4 Reel Cleaning → /projects/4-reel-cleaning** (temp detail page shipped)
- **A1 Suppliers → /projects/a1-suppliers** (temp detail page shipped)

Temp detail pages live in `projects/a1-creative/portfolio/`.

---

## Flip each 🟡 to ✅ (external steps — ~20 min total)

1. **Resend key (email):** create a free key at resend.com → set Vercel env
   `RESEND_API_KEY` (and optionally `NOTIFY_FROM` once your domain is verified). Until then,
   the email step no-ops and is logged.
2. **Direct record links (nice-to-have):** set Vercel env `AIRTABLE_LEADS_TABLE_ID` to the
   `tbl…` id (from the Leads table URL) so ops emails deep-link straight to the record.
3. **Airtable automation:** follow the header in `automation/airtable-new-lead.js`
   (Automations → When record created → Run script → paste → add Send email action → ON).
4. **QR destination:** open `projects/a1-creative/intake.html`, replace
   `REPLACE_WITH_PUBLISHED_INTAKE_FORM` with your Airtable form's share URL, deploy it at
   `a1creativeagency.com/intake`, and point both QR codes there.
5. **Get-A-Quote form:** paste `projects/a1-creative/quote-form-fix.html` before `</body>` on
   the homepage (set `FORM_SELECTOR` if the form id isn't `#quote-form`).
6. **View Project buttons:** paste `projects/a1-creative/view-projects-fix.html` before
   `</body>` on the homepage; deploy the two `/portfolio/*` pages at the matching paths.

### Airtable schema the pipeline expects
- **Leads:** `Lead Name`, `Phone`, `Email`, `Status` (single-select incl. *New Lead*),
  `Source`, `Notes` *(code currently writes `Email ` + `lead_status` to match the existing
  base — reconcile to one naming and update the CONFIG block / env if needed)*.
- **Tasks:** `Task Name`, `Related Lead` (link → Leads), `Priority` (incl. *High*),
  `Status` (incl. *Open*), `Due Date` (date), `Notes`.
- **Automation Logs:** `Event Type`, `Related Lead` (link → Leads), `Status` (incl.
  *Success*), `Timestamp` (date w/ time), `Notes`.

> ⚠️ The previous base used `Event/Details` on the log and `Name/To Do` on tasks. Add/rename
> the fields above so the new records land. Task/Log writes are best-effort, so a mismatch
> never loses a lead — it just skips the task/log and writes the reason to the function log.

---

## #8 — Final test checklist (run once switches are flipped)

| Check | How | Expected |
|---|---|---|
| Lead Capture | Submit the live form / scan QR & submit | Row in **Leads**, Status = New Lead |
| Task Creation | Open **Tasks** | "Follow up with [name]", High / Open, due date set |
| Automation Log | Open **Automation Logs** | "New Lead Captured", Success, timestamp |
| Email Notification | Check operations@ inbox | Subject `New A1 Creative Lead: [name]` + record link |
| QR Destination | Scan website & flyer QR | Opens the Airtable intake form |
| Website Get-A-Quote | Submit homepage form | Same Lead+Task+Log+email pipeline fires |
| View Project Buttons | Click all three | True Hair Care live; other two open detail pages |

Fill in PASS/FAIL after the run:

```
Lead Capture .............. [ ]
Task Creation ............. [ ]
Automation Log ............ [ ]
Email Notification ........ [ ]
QR Destination ............ [ ]
Website Get A Quote ....... [ ]
View Project Buttons ...... [ ]
```
