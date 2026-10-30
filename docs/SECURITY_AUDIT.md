# Pharmly final security hardening and deployment readiness

Audit date: 27 October 2026. Baseline: commit `0703725`. Working branch: `work` (already separate from `main`). All previous security work was preserved. Security release preparation is on branch `work`; final commit/push/PR outcomes are reported in the release handoff. No merge, deployment, DNS/domain setting, or hosting-provider change has been made. Deployment workflow edits were explicitly authorized in the final-hardening request.

## Executive summary and readiness

**Ready with caveats for a reviewed deployment.** Local installation, lint, 47 security tests, dependency audit, production build, static-export reference checks, workflow validation, and desktop/mobile browser smoke tests pass. No outstanding exploitable frontend vulnerability was confirmed in the current curated static site. This is not a claim that the website is completely secure or that advisory databases cover every supply-chain risk.

Resolved: vulnerable dependency versions, excessive build-job permissions, mutable action references, a mailto validation bypass, the broken study-guide link, and browser-storage failures preventing optional UI dismissal. Ad URL/image guards mitigate risks from future external ad content; they do not replace a trusted ingestion/moderation boundary.

**Unverified:** live production TLS, redirects, DNS ownership/mapping, headers and repository/environment protection settings. The environment proxy still denies the production domain. The updated Actions workflow was validated locally but was not run on GitHub. Those are release checks for the repository owner, not passed checks.

## Scope, architecture and verified boundaries

Reviewed application routes/components/data, styles, public assets/downloads, manifests/lockfile, Next.js/TypeScript/ESLint settings, editor tasks, previous uncommitted changes, and deployment workflow. The project uses Next.js 16/React 19 with `output: "export"` and unoptimized images in `next.config.ts`. GitHub Pages serves files, not a production Node server.

Student Ads are reviewed TypeScript records in `app/ads/data.ts`; submissions currently use a mailto link. No user-upload endpoint, ingestion API, authentication system, Server Action, database or private academic-record store was found. Dedicated ad pages are generated only for premium tiers, with no current premium listings. Public data, site styles, existing contact destinations, ad content, navigation, SEO configuration and assets were preserved. The study-guide link now points to its intended existing PDF.

React escapes text. The only explicit HTML injection sink is JSON-LD in `app/components/seo-json-ld.tsx`; its existing `<` escaping prevents script-element breakout and is regression-tested. No current public-input-to-script exploit, arbitrary executable DOM injection, unsafe message handler or use of `eval` was found. Gallery DOM construction uses property assignments and releases object URLs. There are no client environment-variable references or application credentials introduced by these changes.

## Findings, severity and disposition

| Priority / severity | Classification and evidence | Fix or remaining action |
| --- | --- | --- |
| P1 / Critical package rating | **Resolved vulnerable dependencies.** Baseline `npm audit` reported 18 affected package entries: one critical and 17 high. Next.js 16.3.3 had critical/server advisories; sharp and transitive build/lint packages were also affected. Most Next.js attack paths require server features not hosted by Pages. | Next.js/eslint-config-next 16.4.3, sharp 0.35.5 and compatible transitive updates. Fresh install and audit now report zero vulnerabilities. See advisory appendix for ranges and links; no production RCE exploit is claimed. |
| P2 / Medium | **Resolved excessive permissions.** The old build inherited Pages and OIDC write permissions while running dependency/build scripts, and checkout persisted credentials. This increased the impact of a compromised build input; no compromise was demonstrated. | Build has only `contents: read`; Pages/OIDC writes are limited to deployment, which runs no repository/dependency scripts. Checkout has `persist-credentials: false`. |
| P2 / Medium when ad input is untrusted; current exposure low | **Resolved validation bypass.** The prior validator used `split("?", 2)`, which discarded text after a second `?`. `mailto:a@example.com?subject=hello?&bcc=b@example.com` passed validation although the returned link still included the hidden recipient. No current catalog entry contains it. | `app/ads/url-safety.ts` now validates the entire query after the first `?`. Tests reject hidden `bcc`/`cc` while preserving legitimate question marks in allowed subjects. |
| P2 / Medium if untrusted ads are introduced | **Mitigated future-content risk.** Previously ad contacts were rendered without an explicit URL policy and platform badges used substring matching. Current ads are trusted repository data, not attacker-controlled content. | Shared protocol validation in both action and notification renderers, rejecting executable schemes, ambiguous URLs, credentials, control/header injection and unsupported ports. Hostname-boundary checks prevent paths/queries/lookalike domains from acquiring trusted platform badges. HTTPS destinations still need moderation and redirect/phishing review. |
| P2 / Medium if uploads are introduced | **Mitigated future asset risk.** Raw image strings could permit external tracking resources. Untrusted same-origin SVG/HTML uploads could execute when opened directly; no current malicious asset was found. | All ad image sinks and social metadata use `getSanitizedAdImage`, accepting constrained local `/ads/<filename>.<image extension>` paths with `/file.svg` fallback. This is path validation, not a content sanitizer; reviewed current SVGs remain supported. |
| P2 / Unknown | **Needs verification.** Production-domain HTTPS, DNS and security headers could not be observed. | Owner must perform live checks before release; details below. No production security control was assumed present or absent from proxy errors. |
| P3 / Low | **Resolved workflow hardening gaps.** Mutable action tags, Node 20 beyond its scheduled April 2026 end of life, missing quality gates/timeouts and noisy output-directory dumps. | Verified full action SHAs, supported Node 24, lint/tests/audit/export gates, job timeouts, deployment concurrency, and a structured static-output check. Original triggers remain unchanged. |
| P3 / Low, reliability | **Resolved optional-UI storage failure.** Guided tour localStorage reads/writes could throw and prevent dismissal when storage was blocked. No sensitive information was stored. | Catch unavailable storage in `app/components/guided-tour.tsx`. Browser test confirms both the tour and ad notification remain dismissible with localStorage/sessionStorage denied. |
| P3 / Informational | **Resolved content-reference defect.** `app/resources/page.tsx` linked a missing `.docx`; the supplied study guide is a PDF. | Pointed the link to `/resources/nipsa-study-skills-guide.pdf`; PDF signature and HTTP download verified. No asset rename or content replacement. |
| P3 / Low | **Remaining trust/maintenance recommendations.** HTTPS Google Analytics script and Google Fonts are third-party resources. ESLint 9.39.5 emits an upstream support/deprecation notice but has no reported remaining advisory. | Preserve analytics/typography in this patch. Consider consent/asset-hosting policy and separately validate a compatible ESLint major upgrade. A fixed SRI hash is unsuitable for a dynamically changing gtag response. |

## GitHub Actions changes and verification

`.github/workflows/deploy.yml` retains `push` to `main` and `workflow_dispatch`. Global permission is contents read; build explicitly has only contents read. Deploy has only `pages: write` and `id-token: write`, retains `needs: build`, the `github-pages` environment and deployment URL.

The read-only Pages metadata setup step moved to the deployment job; `enablement: false` explicitly prevents automatic site creation. Its official pinned source was reviewed: existing-site metadata is fetched via `repos.getPages`. Deployment permissions match the official deploy-pages documentation. No repository secrets are referenced and no custom token is introduced. A compromised build could still publish malicious static output through an approved deployment: least privilege reduces token exposure, not the need for source/dependency review and environment protection.

| Official action | Verified tag | Full commit pin |
| --- | --- | --- |
| actions/checkout | v6 | `d23441a48e516b6c34aea4fa41551a30e30af803` |
| actions/setup-node | v6 | `249970729cb0ef3589644e2896645e5dc5ba9c38` |
| actions/configure-pages | v5 | `983d7736d9b0ae728b81ab479565c72886d7745b` |
| actions/upload-pages-artifact | v4 | `7b1f4a764d45c48632c6b24a0339c27f5614fb0b` |
| actions/deploy-pages | v4 | `d6db90164ac5ed86f2b6aed7e0febac5b3c0c03e` |

Each pin was resolved with read-only `git ls-remote` against its official `github.com/actions/...` repository. Version comments accompany all pins. Pinning prevents tag movement from silently changing execution; it does not prove every action dependency is vulnerability-free. Keep pins updated through reviewed changes.

Build uses Node 24, compatible with installed Next.js's `>=20.9.0` engine, and `npm ci` with the lockfile. It then runs lint, tests, audit, production build and `check:export` before uploading `./out`. Build/deploy timeouts are 20/10 minutes. The `pages` concurrency group does not cancel an in-progress deployment. Action-internal Node runtime choices are controlled by upstream actions; selecting Node 24 governs repository build/test commands.

Validation: official actionlint v1.7.7 binary passed its official release SHA-256 checksum and reported no errors for this workflow. Independent YAML parsing/assertions confirmed trigger preservation, permissions, all SHA pin formats, checkout credential policy, Node 24 and build/deploy dependency. No GitHub workflow run or production deployment was invoked.

## Student Ads and browser-storage policy

Rendering guards are defense in depth. Future external submissions need server-side or trusted build-time schema validation, field/byte/pixel limits, unique safe slugs/IDs, category validation and an authenticated moderation/publishing boundary. Revalidate URL platform claims and review redirect destinations. Client-side tier flags do not protect private content: every exported record is public.

Keep submitted text as React text; `sanitizePublicAdCopy` strips contact copy, not HTML. Validate share/metadata paths and never insert raw HTML. Check actual uploaded file signatures and content, strip unnecessary metadata and rasterize/sanitize untrusted SVGs; local filename checks do not make uploaded SVG content safe. Do not host executable uploads on the application origin. Obtain consent before publishing contact information and never include raw private submissions, academic records or credentials in the bundle.

Notification session storage contains only dismissal state and finite viewport-clamped coordinates; malformed/unavailable storage is handled. Tour localStorage contains only a dismissal boolean and now handles denied access. No tokens or student records belong in either store. Existing JSON-LD escapes `<`; its hostile-script regression test still passes.

## Production domain, HTTPS and headers

Rechecked HTTP and HTTPS for `nipsaunilesa.com.ng`, plus HTTPS for `www.nipsaunilesa.com.ng`: environment proxy denied requests with 403/tunnel 403. DNS resolution failed in this environment. **Not verified:** HTTP-to-HTTPS redirect, apex/www mapping, certificate chain/expiry/hostname, dangling DNS, custom-domain ownership verification, Pages Enforce HTTPS, CSP, Referrer-Policy, X-Content-Type-Options, HSTS, Permissions-Policy and framing protection. The HTTPS canonical domain in `app/seo.ts` is not evidence of live enforcement. No repository CNAME exists; that does not establish that the domain is unconfigured in Pages settings.

GitHub Pages static export does not honor Next.js `headers()` for custom response headers. No ineffective header configuration, untested CSP, new CNAME or DNS/provider setting was introduced.

Recommended implementation options, subject to owner approval:

1. **Keep GitHub Pages directly:** confirm custom-domain verification, intended DNS targets, valid certificates, HTTPS enforcement and no dangling mapping. This preserves the current platform but arbitrary security response headers are not configurable in repository files. A meta CSP offers partial control and cannot enforce `frame-ancestors` or HSTS.
2. **Add a separately approved edge layer:** a suitable existing DNS/CDN provider or a free-tier edge option can set CSP, nosniff, referrer/permissions policy and framing headers while Pages remains the origin. Trade-offs include DNS/routing changes, cache behavior, certificate/origin configuration and added operational trust. No provider was selected, installed or configured here; no paid service is required by this patch.

First observe the real headers. Stage a CSP in report-only mode at an approved header-capable layer; inventory actual runtime origins, then enforce only after testing. Account for Next.js inline hydration scripts and analytics initializer (generated per-build hashes where suitable), Google script/collection endpoints, Google Fonts and existing inline styles used by the notification/tour. Do not guess a restrictive allowlist, blindly permit all inline scripts or deploy a policy that breaks hydration. Consider HSTS only after validating HTTPS for every hostname included, especially before `includeSubDomains` or preload. Keep production domain/settings changes separate from this local patch.

## Lint and appearance preservation

The original two lint errors remain fixed: header initial scroll-state synchronization uses a cancellable animation frame, and the homepage apostrophe uses `&apos;` without altering rendered copy. The nine existing native images retain documented per-element `@next/next/no-img-element` exceptions. Those are performance-rule exceptions, not vulnerability fixes or image optimization claims; the rule remains enabled elsewhere. Stylesheets, navigation configuration and public assets are unchanged. Existing website design/content were not redesigned.

## Validation results

Current runtime: Node 24.19.0, npm 11.9.0, Next.js 16.4.3, React/React DOM 19.2.8.

| Check | Final result |
| --- | --- |
| Clean dependency installation | `npm ci --cache /workspace/.npm` passed; lockfile/integrity/TLS verification retained |
| Lint | `npm run lint` passed; zero errors/warnings, with the explicit nine native-image exceptions |
| Security tests | `npm test`: 47 passed, zero failed/skipped; includes the three added mailto regression cases, current catalog contacts/images, ad HTML rendering and JSON-LD script protection |
| Dependency audit | `npm audit`: zero reported vulnerabilities |
| Production build | `npm run build`: compilation, TypeScript and 38 static outputs passed |
| Export checks | `npm run check:export`: 35 HTML documents including error pages; 70 unique same-origin references counted as assets (including link tags), 65 valid JSON-LD blocks; no missing internal paths/anchors/assets; sitemap origin/targets, robots and PDF signature checked |
| Workflow | actionlint v1.7.7 passed; YAML/permission/trigger/pin/Node assertions passed |
| Browser desktop | Chromium 154, 1440×1000: passed representative interactions and layout-overflow checks |
| Browser mobile | Chromium 154, 390×844: passed the same smoke checks |
| Storage denial | Tour and notification dismiss normally when both storage APIs throw; no uncaught browser error |
| Patch hygiene | `git diff --check` passed; existing fixes preserved and changed-file scope reviewed |
| Live domain / settings / actual Actions execution | Not verified; blocked or intentionally not executed as described above |

Browser tests ran against the production `out/` export through a temporary local static server. Verified navigation/menu including Escape, all six ad directory cards, category filtering, safe contact link attributes (without opening external contacts), homepage notification opening/next/dismissal persistence across reload, resource PDF signature and HTTP response, executive profile navigation and image load, gallery open/close, event/campus-navigator pages, parsed JSON-LD, no horizontal overflow at either viewport and no uncaught browser runtime errors. System Chromium at `/usr/bin/chromium` was usable; the previous missing Playwright-downloaded browser was not a blocker. Third-party analytics/fonts requests were intentionally blocked, so their runtime behavior and production-font pixel appearance were not validated. These are interaction/layout smoke checks, not screenshot comparisons or proof of every browser/assistive-technology behavior.

The export checker is a dependency-free markup/reference check, not a general HTML/CSS/JavaScript parser or a full web crawler. It checks exported `href`/`src` paths, HTML fragment targets, required routes, sitemap, JSON-LD and the PDF. Browser smoke checks supplement it. Current references use CSS-sized/static images; no assets were renamed. No test-only dependency was added. Optional local browser/actionlint tooling was used without modifying repository dependencies.

A heuristic scan covers changed/new source/configuration/test/documentation files for common private keys, tokens and credential assignments without printing values. No credentials/private records were introduced. Public email/phone contacts, community invitations and analytics measurement IDs are intentional public content. The prior full tracked-text scan found no secret patterns; neither scan is a historical secret audit or guarantee of complete detection. Existing reviewed SVGs showed no active/external content patterns. Prior DOCX inspection found no VBA project and only HTTPS external relationships; no malware scanner or destination-content audit was performed.

## Files changed

This list includes retained work from the previous audit as well as final corrections:

- `.github/workflows/deploy.yml`: least privilege, immutable action pins, Node 24, quality gates, timeouts, concurrency and unchanged deployment triggers.
- `package.json`, `package-lock.json`: previously updated dependency versions/lockfile, security test command and the new export-check command; no new package dependency.
- `app/ads/url-safety.ts`: contact/image/platform guards and the final mailto query parsing correction.
- `app/ads/ad-action-links.tsx`, `app/ads/homepage-ads-notification.tsx`: validated contacts/platform labels, guarded notification images.
- `app/ads/ads-page-content.tsx`, `app/ads/data.ts`: shared image validation.
- `app/components/guided-tour.tsx`: unavailable-storage handling.
- `app/resources/page.tsx`: corrected existing PDF destination.
- `app/components/site-header.tsx`, `app/page.tsx`: retained lint fixes and native-image exceptions.
- `app/components/site-footer.tsx`, `app/layout.tsx`, `app/events/[slug]/page.tsx`, `app/executives/[slug]/page.tsx`, `app/executives/executive-showcase.tsx`: retained narrowly scoped native-image exceptions.
- `tests/ad-url-safety.test.mjs`: security regression coverage, now 47 tests.
- `scripts/check-static-export.mjs`: reusable static reference/SEO/resource gate.
- `docs/SECURITY_AUDIT.md`: final evidence, distinctions, limitations and release guidance.
- `docs/RELEASE_CHECKLIST.md`: owner settings/release checklist and a separate-phase indexing roadmap; no indexing integration implemented.

## Manual release actions and exact next steps

See `docs/RELEASE_CHECKLIST.md` for exact GitHub settings paths, the separate-machine Guided Tour caveat, post-release checks, and the later Search Console/Bing roadmap. The cloud checkout retains `<GuidedTour />`; no separate local-machine edit has been overwritten. Read-only Git verification confirmed `origin/main` still equals audited baseline `07037256304e13e9994b2f849db0878dec931ce8` during release preparation; no remote `work` branch existed at that check. GitHub API access through `gh api` returned Forbidden, including an escalated retry. This API result does not establish Git push permission or missing raw tokens; Git transport is tested independently. Actual hosted PR/check status must not be inferred from local validation.

1. Review this report and the entire local diff on branch `work`. No further code change is required by the checks that passed. Do not blindly stage unrelated workspace files.
2. From an allowed network, verify HTTP/HTTPS, apex/www behavior, certificate validity, DNS targets/domain ownership, absence of dangling records and actual response headers. In GitHub settings confirm Pages uses GitHub Actions, the intended custom domain and Enforce HTTPS. Review main-branch protection and `github-pages` environment reviewers/branch restrictions; changes there require owner approval.
3. Commit the reviewed files on `work`, push that branch and open a PR to `main` when authorized. See the final handoff for actual commit, push and PR outcomes. Use a PR review that includes workflow changes and ensure `npm ci`, lint, tests, audit, build and export checks pass in the review environment. The existing workflow does not gain a PR trigger in this patch.
4. **Merging to `main` triggers the existing production deployment.** Only merge after the owner has accepted the caveats and approved release. Inspect the Actions build/deploy result, then smoke-test the production domain, PDF, ads and navigation. `workflow_dispatch` remains available for an owner-approved release if needed; do not run it merely to validate locally.
5. Consider a separate approved header/CSP change and routine action/dependency updates. Any future automated ad ingestion must implement the validation/moderation boundary above before publication.

Reproduce local gates in the repository root: `npm ci`, `npm run lint`, `npm test`, `npm audit`, `npm run build`, `npm run check:export`. CI uses the same sequence on Node 24. Serve `out/` for static checks; `next start` is not appropriate for `output: "export"`.

## Dependency advisory detail

Baseline affected-package count includes propagated parent findings; it is not a count of independently exploitable vulnerabilities. Safe remediation used a compatible Next.js 16 minor update and dependency updates within declared ranges, not `npm audit fix --force`. React and React DOM remain 19.2.8.

| Package | Installed before → after | Advisory severity | Affected range(s) | Advisory |
| --- | --- | --- | --- | --- |
| brace-expansion | 1.1.18 → 1.1.21, 5.0.9 → 5.0.12 | moderate | `<1.1.21` | [brace-expansion: Quadratic-time expansion of the {a},b} rewrite causes CPU denial of service](https://github.com/advisories/GHSA-q2hr-2g5m-vwhr) |
| brace-expansion | 1.1.18 → 1.1.21, 5.0.9 → 5.0.12 | moderate | `>=4.0.0 <5.0.12` | [brace-expansion: Quadratic-time expansion of the {a},b} rewrite causes CPU denial of service](https://github.com/advisories/GHSA-q2hr-2g5m-vwhr) |
| brace-expansion | 1.1.18 → 1.1.21, 5.0.9 → 5.0.12 | high | `<1.1.20` | [brace-expansion: DoS via uncontrolled recursion on nested brace groups causing stack exhaustion](https://github.com/advisories/GHSA-qhr7-859c-m2p7) |
| brace-expansion | 1.1.18 → 1.1.21, 5.0.9 → 5.0.12 | high | `>=4.0.0 <5.0.11` | [brace-expansion: DoS via uncontrolled recursion on nested brace groups causing stack exhaustion](https://github.com/advisories/GHSA-qhr7-859c-m2p7) |
| brace-expansion | 1.1.18 → 1.1.21, 5.0.9 → 5.0.12 | high | `<1.1.19` | [brace-expansion: DoS via uncontrolled recursion in parseCommaParts causing stack exhaustion](https://github.com/advisories/GHSA-6j4f-fj2g-mc7p) |
| brace-expansion | 1.1.18 → 1.1.21, 5.0.9 → 5.0.12 | high | `>=4.0.0 <5.0.10` | [brace-expansion: DoS via uncontrolled recursion in parseCommaParts causing stack exhaustion](https://github.com/advisories/GHSA-6j4f-fj2g-mc7p) |
| next | 16.3.3 → 16.4.3 | critical | `>=16.2.0 <16.3.6` | [Next.js: Remote Code Execution in next/og ImageResponse](https://github.com/advisories/GHSA-vcvr-r3jv-pc5j) |
| next | 16.3.3 → 16.4.3 | moderate | `>=16.3.0 <16.3.8` | [Next.js: Pending use cache fill can leak Draft Mode content into regular responses and persisted pages](https://github.com/advisories/GHSA-3w37-wq28-93x7) |
| next | 16.3.3 → 16.4.3 | moderate | `>=16.0.0 <16.3.8` | [Next.js has cache poisoning of SSG and ISR pages in self-hosted applications](https://github.com/advisories/GHSA-4jqv-mc3x-m676) |
| next | 16.3.3 → 16.4.3 | low | `>=16.0.0 <16.3.8` | [Next.js has information disclosure in development server's Model Context Protocol endpoint](https://github.com/advisories/GHSA-39w2-rjm5-chcv) |
| next | 16.3.3 → 16.4.3 | moderate | `>=16.0.0 <16.3.8` | [Next.js has information disclosure in App Router metadata image routes via dynamicParams bypass](https://github.com/advisories/GHSA-f87g-xv8r-7p7x) |
| next | 16.3.3 → 16.4.3 | moderate | `>=16.0.0 <16.3.8` | [Next.js has cache poisoning in SSG/ISR rendering that leads to cross-user content substitution and persistent denial of service](https://github.com/advisories/GHSA-mcj8-r9mp-w47p) |
| next | 16.3.3 → 16.4.3 | high | `>=16.0.0 <16.3.8` | [Next.js has Server-Side Request Forgery in Image Optimization](https://github.com/advisories/GHSA-cjq9-62q9-8jv4) |
| next | 16.3.3 → 16.4.3 | critical | `>=16.0.0 <=16.4.0` | [Next.js: Unauthenticated Remote Code Execution in Image Optimization API when SVG files are used](https://github.com/advisories/GHSA-2464-fhr4-w9xw) |
| next | 16.3.3 → 16.4.3 | high | `>=16.0.0 <=16.4.0` | [Next.js: Denial of Service in App Router using Server Actions](https://github.com/advisories/GHSA-p3m5-59mp-jv5r) |
| next | 16.3.3 → 16.4.3 | moderate | `>=16.3.0 <16.3.8` | [next.js cache leak across root param values in nested 'use cache' functions](https://github.com/advisories/GHSA-h694-7cp9-m8p3) |
| next | 16.3.3 → 16.4.3 | critical | `>=16.0.0 <=16.4.0` | [Next.js: Unauthenticated Remote Code Execution in use cache functions returning typed arrays](https://github.com/advisories/GHSA-673q-mjm6-r5xr) |
| sharp | 0.35.4 → 0.35.5 | high | `<0.35.5` | [sharp : Vulnerability in librsvg dependency CVE-2026-96889](https://github.com/advisories/GHSA-wq5f-xc86-pv6w) |
| source-map-js | 1.2.1 → 1.2.2 | high | `>=1.0.0 <1.2.2` | [source-map-js allows event-loop denial of service through indexed source-map section offsets](https://github.com/advisories/GHSA-68fv-2mgg-jv7q) |
| zod | 4.4.3 → 4.6.7 | high | `<4.6.6` | [Zod can exhaust memory while validating oversized constrained collections](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5) |

Transitive parent findings cleared by child updates: @tailwindcss/node and @tailwindcss/postcss; postcss; minimatch; @typescript-eslint/eslint-plugin, parser, type-utils, typescript-estree and utils; typescript-eslint; eslint-plugin-react-hooks; zod-validation-error. eslint-config-next was also aligned to 16.4.3. Lockfile changes include brace-expansion 1.1.18 → 1.1.21 and 5.0.9 → 5.0.12, source-map-js 1.2.1 → 1.2.2 and zod 4.4.3 → 4.6.7. No overrides or verification bypasses were added.
