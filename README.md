# Tongan Professional Dictionaries

A shared app shell for profession-specific Tongan–English terminology dictionaries,
modelled on the baseline set by *Tala 'Uhinga Fakafaito'o* (the Tongan medical
dictionary app). One codebase, one data schema, swappable content packs per
profession — see `/docs/project-scope.pdf` (add the proposal PDF here) for the
full brief.

## Status

Three profession packs ship in `src/data/professions/`: Agriculture (`agriculture.json`),
Computer Terms (`computer-terms.json`), and Sustainable Development Goals (`sdg.json`).
They are imported by `src/data/professions/index.ts` and rendered as subject tabs.
The JSON copy is the glossary; the interface does not rewrite it. `_template.json`
is the schema for a new pack and is not registered.

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
