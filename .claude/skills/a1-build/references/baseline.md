# A1 Build — Locked Baseline (facts, not opinions)

If any of these is contradicted by what you find, STOP and confirm with Cecil
before building. These are the settled answers to questions that caused rework.

## The website (source of truth)
- **Correct homepage** = the live A1 Creative page whose hero is
  **"Build The Business System Behind Your Brand"** (A1 logo; blue/orange; nav
  Work · Services · Packages · Why A1 · Contact; buttons Request A Build Quote /
  See Our Work / Pay Project Deposit). Self-contained static HTML (inline styles,
  base64 data-URI logo, Outfit font).
- **NOT** the "Stop Losing Jobs From Missed Calls" missed-call landing page — that
  was an interim page; do not use it as the baseline.
- Recovered from `projects/a1-creative/index.html` (saved from the live
  `a1creativeagency4` Netlify deploy). Lives at repo root `index.html` on the build
  branch.

## Repo / host / deploy
- Repo: **`ceciltrimble15/a1-creative-agency`**
- Production branch: **`a1-creative-production`** (build branches are cut from its HEAD)
- `main` = a DIFFERENT app (TRHUE Hair Care, Vite/React). **Never build on main.**
- Host: **Netlify**, site **`a1creativeagency4`** (site_id `4cd8ea1b-efe4-42b0-b4b5-f2a49a57fe8f`),
  domain `a1creativeagency.com`, publish dir `.`, functions dir `netlify/functions`,
  build command = echo (static, no bundler).
- Deploy previews: `https://deploy-preview-<PR#>--a1creativeagency4.netlify.app`.
- A parallel **Vercel** preview also builds from the repo — ignore it; review only Netlify.

## Backend / data
- One same-origin endpoint: **`/api/submit-lead`** (netlify.toml rewrites it to the
  function). Both the quote form and the assessment post here.
- Airtable base **A1 Creative Agency Hub** `appvfR20qp1dh5bT0`:
  - Leads: **`tblp6BvYflT2xl6xT`** (fields incl. `Email ` and `Service Requested `
    with trailing spaces; `SMS Consent` + consent-audit fields).
  - Business Assessments: **`tbl32Rz60XERXfg6V`** (created for this system; linked to
    Leads; scoring + package fields; plus `Lead Capture Status`).
- Email: Resend (`notify.mjs`), server-side only.
- Twilio number: (513) 440-3329. Twilio handlers exist on `main` as `api/twilio/*`
  (Vercel style) and must be **ported to `netlify/functions`** for production.

## Scoring / packages (assessment)
- Six 0–3 questions (website, lead-capture, booking, CRM, follow-up, missed-call);
  total 0–18. Bands → package + price: 0–4 QuickLaunch Kit **$500** · 5–9 Community
  Access System **$1,500** · 10–14 Growth Infrastructure **$3,500+** · 15–18 Full
  Infrastructure Build **custom**.

## Env vars (names only — never print values)
`AIRTABLE_API_KEY` **or** `AIRTABLE_TOKEN`, `AIRTABLE_BASE_ID`, `RESEND_API_KEY`,
`NOTIFY_FROM`, `NOTIFY_EMAIL?`, `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`,
`TWILIO_PHONE_NUMBER`, `OWNER_CELL`, `QUOTE_FORM_URL?`. Must be set for BOTH the
Production and Deploy-preview contexts in Netlify.
