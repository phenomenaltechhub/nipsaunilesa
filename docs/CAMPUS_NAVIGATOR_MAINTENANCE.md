# Campus Navigator maintenance and review

## Branch and release separation

`feature/campus-navigator-preview` starts from security commit `a682b4c` on `work`, as explicitly approved. Do not amend the security commit. Navigator changes belong in separate commits and are compared against `work` until the security PR is merged. No push, merge or deployment is authorized.

After the owner confirms the security PR is merged, fetch `origin/main` and inspect its history. For a normal merge retaining `a682b4c`, rebase the feature onto `origin/main`. For a squash/rebase merge, inspect patch equivalence and use `git rebase --onto origin/main a682b4c feature/campus-navigator-preview` to replay **only** feature commits. Do not blindly replay the security commit or force-push. If conflicts occur, preserve the approved security behavior, resolve one change at a time, and rerun every check below. The rebase is conditional on that external merge and has not been performed. Prepare a separate `main`-targeting PR only after approval to push; see `CAMPUS_NAVIGATOR_PR.md` for the local review draft and blockers.

## Data files and trust boundary

- `app/campus-navigator/data.ts`: typed source register and records. Candidates and verified entities are distinct; an institutional name is not a separate physical destination.
- `app/campus-navigator/model.ts`: data checks, search/filtering, selected-record reconciliation, map eligibility and a fixed-origin external-directions URL builder.
- `navigator.tsx`: accessible directory/detail interface. `campus-map.tsx`: browser-only dynamic Leaflet loading, explicit external tile consent, map selection synchronization and service fallback. `navigator.module.css`: route-scoped styling; shared header/footer/SEO infrastructure is retained.

Do not edit compiled `out/` or `.next/` files, hardcode fake marker fixtures in the app, or bypass validation to make the directory look fuller. Source metadata is an auditable assertion requiring reviewer judgment, not automatic proof that a source is true.

## Add or verify a record

1. Follow `CAMPUS_NAVIGATOR_SOURCES.md`; verify the exact official name, category, purpose and faculty/department association. Add a source with stable ID, exact HTTPS URL, kind, `lastChecked`, `access: "reviewed"` and a concrete evidence summary. Do not mark a source reviewed while access is blocked. Keep distinct candidate records when evidence is incomplete.
2. Add a stable kebab-case record ID and plain-text description. Set `verification: "verified"` only after an actual supporting source was reviewed. Faculty/department may be `null`; unknown association must not be guessed. Existing `candidate` records can remain in the directory with explicit warnings.
3. Keep `position: null` until coordinates are geographically verified. A position needs latitude/longitude in valid ranges, source IDs including a reviewed geographic record, `independentlyVerified: true`, `verifiedOn`, precision (`university`, `building` or `entrance`) and an explicit `usableForDirections` decision. Preserve the independently checked evidence in the source register/documentation. University points are labeled as reference points and can never yield building directions.
4. Only current filtered, eligible records become markers. Selecting a marker and selecting its directory card update the same ID. Filtering reconciles selection to the first remaining record; zero results clears details without retaining a stale marker selection.
5. No walking paths or internal routing exist. A future verified non-university destination may opt into an external Google Maps directions link built from validated numbers on a fixed HTTPS origin. This is provider routing, not verified internal campus walking guidance. Do not enable it for an area centroid or a non-routable point.
6. Landmark references need their own reviewed source IDs. Accessibility information needs documented evidence and should state its scope/date; never infer accessible entrances from a photograph.

## Add photographs

Obtain rights first. Keep images under `public/campus-navigator/` with simple filenames and a reviewed source ID, license/permission, author credit and meaningful alt text. Only local raster JPG/PNG/WebP/AVIF paths are accepted. Validate actual file type, dimensions and content, remove inappropriate metadata and optimize image weight. Never upload SVG/HTML/scripts or arbitrary submitted files to the site origin. Photograph credits are shown in the details panel; retain permission evidence in documentation. No real campus photographs are currently licensed/added.

## Map service and privacy

No paid API, backend, database, geolocation permission or runtime geocoder is needed. Leaflet is the only added runtime dependency; TypeScript definitions add their small type dependency. Local search is entirely in memory. Standard OSM tiles are loaded only on consent, which sends normal requests to OSM; preserve attribution, browser caching and Referer and comply with OSM's service policy. Do not prefetch/offline-cache tiles. Source links use HTTPS and `noopener noreferrer`; marker text uses textContent and React escapes display copy. Fixed attribution/marker icon markup contains no record-supplied HTML.

On tile failures the app explains that the base map may be incomplete; directory/details remain available and Retry reinitializes the map. A missing library chunk is also handled. Map/List switching is touch-friendly on mobile; hiding/showing the map triggers a ResizeObserver size refresh. Do not silently replace an unavailable map with a fictional campus diagram.

## Required checks

From the repository root:

```
npm ci
npm run lint
npm test
npm audit
npm run build
npm run check:export
```

The node test runner must report individual assertions/cases, not just a successful file invocation. This cloud sandbox suppressed child test execution until run with the appropriate process permissions; `node --test --experimental-test-isolation=none tests/*.test.mjs` is a diagnostic alternative on Node 24, not a reason to claim an unexecuted suite passed. No test command was weakened.

If Turbopack cannot bind its local worker port in a restricted runner, record the failure and validate the supported `npm run build -- --webpack` export separately. Do not claim the default builder passed on the basis of a webpack run. In this run, preserving the generated `.next` cache outside the checkout and rebuilding from a clean cache resolved the cached worker failure; the default Turbopack build then passed. The webpack diagnostic also surfaced a pre-existing gallery-route props check; no gallery source was changed. CI still needs its own build result. Keep tracked configuration/source unchanged merely to work around a sandbox.

Run `node scripts/campus-navigator-browser-smoke.mjs` when Playwright and a Chromium executable are independently available. This optional test tool is not installed as an application dependency. Verify desktop/mobile search, filters, selection, no-results/reset, map/list controls, tile-failure/retry, attribution, zero unverified markers, keyboard access, safe source links and no overflow/runtime errors. Browser scripts must not inject fake production records. Once real points are verified, add interaction checks for their actual marker/directory synchronization. Inspect screenshots manually; browser geometry checks are not pixel equivalence.

## Progressive enrichment and current release gate

The current two records are source-review candidates, not independently verified official-directory entries. Zero geographically verified destinations exist. Do not call the data-complete campus preview ready for public release until official and geographic source research can be completed. Do not invent records or coordinates while access is blocked. Continue with official pages, reviewed OSM elements and independently verifiable geography, then update both source metadata and documentation. Corrections from students should enter an authenticated moderation workflow in a separately scoped future implementation; no public upload/submission endpoint is implemented here.

## Current validation notes (30 October 2026)

The initial default build hit a cached Turbopack worker-port permission error. A webpack diagnostic compiled but exposed an existing gallery route's unsupported page prop type. The generated `.next` cache was preserved outside the checkout and cleared; the normal `npm run build` then compiled, type-checked and exported successfully. No gallery source, Next configuration or existing security code was changed. Earlier file-only test summaries were not accepted as validation; the tests were rerun with process permission and individual test cases executed.
