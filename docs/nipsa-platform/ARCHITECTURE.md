# PHARMAIDEIA architecture and repository inspection

Inspection: 17 November 2026. Existing branch: `development/nipsa-student-platform`, initial revision `1ad21bba741f1c0239860cca610b7f8b0c64e94b`. The working tree was clean before checkout. The remote branch was fetched and opened under its existing name; no work was reset, discarded or force-pushed. `main` and the previous Navigator/security commits are preserved.

Read completely: `docs/NIPSA_PLATFORM_IMPLEMENTATION.md` and [GitHub Issue #3](https://github.com/phenomenaltechhub/nipsaunilesa/issues/3), including its 17 November updates. Issue body was retrieved from the live public GitHub HTML document because the API host is blocked by the cloud network proxy. This does not establish working API credentials or permissions. No issue was edited.

## What exists

| Area | Repository evidence | Current behavior |
| --- | --- | --- |
| Website | `app/`, `next.config.ts` | Next.js 16 / React 19, static export, unoptimised images for static hosting. No API handlers, Server Actions, DB, private student store or authentication found. |
| Delivery | `.github/workflows/deploy.yml` | Main pushes/manual workflow dispatch; Node 24, pinned official actions, least privileges, npm ci/lint/tests/audit/build/export before Pages deployment. No PWA upload or branch deployment added. |
| Portal | `app/portal/page.tsx` | Public resources and explicitly planned features. Not a private student dashboard. Existing content/navigation preserved. |
| Gallery | `app/gallery/data.ts`, `gallery-image-viewer.tsx` | Static public records, accessible dialog/navigation/sharing and existing **download-time** Canvas JPEG composition. Source image remains unchanged. |
| Ads | `app/ads/` | Reviewed static records, URL/image guards, homepage notifications and contact links. No payment/submission backend. |
| Navigator | `app/campus-navigator/` | Transparent directory-first Interactive Preview, 2 candidates and no verified markers. No fabricated destinations introduced. |
| Tests | `tests/`, `scripts/` | Existing 47 Ads/security cases + 25 Navigator cases, static export checker and Chromium Navigator smoke script. |
| Editorial | Specification only | No owned editorial application source, schema, ZIP, package or backend found in tracked files or available attachment filenames. The independent ChatGPT Sites prototype was not imported, replaced or modified. |

No editorial source access is inferred from filenames or descriptions. Its integration is **source-blocked** until the original owned source/export and provenance are supplied. Work on the independent PWA does not depend on copying that prototype.

## Separation and deployment boundary

```text
Next.js public website + existing Pages pipeline (preserved)
                   ^ approved public publishing only
Editorial console (source unavailable) ---- future shared backend
                                              ^
Standalone student-pwa/ ----------------------+
 public shell + local tools         future authenticated APIs
```

The PWA has plain HTML, CSS and browser ES modules with no runtime npm dependency or bundler. `student-pwa/` stays outside `public/` and `out/`; it is not deployed by the current pipeline. A small local-only preview server supports repeatable browser tests. Proposed `app.nipsaunilesa.com.ng` is not provisioned and DNS is untouched.

PHP/MySQL on Smartweb is a **candidate**, not a validated final infrastructure decision. Confirm supported PHP version/Argon2id, transactional MySQL, TLS, same-origin API routing, process/memory limits, storage permissions, scheduled jobs, backups, outgoing email and logging before building the live backend. Plan external real-time messaging where shared hosting cannot support persistent connections. Approximately 887 students is a capacity-planning input; entry-process limits are simultaneous PHP work, not total student accounts. Load-test gradual adoption and realistic concurrent operations before making capacity claims.

## Baseline and changes

Unmodified baseline passed lint, 72 individually executed tests, default Turbopack/TypeScript build and static-export checks: 38 generated outputs, 35 HTML documents, 72 local references and 65 valid JSON-LD blocks. The 17 November npm audit newly reports 8 moderate dependency entries: Next.js cached-root-param information disclosure (`GHSA-mfr8-8qww-v76h`, Next 16.4.3 within affected 16.3.0–16.4.4) and ESLint's transitive minimatch glob amplification (`GHSA-g3hv-75wg-m249`, affected 7–11.0.0), including dependent-package entries. No high or critical advisory was reported. This static site does not use the affected cached server flow, but compatible patches are appropriate. Record actual patch and final validation outcomes in the milestone report; do not reuse October's zero-advisory result.

## Milestone scope

M1 inspects and documents repository/security/source availability. Early M2 work creates real reusable brand assets, design tokens, navigation, public offline shell and a local focus timer. Empty course/glossary views do not constitute completed course hubs or a reviewed glossary. A closed community screen is not a messaging implementation. Rejected service calls are not authentication, payment verification or server authorization.

M3–M6 remain ongoing planned implementation. M7 depends on authorised operational infrastructure. M8 is incomplete until end-to-end security, real mobile/device testing, accessibility/performance review, backup restoration and operational approval succeed. Root website/gallery changes are deferred to their scoped milestone; the existing Canvas watermark implementation is preserved byte-for-byte in M1.

## M5 implementation update

The historical inventory above describes M1. M5 adds a **real, separate, loopback-only Node 24/SQLite synthetic backend** in `backend/`, including actual account/session/MFA/recovery/role/level/admin/audit/deletion/backup tests. This does not add Next.js APIs or change Pages deployment. Smartweb support remains unverified after one proxy-blocked request; no final production stack or public service is approved. See [M5 architecture](m5/ARCHITECTURE.md), [actual APIs](m5/API_AND_SECURITY.md) and [remaining launch gates](m5/PRE_LAUNCH_MATRIX.md). Local PWA study tools and backend service status are reported separately.

## M6 implementation update

M6 extends the same M5 service and SQLite database through migration 004 and `backend/src/operations/`; there is no competing backend. Reviewed course publication/access/progress, scoped notifications, general-community messages/moderation and two-stage CBT applications/selected-batch planning now have actual transactional HTTP/database behavior and browser integration. Protected online modules under `backend/ui/operations/` mount inside existing PWA routes after current authentication. They are not copied to the public shell/export/cache. Existing personal offline tools remain usable independently.

One departmental community is retained; no level rooms/DMs are approved. CBT examination delivery remains explicitly unavailable pending M7's server-controlled engine. No real institutional academic content or student data is seeded. Public website, approved Standard identity and deployment boundary are preserved. Current evidence, performance scope, unresolved full-audit finding and all-before-launch gates are in [M6 report](MILESTONE_6.md), [API/permissions](m6/API_AND_PERMISSIONS.md) and [M6 matrix](m6/PRE_LAUNCH_MATRIX.md). Earlier milestone inventories are historical, not current claims of missing implemented services.
