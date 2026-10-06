# Swipe — Product Facts

Single source of truth for factual claims used anywhere on the Swipe website
(copy, alt text, image-generation prompts). If a fact isn't recorded here,
don't state it on the site — add it here first. All facts below are taken
directly from the approved packaging reference
(`public/assets/swipe/source/packaging/dish-towel-roll-green-packaged.webp`).

## Brand

- **Name:** Swipe
- **Brand line (above logo on pack):** "Made to help, every day"
- **Positioning line:** "The Kitchen Cloth Made Smarter"
- **Logo:** pink/magenta script wordmark "Swipe" with a pink four-point spark
  over the "i", accent tick marks after the "e", and a navy underline swoosh.

## Product

- **Product name:** Swipe Dish Towel Roll
- **Format:** roll of tear-off microfiber cloths, white with a woven grid
  pattern and colored stitching lines
- **Count:** 30 cloths per roll
- **Descriptor row (pill on pack):** Reusable · Tearable · Washable
- **Usage line:** "For rinse, wash & dry. Built soft. Cleans strong."
- **Benefit icons (pack, left to right):** Reusable & eco friendly ·
  Super absorbent · Machine washable
- **Colorways:** Green (source photography exists). Blue and Red are
  approved variations that differ ONLY in stitching/accent color —
  generated from the green masters, never redesigned.

## Verified claims (usable in copy)

- Reusable
- Tearable (tear off one cloth at a time)
- Machine washable
- Super absorbent
- Eco friendly (as "Reusable & eco friendly", per pack icon)
- Built soft. Cleans strong.
- For rinse, wash & dry
- 30 cloths per roll

## Do NOT claim

Anything not on the packaging, including but not limited to: cloth
dimensions, GSM/material composition percentages, number of reuses or
washes, compostability/biodegradability, antibacterial properties,
price, or third-party certifications.

## Locked visual references (never redesign)

| File | Role |
|------|------|
| `source/logo/swipe-logo.webp` | Official Swipe script logo |
| `source/mascot/mascot-flat.webp` | Official flat packaging illustration of the mascot |
| `source/mascot/mascot-3d.webp` | Approved dimensional (3D) mascot for playful website scenes |
| `source/packaging/dish-towel-roll-green-packaged.webp` | Master packaging reference: construction, proportions, cloth count, printed information, window position |
| `source/products/dish-towel-roll-green-unpackaged.webp` | Master product reference: cloth texture, grid pattern, roll construction, stitching |

Mascot rules: the flat illustration and the 3D character are two approved
expressions of the SAME character. Flat = packaging-style graphics and small
decorative elements. 3D = dimensional website scenes. Never blend the two
styles into one altered character.

Color-variant rules: when producing blue/red variants, change only the
stitching, packaging accents, and corresponding color details. Preserve the
white microfiber cloth, exact grid pattern, roll size and proportions,
package construction, Swipe logo, typography, printed product information,
"30 Cloths", claims and icons, mascot placement, and window position. Never
let AI rewrite packaging text — use controlled image editing or compositing.

## Asset organization

Assets live under `public/assets/swipe/`:

| Folder | Contents |
|--------|----------|
| `source/logo/` | Original logo files |
| `source/products/` | Product photography (unpackaged rolls) |
| `source/packaging/` | Packaged product shots |
| `source/mascot/` | Mascot artwork (flat + 3D) |
| `source/brand/` | Other brand collateral |
| `generated/` | AI-generated or derived assets (never mix into `source/`) |

Rules:

1. `source/` is locked originals only — never overwrite or edit in place;
   derived versions go to `generated/`.
2. Every generated asset must be traceable to the source files and the
   facts on this page. When generating lifestyle scenes, composite the
   real supplied roll into the generated environment whenever possible.
