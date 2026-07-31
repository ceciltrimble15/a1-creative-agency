#!/usr/bin/env bash
# Assemble a self-contained, drag-ready Netlify deploy bundle for
# a1creativeagency.com into ./site/. Netlify deploys for this site are manual
# drag-and-drop (see quote-link.md), so this produces one folder you can drop
# straight onto the Netlify Deploys page — no build step, no git link required.
#
# Usage:  cd projects/a1-creative && bash build-site.sh
set -euo pipefail
cd "$(dirname "$0")"

OUT="site"
rm -rf "$OUT"
mkdir -p "$OUT/brand"

# Landing page becomes the site root (/)
cp missed-call/index.html "$OUT/index.html"

# Landing-page styles. In the flat bundle, brand/ sits at the root, so rewrite
# the stylesheet's ../brand/ import to brand/.
sed 's#\.\./brand/#brand/#g' missed-call/styles.css > "$OUT/styles.css"

# Compliance pages + shared legal styling (served at /privacy, /terms, /sms-consent)
cp privacy.html terms.html sms-consent.html legal.css "$OUT/"

# A2P URL-compatibility aliases (real 200 routes, NOT redirects).
# Twilio already has these URLs registered on the campaign and they can't be
# edited reliably, so we make them valid at the website level by serving byte-for-byte
# identical content at the alias paths. The originals /privacy, /terms, /sms-consent
# are left completely untouched.
#   /privacy-policy         == /privacy
#   /terms-and-conditions   == /terms
#   /get-a-quote            == /sms-consent  (the compliant quote form with the
#                              unchecked optional SMS checkbox + Privacy/Terms links)
cp privacy.html      "$OUT/privacy-policy.html"
cp terms.html        "$OUT/terms-and-conditions.html"
cp sms-consent.html  "$OUT/get-a-quote.html"

# Brand assets (logos, tokens) referenced by every page
cp brand/logo-primary.svg brand/logo-icon.svg brand/logo-dark.svg brand/tokens.css "$OUT/brand/"

# Netlify routing:
#  - The three A2P aliases are also declared as 200 rewrites as a belt-and-suspenders
#    backup to the real alias files above (either mechanism yields HTTP 200, same content).
#  - /quote keeps redirecting to the Vercel quote endpoint (unchanged behavior)
#  - /api/* is proxied to the Vercel serverless functions so the consent form
#    can POST same-origin to /api/submit-lead (no CORS, no config in the page)
cat > "$OUT/_redirects" <<'EOF'
/privacy-policy          /privacy.html            200
/terms-and-conditions    /terms.html              200
/get-a-quote             /sms-consent.html        200
/quote   https://a1-creative-agency.vercel.app/quote            302
/api/*   https://a1-creative-agency.vercel.app/api/:splat       200
EOF

echo "Built $OUT/:"
find "$OUT" -type f | sort
