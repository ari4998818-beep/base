# Swipe — Product Facts

Single source of truth for factual claims used anywhere on the Swipe website
(copy, alt text, image-generation prompts). If a fact isn't recorded here,
don't state it on the site — add it here first.

## Brand

- **Name:** Swipe
- **Tagline:** _TODO_
- **One-line description:** _TODO_

## Product line

| Product | Format / size | Key claim | Notes |
|---------|---------------|-----------|-------|
| _TODO_  | _TODO_        | _TODO_    |       |

## Verified claims

Only claims with a source belong here.

- _TODO_

## Do NOT claim

Things that must never appear in copy or generated imagery (unverified,
legally sensitive, or off-brand).

- _TODO_

## Asset organization

Assets live under `public/assets/swipe/`:

| Folder | Contents |
|--------|----------|
| `source/logo/` | Original logo files (all lockups, light/dark variants) |
| `source/products/` | Product photography — the products themselves |
| `source/packaging/` | Packaging shots (boxes, wrappers, labels) |
| `source/mascot/` | Mascot artwork and reference sheets |
| `source/brand/` | Other brand collateral (patterns, color refs, type specimens) |
| `generated/` | AI-generated or derived assets (never mix into `source/`) |

Rules:

1. `source/` is originals only — never overwrite or edit files in place;
   derived versions go to `generated/`.
2. Every generated asset should be traceable to the source files and facts
   it was based on.
