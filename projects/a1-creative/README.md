# A1 Creative Agency

**Business**: A1 Creative Agency — Infrastructure · Intelligence · Systems
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

## Next Steps

1. Confirm the production deploy source/root for `a1-creative-site` (Netlify).
2. Deploy `projects/a1-creative/` as the root with clean URLs.
3. Attach domain `a1creativeagency.com` to that project only.
4. Screenshot the live `/sms-consent` opt-in for the A2P campaign submission.
