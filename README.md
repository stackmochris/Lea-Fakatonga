# Tongan Professional Dictionaries

A shared app shell for profession-specific Tongan–English terminology dictionaries,
modelled on the baseline set by *Tala 'Uhinga Fakafaito'o* (the Tongan medical
dictionary app). One codebase, one data schema, swappable content packs per
profession — see `/docs/project-scope.pdf` (add the proposal PDF here) for the
full brief.

## Find the source for a task

- **One profession or term.** Start with its shipped pack in [professions](src/data/professions), using the [pack registry](src/data/professions/index.ts) for keys and order.
- **Sheet comparison or import.** Open [import script](scripts/import-sheet.py) and [glossary check](scripts/check-glossary.mjs). The [sheet fixture](scripts/fixtures/sheet_terms.json) is an input to the check. The checked-in SDG pack and sheet fixture currently disagree. Verify the source rows and confirm which revision should govern before changing shipped terms.
- **UI or release.** Start at [App.tsx](src/App.tsx) for behaviour or [Pages workflow](.github/workflows/deploy.yml) and [Vite configuration](vite.config.ts) for deployment. Check this repository's files when documenting its release behaviour.

## Status

Profession packs live in `src/data/professions/*.json` and are registered in
`src/data/professions/index.ts`. `npm run check:glossary` counts them and checks
each row of `scripts/fixtures/sheet_terms.json` is represented, aside from the
skips in `scripts/sheet-coverage.json`. `_template.json` is the schema for a new
pack and is not registered.

## Stack

- **Vite + React + TypeScript** — static, offline-capable, no backend required
- **Content as data** — each profession is a JSON file under `src/data/professions/`
- Designed to be buildable into a static site and wrapped later (Capacitor/PWA)
  if a native app store presence is wanted — no rewrite required to get there

## Getting started

The dev and preview servers use the GitHub Pages base path.

```bash
npm install
npm run dev        # http://localhost:5173/Lea-Fakatonga/
npm run build      # static production build → dist/
npm run preview    # http://localhost:4173/Lea-Fakatonga/
```

## Adding a new profession

1. Copy `src/data/professions/_template.json` to `<profession-slug>.json`
2. Fill in entries following the schema (see comments in the template)
3. Register the new profession in `src/data/professions/index.ts`
4. Run `npm run dev` — it appears automatically in the profession picker

## Data schema

Every term entry has this shape (see `src/types.ts` for the enforced version):

| Field | Required | Notes |
|---|---|---|
| `id` | Yes | Stable slug, e.g. `router` |
| `en_term` | Yes | English term |
| `to_term` | Yes | Tongan term — use `'` (U+02BB, fakau'a) consistently, not `’` or `ʻ` variants |
| `en_definition` | Yes | Plain-language, 1–2 sentences |
| `to_definition` | Yes | Native-reviewed, not machine translated |
| `category` | Yes | Sub-topic for browsing, e.g. `Hardware`, `Safety` |
| `en_example` | Recommended | On-the-job phrasing |
| `to_example` | Recommended | Matched to the English example |
| `prefix` | Optional | Only for compound/technical domains |
| `audio_url` | Optional | Populated once native audio is recorded |
| `image_url` | Optional | Diagram or illustration |

## Not yet built

- Recorded pronunciation audio (the player renders when `audio_url` is set; none are yet)
- Offline storage / service worker
- Language toggle for UI chrome (content-level EN/TO toggle works)
- Native app wrapper
