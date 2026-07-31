# A/1 Creative Agency

**Business**: A/1 Creative Agency — Infrastructure · Intelligence · Systems
**Domain**: a1creativeagency.com
**Contact**: admin@a1creativeagency.com | (513) 440-3329

## Deployment Lane

- **Folder**: `projects/a1-creative/`
- **Vercel project**: Needs dedicated project — `a1-creative-agency` is currently used for TRHUE
- **Production branch**: Dedicated branch or repo TBD

## Content Scope

Allowed: A1 Creative homepage, missed-call recovery landing page, service pages, agency assets.

Must NOT show: TRHUE Hair Care, Touch of Feather, TVF/TBF/Deep Well content.

## Structure

```
projects/a1-creative/
├── missed-call/        ← Missed Call Revenue Recovery landing page (standalone HTML)
│   ├── index.html
│   └── styles.css
├── legal.css           ← Shared styling for the compliance pages below
├── privacy.html        ← Privacy Policy (incl. carrier-mandated SMS/mobile clause) → /privacy
├── terms.html          ← Terms of Service (incl. SMS program terms)              → /terms
├── sms-consent.html    ← Quote form with the TCPA/A2P opt-in checkbox            → /sms-consent
├── a2p-registration-package.md  ← Ready-to-submit Twilio A2P Brand + Campaign package
└── brand/              ← Master logo system and design tokens
    ├── logo-primary.svg
    ├── logo-icon.svg
    ├── logo-dark.svg
    ├── tokens.css
    ├── preview.html
    └── README.md
```

## A2P / SMS compliance gate

The compliance pages must be **live and linked** for Twilio A2P 10DLC approval:

- **Privacy Policy** (`/privacy`) — contains the required clause: *no mobile
  information is shared with third parties/affiliates for marketing; opt-in data
  is never shared.*
- **Terms of Service** (`/terms`) — contains the SMS program terms.
- **SMS consent form** (`/sms-consent`) — an **unchecked** opt-in checkbox with
  the exact consent wording (version `v2026-07-30`), links to Privacy + Terms,
  and posts consent metadata to the intake API.
- **Consent storage** — the intake handler (`api/submit-lead.js`) stamps
  `SMS Consent`, `SMS Consent Timestamp`, `SMS Consent Text Version`,
  `Consent Source URL`, and `Consent IP` on the Airtable **Leads** record.
  (Field mapping verified against base `A1 Creative Agency Hub`.)
- **Twilio A2P** — see `a2p-registration-package.md`. Submission is Cecil's
  protected Twilio action; the package lists every value + the open items
  (EIN, street address, current Brand/Campaign status).

Deploy paths assume `projects/a1-creative/` is the site root with clean URLs
(`/privacy`, `/terms`, `/sms-consent`). Adjust link paths if the publish root
differs.

## Drag-ready deploy bundle (`site/`)

The live `a1creativeagency.com` site is on Netlify and deploys by **manual
drag-and-drop** (see `quote-link.md`), so a git push here does **not** publish.
To make publishing one step, `build-site.sh` assembles a self-contained bundle:

```
cd projects/a1-creative && bash build-site.sh   # regenerates ./site/
```

`site/` contains the landing page as `index.html`, the compliance pages
(`/privacy`, `/terms`, `/sms-consent`), `legal.css`, brand assets, and a
`_redirects` file that (a) keeps `/quote` pointing at the Vercel quote endpoint
and (b) proxies `/api/*` to the Vercel functions so the consent form POSTs
same-origin to `/api/submit-lead`. **To publish: drag the `site/` folder onto
the Netlify Deploys page** for the production site.

### A2P URL-compatibility aliases

Twilio already has Privacy/Terms/quote URLs registered on the campaign and they
can't be edited reliably, so the build emits **real 200 route aliases** that serve
byte-for-byte identical content (also declared as 200 rewrites in `_redirects` as
backup). The originals are untouched.

| Alias (registered in Twilio) | Serves | Same content as |
|---|---|---|
| `/privacy-policy` | `privacy-policy.html` | `/privacy` |
| `/terms-and-conditions` | `terms-and-conditions.html` | `/terms` |
| `/get-a-quote` | `get-a-quote.html` | `/sms-consent` (compliant quote form) |

## Next Steps

1. Drag `site/` onto Netlify to publish the compliance gate to a1creativeagency.com.
2. Verify `/privacy`, `/terms`, `/sms-consent` load and a test opt-in lands in Airtable with the consent fields set.
3. Screenshot the live `/sms-consent` opt-in for the A2P campaign submission.
4. (Optional) Repoint `/quote` to `/sms-consent` if you want the branded quote link to use the new compliant form.
