# Inside the Sukkah

A community gallery of sukkahs: discover, submit, vote, and shop the look.
Static site, no build step: plain HTML, CSS, and ES modules.

```bash
cd inside-the-sukkah
python3 -m http.server 8000   # → http://localhost:8000
```

Deploys to any static host. `netlify.toml` publishes this folder as-is.

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
| `#/admin` | Review, approve/reject, edit, reorder photos, set the cover, review and fix product links, feature / Editor's Pick, manage votes, manage sample content. Demo passcode: `sukkah` |

## Files

```
js/seed.js      placeholder sukkahs, users, products (all flagged sample: true)
js/store.js     data layer — the only file that touches storage
js/i18n.js      English + heimish Yiddish strings
js/ui.js        cards, vote flow, WhatsApp share, modal, toast
js/views/*.js   one file per page
css/styles.css  the whole design system (tokens at the top)
img/            placeholder photos
```

## Things to know before launch

- **No backend yet.** State lives in the visitor's browser (localStorage, plus IndexedDB for uploaded photos),
  so submissions and votes aren't shared between devices. `js/store.js` is the only file that reads or writes
  data. Swap its functions for API calls (Supabase fits well: Postgres, Storage for photos, Auth for admin)
  and the pages don't change.
- **Voting uses email codes, in demo mode.** Nothing is emailed; the code appears on screen. With a backend,
  send the code from the server and stop returning it. Duplicates are blocked per email and per device.
- **The admin passcode is not security.** It only keeps casual visitors out of the UI. Put the admin behind
  real auth with the backend.
- **Placeholder photos are crops of the approved homepage mockup,** upscaled, so they're soft on large screens.
  Replace them via `/admin → Samples & settings`: delete the samples, or hand a sample's slot to a real
  submission.
- **Product links** in the sample data point to store *search* pages, not specific products.
- The "500+ sukkahs" badge and the contest line on Winners are editable in admin settings.

## Language

English is the default. The **אידיש** button in the nav switches the interface to heimish Yiddish and the
layout to right-to-left. Owner-written content (titles, descriptions, notes) stays in the owner's language.
Share text on WhatsApp follows the current language.
