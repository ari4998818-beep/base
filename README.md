# Chloe Jewelers — Website

A short, highly art-directed one-page site for **Chloe Jewelers**, an
appointment-based fine-jewelry business. Built around a single visual concept —
a **modern jewelry display case**: fine burgundy architectural lines, warm ivory
space, the burgundy CHLOE logo, and editorial photography, presented as one
continuous designed experience. Not an e-commerce store: no prices, cart, or
product catalog.

**Four compact sections:** (1) the art-directed display-case hero, (2) Selection ·
Quality · Personal Service, (3) one editorial jewelry showcase, (4) appointment +
contact. On load, the burgundy lines draw the case, the logo appears, the jewelry
settles in, and a few diamonds catch the light — slow and restrained, and disabled
under `prefers-reduced-motion`.

## What's here

| File | Purpose |
|------|---------|
| `index.html` | The full one-page site — nav, hero, brand values, collection, the Chloe experience, appointment scheduler, contact, footer. Semantic HTML with SEO metadata. |
| `styles.css` | The design system. Every color, font, and spacing value lives as a CSS variable in `:root`. **Change a token once, it updates everywhere.** |
| `main.js` | Interactions (scroll reveals, hero parallax + light-catches, mobile menu, custom cursor, Cal.com embed). No frameworks, no build step. The **CONFIG** block at the top holds everything you routinely change. |
| `assets/` | Brand logo (rendered from the supplied `.ai`), favicon, and the jewelry photographs. |

## Run it locally

Static site — just open `index.html`, or:

```bash
python3 -m http.server 8000   # then visit http://localhost:8000
```

## 1) Add the jewelry photographs

The layout reserves three correctly-proportioned image slots. Drop your photos
into `assets/` using these exact names (until then, an on-brand placeholder shows
in each slot — no broken images, no layout shift):

| File | Where it appears | Suggested crop |
|------|------------------|----------------|
| `assets/hero-necklace.jpg` | Hero + Collection “Signature Necklaces” | portrait ~1104 × 1288 |
| `assets/silver-set.jpg` | Collection “Refined Essentials” | portrait ~852 × 1120 |
| `assets/gold-ring.jpg` | Collection “Pieces for Every Occasion” + Experience | portrait ~1333 × 1620 |

To use different images later, replace the files (or edit the `src` paths in
`index.html`). Keep roughly the same aspect ratios to preserve the crops.

## 2) Connect the real Cal.com scheduler

The appointment section shows a refined **“Online scheduling coming shortly”**
state (with call/email actions) until you add a real booking link — no fake
calendar, availability, or dates are shown. In `main.js`, set:

```js
const CONFIG = {
  calLink: "chloe-jewelers/private-appointment",  // your Cal.com "username/event-slug"
  ...
};
```

Once set, the live Cal.com inline embed replaces that state automatically —
handling live availability, Google Calendar sync, confirmations, rescheduling and
cancellation. Configure the booking questions **(name, phone, email, and the
optional “What are you looking for?”)** on the Cal.com event type itself. The embed
is themed to the Chloe palette via `Cal("ui", …)`.

> No live Cal.com username is invented in this code — you supply the real one.

## 3) Business details & Instagram

Phone, email, and the Instagram URL also live in `main.js` → `CONFIG`. The
Instagram link stays visible but does not navigate anywhere until you set
`CONFIG.instagram` to a real profile URL (no handle is invented).

- **Phone:** 845-538-0053 (click-to-call `tel:` link — not WhatsApp)
- **Email:** chloejewelers@gmail.com
- By appointment only · daytime and evening appointments available
- No street address is displayed anywhere on the site.

## Brand & accessibility notes

- **Logo:** the supplied burgundy CHLOE logo is used intact (rendered from the
  `.ai` file to `assets/chloe-logo.png`, plus an ivory version for dark
  backgrounds). It is never recreated with a font.
- **Type:** Bodoni Moda for editorial headings, Manrope for body/UI/labels
  (Google Fonts).
- **Palette:** burgundy `#4C1423`, champagne `#C59D71`, ivory `#F7F4F4`,
  cream `#F1E9E1`, charcoal `#272223`.
- Keyboard accessible with visible focus states, strong contrast, semantic
  landmarks, and full `prefers-reduced-motion` support (animations, parallax, and
  the custom cursor all disable).

## Deploy

Any static host works. `netlify.toml` serves the repo root with no build step.
