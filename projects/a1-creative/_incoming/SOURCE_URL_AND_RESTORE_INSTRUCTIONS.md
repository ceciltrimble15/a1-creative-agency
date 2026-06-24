# A1 Creative Incoming Source

This is the safe incoming recovery note for the broader A1 Creative homepage.

## Source URL from the uploaded saved HTML

The uploaded HTML file in ChatGPT/Shuri was saved from this Netlify deploy URL:

https://6a1c7fb3b8c29c6f71183bd6--a1creativeagency4.netlify.app/

## Why this file exists

The full uploaded HTML is visible in ChatGPT/Shuri's environment, but Claude Code could not see the chat upload channel. The reliable way for Claude Code to recover the homepage is to pull the public deploy URL directly or receive the full file through GitHub.

## Claude Code instruction

Do not use the missed-call-only ZIP as the source of truth.

First, try to pull the source directly:

```bash
mkdir -p projects/a1-creative/_incoming
curl -L "https://6a1c7fb3b8c29c6f71183bd6--a1creativeagency4.netlify.app/" -o projects/a1-creative/_incoming/index.html
```

Then inspect `projects/a1-creative/_incoming/index.html` read-only before moving anything into the publish folder.

## Confirm the incoming file has

- A1 Creative Agency | Websites. Branding. Automation. Lead Systems. | Cincinnati, Ohio
- The broader A1 Creative business infrastructure positioning
- The hero: "Build The Business System Behind Your Brand"
- `operations@a1creativeagency.com`
- Phone/Text: `(513) 440-3329`
- Airtable quote form link
- Calendly discovery call link
- PayPal project deposit link
- Package structure around QuickLaunch / Community Access / Growth Infrastructure / VIP
- Internal anchors like `#proof`, `#services`, `#packages`, `#why`, and `#contact`

## Apply only approved launch fixes after inspection

1. Change footer year from 2025 to 2026.
2. Keep `operations@a1creativeagency.com`.
3. Keep Airtable, Calendly, and PayPal links.
4. Confirm internal links are relative anchors, not old Netlify deploy URLs.
5. Move the inspected source into `projects/a1-creative/missed-call/index.html` only after confirmation.
6. Deploy preview only to `a1-creative-site`.
7. Do not touch `a1creativeagency.com` until preview is approved.

## Notes

This instruction file is intentionally stored in `_incoming` so it does not overwrite the current reconstruction or the live publish folder before inspection.
