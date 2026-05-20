# A Touch of Feather LLC — Landing Page

Premium contractor prototype landing page for **A Touch of Feather LLC**
(General Contractor · Master Carpenter).

This branch is a clean, solo build — no shared history or routes with
any other client landing page.

## Structure

```
/
├── vercel.json                          # static deploy + root rewrite
└── touch-of-feather-landing/
    ├── index.html                       # the landing page
    ├── styles.css                       # full brand visual system
    └── assets/
        ├── touch-of-feather-logo.png    # ← drop the rendered logo here
        └── logo-mark.svg                # SVG fallback (auto-used if PNG missing)
```

## Deploy behavior

`vercel.json` rewrites the preview root (`/`) to the landing page so
the Vercel preview opens A Touch of Feather immediately — no
`/touch-of-feather-landing` path required.

## Logo

The page references **`/touch-of-feather-landing/assets/touch-of-feather-logo.png`**
in the navbar, hero, and footer. Drop the rendered brand asset at that
path and commit — the page will pick it up across all three
placements automatically.

If `touch-of-feather-logo.png` is not present, an `onerror` fallback
swaps in `assets/logo-mark.svg` (a tasteful steel-blue feather + brushed
metal claw hammer) so the prototype never renders broken.

## Stack

Static HTML + CSS. No build step. No backend. Lightweight, fast,
deploy-ready, and easy to revise.
