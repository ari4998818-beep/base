# Bright Sky Management — Website

A clean, consistent rebuild of the Bright Sky Management homepage, applying a
single unified design system (color, type, spacing, components) so every section
speaks with the same voice.

## What's here

| File | Purpose |
|------|---------|
| `index.html` | The full homepage — nav, hero, communities, about, impact, testimonials, contact, footer. |
| `styles.css` | The design system. Every color/font/size/spacing value lives here as a CSS variable (`:root`). **Change a token once, it updates everywhere.** |
| `main.js` | Light interactivity (testimonial carousel, contact-form feedback, tabs). No frameworks, no build step. |

## Design system at a glance (v2 — "Trust")

A restrained, institutional system: navy-led, quiet on accent, solid in structure.

- **Headings:** Source Serif 4 (transitional serif, weights 500–600) — all of them.
- **Body / UI:** Libre Franklin (neutral grotesque).
- **Signature line:** Source Serif *italic*, small and quiet — no script font.
- **Accent:** deep steel `#2E4D6B`, used on ~10% of the page. Navy `#16273F` leads; primary buttons are navy, not bright blue. Dark surfaces: ink `#0A1628`.
- **Spacing rhythm:** 80px sections on mobile → 128px on desktop.
- **Radii:** 4 (buttons/inputs/tags) · 8 (cards) · 12 (feature). No pills (avatars only).
- **Elevation:** hairline 1px borders over near-invisible shadows — no glow.
- **Stats:** real figures (units, years, states), never adjectives.

## Run it locally

It's a static site — just open `index.html` in a browser, or:

```bash
python3 -m http.server 8000   # then visit http://localhost:8000
```

## Deploy

Any static host works (Netlify, Vercel, GitHub Pages). `netlify.toml` is included
so Netlify serves the repo root with no build step.

## Swapping the photos

Hero, community, and feature images load from Unsplash. To use your own photos,
drop them in an `assets/` folder and update the `src` attributes in `index.html`.
If an image fails to load, a brand-colored gradient shows in its place.
