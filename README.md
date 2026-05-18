# TRHUE Hair Care — Landing Page

> Home of Pretty Hair Care Collection · Beauty. Care. Confidence. · Cincinnati, Ohio

A premium, mobile-first, single-page landing site for **TRHUE Hair Care**,
built as a real-world proof-of-concept for **A1 Creative Agency’s
“Starter — Community Access System.”**

It functions as a landing page, lead-capture surface, booking bridge, and
QR-ready business setup — the launch-ready infrastructure A1 Creative
delivers for local brands.

## Stack

- React 18 + Vite
- Tailwind CSS 3
- Framer Motion (subtle entrance / hover animation)
- No backend — the contact form captures input on the frontend only

## Run locally

```bash
npm install
npm run dev      # development server
npm run build    # production build → dist/
npm run preview  # preview the production build
```

## Sections

Navbar · Hero · Services · Gallery · Booking CTA · Contact / Lead Form ·
Scan-to-Book QR · Social & Contact · A1 Creative proof footer

## Brand logo

The logo is a faithful vector reproduction in
[`src/components/Logo.jsx`](src/components/Logo.jsx) so it stays crisp at
every size and powers the navbar, hero, footer, and hero watermark.

To use the original supplied artwork instead:

1. Drop the file in at `public/trhue-logo.png`
2. Set `USE_IMAGE = true` at the top of `src/components/Logo.jsx`

Every placement updates at once.

## Placeholders (intentional, frontend-only)

- Gallery uses styled placeholders — ready for real client photography
- QR section uses a decorative placeholder code — swap with the real
  booking QR
- Social handles, phone, and email are sample values
- The lead form does not POST anywhere yet (Airtable / Twilio / CRM are
  deliberately out of scope for the Starter build)

---

Built as a Community Access System by **A1 Creative Agency** —
Websites · Branding · Automation · Lead Systems.
