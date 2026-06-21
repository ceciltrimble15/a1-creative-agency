# A1 Creative Agency

**Business**: A1 Creative Agency — Infrastructure · Intelligence · Systems
**Domain**: a1creativeagency.com
**Contact**: operations@a1creativeagency.com | (513) 440-3329

## Deployment Lane

- **Folder**: `projects/a1-creative/`
- **Vercel project**: Needs dedicated project — `a1-creative-agency` is currently used for TRHUE
- **Production branch**: Dedicated branch or repo TBD

## Content Scope

Allowed: A1 Creative homepage, missed-call recovery landing page, service pages, agency assets.

Must NOT show: TRHUE Hair Care, Touch of Feather, TVF/TBF/Deep Well content.

## Structure

The site deploys with **`projects/a1-creative/` as the production root** — the
homepage and clean URLs resolve with zero rewrites.

```
projects/a1-creative/
├── index.html                  ← Homepage (Missed Call Revenue Recovery)
├── privacy-policy.html         ← /privacy-policy
├── terms-and-conditions.html   ← /terms-and-conditions
├── styles.css                  ← Site styles
├── legal.css                   ← Legal-page styles
├── vercel.json                 ← cleanUrls + security headers
└── brand/                      ← Master logo system and design tokens
    ├── a1-logo.png             ← Official master logo (header/footer/favicon/social)
    ├── og-image.png            ← 1200×630 social-share card
    ├── tokens.css
    ├── preview.html
    └── (legacy: logo-primary.svg, logo-icon.svg, logo-dark.svg)
```

> `airtable-automation.md`, `quote-link.md`, `quote-form-fix.html`, and `qr/`
> are project/dev references, not part of the published site.

## Next Steps

1. Create a dedicated Vercel project: `a1-creative-agency-site`
2. Attach domain `a1creativeagency.com` to that project only
3. Deploy with **Root Directory = `projects/a1-creative/`** (no rewrites needed)
