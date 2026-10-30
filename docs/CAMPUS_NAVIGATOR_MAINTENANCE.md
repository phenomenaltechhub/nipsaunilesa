# Campus Navigator maintenance and review

## Branch and release separation

`feature/campus-navigator-preview` starts from security commit `a682b4c` on `work`, as explicitly approved. Do not amend that security commit or Navigator commits `55bfbab`, `d636dc7` and `9b5b8ad`. Navigator changes remain in separate commits and are now compared against the updated `origin/main`. The owner has authorized the ordinary push, dedicated PR, merge and deployment workflow after relevant validation and repository protections pass. Force-pushing, overwriting existing work and bypassing protections remain prohibited.

Security PR #1 is merged at `ce1bddebbed0a26852a33a211ff6df8f137ccd5b` on `origin/main`; its normal merge retains `a682b4c` and has the same security tree. The owner reports that its Pages deployment succeeded. The published Navigator branch was reconciled with a normal merge of updated `origin/main` (`f54069d`), preserving every implementation commit without conflicts or application-code changes. No rebase or force-push is needed. Security changes are shared ancestry, and the main-targeting diff contains only Navigator work.

For future updates, fetch and inspect both remote branches before changing history. Preserve published work with a nonrewriting merge where appropriate, resolve any conflicts without weakening approved security behavior, and rerun every check below. Do not replay security commits or rewrite published history to remove a duplicate patch. Inspect the actual main-targeting diff and repository requirements before merging the dedicated Navigator PR. See `CAMPUS_NAVIGATOR_PR.md` for the review draft and current access limitations.

## Data files and trust boundary

- `app/campus-navigator/data.ts`: typed source register and records. Candidates and verified entities are distinct; an institutional name is not a separate physical destination.
- `app/campus-navigator/model.ts`: data checks, search/filtering, selected-record reconciliation, map eligibility and a fixed-origin external-directions URL builder.
- `navigator.tsx`: accessible directory/detail interface. `campus-map.tsx`: browser-only dynamic Leaflet loading, explicit external tile consent, map selection synchronization and service fallback. `navigator.module.css`: route-scoped styling; shared header/footer/SEO infrastructure is retained.

Do not edit compiled `out/` or `.next/` files, hardcode fake marker fixtures in the app, or bypass validation to make the directory look fuller. Source metadata is an auditable assertion requiring reviewer judgment, not automatic proof that a source is true.

## Add or verify a record

1. Follow `CAMPUS_NAVIGATOR_SOURCES.md`; verify the exact official name, category, purpose and faculty/department association. Add a source with stable ID, exact HTTPS URL, kind, `lastChecked`, `access: "reviewed"` and a concrete evidence summary. Do not mark a source reviewed while access is blocked. Keep distinct candidate records when evidence is incomplete.
2. Add a stable kebab-case record ID and plain-text description. Set `verification: "verified"` only after an actual supporting source was reviewed. Faculty/department may be `null`; unknown association must not be guessed. Existing `candidate` records can remain in the directory with explicit warnings.
3. Keep `position: null` until coordinates are geographically verified. A position needs latitude/longitude in valid ranges, source IDs including a reviewed geographic record, `independentlyVerified: true`, `verifiedOn`, destination precision (`building` or `entrance`) and an explicit `usableForDirections` decision. Preserve the independently checked evidence in the source register/documentation. General university reference points are not valid mapped record positions: keep them only in research notes. They must never become building markers or directions. A mappable record must be a verified `physical-destination`.
4. The default directory view prioritizes search and profile details when no precise destinations exist. The Verification filter separates verified records from candidates without hiding uncertainty. Only current filtered, eligible records become markers. Selecting a marker and selecting its directory card update the same ID. Filtering reconciles selection to the first remaining record; zero results clears details without retaining a stale marker selection.
5. No walking paths or internal routing exist. A future verified non-university destination may opt into an external Google Maps directions link built from validated numbers on a fixed HTTPS origin. This is provider routing, not verified internal campus walking guidance. Do not enable it for an area centroid or a non-routable point.
6. Landmark references need their own reviewed source IDs. Accessibility information needs documented evidence and should state its scope/date; never infer accessible entrances from a photograph.

## Add photographs

Obtain rights first. Keep images under `public/campus-navigator/` with simple filenames and a reviewed source ID, license/permission, author credit and meaningful alt text. Only local raster JPG/PNG/WebP/AVIF paths are accepted. Validate actual file type, dimensions and content, remove inappropriate metadata and optimize image weight. Never upload SVG/HTML/scripts or arbitrary submitted files to the site origin. Photograph credits are shown in the details panel; retain permission evidence in documentation. No real campus photographs are currently licensed/added.

## Map service and privacy

No paid API, backend, database, geolocation permission or runtime geocoder is needed. Leaflet is the only added runtime dependency; TypeScript definitions add their small type dependency. Local search is entirely in memory. Standard OSM tiles are loaded only for verified destinations and on consent, which sends normal requests to OSM; preserve attribution, browser caching and Referer and comply with OSM's service policy. Do not prefetch/offline-cache tiles. Source links use HTTPS and `noopener noreferrer`; marker text uses textContent and React escapes display copy. Fixed attribution/marker icon markup contains no record-supplied HTML.

With no verified destinations, no Leaflet instance, tile requests or map-navigation controls are rendered. The Map view explains the evidence needed and offers Browse directory; returning to the list preserves selection and focuses search.

When an actual map is available, on tile failures the app explains that the base map may be incomplete; directory/details remain available and Retry reinitializes the map. A missing library chunk is also handled. Map/List switching is touch-friendly on mobile; hiding/showing the map triggers a ResizeObserver size refresh. Do not silently replace an unavailable map with a fictional campus diagram.

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

Run `node scripts/campus-navigator-browser-smoke.mjs` when Playwright and a Chromium executable are independently available. This optional test tool is not installed as an application dependency. Verify desktop/mobile search, category/verification/department filters, selection, no-results/reset, map/list controls, the informative empty-map state, zero map controls/tile requests without destinations, keyboard return-to-search, safe source links and no overflow/runtime errors. Screenshots and a review index are saved to `CAMPUS_REVIEW_DIR` (default `/tmp/campus-navigator-directory-first-review`). Browser scripts must not inject fake production records. Before releasing verified points, add interaction checks for actual marker/directory synchronization, filtering across mapped record counts, map reinitialization, and live tile loading/error/retry behavior. Current zero-coordinate smoke checks do not establish those positive map interactions. Inspect screenshots manually; browser geometry checks are not pixel equivalence.

## Progressive enrichment and current release gate

The current two records are source-review candidates, not independently verified official-directory entries. Zero geographically verified destinations exist. The interface may be presented as an explicitly labeled under-development interactive preview, but must not be described as a verified campus directory or usable wayfinding service until source research is completed. Current coverage of two candidates is insufficient for a substantive official university directory. Do not invent records or coordinates while access is blocked. Continue with official pages, reviewed OSM elements and independently verifiable geography, then update both source metadata and documentation. Corrections from students should enter an authenticated moderation workflow in a separately scoped future implementation; no public upload/submission endpoint is implemented here.

## Current validation notes (30 October 2026)

The initial default build hit a cached Turbopack worker-port permission error. A webpack diagnostic compiled but exposed an existing gallery route's unsupported page prop type. The generated `.next` cache was preserved outside the checkout and cleared; the normal `npm run build` then compiled, type-checked and exported successfully. No gallery source, Next configuration or existing security code was changed. Earlier file-only test summaries were not accepted as validation; the tests were rerun with process permission and individual test cases executed.


## Directory-first completion and visual review

The hero/SEO description now describes a searchable preview and pending mapping, without implying that public university/geographic sources were successfully reviewed. Verified and candidate counts are visible; cards and profiles identify candidates, and a Verification filter separates both states. Faculty controls remain disabled while associations are unknown. No university names, facilities, descriptions, photographs or coordinates were fabricated.

The no-coordinate layout allocates the main canvas to the directory and selected details. Mapping status is secondary, retaining mobile Map/Directory switching. When reviewed physical destinations become available, the existing interactive map/loading/attribution/failure-recovery path can be used; it does not use a default world centre or promote a university-area reference point to a destination.

No blocked official/OSM source requests are repeated for this completion. Resume research only after a meaningful access change or owner-provided verifiable evidence. Positive live map-marker/tile-service interactions cannot be validated against the present production dataset because it contains zero eligible destinations; model tests and component-rendering tests cover eligibility and the retained loading branch. Do not claim those live services or source content were verified.


## Publication preparation and latest verification

The owner has authorized releasing this transparent Interactive Preview after the validation and repository gates pass; this is not a fully verified wayfinding service. Security PR #1 is now merged on `main` at `ce1bddebbed0a26852a33a211ff6df8f137ccd5b`. The Navigator branch includes that main history through nonrewriting merge `f54069d`, preserving security and all three existing Navigator implementation commits. GitHub REST access still returns Forbidden; an unauthenticated API-root request confirms a proxy tunnel `403 Forbidden`. Production `/campus-navigator` access is blocked by the same proxy. Hosted PR status, required checks, protections and Navigator deployment/live-site results remain unverified here; a GitHub account-permission failure has not been demonstrated. Stop rather than bypass the GitHub review/release workflow if that access remains blocked. The final handoff must identify actual push, PR, merge, Actions and production-check outcomes without inferring them from Git transport.

The reconciled release branch passed lint with no warnings/errors, all 72 tests (47 security + 25 Navigator), dependency audit with zero advisories, the default production build, static-export checks (35 HTML documents, 72 local references and 65 valid JSON-LD blocks), and desktop/mobile Chromium smoke checks. The unchanged dependency tree had a clean installation during the previous validation. Current screenshots are under `/workspace/artifacts/campus-navigator-post-security-release/` in this cloud workspace; the browser script regenerates portable review artifacts without a development indicator. The interface is suitable for presenting an explicitly labeled experimental preview, while the dataset remains 2 candidates, 0 verified records and 0 mapped destinations. See the PR draft for release order and the source register for evidence requirements.
