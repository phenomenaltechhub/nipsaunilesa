# M4 — Academic systems and student experience

17 November 2026 · existing branch `development/nipsa-student-platform`.

## 1. Verified starting point

Local and GitHub development HEAD both verified as **cecf1ab39ee035a2f5e03ddb9268c7e95a1e61e6**, continuing ea43d47/M3 and earlier preserved milestones. The working tree was clean. Remote is `https://github.com/phenomenaltechhub/nipsaunilesa.git`. `main` observed at `92d890a39d9ac056d81e758ebeafb9b96ed781e0` and is not modified. Read the complete implementation document, current public Issue #3, milestone/identity/security/academic contracts and actual application before editing. A clean `npm ci` and baseline lint/types/103 tests passed.

The latest owner message contains the approved identity instruction and final START M4. It supersedes older identity-review status and explicitly authorises PWA integration. Production/DNS/live payments/real accounts remain unauthorised.

## 2. Features implemented — actual functionality

- **Approved Knowledge Nexus Classic Standard identity integrated.** Header, startup, light/dark/mono/stacked masters, ordinary/maskable/Apple icons, favicon and existing manifest icon paths use the approved standard artwork. Exact drawing geometry is checked against preserved a-classic standard review masters. No Institutional, Essential or optical substitution, including 16px. Main website branding is unchanged. Prior review files stay untouched; original M1 symbol/wordmark/generator are archived as historical source.
- **Real course-specific personal progress tools.** Add/select/remove personal outlines; add topics/subtopics; track coverage, self-assessed understanding, revision, difficulty and priority; filter topics; view course and overall summaries. Leaf topics prevent parent/subtopic double counting. Overall coverage weights topic counts. Practice/CBT results remain distinct and absent, never inferred from checklist completion. No topics means no coverage measurement. Local outlines are non-confidential user input in tab memory, not official syllabus/student records.
- **Academic hierarchy and content preparation.** Proposed level/session/semester/course structure, sourced topics/subtopics, syllabus/resource categories, assignment/deadline/schedule metadata and same-context conflicts are validated in the separate developer workbench. Parent topics must belong to the course. A repeated code in a different semester/session is distinguished. Student course structure retains details, topics, materials, schedule, announcements, syllabus and revision empty states. No official course, lecturer, schedule or question is invented.
- **Notification centre UI and independent state logic.** Literal search, priority/read filters, read/unread controls, correction/revision handling and withdrawal behavior work. Future publication times are excluded defensively; stale/tampered equal revisions are rejected, while equivalent reordered JSON preserves receipts. The application starts with zero notices. Test-only synthetic payloads exercise populated behavior in an isolated harness. This is not authenticated delivery, sender verification or a publishing service.
- **Settings and Help.** Compact settings sections expose approved avatars, device/light/dark theme, larger text, local preference state, privacy clearing, account/recovery guidance, About and verified public support links. Clear local data removes outlines/tasks/read history and only the allowlisted saved avatar key, preserving unrelated storage. Appearance/notification choices remain in memory. No browser permission prompt, fake login or sign-out is offered before real sessions exist.
- **Searchable public guidance.** Students, class reps, executives, administrators and editors have non-sensitive guidance for navigation, study/progress, resources, privacy/recovery, notification permissions, community conduct, CBT and ownership. The audience selector filters articles; it grants no role. Private administrative runbooks require future authorised delivery and are not bundled.
- **Academic utility foundations.** Existing timetable, planner, focus, avatars and empty course/glossary search remain functional. Stable daily-term selection and literal normalized glossary search are independently tested using non-medical test labels. No reviewed scientific definitions are available, so the app retains a truthful glossary/daily-term empty state and links to the glossary rather than claiming a term exists.
- **Launch architecture and security specifications.** Every approved requirement is assigned to M5–M8 with a pre-launch acceptance gate. Complete community and operational CBT are mandatory before first public launch. Prepared progress/notification API, progressive login/recovery/lockout-defence policy and complete CBT/community architecture, explicitly classified as specifications rather than live services.

## 3. Existing features preserved

Real personal revision tasks and focus timing; week/agenda date navigation; course structure/keyboard tabs; glossary foundations; mobile/desktop navigation; 20 curated avatars and optional preference behavior; public-only offline cache and explicit updates; safe DOM rendering and fail-closed disconnected services; developer diagnostics and draft preparation; editorial ownership/source protections. The inactive community source/status now says implementation pending rather than conflating unfinished work with an operational CLOSED service. It remains absent from student navigation/cache.

No root `app/`, `public/`, `.github/`, Next config, dependency version/lockfile, existing Navigator implementation or website gallery/watermark changes. Original editorial source is still unavailable; no portal integration or replacement is claimed.

## 4. Security and privacy boundaries

| Component | Classification | Actual boundary / remaining requirement |
| --- | --- | --- |
| Local progress/settings/help | Implemented and tested | Bounded plain-text state, safe DOM, literal search, allowlisted preferences and tab-only lifetime; no server identity/permission claim |
| Academic hierarchy/developer intake | Implemented and tested independently | Every proposal remains local/unreviewed; source URL is not verification; server rep/level/object checks still required |
| Notification UI/read-state/revisions | Implemented and tested independently; integration pending | Memory-only receipts/content, validated metadata; server must verify recipients/actor/sender/rights and enforce publication/scheduling/audit |
| File handling | Descriptor checks only | No live picker/upload; backend byte/container/size/malware/private-storage controls still mandatory |
| Authentication/activation/recovery/roles/payments/audit | Infrastructure-blocked; specification prepared | No accounts, keys, private dues records, sessions or real provider verification |
| Community | Pre-launch-required; infrastructure-blocked | CLOSED must mean a completed server-restricted service; not implemented in M4 |
| CBT | M4 architecture prepared; M6/M7/M8 required before launch | No real exam, question, key, batch membership, result or timing engine |
| Editorial integration | Source-blocked | Owned source/export and review required; independent prototype preserved |

The authentication specification follows relevant OWASP/NIST principles, while identifying the exact 1/2 retry, 3→5min, 4→15min, 5→30min, 6→60min, 7→24h schedule as owner policy. Later failures have a documented bounded continuation. Active restrictions do not extend on blocked requests. Atomic server enforcement, generic errors and a verified-owner recovery lane are mandatory to avoid attacker-controlled indefinite lockout. This is not working server authentication.

No role/level selector, hidden control or local status flag authorises protected operations. No private progress, notice, course file, question or key enters browser storage/public precache. Only the opted-in curated avatar ID may persist. No secret/student identity/payment record is added to source or reports.

## 5. Performance and third-party decisions

No new npm dependency or runtime UI framework. Existing native controls/original components are used, retaining M3's evaluated-library decisions and notices. React libraries are not imported into the HTML/JS PWA. Existing Sharp, Chromium/Playwright and development-only axe are reused. The system FFmpeg is linked through a temporary test-tool directory only; nothing is downloaded or installed globally for recording.

The existing **200,000-byte public-shell / 80,000-byte JavaScript guards are unchanged**. Initial M4 growth exceeded them. Developer-only proposal models/rendering were separated from student runtime, unused legacy presentation CSS removed, and redundant copy condensed. A new guard checks static runtime imports against the precache so reduced counts do not conceal uncached runtime downloads. Final public cache v4 contains 46 assets at approximately **198.9 KB uncompressed / 79.8 KB JavaScript**, below both limits. Exact final counts are in validation logs. This is a payload measurement, not a low-end-device speed benchmark; JavaScript headroom is small and future features need further architectural optimisation or separately reviewed budgets.

## 6. Executed validation and actual results

| Check | Result |
| --- | --- |
| Clean `npm ci` | Passed, 375 packages installed using the existing lockfile; no dependency/lockfile change |
| ESLint | Passed, no lint errors/warnings. npm emitted an existing ESLint 9 support/deprecation notice during installation; compatible tooling maintenance remains necessary |
| Strict type checks | Passed for app, worker and developer JS; website TypeScript passes in Next build |
| Unit/security/academic/Navigator tests | **122 passed**, 0 failed/skipped: existing 103 plus 19 focused M4 cases |
| M4 test coverage | Weighted leaf progress/parent cleanup/limits, invalid flags/scope, notification metadata/revisions/JSON order/read/withdrawal/scheduling defence, hierarchy/conflicts/topic scope, literal search/stable date selection, preference clearing and exact Standard artwork |
| Dependency audit | **0 reported vulnerabilities** at this run, a point-in-time installed-tree result |
| Production Next build | Passed default static production build; no deployment performed |
| Static export | Passed: **35 HTML documents, 72 local references, 65 valid JSON-LD blocks**, no missing internal references; PWA/tooling remains excluded |
| Public shell/integrity | Passed original budgets, runtime dependency/cache coverage, icon dimensions, 20 passive avatars, contrast pairs, isolated scope and CSP; cache v4 |
| Existing PWA Chromium suite | Passed 1440×1050, 390×844, 320×900, 768×1024; navigation/tabs/calendar/tasks/focus/avatars/denied storage/opt-in reload/clear, offline reload/private-cache exclusion and explicit worker updates |
| M4 Chromium suite | Passed desktop/mobile actual progress, literal/XSS-safe fields/search, reading filters, dark/large appearance, privacy clearing with a saved avatar, offline Help, no overflow/runtime/CSP/external-request errors; isolated notice integration tests verify correction/withdrawal/read rendering |
| Automated accessibility | Existing suite: **28 scans, 0 violations**, with incomplete/manual rule IDs aria-prohibited-attr, color-contrast, label-content-name-mismatch. M4: **15 scans, 0 violations/incomplete rules**, covering light/dark progress, settings, avatars, help and notice views. These are not full accessibility certification |
| Developer browser suite | Desktop/mobile passed metadata preparation, safe resource rendering/filtering, conflicts/reload reset, file boundary 403 checks, no persistence/service worker and axe scans |
| Installation eligibility | Manifest parse errors: none. Regular temporary Chromium profile: **no installability errors**. Isolated incognito contexts report in-incognito as expected. Physical OS installation was not performed |
| Approved branding | Exact master geometry checks, actual seven-size PNG rendering/dimensions (16/24/32/48/64/192/512), opaque maskable safe-circle checks; normal/dark screenshots inspected. Fine detail softens at tiny sizes; Standard remains selected |
| Website/gallery regressions | Desktop/mobile home, Portal, resources, Ads, gallery and Navigator passed; two public portrait downloads produce valid 810×1080 watermarked JPEGs, original bytes/top pixels preserved |
| Recording | Real mobile UI interactions recorded without injected study state or student/course data. H.264 MP4 at **390×844**, with metadata and decode integrity checked; source WebM also retained |
| Secret/scope/whitespace checks | Passed heuristic file scan, matching values never logged; production/source boundary inspected. Not a complete secret-history/real-device audit |

No physical Android/iOS/Safari or full screen-reader/low-end network benchmark, live backend auth/IDOR/role-revocation, payment/recovery/upload/audit, real-time community or operational CBT tests are claimed. Those require actual infrastructure/content and M7/M8 acceptance. Installability eligibility and automated colour/axe checks do not prove every device/platform experience.

## 7. Files added or modified

- `student-pwa/assets/brand/`, generator, index/manifest/tokens/styles: selected Standard identity and responsive light/dark presentation; historical source in `design-review/brand-history/`.
- `student-pwa/src/modules/progress/{model,view}.js`: working personal course/topic progress.
- `student-pwa/src/modules/notifications/{model,view}.js`: local inbox state and safe empty/delivered views.
- `student-pwa/src/modules/settings/{model,view}.js`, `help/{articles,view}.js`, shared `components/{fields,validation}.js`: real preferences, privacy and searchable guidance.
- Academic models/catalogue/course-hub/views/glossary, routes/app/cache policy; existing avatar/revision models gain safe local clearing. Disconnected service/community status copy clarified without exposing student routes.
- `developer-tools/{academic-preparation,academic,prepared-course-hub,modules}.js`: richer unreviewed academic structure and isolated draft rendering/statuses.
- `tests/student-pwa-m4.test.mjs`, existing metadata/service tests; M4 browser/brand-check scripts and existing browser/integrity helpers; package commands only.
- Implementation document/current design/brand/PWA READMEs and `docs/nipsa-platform/m4/` specifications plus this report. Historical milestones/review families remain preserved.

## 8. Remaining infrastructure, content and next milestones

The full assignment is in [LAUNCH_COMPLETION_MATRIX.md](m4/LAUNCH_COMPLETION_MATRIX.md). M5 completes reviewed academic/learning workflows, content intake, permission models and approved operational policies. M6 completes community/CBT interaction/application/review components and source-dependent editorial work. M7 implements funded validated backend authentication, scope, storage, reconciliation, email, notifications, messaging and the operational CBT engine. M8 requires end-to-end security, accessibility/device/performance, load, backup/restore and operational acceptance. All are before launch.

External dependencies: institution-reviewed curriculum/syllabus/glossary/questions and licences; owned editorial source; validated funded hosting/email/realtime/private-storage/scanning capabilities; actual staff/role/retention/CBT policy approval and test infrastructure. No university data, rules, question bank, sender identity or clinical calculator is invented to fill these gaps. No paid service, production account, DNS/mail setting or live Paystack page is activated.

## 9. Review artifacts and version control

Actual screenshots: `/workspace/artifacts/pharmaideia-m4/` — desktop/mobile Dashboard and progress, dark Settings/progress, Help, empty notifications, approved native-size icons. Populated personal-progress images use deliberately entered generic study labels, not official course data. Functional recording: `m4-walkthrough.mp4` and `.webm`. `REVIEW.md`, validation logs and a selected review ZIP accompany the handoff. No localhost URL is represented as a public smartphone preview.

M4 is committed and normally pushed only to the existing development branch after successful checks. Actual final SHA/remote verification and clean working-tree status are in the handoff receipt/final response, avoiding a self-referential commit hash in this document. Prior milestone commits remain ancestors; no reset, force push, new branch, main merge or deployment is performed. Full PWA launch is **not ready** merely because this M4 increment passes.
