# SukkahPin

A community gallery of sukkahs: discover, submit, vote, and shop the look.
Static front end (plain HTML, CSS, ES modules, no build step) on **Supabase** (database, email sign-in,
photo storage), deployed on **Vercel** from git.

```bash
cd sukkahpin
python3 -m http.server 8000   # → http://localhost:8000  (talks to the live Supabase project)
```

## Pages

| Route | What it is |
|---|---|
| `#/` | Hero (drag, tilt, and tap the photo prints to swap the main image), Trending / New / Most Voted, Explore by style, masonry gallery with filters, Sukkah Sources teaser |
| `#/explore?f=Modern` · `#/explore?q=monsey` | Full gallery, filtered or searched (press `/` anywhere to search) |
| `#/sukkah/<slug>` | Project-style sukkah page: photo story, **Shop this sukkah** hotspots, product list, vote, WhatsApp share |
| `#/submit` | 5-step submission: photos (camera / library / drag-drop, reorder, cover) → details → tag products on the photo → about you → live preview |
| `#/sources` · `#/sources/<item>` | Every tagged product, by shelf, with "Seen in these sukkahs" |
| `#/winners` | Editor's Picks + live standings |
| `#/about` | About |
| `#/admin` | Review, approve/reject, edit, reorder photos, set the cover, review and fix product links, feature / Editor's Pick, manage votes, manage sample content. Sign in with an email listed in `sp_admins` |

## Files

```
js/seed.js      placeholder sukkahs (already loaded into Supabase; used by admin "Restore samples")
js/config.js    Supabase URL + publishable key
js/store.js     data layer — the only file that talks to Supabase
js/i18n.js      English + heimish Yiddish strings
js/ui.js        cards, vote flow, WhatsApp share, modal, toast
js/views/*.js   one file per page
css/styles.css  the whole design system (tokens at the top)
img/            placeholder photos
brand/          logo (SVG + PNG), icon, and ready-made social graphics
```

## Backend (Supabase project `sukkah-gallery`)

SukkahPin uses its own `sp_*` tables and `sp-photos` bucket, so the earlier prototype tables in the same
project are untouched.

| Table | What | Who can read / write |
|---|---|---|
| `sp_sukkahs` | Sukkahs, photos + product hotspots (jsonb), vote count, `year`, `visit` (open / address / times / contact), `video` | Public reads approved; admins everything |
| `sp_contacts` | Submitter name / email / phone | Admins only |
| `sp_votes` | One row per (sukkah, signed-in user) — unique | Users insert/read their own; admins read/delete |
| `sp_admins` | Admin emails | — |
| `sp_settings` | Hero stat, contest line | Public read; admins write |

- **Submissions** go through `sp_submit()` (inserts a *pending* sukkah + private contact). Photos and an optional
  video upload to `sp-photos/uploads/` (images + mp4/mov/webm, 50 MB max); a YouTube/Vimeo link works too.
- **Year & visiting**: owners pick the year. Only this year's sukkahs can be marked *open to visitors*; the
  address, times and optional phone/WhatsApp are then public on the page (with Directions + WhatsApp buttons)
  and in the gallery's "Open to visit" filter. They disappear automatically once the year rolls over.
- **Voting** is one tap via a guest (anonymous) sign-in; email is the fallback. A trigger keeps `votes` in sync,
  only approved sukkahs accept votes, and each network is capped at 25 votes per sukkah per day.
- **Admins**: add a row to `sp_admins` (lower-case email). `ari4998818@gmail.com` is there already.

### One-time Supabase dashboard setup

1. **Auth → Sign In / Providers → Allow anonymous sign-ins: ON.** This is what makes voting one tap: the
   phone gets a guest account on the spot (no email). The database still allows one vote per guest per
   sukkah, and at most 25 votes per sukkah per network per day (hashed IP), so clearing the browser or
   using incognito can't stuff the ballot. If this is off, voting falls back to an email sign-in.
   Optional hardening later: enable Cloudflare Turnstile under Auth → Bot and Abuse Protection.
2. **Auth → URL Configuration**: set *Site URL* to the Vercel URL (e.g. `https://sukkahpin.vercel.app`) and add
   `https://sukkahpin.vercel.app/**` to *Redirect URLs*. The admin sign-in link uses it.
3. **Admin sign-in** is by emailed link to an address in `sp_admins`. Supabase's built-in sender handles this
   (a few emails an hour is plenty for admins). Custom SMTP (Resend, etc.) is only needed if you later want
   email-based voting or to edit the email templates.

## Deploy (Vercel, from git)

1. vercel.com → **Add New… → Project** → import the GitHub repo `ari4998818-beep/base`.
2. Framework preset: **Other**. Leave **Root Directory** as `./` — the repo-root `vercel.json` serves the
   `sukkahpin/` folder. (Setting Root Directory to `sukkahpin` also works; then `sukkahpin/vercel.json` applies.)
3. Deploy. Every push now redeploys: the default branch goes to production, other branches get preview URLs.
   (To make this branch production, merge it into `main`, or change *Settings → Git → Production Branch*.)
4. Put the resulting URL into the Supabase *Site URL* (step 1 above). Add a custom domain in Vercel whenever.

## Still to know

- **Placeholder photos are crops of the approved homepage mockup,** upscaled, so they're soft on large screens.
  Replace them via `/admin → Samples & settings`: delete the samples, or hand a sample's slot to a real
  submission.
- **Product links** in the sample data point to store *search* pages, not specific products.
- The "500+ sukkahs" badge and the contest line on Winners are editable in admin settings.
- Photo uploads are open to anyone (that's how submissions work). Admins can delete a sukkah, which also deletes
  its uploaded photos.

## Language

English is the default. The **אידיש** button in the nav switches the interface to heimish Yiddish and the
layout to right-to-left. Owner-written content (titles, descriptions, notes) stays in the owner's language.
Share text on WhatsApp follows the current language.

## Brand

The wordmark is **SukkahPin** in Inter Tight Bold, converted to outlines so it renders the same everywhere.
The dot of the "i" is a green pin (`#7CC242`) with a cut-out eye. The UI accent stays citron (`#D8F23A`).

| File | Use |
|---|---|
| `brand/sukkahpin-logo.svg` / `png/sukkahpin-logo.png` | Default: black type, green pin, transparent |
| `brand/sukkahpin-logo-white.svg` / `.png` | On dark backgrounds or photos |
| `brand/sukkahpin-logo-black.svg` / `.png` | One-colour (print, stamps) |
| `brand/sukkahpin-pin.svg`, `sukkahpin-icon.svg`, `png/sukkahpin-icon-*.png` | Favicon, app icon, small spaces |
| `brand/social/whatsapp-status-1080x1920.png` | WhatsApp status / stories |
| `brand/social/og-image-1200x630.png` | Link previews (WhatsApp, iMessage, social) |
| `brand/social/avatar-*.png` | Profile pictures (circle-safe) |

Keep clear space around the wordmark of at least the pin's height. Don't recolour the type, stretch it, or put
the green pin on the citron accent.
