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
├── index.html          ← A1 Creative homepage (approved baseline). Self-contained
│                          standalone HTML; the Get-A-Quote form posts to the
│                          Vercel lead backend (/api/submit-lead).
├── missed-call/        ← Missed Call Revenue Recovery landing page (standalone HTML)
│   ├── index.html         — a secondary campaign page, NOT the homepage.
│   └── styles.css
└── brand/              ← Master logo system and design tokens
    ├── logo-primary.svg
    ├── logo-icon.svg
    ├── logo-dark.svg
    ├── tokens.css
    ├── preview.html
    └── README.md
```

## Homepage (`index.html`)

Restored from the approved Netlify baseline (deploy `a1creativeagency4`). Sections:
Hero · Proof of Work · Services · Packages · Infrastructure Flow · Why A1 ·
**Business Infrastructure Assessment** · Final CTA · Quote Form · Scan-to-Get-Started QR ·
Footer.

The **Business Infrastructure Assessment** section and the **quote-form backend
wiring** are the only additions on top of the baseline — no redesign.

### Quote form

The scoped `#a1-quote-form` posts JSON to
`https://a1-creative-agency.vercel.app/api/submit-lead`, which creates an
Airtable Lead + Task + Automation Log and emails operations@a1creativeagency.com.
Field mapping: `full name → name`, `email → email`, `mobile → phone`,
`what you need built → service`; the business name and SMS-consent proof
(version + source URL) are folded into `message`. Phone is optional (email-only
requests are accepted); when a phone is provided, SMS consent is required
client-side for A2P/10DLC compliance.

## Next Steps

1. Create a dedicated Vercel project: `a1-creative-agency-site`
2. Attach domain `a1creativeagency.com` to that project only
3. Deploy `projects/a1-creative/` as the root for that project
