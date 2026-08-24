# A1 Creative — Website & Systems Rebuild Spec

**Purpose:** one source of truth to fix every button, link, form, legal page, and
integration on the A1 Creative site, and to get Airtable + email + Twilio/A2P
working — end to end. We check items off here instead of chasing one-off previews.

**Baseline (locked):** the live A1 Creative homepage — hero *"Build The Business
System Behind Your Brand."* Repo `ceciltrimble15/a1-creative-agency`, branch
`a1-creative-production`, host **Netlify** (`a1creativeagency4`, domain
`a1creativeagency.com`), publish dir `.`, backend = `netlify/functions`.
Working branch: `claude/assessment-correct-homepage` (PR #15).

**Owner key:** 🟦 Claude (I build it) · 🟧 Cecil (needs your login/approval) · ⬜ done.

---

## 1. Buttons, links & navigation

Every interactive target on the homepage, audited:

| Element | Points to | Correct? | Action | Owner |
|---|---|---|---|---|
| Nav: Work / Our Work / See Our Work | `#proof` | ✅ | keep | ⬜ |
| Nav: Services | `#services` | ✅ | keep | ⬜ |
| Nav: Packages | `#packages` | ✅ | keep | ⬜ |
| Nav: Why A1 | `#why` | ✅ | keep | ⬜ |
| Nav: Contact / Get A Quote | `#contact` | ✅ | keep | ⬜ |
| Hero: Request A Build Quote | `#contact` | ✅ | keep | ⬜ |
| Hero: Pay Project Deposit | PayPal link | ✅ works | verify amount/flow | 🟧 |
| CTAs: Get Systemized / Functional / Visible Fast / Request Quote | `#contact` | ✅ | keep | ⬜ |
| Schedule A Discovery Call | Calendly link | ✅ works | confirm it's the right event | 🟧 |
| Project cards: View Project → | client sites | ✅ | keep | ⬜ |
| **Assessment CTA** | `#assessment` | ✅ added | "Take The Free Assessment" button in hero + "Assessment" nav link | ⬜ |
| Footer: Privacy Policy | `/privacy` | ✅ built + canonical | page live; `/privacy-policy` → 301 → `/privacy` | ⬜ |
| Footer/consent: Terms | `/terms` | ✅ built + canonical | page live; `/terms-and-conditions` → 301 → `/terms` | ⬜ |
| `/quote` | → `/#assessment` (302) | ✅ | keep | ⬜ |

**Fixes I'll make:** add a visible **"Take the Free Assessment"** button (hero and/or
the assessment teaser) linking to `#assessment`; standardize legal links to `/privacy`
and `/terms` and add redirects from the `-policy` / `-and-conditions` variants.

---

## 2. Forms & data flow

Two forms, one backend (good — no duplicate systems):

| Form | Location | Posts to | Creates | Status |
|---|---|---|---|---|
| Quote / Contact (`#a1-quote-form`) | `#contact` | `/api/submit-lead` | Airtable **Lead** + follow-up Task + ops email | ✅ wired — needs an end-to-end live test |
| Business Infrastructure Assessment (`#bia-form`) | `#assessment` | `/api/submit-lead` (`type:assessment`) | **Lead** (find-or-create, dedupe) + linked **Business Assessment** (scored, package) + Task + ops email | ✅ built + visibility fixed (commit `7c09c03`) |

Backend: `netlify/functions/submit-lead.mjs` → `_lib/airtable.mjs` (Leads
`tblp6BvYflT2xl6xT`, Business Assessments `tbl32Rz60XERXfg6V`) + `_lib/notify.mjs`
(Resend email). Server-side token only; email failure never blocks the record.

**To verify:** both forms submitting on the **live preview** (needs env vars set for
the Netlify Deploy Preview context — see §5). "New forms/access" = the assessment is
the new form; if you want more (e.g., a booking intake or a deposit form), list them
in §7 and I'll add them the same way.

---

## 3. Legal pages (required, and A2P-blocking)

Twilio A2P 10DLC **will not approve** SMS without a public Privacy Policy + Terms that
mention how phone numbers/consent are used, plus STOP/HELP language on the site.

| Page | Path | Status | Action | Owner |
|---|---|---|---|---|
| Privacy Policy | `/privacy` | ✅ built (`privacy.html`) | data use + SMS consent, STOP/HELP, no-sale/no-share clause, 2–6/mo, rates | 🟧 review wording |
| Terms & Conditions | `/terms` | ✅ built (`terms.html`) | service terms + SMS program terms (opt-out keywords, HELP, carrier disclaimer) | 🟧 review wording |
| Redirects | `/privacy-policy`, `/terms-and-conditions` | ✅ 301 → canonical | in `netlify.toml` | ⬜ |

I'll draft both in the site's design; **you review the wording** (or your attorney) before it's used for A2P. 🟧 review.

---

## 4. Twilio + A2P 10DLC (the "get my SMS working" part)

This is the biggest piece and it's a **shared** job — some of it only you can do
(carrier registration in the Twilio console). Sequenced:

| Step | What | Owner |
|---|---|---|
| 4.1 | Consent capture on the site (one optional unchecked checkbox, STOP/HELP/rates + Privacy/Terms) | ✅ `/quote` only; assessment and contact do not collect SMS consent |
| 4.2 | Build Netlify functions for Twilio: inbound **voice** (`twilio-voice`), internal **missed-call follow-up** (`twilio-missed-call`), **voicemail** (`twilio-voicemail`), and inbound **SMS** opt-out handling (`twilio-sms`) — signature-verified, at `/api/twilio/*` | ✅ built; missed calls never trigger customer SMS |
| 4.3 | Twilio account: buy/confirm number, get Account SID + Auth Token | 🟧 |
| 4.4 | **A2P 10DLC registration** in Twilio console: register Brand, then Campaign (use case = customer care/marketing), submit sample messages + the opt-in screenshot (our consent box) + Privacy/Terms URLs | 🟧 (carrier approval, days) |
| 4.5 | Point the Twilio number's Voice + Messaging webhooks at the Netlify function URLs | 🟧 (I give exact URLs) |
| 4.6 | Set Twilio env vars in Netlify (§5), test a real missed call, confirm no customer SMS, and verify STOP/HELP | 🟦 build + 🟧 trigger |

> A missed call, voicemail, inbound text, or phone number alone is never SMS consent.
> The `/quote` checkbox is the only initial SMS consent source.

---

## 5. Environment variables (names only — never commit values) — 🟧 set in Netlify

Per-context (set for **Production** *and* **Deploy previews** so previews work):

- Airtable: `AIRTABLE_API_KEY` **or** `AIRTABLE_TOKEN`, `AIRTABLE_BASE_ID`
- Email: `RESEND_API_KEY`, `NOTIFY_FROM` (verified sender), `NOTIFY_EMAIL` (optional)
- Twilio: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`, `OWNER_CELL`
- Optional: `QUOTE_FORM_URL`

---

## 6. Deployment model (locked)

One repo → **Netlify** builds branch `a1-creative-production` → `a1creativeagency.com`.
Every push builds a Deploy Preview (`deploy-preview-N--a1creativeagency4.netlify.app`).
Nothing goes to production without your explicit approval. (A parallel Vercel preview
also builds from the repo — ignore it; review only the Netlify URL.)

---

## 7. Build order (what I'll do once you say go)

1. Legal pages `/privacy` + `/terms` (+ redirects) — unblocks A2P. 🟦
2. Add the assessment CTA button(s) → `#assessment`; standardize legal links. 🟦
3. Mirror SMS-consent language onto the quote form. 🟦
4. Port Twilio voice / missed-call / voicemail / inbound-SMS to Netlify functions. 🟦
5. One preview with all of the above; you visually check every button/form. 🟦→🟧
6. You set env vars (§5) and we run live submit + call tests on the preview. 🟧🟦
7. You do A2P registration (§4.4) and webhook wiring (§4.5); I hand you exact URLs. 🟧
8. Final review → you approve → merge to production. 🟧

## 8. What I need from you to start

- ✅ "Go" on this spec (or edits to it).
- The **PayPal deposit** and **Calendly** links are correct? (confirm)
- Any **additional forms/pages** you want beyond quote + assessment? (list them)
- For A2P: confirm the Twilio number and that you can access the Twilio console.
- Who approves the **legal wording** — you or an attorney?
