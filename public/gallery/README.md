# TRHUE Hair Care — Client Gallery Images

Drop the four client work photos in this folder using these **exact filenames**:

| Filename | Label shown on the site |
| --- | --- |
| `silk-press.jpg` | Silk Press |
| `sleek-ponytail.jpg` | Sleek Ponytail |
| `pixie-curl-style.jpg` | Pixie Curl Style |
| `long-soft-curls.jpg` | Long Soft Curls |

The gallery cards in `src/components/Gallery.jsx` reference these paths
directly (`/gallery/silk-press.jpg`, etc.), so once the files land
in this folder the live site picks them up on the next build with no
code change.

## Optimization tips (not required)

- Aspect ratio: 3:4 (portrait) crops cleanest in the gallery grid.
- Width: ~1200 px is plenty — Vite serves them straight; the browser
  resizes for the card size.
- Format: JPG. ~200–400 KB after compression is a good target for
  fast mobile loads.
- If you only have phone screenshots, that's fine — the gallery uses
  `object-cover` with sensible focal positions; faces stay in frame.

## Graceful fallback

If a file is missing, the card still renders with a luxury pink
gradient + the label. The site never breaks because of a missing photo.
