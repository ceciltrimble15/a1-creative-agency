# A1 Creative — Monday Launch Runbook (working path: Airtable Form → Leads)

**Goal:** A prospect scans the QR or clicks Quote → submits → lands in **Leads** →
auto-creates **Task** + **Automation Log** → **emails operations@**.

**Tonight's path is the Airtable public form.** The website form is Phase 2.
No branch merges. No DNS changes. No redesign.

There is exactly **one value to set** across this whole launch: your published
Airtable intake form URL. Set it, and everything below works.

---

## 0. The one URL (already set)
The published Airtable form is
`https://airtable.com/app66a6HF20gMtB7Z/pag92tvcd91URlbvG/form` and it is already
wired into `_redirects`, `quote.html`, and `intake.html`. To change the destination
later, find-and-replace that URL in those three files — nothing else.

---

## 1. /quote → Airtable form  (permanent route)
The QR and CTAs point at `a1creativeagency.com/quote`, never at the raw Airtable
URL — so you can change the destination later without reprinting anything.

Pick the one that matches the live host:

- **Netlify (current live host):** drop `projects/a1-creative/_redirects` into the
  site's publish folder (or paste its rules into `netlify.toml`). Done — `/quote`
  302-redirects to the form.
- **Vercel:** add to `vercel.json`:
  ```json
  { "redirects": [{ "source": "/quote", "destination": "https://airtable.com/app66a6HF20gMtB7Z/pag92tvcd91URlbvG/form", "permanent": false }] }
  ```
- **Any static host (fallback):** deploy `projects/a1-creative/quote.html` at `/quote`.

**Confirm:** open `https://a1creativeagency.com/quote` → it should land on the form.

## 2. QR code → /quote
Regenerate the website + flyer QR to encode **`https://a1creativeagency.com/quote`**
(not the Airtable URL). Because /quote is an indirection, this is the **last time**
the QR ever needs to change. **Confirm:** scan it → form opens.

## 3. Website CTAs → /quote
Point "Get A Quote" / primary CTA buttons at `https://a1creativeagency.com/quote`
(plain `href`). This is link-only — no form rebuild, no redesign. **Confirm:** click
each CTA → form opens.

---

## 4. Airtable automations (Leads table)
> I can't log into Airtable to build these for you, so here is the exact install.
> One automation, four outcomes. Uses the ready script in
> [`automation/airtable-new-lead.js`](../../automation/airtable-new-lead.js).

1. Airtable → base → **Automations** → **Create automation**.
2. **Trigger:** *When a record is created* → Table: **Leads**.
3. **Action 1 — Run a script.** Add input variable `recordId` = (insert) record ID
   from the trigger. Paste the entire `automation/airtable-new-lead.js`. This does:
   - **Set status/source if blank** → Status `New Lead`, Source `A1 Creative Intake Form`
   - **Create Task** → "Follow up with [name]", High / Open, due date, Related Lead, notes
   - **Create Automation Log** → "New Lead Captured", Success, timestamp, Related Lead
4. **Action 2 — Send email** (native):
   - **To:** `operations@a1creativeagency.com`
   - **Subject:** `New A1 Creative Lead: ` + script output `leadName`
   - **Body:** use script outputs `leadName, phone, email, service, message, source, recordUrl`
5. Toggle the automation **ON**, click **Test**.

**Required tables/fields** (add if missing — Task/Log writes are best-effort and
won't lose a lead, but they need these fields to land):
- **Tasks:** `Task Name`, `Related Lead` (link→Leads), `Priority`, `Status`, `Due Date`, `Notes`
- **Automation Logs:** `Event Type`, `Related Lead` (link→Leads), `Status`, `Timestamp`, `Notes`

---

## 5. Facebook / LinkedIn links — resolved
Applied to the A1 site source (`src/lib/site.js` + `Footer.jsx`):
- **Facebook** → `https://www.facebook.com/profile.php?id=61590367834347` (real page).
- **LinkedIn** → **removed** (not ready). The dead LinkedIn icon no longer renders.
- **Instagram** (`instagram.com/a1creativeagency`) — already correct.

These ship when the A1 site source is deployed.

---

## Monday "Definitely Ready" test (run once)
Submit a real entry through `/quote` (or scan the QR), then check:

```
[ ] /quote opens the Airtable form
[ ] QR opens the Airtable form
[ ] CTA buttons open the Airtable form
[ ] Submission appears in Leads (Status = New Lead, Source set)
[ ] Task created (Follow up with…, High / Open)
[ ] Automation Log created (New Lead Captured, Success)
[ ] Email arrives at operations@a1creativeagency.com
```

All seven checked = **READY FOR OUTREACH**.
