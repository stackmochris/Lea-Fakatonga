# Tongan Professional Dictionaries

A shared app shell for profession-specific Tongan–English terminology dictionaries,
modelled on the baseline set by *Tala 'Uhinga Fakafaito'o* (the Tongan medical
dictionary app). One codebase, one data schema, swappable content packs per
profession — see `/docs/project-scope.pdf` (add the proposal PDF here) for the
full brief.

## Status

Scaffold only. No content populated yet — see `src/data/professions/_template.json`
for the schema every profession pack must follow.

## Stack

- **Vite + React + TypeScript** — static, offline-capable, no backend required
- **Content as data** — each profession is a JSON file under `src/data/professions/`
- Designed to be buildable into a static site and wrapped later (Capacitor/PWA)
  if a native app store presence is wanted — no rewrite required to get there

## Getting started

```bash
npm install
npm run dev       # local dev server
npm run build      # static production build → dist/
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

- Audio playback UI (field exists in schema, player component not built)
- Offline storage / service worker
- Language toggle for UI chrome (content-level EN/TO toggle works)
- Native app wrapper
