# A1 Creative Agency — Master Logo System

> Infrastructure · Intelligence · Systems
> The operating system behind modern business growth.

A vector-native master logo system for **A1 Creative Agency**. The same
concept as the original lightbulb / circuit / A‑1 mark, re-engineered to
feel like premium tech infrastructure: brushed chrome, illuminated
circuitry, blue/gold split energy — engineered, not embroidered.

These SVGs are the **master digital files**: infinitely scalable, crisp
at any size, the format a designer hands off from Illustrator/Figma.
For raster derivatives (PNG, JPG, social previews), export from any
vector tool at the size you need.

## Files

| File | Use |
| --- | --- |
| `logo-primary.svg` | Flagship master logo — full bulb + A/1 + CREATIVE AGENCY plate. |
| `logo-icon.svg` | Symbol-only — bulb + A/1, no wordmark. App / favicon / social. |
| `logo-dark.svg` | Cinematic dark presentation mockup for decks and hero placements. |
| `tokens.css` | Brand color, gradient, and typography tokens (CSS custom properties). |
| `preview.html` | Static preview page rendering the full system. Open in any browser. |

Open `preview.html` directly in a browser to see the full system on its
intended dark stage.

## Concept

- **Lightbulb** — energy, ideas, illumination.
- **Circuitry** — engineered systems, AI infrastructure.
- **A / 1** — the central identity.
- **Blue / Gold split** — twin currents: technology and craft.
- **Brushed chrome rim** — luxury hardware feel.

## Color system

| Token | Value | Purpose |
| --- | --- | --- |
| `--a1-black` | `#04070d` | Base background |
| `--a1-navy` | `#0a1626` | Deep brand background |
| `--a1-silver-1` | `#e7ecf3` | Chrome highlight |
| `--a1-blue` | `#2a82ff` | Electric blue (left current) |
| `--a1-gold` | `#dfb346` | Metallic gold (right current) |

Gradients (`--a1-grad-chrome`, `--a1-grad-blue`, `--a1-grad-gold`,
`--a1-grad-stage`) match the stops used inside the SVG masters, so any
product surface stays consistent with the logo.

## Typography

- **Display / wordmark**: Space Grotesk (600) — architectural, luxury-tech.
- **Body**: Inter (400 / 500).

The wordmark in `logo-primary.svg` uses `<text>` with a font-family
fallback chain (Space Grotesk → Inter → Helvetica Neue → Arial). Before
distributing final brand assets, convert the text to outlines in your
vector editor so the mark renders identically regardless of installed
fonts.

## Usage rules

- Always reproduce the mark on a dark surface (`#04070d`–`#0a1626` range).
- Maintain at least one bulb-width of clear space around the logo.
- Never stretch, recolor, or replace the chrome/blue/gold treatment.
- For monochrome contexts, request a dedicated single-color export.
- Minimum size: 32 px for the icon, 240 px wide for the primary mark.

## Export to raster (when you need PNGs)

Any of these will produce clean PNGs from the SVG masters:

```bash
# rsvg-convert (librsvg)
rsvg-convert -w 1024 logo-primary.svg -o logo-primary@1024.png

# Inkscape
inkscape logo-primary.svg --export-type=png -w 1024 -o logo-primary@1024.png

# ImageMagick / Resvg
magick -density 320 logo-primary.svg logo-primary@1024.png
```

For social, favicon, and app icon sets, export `logo-icon.svg` at 1024,
512, 192, 64, 32 px.

---

A1 Creative Agency · Master Brand System · v1.0
