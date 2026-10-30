# Campus Navigator publication PR draft

Suggested title: **Campus Navigator: publish a transparent directory-first interactive preview**

Base: `main`. Head: `feature/campus-navigator-preview`. The feature is stacked on `work` security commit `a682b4c`; Navigator commits `55bfbab` and `d636dc7` remain unchanged. The owner has authorized committing outstanding Navigator improvements and pushing this feature branch for review. No force-push, merge or deployment is authorized.

## Dependency and release order

At the last remote check, `origin/main` still points to `07037256304e13e9994b2f849db0878dec931ce8`; the security commit has not been incorporated. **Do not merge or deploy the Navigator before the security release.** A main-targeting PR will temporarily include the existing security commit in its ancestry/diff. No security files are newly modified by the Navigator commits. After security approval/merge, inspect the actual merge strategy and safely reconcile the feature history without replaying security changes or force-pushing; rerun all checks. The final release handoff records actual push and hosted-PR outcomes. GitHub API calls currently return Forbidden, so hosted PR/check status is not inferred from Git transport.

## Summary

- Replace the text-heavy campus page with a directory-first interactive preview: local search, category/verification/faculty/department filters, selected-record profiles, source notes and mobile Map/Directory switching.
- Keep **Campus Navigator — Interactive Preview** visible and use accurate current-versus-planned feature copy and SEO metadata.
- Explicitly identify unresolved candidates, show verified/candidate counts and allow verified-only filtering; do not promote unreviewed names to confirmed records.
- With no verified physical destinations, show informative mapping status rather than an empty map, world reference view or misleading navigation controls. The directory/details remain primary.
- Preserve browser-only Leaflet loading, explicit tile consent, attribution, destination selection and service-error/retry architecture for future verified physical destinations. General university coordinates cannot become building pins or directions.
- Add evidence-aware data checks, security/regression tests, a reproducible browser smoke/screenshot script and source/maintenance documentation. No paid API, backend, database, geolocation permission or fabricated campus information is introduced.

## Current coverage and transparency

**0 verified directory records, 2 candidates, 0 verified markers.** University of Ilesa and Department of Pharmacology are grounded in the existing NIPSA repository but await independent official-source review. No campus photographs, landmarks, accessibility claims or routes have been invented. Official and OSM source reads previously returned proxy 403; these blocked requests are not repeatedly retried. Full location coverage, verified coordinates and route navigation remain under development.

This can be presented as a clearly labeled experimental interface after owner review and the security release. It must not be advertised as a verified campus directory or usable wayfinding service. Sources and evidence requirements are documented in `docs/CAMPUS_NAVIGATOR_SOURCES.md` and `docs/CAMPUS_NAVIGATOR_MAINTENANCE.md`.

## Validation

- Clean installation and lint passed.
- **72 individual tests passed**: 47 existing security tests and 25 Navigator cases; zero failures/skips. Includes verification filters, institutional-versus-physical distinction, exclusion of university reference points, coordinate/source/rights checks, safe directions generation and component-rendered empty/loading map states.
- `npm audit`: zero reported vulnerabilities.
- Default `npm run build`: compilation, TypeScript and 38 static outputs passed.
- `npm run check:export`: 35 HTML documents, 72 local asset/link references, 65 valid JSON-LD blocks and no missing internal references.
- Desktop Chromium 1440×1100 and mobile 390×844 smoke tests exercise search, category/verification/department filtering, candidate selection/details, empty/reset states, safe links, mobile Map/Directory return/focus, zero empty-map controls/tile requests, JSON-LD and no overflow/uncaught runtime errors. Actual production-export screenshots are supplied in the cloud handoff; external fonts/analytics are blocked during capture, so typography can fall back.
- No real marker/tile-service/route interaction is claimed with the current zero-coordinate dataset. The retained positive map-loading branch is component-tested, not a claim of live source verification.
- Whitespace and changed-file scope checks pass. No source retries, indexing integration, DNS/hosting changes, merges or deployments are part of this publication preparation.

## Changed-file scope

Against `work`: only `app/campus-navigator/*`, the minimal Leaflet/type manifest/lockfile additions, Navigator tests/browser script and `CAMPUS_NAVIGATOR_*` documentation. Shared header/footer, security implementation/tests, security report, deployment workflow, navigation configuration and public assets are preserved.

## Owner release steps

1. Merge the reviewed security PR first. Confirm the security pipeline/release result.
2. Inspect/reconcile Navigator history against updated approved `main` without force-pushing; rerun lint, tests, audit, build, export and browser checks.
3. Review the preview's visible limitations and screenshots. Merging this PR into `main` triggers the existing GitHub Pages deployment; merge only with explicit owner approval.
4. Inspect the actual Actions result and smoke-test the production `/campus-navigator` route, search/filters/details, mobile switching, source disclosures, sitemap/robots and shared navigation.
5. Add verified institutional names/purposes progressively after readable official evidence is available. Add markers only for independently verified physical destinations; no campus route promises without verified route information.
