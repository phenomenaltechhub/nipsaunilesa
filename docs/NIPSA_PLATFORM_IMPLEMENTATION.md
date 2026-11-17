# NIPSA UNILESA — Integrated Editorial + Student PWA Implementation Plan

> Status: development specification, NOT proof that production services are live.
> Repository: phenomenaltechhub/nipsaunilesa
> Working branch: development/nipsa-student-platform
> Production protection: main and existing GitHub Pages deployment must remain untouched until reviewed and approved.

## Context and architecture
- Existing public site: Next.js 16 static export at repository root; GitHub Pages deploy workflow runs on main.
- Student PWA: separate installable mobile-first HTML/CSS/ES-module JavaScript application proposed in student-pwa/; future app.nipsaunilesa.com.ng.
- Editorial console: independent NIPSA UNILESA Editorial Site prototype (browser-local storage, not yet authenticated/published into main website). Keep its source separate pending an intentional source import; do not pretend the existing Site is connected.
- Shared future backend: PHP + MySQL on Smartweb or later provider, with server-side RBAC, API, audit, secure sessions, file metadata, Paystack integration only where required.
- Avoid extra build tools and large JS packages for PWA; offline resilience and low data use are requirements.

## Current financially constrained phase
- Registration is dues collection + collecting future PWA roster fields, not membership verification. No OTP, no eligibility gate and no registration batches.
- An unlisted Next.js information route or direct Paystack Payment Page URL is enough. Use Paystack hosted fixed-fee form with custom fields; store successfully paid records in Paystack, export CSV manually. Never expose secret API keys in Next.js static output.
- Capture required name, institutional email, matriculation number, current level, admission year, registered position/status, privacy notice; do not auto-grant roles from a self-selected field.
- Registration completion = successful dues payment. PWA activation batches are a separate future operation.
- The existing editorial prototype remains local-first until proper source integration and authenticated remote publishing are implemented.

## Editorial console — intended production modules
1. Overview: action queue, approvals, schedule, revision reminders, recent publishing history.
2. Publishing: announcements, official notices/memos, articles/news, events, homepage placements.
3. Resources & opportunities: approved academic links and files, opportunities and categories.
4. Student Ads: student/external application; review; quotation; policy consent; Paystack confirmation; final review; publication; expiry; renewal; Basic/Premium/Premium Plus and featured placements.
5. Departmental Gallery: public albums grouped by event/date/level; images, captions, consent and attribution, thumbnails, accessible alt text, rights, moderation, archive; Google Drive for originals as appropriate. Download-triggered watermarking is ALREADY IMPLEMENTED in app/gallery/gallery-image-viewer.tsx via downloadWatermarkedImage(): on click, a canvas composites the current image with /nipsa-logo.png and an attribution line, then downloads a generated JPEG. PRESERVE this existing behavior and REFINE it, do not replace it with pre-watermarked published assets. Refine branding to include approved NIPSA UNILESA identity/site address as required, text readability across image sizes, image quality and aspect, safe filenames and errors, large-image/mobile-memory handling, slower-device timing and external-image CORS handling. Audit all website image download buttons to use the same reusable helper. The guarantee applies to downloads initiated through the website's controlled buttons; do not falsely claim it prevents saving original public image URLs or screenshots.
6. Website management: Campus Navigator verified location data/content, shared site footer and link integrity (no invented map coordinates).
7. Settings: media management, editorial roles, backups, logs, integration/deploy status.
- Roles may have several accounts each. Administrator has technical/configuration control AND explicit full publishing rights; Editor-in-Chief, Contributor, Media Editor, Ads Editor and restricted publisher are separate permission sets. Do not pre-create staff accounts.
- Workflow: Draft -> Submitted -> Review/Revisions -> Approved -> Scheduled -> Published -> Archived. Local browser approval is NOT public publication. Optional verified author/sender attribution on announcements, memos and articles: staff, EXCO, class representative or official NIPSA account, with visible position and immutable underlying authenticated actor/audit ID; never allow arbitrary impersonated titles. No staff accounts should be precreated.

## Student PWA — completed design scope for release
- One PWA, three level-specific dashboard views: 100L, 200L, 300L, each controlled by the server account level; student visible by real registered name and level, not username.
- Home: current level, urgent notices, today's schedule, deadlines, latest materials, term of the day.
- Academics: per-course hubs with syllabus/topics, lecture notes, practical materials, past questions where approved, assignment reminders, key deadlines, links, search and filtering, download/preview, activity and revision checklist.
- Academic excellence: self-managed study planner, calendar/ICS export, exam revision checklist, flashcards/self-tests with reviewed sources, optional local progress tracking, recent resource history; no fabricated grades or fake progress.
- Class representatives are assigned per LEVEL; manage course-by-course materials/timetables/deadlines for their own level only. Add a rep content-update workflow with audit trail, and Google Drive URL submission alongside hosted file upload when storage is funded.
- Existing public website resources link into PWA without duplicated storage. Public Google Drive anyone-with-link material is NOT private merely because viewed from PWA.
- Glossary: reviewed searchable pharmacology concepts with mechanism/functions/related terms/bookmarks, persistent automatically selected Term of the Day (no auto-disappear).
- Notifications: in-app feed, targeted level/role/department notices; selected executives gain explicitly assigned publishing privileges. Actual browser push only after verified implementation and consent.
- Community: exactly ONE full-window general department chat; WhatsApp-style swipe-right-to-reply/quote, @mentions, reactions, avatar profile dialog, group info and member listing, message reporting, chat-only suspension, action audit. Chat defaults LOCKED during dues registration; an authorised PWA administrator can OPEN or CLOSE it at ANY TIME once safe infrastructure exists. Closing disables posting using server-side checks, preserves appropriate read-only history and logs the action. No automatic unlock based solely on funds collected. Do not implement level-based chatrooms, direct audio calling or media chat at release.
- Profile/avatar: curate ~20 small static pharmacology/student medicine themed SVG avatar choices (including science icons and diverse clinician illustrations); no personal image uploads. Display student registered name, level, verified office title AND actual name for executives/CRs.
- Account activation: batches released AFTER successful paid roster import; at activation verify identity/ownership using a secure method to be determined, set password, then administrator approves PWA access. Later logins email/password.
- Recovery: student contacts admin; admin verifies and issues one-time expiring reset credential/link; student changes password immediately. Never email shared default passwords or forbid urgent changes for one week. Password reset revokes existing sessions. Do not build invasive cross-device tracking.
- Admin PWA modules: student accounts and approval, position grants/revocation/switching, CR academic oversight, role-targeted notifications, glossary moderation, chat restriction, logs. No unassigned staff accounts.
- Graduation: deactivate access and apply disclosed data-retention/deletion policy, preserving only records required by applicable obligations.

## Design identity
- Companion brand is PHARMAIDEIA (selected name), by NIPSA UNILESA. Selected visual identity Concept B: Book–Molecule Interlock (interlocking open-book pages and molecule bonds). Implement an original scalable SVG app emblem with PWA 192/512 icons, mono and light/dark variants. Keep assets editable for future revisions requested by authorised staff/executives. Do not recreate the NIPSA National symbol.
- Visual direction: course-first, contemporary Moodle/Canvas/Google Classroom-inspired navigation (NOT copying their design); emerald/teal, white/light backgrounds, subtle glass nav, compact real academic content, mobile bottom nav + desktop sidebar.
- Do not generate placeholder students, fake announcement identities, fabricated timetable/source content or non-functional controls that look active.

## Code organisation proposed (do not restructure existing root blindly)
- Existing root Next.js public website remains intact.
- student-pwa/ for build-light HTML/CSS/JS app, assets, manifest, SW, admin and student views.
- docs/nipsa-platform/ for diagrams, source schemas, payment import format, permission matrix, editorial/PWA dependency matrix, cost and operations notes.
- future: a separate backend/ folder for PHP APIs and migrations only after hosting resources are secured.
- Editorial Site source should be imported only after retrieval of the owned original project/ZIP, with provenance documented.

## Security and data safety — highest priority; release gates
- Threat-model every shared workflow before implementing it, using least-privilege server-enforced RBAC. Client-side guards, hidden URLs, localStorage and payment redirects are NOT security boundaries.
- Collect minimum necessary student personal information, with disclosed retention/deletion and rights, photo consent/withdrawal, protected exports, encrypted offsite backups and tested restoration.
- Repository is PUBLIC: never commit actual student records, NIN/BVN, database dumps, account credentials, API/Paystack secrets, private media or tokens. Add secret scans and safe example env placeholders.
- Use strong password hashing (Argon2id where available), secure HttpOnly/Secure/SameSite cookies, CSRF checks, narrow CORS, input validation/output encoding, rate limiting, audit logs, safe errors and admin MFA where feasible.
- Do not create shared/permanent default passwords. Admin-assisted recovery must verify identity, issue one-time expiring credential/link, force immediate password change and invalidate existing sessions. Students can change compromised passwords immediately; never delay security changes one week.
- Paystack dues registration is hosted by Paystack without a backend. When APIs become available, independently verify server-side reference/status/amount/currency/signature and handle retries/idempotency/chargebacks; never trust frontend payment callbacks.
- Validate file MIME/size/content, permissions and source; scan uploads where possible; keep private originals outside public paths and prevent unauthorized downloads; Drive 'anyone with link' is not confidential.
- Test cross-level access isolation, position grant/revoke, accurate author attribution, rollback, moderation and server-side community open/close. A closed community rejects ALL write requests even if clients bypass controls.
- Require security CI, dependency updates/audits, responsive/accessibility testing and privacy, backup/restore and incident-response reviews before live student accounts, remote content publishing, payments or chat are declared production-ready.

## Phased implementation & gates
1. Baseline: inspect current production site and CI; record exact modules and dependencies. Add no secrets; create feature tests; isolate all work on this branch.
2. Brand/design tokens, navigation and fully responsive PWA shell with installability and accessible components.
3. Complete all academic views, level structures, rep workflows, glossary, notification screens, course resources, calendar and accessible offline fallbacks. Use truthful empty states, no fake students or courses.
4. Extend Next.js website registration info page/unlisted route and future editorial content/gallery contracts; do not enable live payment before merchant setup and tests.
5. Prepare editorial source integration, CMS content types/gallery/ads workflows; do not overwrite the independent Sites project or claim live remote publication.
6. Define data model, PHP/MySQL API contracts and security tests for after paid hosting. Never implement client-only trust for payments, roles or account approval.
7. Implement backend, admin approval, session auth, role checks, audit, resource upload permissions, email ownership, web push and realtime chat after infrastructure exists.
8. Security + functional QA: no cross-level leakage, Paystack records only after success, file permission checks, upload validations, admin recovery, chat locked state, 3-level mobile testing, accessibility, budgets, backup/restore.
9. Preview on branch; open reviewed PR. Never merge, deploy production or alter DNS without explicit approval.

## Production acceptance
- All promised launch features must be real and tested, or clearly held behind an intentional administrative availability gate (e.g. locked chat).
- The PWA cannot be publicly described as a fully operational authenticated student application until backend, privacy controls, payment roster import, permissions and QA are complete.
- Connected cross-platform workflows must be exercised end to end, with recovery for failures and auditability.

## Mobile Codex execution context
- The owner is using SMARTPHONE, and an existing Codex Cloud environment named nipsaunilesa already exists. Locate/fetch the remote branch development/nipsa-student-platform in THAT environment; do not ask for PC setup or create another branch/environment/repository. Preserve main.

## Technical checks
- Verify npm run lint, npm test, npm run build, npm run check:export on unmodified Next.js baseline and after changes. Keep npm network usage minimal.
- Test PWA with real browser/phone where feasible; no forced heavy framework migration.
- Preserve existing Pages workflow trigger on main and do not accidentally deploy branch artifacts.
## M4 owner update — 17 November 2026 (current requirements)

All approved PWA functionality must be fully implemented, integrated, secured and tested **before first public launch**. Community and the complete pre-examination CBT programme are included; neither is deferred to post-launch. M4 is an increment, not whole-platform completion. The current completion assignments and gates are in `docs/nipsa-platform/m4/LAUNCH_COMPLETION_MATRIX.md`. Infrastructure/source/content gaps block the affected launch gate rather than silently removing approved scope.

Approved identity is **Knowledge Nexus — Classic — Standard** from `design-review/knowledge-nexus/masters/a-classic-*` standard files. Preserve the graduation cap/book/molecular structure and proportions. No Institutional, Essential or optical substitution is authorised. PWA integration is authorised in M4; the main website logo remains unchanged. Original sources/review assets remain preserved.

M4 adds working local academic progress, context/topic preparation, notification-centre state, Settings/Help and current security/API specifications. No browser role or level grants access. Authentication requires progressive server restrictions, secure owner recovery and defence against deliberate lockout as specified in `m4/AUTHENTICATION_POLICY.md`. CBT, notifications/progress and community contracts explicitly distinguish local components from operational backend services. No production, DNS, real-account or live-payment action is authorised.

## M6 implementation update — current controlled architecture

M5/M6 implement and test a real **loopback-only synthetic Node 24/SQLite backend** in `backend/`, extending one service rather than assuming unverified Smartweb PHP/MySQL support. Earlier proposed stack/phasing text remains historical planning. No production backend/runtime choice or public activation is inferred. M6 adds actual academic review/progress, targeted notifications, persisted general-community operations/moderation and two-stage CBT applications/selected-batch planning, connected to existing PWA routes. Server-controlled examination delivery remains a required M7 implementation; full platform launch remains blocked until every approved feature is completed/reviewed.

Use [M6 milestone report](nipsa-platform/MILESTONE_6.md), [actual APIs/permissions](nipsa-platform/m6/API_AND_PERMISSIONS.md), [security review](nipsa-platform/m6/SECURITY_REVIEW.md) and [updated pre-launch matrix](nipsa-platform/m6/PRE_LAUNCH_MATRIX.md) for current evidence and assignments. There is no post-launch deferral of approved scope. Original editorial source remains absent; no duplicate publisher or fabricated integration is built. No merge/deployment/main/DNS/hosting/payment/real-account action is authorized by M6.

## M7 controlled integration update

M7 now implements and tests the actual server-controlled CBT delivery engine on this same native backend, including selected attempts, deadlines, answer persistence/replay/recovery, marking, admin review and private result release. Community/notification polling and maintenance, reviewed protected resources, controlled TLS and sandbox-only provider adapters extend existing operations. No real accounts, payment service, external provider/host or Editorial integration is declared operational.

Current evidence and incomplete scope are in the [M7 report](nipsa-platform/MILESTONE_7.md), [API/operations](nipsa-platform/m7/API_AND_OPERATIONS.md), [architecture decision](nipsa-platform/m7/ARCHITECTURE_DECISION.md), [security register](nipsa-platform/m7/SECURITY_REVIEW.md) and [M8 pre-launch matrix](nipsa-platform/m7/PRE_LAUNCH_MATRIX.md). Every approved feature remains mandatory before public launch. M8 must complete remaining implementation and external/review gates; no automatic M8 start, main merge, production deployment, DNS/hosting change or paid provisioning is authorized.
