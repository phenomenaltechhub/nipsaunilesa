# Campus Navigator publication PR draft

Suggested title: **Campus Navigator: publish a transparent directory-first interactive preview**

Base: `main`. Head: `feature/campus-navigator-preview`. Navigator commits `55bfbab`, `d636dc7` and `9b5b8ad` remain unchanged, as does security commit `a682b4c`. The owner has authorized the ordinary push, dedicated PR, merge and deployment workflow after relevant validation and repository protections pass. Force-pushing, overwriting existing work and bypassing protections remain prohibited.

## Dependency and release order

Security PR #1 is merged at `ce1bddebbed0a26852a33a211ff6df8f137ccd5b` on `origin/main`. This normal merge retains `a682b4c` and has the same security tree; the owner reports that its Pages deployment succeeded. The published Navigator branch was reconciled by merging this updated `origin/main` without rewriting history (`f54069d`), with no conflicts or application-code changes. Security changes are shared ancestry rather than duplicated feature changes, and the final main-targeting diff contains only intended Navigator work.

All local checks listed below passed again after reconciliation. GitHub REST requests still return Forbidden in this environment; an unauthenticated request to `https://api.github.com` confirms a proxy tunnel `403 Forbidden`, rather than a demonstrated GitHub account-permission failure. The production `/campus-navigator` request is also blocked by the proxy. Hosted PR status, required checks, repository protections and Navigator deployment/live-site results remain unverified here. Do not infer them from successful Git fetch/push operations or bypass the PR workflow. The release handoff must record the actual PR, merge and deployment outcomes when access permits them.

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

The following checks passed on the reconciled release branch on 30 October 2026. Browser checks use the actual local production export; they do not establish production-site or GitHub Actions success.

- Lint passed with no warnings or errors. The unchanged lockfile/dependency tree was installed cleanly during the earlier validation.
- **72 individual tests passed**: 47 existing security tests and 25 Navigator cases; zero failures/skips. Includes verification filters, institutional-versus-physical distinction, exclusion of university reference points, coordinate/source/rights checks, safe directions generation and component-rendered empty/loading map states.
- `npm audit`: zero reported vulnerabilities.
- Default `npm run build`: compilation, TypeScript and 38 static outputs passed.
- `npm run check:export`: 35 HTML documents, 72 local asset/link references, 65 valid JSON-LD blocks and no missing internal references.
- Desktop Chromium 1440×1100 and mobile 390×844 smoke tests exercise search, category/verification/department filtering, candidate selection/details, empty/reset states, safe links, mobile Map/Directory return/focus, zero empty-map controls/tile requests, JSON-LD and no overflow/uncaught runtime errors. Actual production-export screenshots are supplied in the cloud handoff; external fonts/analytics are blocked during capture, so typography can fall back.
- No real marker/tile-service/route interaction is claimed with the current zero-coordinate dataset. The retained positive map-loading branch is component-tested, not a claim of live source verification. Before releasing verified points, test actual marker selection, filtering across mapped record counts, map reinitialization and tile-service/error/retry interactions.
- Whitespace and changed-file scope checks passed. No blocked university/OSM source retries, indexing integration or DNS/hosting configuration changes are included. No hosted Navigator PR merge or deployment is claimed here.

## Changed-file scope

Against the updated `origin/main`: only `app/campus-navigator/*`, the minimal Leaflet/type manifest/lockfile additions, Navigator tests/browser script and `CAMPUS_NAVIGATOR_*` documentation. Shared header/footer, security implementation/tests, security report, deployment workflow, navigation configuration and public assets are preserved.

## Remaining release steps

1. Preserve the completed security merge and nonrewriting Navigator reconciliation. Rerun lint, all tests, audit, build, export and desktop/mobile browser checks.
2. Push the updated feature branch normally and create or inspect its dedicated `main`-targeting PR. Review the final diff, conflicts, actual required checks and repository protections; stop if access or an unresolved failure prevents safe completion.
3. Review the preview's visible limitations and screenshots. Under the owner's current release authorization, merge only after the relevant gates pass, using a repository-supported method without bypasses. Merging into `main` triggers the existing GitHub Pages deployment.
4. Inspect the actual Actions result and smoke-test the production `/campus-navigator` route, search/filters/details, mobile switching, source disclosures, sitemap/robots and shared navigation.
5. Add verified institutional names/purposes progressively after readable official evidence is available. Add markers only for independently verified physical destinations; no campus route promises without verified route information.
