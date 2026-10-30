# Local review draft: Campus Navigator interactive preview

**Not a hosted PR. Do not push, merge or deploy without approval.** The feature branch is stacked on `work`; security commit `a682b4c` must remain unchanged. The security PR must be merged before rebasing this feature onto the updated approved `main` and preparing a separate main-targeting PR.

## Summary

Replace the text-only Campus Navigator with a responsive map/directory/details interface, route-scoped styling and browser-only Leaflet. Include local search, category/faculty/department filtering, selection reconciliation, mobile Map/Directory switching, explicit tile-service consent, attribution and graceful service failures. Add typed evidence/coordinate/photo metadata, marker eligibility checks and fixed-origin external directions generation, plus source and maintenance documentation.

## Critical data caveat — not ready for public-data release

Official University of Ilesa and OSM source reads were blocked by the environment proxy. The directory currently contains only two **candidate** records grounded in the existing NIPSA repository: University of Ilesa and Department of Pharmacology. They are not claimed as independently verified official-directory entries. There are **zero verified campus coordinates**, **zero campus markers**, no campus photographs or invented landmarks, and no internal route guidance. The map explicitly offers a world reference view rather than pretending to show the campus. University-level points, if later verified, cannot be used as building directions.

Enable the saved university/OSM network domain requirements in environment settings and resume source review before treating this as the requested data-complete, publicly publishable preview. Do not invent records to close the gap. A network draft save does not establish working runtime access.

## Validation

Executed on 30 October 2026:

- Clean `npm ci` passed; lint passed without errors/warnings.
- `npm test`: 67 individual tests passed (47 existing security + 20 navigator), no failures/skips. The sandbox's file-only summaries were not counted as successful case execution.
- `npm audit`: zero reported vulnerabilities.
- Default `npm run build`: compiled, type-checked and exported all 38 static outputs successfully after preserving/clearing stale generated cache. The earlier restricted-worker failure and webpack/gallery diagnostic are documented in the maintenance guide, not hidden.
- `npm run check:export`: 35 HTML documents, 72 same-origin asset/link references and 65 JSON-LD blocks; no missing internal references.
- Chromium desktop 1440×1100 and mobile 390×844 smoke checks passed for search/filtering, record/detail selection, empty/reset behavior, safe source links, map consent/zoom, tile service failure/retry, zero unverified pins, mobile view switching, JSON-LD and no horizontal overflow/uncaught runtime errors. Real map tiles and external source availability were not validated; third-party requests were deliberately blocked.
- Patch whitespace and changed-file scope checks passed. Security commit remains unchanged. Remote `main` still points to `0703725`; no conditional rebase was performed.

 Required gates are clean installation, lint, existing security/new navigator tests, dependency audit, default production build, static-export references and optional desktop/mobile browser smoke tests. The optional Playwright script blocks third-party services intentionally to exercise offline fallbacks and makes no live tile-service or photograph claim. Synthetic test coordinates never ship in production data.

## Review scope

Only `app/campus-navigator/*`, new navigator tests/browser script/docs, and the minimal Leaflet/type-definition manifest/lockfile additions belong in the feature diff against `work`. Existing security tests, security documentation, deployment workflow, shared header/footer, navigation and public assets are unchanged. No API, backend, paid service, geolocation permission, indexing integration or hosting change is introduced.

## After security approval

Inspect the actual security merge strategy, fetch updated main, and rebase only feature commits as described in the maintenance guide. Resolve dependency/lockfile conflicts without dropping the approved security versions. Rerun all gates and browser checks before seeking approval to push and open the separate feature PR. No rebase or hosted PR is claimed until that prerequisite exists and publication is authorized.
