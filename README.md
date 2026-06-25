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

## Design system at a glance

- **Headings:** Fraunces (serif) — *all* of them, consistently.
- **Body / UI:** Nunito Sans.
- **Signature line only:** Dancing Script ("Quality housing isn't a privilege…").
- **Accent:** one blue `#2563EB`. Dark surfaces: ink `#0B1120`.
- **Spacing rhythm:** 96px sections on mobile → 144px on desktop.
- **Radii:** 8 (UI) · 16 (cards) · 24 (feature) · pill.

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
