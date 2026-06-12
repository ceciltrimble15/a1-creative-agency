# A1 Creative — Permanent Quote Link System

One URL for every surface. The destination changes behind it; the printed
link never does.

## The links

| URL | Status | Use |
|---|---|---|
| `https://a1creativeagency.com/quote` | **Preferred** — live after the one-time Netlify step below | Print + everything, once verified |
| `https://a1-creative-agency.vercel.app/quote` | **Live now** (after `QUOTE_FORM_URL` env var is set) | Everything, today |

Redirect chain: `a1creativeagency.com/quote` → `…vercel.app/quote` →
`QUOTE_FORM_URL` env var (currently the Airtable public intake form).
Retargeting = edit one Vercel env var + redeploy. No QR reprints, no button
edits, no social-bio changes — ever.

## One-time step to activate the branded URL (Netlify, ~5 min)

The `a1creativeagency.com` site is hosted on Netlify (site `a1creativeagency4`).
Netlify redirects are configured by a file named `_redirects` in the deployed
folder:

1. Netlify dashboard → site `a1creativeagency4` → **Deploys** → open the
   latest deploy → **Download** the ZIP and unzip it.
2. In the unzipped folder, create a plain-text file named exactly
   `_redirects` (no extension) containing one line:

   ```
   /quote https://a1-creative-agency.vercel.app/quote 302
   ```

3. Drag the whole folder back onto the Deploys page to publish.
4. Verify: open `https://a1creativeagency.com/quote` → you should land on
   the Airtable form.

Until that's done, use the Vercel URL everywhere digital (those links are
editable later). Print branded QR codes only AFTER step 4 passes.

## Which URL goes where

| Surface | URL |
|---|---|
| Flyers | `https://a1creativeagency.com/quote` (after activation) — QR: `qr/qr-quote-branded.png` |
| Business cards | same as flyers |
| Facebook page button + posts | `https://a1creativeagency.com/quote` (or Vercel URL today — editable later) |
| Instagram bio | same |
| Google Business Profile website/appointment link | same |
| Website "Get A Quote" buttons | `https://a1-creative-agency.vercel.app/quote` (skips one hop) |

## QR assets (`projects/a1-creative/qr/`)

| File | Encodes | Use |
|---|---|---|
| `qr-quote-branded.png` | a1creativeagency.com/quote | print, white background |
| `qr-quote-branded-transparent.png` | 〃 | print over colored designs |
| `qr-quote-branded.svg` | 〃 | designers/print shops, any size |
| `qr-quote-vercel.png` / `-transparent.png` / `.svg` | …vercel.app/quote | usable immediately, before the Netlify step |

All generated at error-correction level Q (survives print wear and partial
obstruction). Minimum print size ~0.8 in / 2 cm square.

## Backend

- `api/quote.js` — `/quote` on the Vercel project; 302 → `QUOTE_FORM_URL`
  env var, falls back to the homepage if unset. `Cache-Control: no-store`
  so retargets take effect immediately.
- Required env var (Vercel → Settings → Environment Variables → Production):
  `QUOTE_FORM_URL` = the Airtable public form share link. Redeploy after
  setting.

## Lead follow-up automation

Two equivalent builds (run only one on the Leads table):
- `airtable-automation.md` — click-path + paste-ready script.
- `airtable-automation-nocode.md` — same outcome with zero scripting,
  built from Airtable's point-and-click actions plus field defaults.

Both do: new Leads record → Task created, Automation Log written,
operations@a1creativeagency.com emailed, Status/Source defaulted when blank,
form values never overwritten.
