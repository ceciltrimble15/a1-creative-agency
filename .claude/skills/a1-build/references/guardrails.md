# A1 Build — Guardrails (hard rules, learned the hard way)

1. **Browser output is the source of truth.** Never say a button/form/section
   "works" or "is visible" from source code or unit tests alone. Render it headless,
   click it, and measure computed style (`opacity`/`display`/`visibility`/rect) +
   screenshot. Watch the `.reveal { opacity:0 }` scroll-animation trap: an element can
   be in the DOM and fully "present" yet invisible until an IntersectionObserver adds
   `.visible`. If content must always show, don't gate it behind `.reveal`.

2. **Right baseline, right branch.** Build only on a branch cut from
   `a1-creative-production`; the homepage must be the "Build The Business System"
   page. `main` is a different app — never use it. Confirm with
   `git merge-base --is-ancestor origin/main <branch>` = false.

3. **Preserve the approved design.** Additive only. Do not change logo, hero, colors,
   fonts, nav, pricing, packages, proof-of-work, or footer. Match the page's own
   design tokens for anything new. Keep exactly ONE `<section id="assessment">`.

4. **One backend, one base, no duplicates.** Post to `/api/submit-lead`; reuse the
   existing Leads + Business Assessments tables. Do not create duplicate endpoints,
   tables, fields, or a second website/repo unless explicitly required.

5. **SMS / A2P compliance.** Phone is OPTIONAL. SMS consent is OPTIONAL and NEVER
   blocks a submission (a phone without consent still becomes a Lead, just not
   opted-in). Write consent evidence (status, timestamp, text version, source URL, IP)
   only when opted in. The consent UI must show message frequency, msg&data rates,
   STOP, HELP, and links to Privacy Policy + Terms. A2P 10DLC brand+campaign
   registration is Cecil's Twilio-console action (carrier approval takes days) — build
   everything it needs, but don't claim SMS is live until it's approved and webhooked.

6. **Secrets never leak.** Server-side token only; never print env values in logs,
   commits, screenshots, or replies. Public error responses must not expose tokens,
   Airtable IDs, or stack traces.

7. **One branch, one draft PR, real preview URL.** Fix in place on the single build
   branch; refresh the same draft PR into `a1-creative-production`. Get the preview URL
   from the Netlify deploy record — never guess/manufacture it.

8. **Never touch production without explicit CEO approval.** No merge to
   `a1-creative-production`, no production deploy, no DNS change, no deleting records
   you didn't create — until Cecil says so. Label any test data `TEST —`.

9. **Own vs ask.** Do all code-ownable work now (🟦). Only Cecil can do 🟧: set env
   vars, register A2P, wire Twilio webhooks, change DNS, approve/merge. Surface these
   clearly; don't stall Claude work waiting on them.

10. **Talk in plain terms, not commit hashes.** Refer to "the current live homepage
    with the 'Build The Business System' hero", not branch/commit names, when
    confirming intent with Cecil.
