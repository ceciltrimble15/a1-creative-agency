# Deploying the A1 Creative site to Netlify (`a1-creative-site`)

The A1 Creative website is a **self-contained static site** in
`projects/a1-creative/missed-call/` (homepage `index.html`, plus `/start`
and `/thank-you`, `styles.css`, and a vendored `brand/` folder). It is wired
to deploy to the Netlify project **`a1-creative-site`**
(site ID `ed5c9f8a-60b9-40cc-9e06-d297b42f63ca`,
team "A1 Creative Agency go getter", primary URL
`https://a1-creative-site.netlify.app`).

Netlify Forms is already **enabled** on that site. The root `netlify.toml`
scopes the publish directory to the A1 folder (so the root TRHUE/Vite app is
NOT deployed here), turns on pretty URLs for `/start` and `/thank-you`, and
sets security headers.

## Deploy — pick ONE

### A. Connect the repo (recommended, gives auto-deploys)
Netlify dashboard → `a1-creative-site` → **Site configuration → Build &
deploy → Link repository** → choose `ceciltrimble15/a1-creative-agency`,
branch `claude/zealous-dijkstra-4gdnt2` (or `main` after merge). The root
`netlify.toml` supplies publish dir + no-build command automatically.

### B. CLI deploy from your machine (one-off)
From the repo root, on this branch:
```shell
npx netlify-cli@latest deploy --prod \
  --site ed5c9f8a-60b9-40cc-9e06-d297b42f63ca \
  --dir projects/a1-creative/missed-call
```
(Run `npx netlify-cli login` first if not authenticated.)

### C. Manual drag-and-drop
Netlify → `a1-creative-site` → **Deploys** → drag the
`projects/a1-creative/missed-call/` folder onto the page. The folder is
self-contained, so the logo, tokens, `/start`, and `/thank-you` all resolve.

> Note: an automated deploy attempted from the Claude Code web session was
> rejected by Netlify's API with 403 (session token/plan limitation), so the
> upload must be run from one of the paths above.

## After deploy — verify the launch checklist
1. Open `https://a1-creative-site.netlify.app/` — restored homepage loads.
2. Open `/start` and `/thank-you` — both load (pretty URLs).
3. Netlify → `a1-creative-site` → **Forms** — a form named
   **`a1-system-audit`** appears (auto-detected on deploy).
4. Submit a test on `/start` — it should redirect to `/thank-you` and the
   submission should appear under **Forms** (including the `sms_consent` value).
5. **Form notification:** Forms → `a1-system-audit` → **Settings & usage →
   Form notifications → Add notification → Email notification** →
   `operations@a1creativeagency.com`. (This can only be set in the UI/API
   once the form exists; there is no config-file equivalent.)

## Pointing the production domain
To make `a1creativeagency.com` serve this version, add the custom domain to
`a1-creative-site` (Domain management → Add a domain) and update DNS — OR, if
the apex currently points at the separate `a1creativeagency4` site, move the
domain to this project. That `a1creativeagency4` site is under a different
Netlify account not reachable from this session.
