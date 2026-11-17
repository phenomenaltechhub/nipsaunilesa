# PHARMAIDEIA M5 — controlled backend and student experience

17 November 2026. Work remains on `development/nipsa-student-platform`. Verified starting local commit: **398db251d4a70e2e64b325e25700687592134552** (M4); prior identity commit `cecf1ab` and M1–M4 work are preserved. The local development remote-tracking ref was stale at `75cfcfb53ed4a211fa85fc7edb330324577345f3` because the environment fetch refspec tracked only main. GitHub’s normal push confirmed that M3/M4 were already published at `398db25`; the M5 implementation fast-forwarded that live branch to `4d44b4423b0d9d3658e84673bc5ad26beb2aba43`. Existing history was preserved, not rewritten. A documentation-only follow-up corrects this tracking-ref detail. `origin/main` remains **92d890a39d9ac056d81e758ebeafb9b96ed781e0**.

Read the complete implementation document, current Issue #3, milestone/security/architecture material and inspected actual source before development. Original editorial application source is still absent. Image A was available; Image B design board was not.

## 1. Implemented features and honest status

| Feature | Actual M5 result |
| --- | --- |
| Backend architecture | **Implemented and tested:** separate Node 24.19/SQLite 3.53.3 service, three migrations, real private DB operations, versioned HTTP APIs, strict validation, central errors, health, rate controls and transactional audit. No added npm package. |
| Authentication | **Implemented and tested in controlled environment:** scrypt passwords, ownership activation, pending approval, login/logout, HttpOnly sessions, expiry/rotation/revocation, password change and single-use recovery. No real account or operational email. |
| Password restrictions | **Implemented and tested:** exact 5/15/30/60-minute/24-hour sequence, counter reset/inactivity expiry, no deadline extension while blocked, concurrent-request handling and independent owner-recovery lane. |
| Privileged roles/MFA | **Implemented and tested:** encrypted RFC 6238 TOTP, replay/expiry/abuse checks, fresh MFA for sensitive operations, multiple roles and active-role switch, immediate revocation and server level/object enforcement. MFA recovery requires owner proof and another current administrator; approval uses a non-secret reference. |
| Administration | **Implemented and tested:** real DB-derived accounts/pagination/search, activation/status/level changes, scoped appointments/revocations, recovery, community policy/chat restrictions, audit and non-secret operational diagnostics. Independent from editorial publishing. |
| Academic integration | **Implemented, integration pending:** real private unreviewed drafts with representative/reviewer level enforcement. Existing public catalogue/course hubs remain truthful empty states. No official course data was invented. Authenticated progress synchronization and reviewed-content delivery are not operational. |
| Community | **Partial implementation:** discoverable restricted PWA view; actual backend open/close, chat-only suspension and audit tested. **Messaging transport/interactions remain planned M6/M7 and mandatory before launch.** Opening the policy gate returns no fabricated chat success. |
| Payments | **Infrastructure/approval blocked:** no Paystack service or verification implemented. Tests prove client callback/`paid` fields cannot create eligibility or accounts. Trusted synthetic eligibility is not provider verification. |
| Visual identity and UI | **Implemented and tested:** unchanged approved Classic Standard master/icons; emerald desktop sidebar, warm-white compact academic hierarchy, original outlined icons, light/dark support and truthful empty records. |
| Hero | **Implemented and tested:** user-supplied fictional scene, distinct mobile/desktop crops, AVIF/WebP, overlay, working course/planner actions, visible attribution and solid-color failure fallback. Hero is short on phones. |
| Mobile navigation | **Implemented and tested:** exactly Home, Courses, Community, Planner, More; Home uses the existing dashboard route. Desktop retains Dashboard. Timetable remains accessible. |
| Help video | **Implemented and tested:** real 45.5-second mobile screencast, 344,483-byte silent H.264 MP4, native controls, no autoplay, preload=none, captions, transcript and poster. It demonstrates current tools only and must be updated before full launch. |
| Backup/lifecycle | **Implemented and tested locally:** consistent encrypted snapshot and verified no-overwrite restore, lifecycle restrictions, delayed deletion, separate financial-reference retention. Scheduled/offsite backups, policy approval and real operations remain blocked. |
| Editorial | **Source-blocked:** original Sites implementation preserved; no duplicated publishing portal or completed editorial integration claimed. |

## 2. Existing functionality preserved

Approved branding and all 20 avatars; planner/focus timer; personal progress/confidence/revision controls; course tabs and categories; timetable/date navigation; glossary foundations; notification filtering/read/correction/withdrawal; appearance/privacy controls; searchable Help; developer workbench; public shell/install/update/offline protections. Gallery download-time Canvas watermark code, public website/logo/content/SEO, Navigator and production workflow are unchanged.

The mandatory public shell remains **199,993 bytes / 79,972 bytes JavaScript**, within the unchanged 200 KB / 80 KB guards. Optional hero/video assets are outside that cache and do not cache private records. Developer-only preparation helpers/styles moved out of the student cache; reusable progress/form controls reduce duplication without removing functionality.

## 3. Tests actually executed

| Check | Result |
| --- | --- |
| Clean `npm ci` | Passed, 375 packages installed from existing lockfile. No dependency additions/versions changed. |
| `npm run lint` | Passed, zero errors/warnings. One Next-only navigation rule is scoped off for independent native backend UI modules, not application security checks. |
| `npx tsc --noEmit`; `npm run check:pwa` | Website TypeScript and strict PWA/service-worker/developer JS checks passed; integrity/budgets/cache/icon/contrast guards passed. Backend is native JS validated by runtime tests, not claimed as strict-TypeScript checked. |
| `npm test` | **155 passed, 0 failed**: 122 existing website/security/Navigator/academic/PWA tests plus 33 actual backend tests. Backend tests are now included in the existing npm validation command. |
| Backend suite, included in `npm test` | **33 passed, 0 failed**, including database restart, authorization/IDOR, hashing/Unicode, exact restrictions/concurrency, enumeration responses, recovery, MFA, CSRF/Origin/Host, input, revocation, audit rollback/redaction, DB failures, payment boundary, deletion/financial retention, encrypted restore/privacy failures and logout during password verification. |
| `npm audit --json` | **0 known vulnerabilities** across all severity categories at this check. Built-in/runtime/cloud-tool security is outside npm audit. |
| `npm run build` | Passed Next.js production static build. |
| `npm run check:export` | Passed: 35 HTML documents, 72 local assets, 65 valid JSON-LD blocks; no missing local references. Backend/PWA/developer/review code remains outside public export. |
| PWA core browser suite | Passed at 1440, 390, 320 and 768px: navigation/tabs/search/XSS text, planner/focus, denied storage, avatars, offline reload, update handling and isolated cache. |
| M4 browser regression | Passed desktop/mobile progress, privacy, dark/large appearance, Help, notification harness, seven Standard icon dimensions and regular-profile installability. |
| M5 visual/browser suite | Passed 1440/390/320px exact navigation, correct image crops, restricted Community/CBT, real video play/pause/captions/transcript, dark contrast, offline/failure fallback and overflow checks. |
| Controlled backend browser suite | Passed 1440/390px actual sign-in/MFA/role switch, DB status changes, community policy, audit, recovery, dark/light admin, logout and API/account/admin cache exclusion. No credential/setup-secret screenshots. |
| Developer workbench browser | Passed desktop/mobile metadata/resource/conflict behavior, boundaries and axe checks. |
| Website/gallery browser | Passed home/Portal/resources/Ads/gallery/Navigator at desktop/mobile; four portrait gallery downloads decode as valid JPEG with watermark changes and original-byte/top-content preservation. |
| Accessibility | **77 automated axe view scans, zero reported violations** across core/M4/M5/backend/developer suites. Manual visual/keyboard review is separate; no full-conformance/physical-device claim. |
| Brand/media integrity | Approved Standard geometry/icon/safe-circle checks; eight metadata-free responsive hero derivatives; real MP4 codec/dimensions/duration, captions/transcript/poster and optional-cache exclusion passed. |
| Secrets/diff review | Heuristic no-value credential scan and intended-file review passed. No real records, credentials, hashes, runtime databases, backups or token dumps added. A heuristic scan is not a complete history/private-data audit. |

The new backup-permission negative test initially did not force its intended world-readable directory because of the executor umask. The fixture now explicitly sets and verifies permissions; the targeted test and full combined suite pass. Final review also fixed an in-flight session-revocation race: a password change or MFA enrollment rechecks the actual session row after asynchronous work, so logout cannot resurrect authorization. Other integration test corrections preserved security assertions rather than disabling them.

## 4. Performance and visual comparison

Latest Chromium run at 390px with **400 kbps download / 150 ms latency**, no CPU throttling: largest contentful paint approximately **3.9 seconds**, load approximately **3.8 seconds**. This is a local emulation, not a Nigerian-network or physical-device benchmark. A browser downloads one hero candidate, approximately **9–32 KB**. Optional walkthrough is about **345 KB**, not automatically downloaded as video.

Written visual requirements and Image A are reflected in actual captures. Exact Image B comparison is **not completed because the file is unavailable**. No illustrative course lists, grades, timetables or identities were copied into the app. [Actual screenshots and video](../../design-review/m5/README.md) are suitable for smartphone review; they are not public-service mockups.

## 5. Security findings and infrastructure requirements

No unresolved confirmed frontend vulnerability was identified in the changed paths after fixes/tests. This is limited local evidence, not an independent penetration assessment. Remaining launch blockers are explicit:

- Smartweb runtime/DB/TLS/email/cron/private storage/logs/backups/limits/costs remain unverified after one proxy CONNECT 403. Node/SQLite is a working controlled candidate, not an approved hosting selection. Scrypt consumes about 128 MiB per job; real concurrent capacity must be tested.
- Production activation is deliberately refused; listener is loopback only and accepts synthetic databases. HTTPS/Secure-cookie deployment, secret custody, verified institutional domains, operational ownership/recovery email and abuse/load review are required before real accounts.
- Full compromised-password screening, production response-timing review, phishing-resistant privileged-access assessment and reviewed emergency administrator recovery remain required. TOTP tests do not certify complete authentication security.
- Payment reconciliation, protected file uploads/scanning/delivery, reviewed academic content, progress/notification synchronization, complete community transport and CBT engine are not operational. All remain required before first launch.
- Retention/legal holds, graduation/deletion ownership, financial/audit retention, offsite backup schedules/key custody/monitoring and independent audit anchoring need approval and implementation. Test defaults are not legal policy.
- The install emitted an **ESLint 9 end-of-support deprecation notice**. No known audit vulnerability is reported; review a compatible supported tooling upgrade separately. No unrelated dependency migration was made here.
- Current NIST/OWASP online reference requests also returned proxy CONNECT 403 once each. Established guidance is documented, but latest online text could not be reverified. No blocked service was repeatedly retried.
- Physical Android/iOS, real authenticator-app/user assistive-technology review, production mail/provider/host/load tests and independent security review were unavailable/not executed. Original editorial source and Image B remain external dependencies.

## 6. Integration, remaining milestones and next tasks

Next.js public publishing, editorial operations and sensitive PWA administration retain separate ownership. No real student/financial information is in static assets or the public repository. No DNS, hosting, main branch, production workflow or payment setting was changed.

[M5 completion matrix](m5/PRE_LAUNCH_MATRIX.md) assigns every remaining approved function to M6–M8: reviewed academic workflows/content and learning tools; complete notifications/appointments; community interactions/moderation and CBT applications in M6; operational protected APIs/email/payments/uploads/sync/messaging/CBT engine in M7; complete device/accessibility/load/security/restore and institutional acceptance in M8. **No approved function is postponed beyond launch.**

Next actions are owner visual review, missing design-board/editorial source access when available, verified hosting capabilities/costs and reviewed academic content/policy. No production activation is requested or performed by this milestone.

## 7. Files and version control

Main additions: `backend/src/`, `backend/migrations/`, `backend/ui/`, `backend/testing/`, `backend/tests/`; M5 API/operations/threat/launch/visual documents; responsive hero source/generator/derivatives; optional tutorial/player/media; M5 browser/media checks and review images. Existing PWA routes/views/styles, native form/progress helpers, developer-only preparation placement, package validation commands and current-status documentation are updated. The original watermark, website and approved identity masters remain unchanged. [Complete intended-file inventory](../../design-review/m5/FILES_CHANGED.txt) accompanies review assets.

Completed M5 work is committed normally to the existing development branch after successful checks; the exact final SHA and remote confirmation are supplied in the delivery message and cloud review package. No force-push, rebase, merge or deployment is performed. The full PWA is **not ready for public launch**; this milestone is ready for owner review within the documented controlled boundaries.
