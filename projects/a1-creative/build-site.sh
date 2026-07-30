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

# Brand assets (logos, tokens) referenced by every page
cp brand/logo-primary.svg brand/logo-icon.svg brand/logo-dark.svg brand/tokens.css "$OUT/brand/"

# Netlify routing:
#  - /quote keeps redirecting to the Vercel quote endpoint (unchanged behavior)
#  - /api/* is proxied to the Vercel serverless functions so the consent form
#    can POST same-origin to /api/submit-lead (no CORS, no config in the page)
cat > "$OUT/_redirects" <<'EOF'
/quote   https://a1-creative-agency.vercel.app/quote            302
/api/*   https://a1-creative-agency.vercel.app/api/:splat       200
EOF

echo "Built $OUT/:"
find "$OUT" -type f | sort
