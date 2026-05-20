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
└── brand/              ← Master logo system and design tokens
    ├── logo-primary.svg
    ├── logo-icon.svg
    ├── logo-dark.svg
    ├── tokens.css
    ├── preview.html
    └── README.md
```

## Next Steps

1. Create a dedicated Vercel project: `a1-creative-agency-site`
2. Attach domain `a1creativeagency.com` to that project only
3. Deploy `projects/a1-creative/` as the root for that project
