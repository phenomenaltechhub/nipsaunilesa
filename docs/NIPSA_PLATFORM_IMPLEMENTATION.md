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
5. Departmental Gallery: public albums grouped by event/date/level; images, captions, consent and attribution, thumbnails, accessible alt text, rights, moderation, archive; Google Drive for originals as appropriate.
6. Website management: Campus Navigator verified location data/content, shared site footer and link integrity (no invented map coordinates).
7. Settings: media management, editorial roles, backups, logs, integration/deploy status.
- Roles may have several accounts each. Administrator has technical/configuration control AND explicit full publishing rights; Editor-in-Chief, Contributor, Media Editor, Ads Editor and restricted publisher are separate permission sets. Do not pre-create staff accounts.
- Workflow: Draft -> Submitted -> Review/Revisions -> Approved -> Scheduled -> Published -> Archived. Local browser approval is NOT public publication.

## Student PWA — completed design scope for release
- One PWA, three level-specific dashboard views: 100L, 200L, 300L, each controlled by the server account level; student visible by real registered name and level, not username.
- Home: current level, urgent notices, today's schedule, deadlines, latest materials, term of the day.
- Academics: per-course hubs with syllabus/topics, lecture notes, practical materials, past questions where approved, assignment reminders, key deadlines, links, search and filtering, download/preview, activity and revision checklist.
- Academic excellence: self-managed study planner, calendar/ICS export, exam revision checklist, flashcards/self-tests with reviewed sources, optional local progress tracking, recent resource history; no fabricated grades or fake progress.
- Class representatives are assigned per LEVEL; manage course-by-course materials/timetables/deadlines for their own level only. Add a rep content-update workflow with audit trail, and Google Drive URL submission alongside hosted file upload when storage is funded.
- Existing public website resources link into PWA without duplicated storage. Public Google Drive anyone-with-link material is NOT private merely because viewed from PWA.
- Glossary: reviewed searchable pharmacology concepts with mechanism/functions/related terms/bookmarks, persistent automatically selected Term of the Day (no auto-disappear).
- Notifications: in-app feed, targeted level/role/department notices; selected executives gain explicitly assigned publishing privileges. Actual browser push only after verified implementation and consent.
- Community: exactly ONE full-window general department chat; WhatsApp-style swipe-right-to-reply/quote, @mentions, reactions, avatar profile dialog, group info and member listing, message reporting, chat-only suspension, action audit. Chat stays LOCKED during dues registration, and unlocks only on explicit admin readiness decision after server/realtime load tests and adequate funding. Do not implement level-based chatrooms, direct audio calling or media chat at release.
- Profile/avatar: curate ~20 small static pharmacology/student medicine themed SVG avatar choices (including science icons and diverse clinician illustrations); no personal image uploads. Display student registered name, level, verified office title AND actual name for executives/CRs.
- Account activation: batches released AFTER successful paid roster import; at activation verify identity/ownership using a secure method to be determined, set password, then administrator approves PWA access. Later logins email/password.
- Recovery: student contacts admin; admin verifies and issues one-time expiring reset credential/link; student changes password immediately. Never email shared default passwords or forbid urgent changes for one week. Password reset revokes existing sessions. Do not build invasive cross-device tracking.
- Admin PWA modules: student accounts and approval, position grants/revocation/switching, CR academic oversight, role-targeted notifications, glossary moderation, chat restriction, logs. No unassigned staff accounts.
- Graduation: deactivate access and apply disclosed data-retention/deletion policy, preserving only records required by applicable obligations.

## Design identity
- Final companion-app name is undecided: use NIPSA UNILESA Student PWA as temporary title, preserve NIPSA chapter affiliation and existing logo until new companion identity is approved.
- Visual direction: course-first, contemporary Moodle/Canvas/Google Classroom-inspired navigation (NOT copying their design); emerald/teal, white/light backgrounds, subtle glass nav, compact real academic content, mobile bottom nav + desktop sidebar.
- Do not generate placeholder students, fake announcement identities, fabricated timetable/source content or non-functional controls that look active.

## Code organisation proposed (do not restructure existing root blindly)
- Existing root Next.js public website remains intact.
- student-pwa/ for build-light HTML/CSS/JS app, assets, manifest, SW, admin and student views.
- docs/nipsa-platform/ for diagrams, source schemas, payment import format, permission matrix, editorial/PWA dependency matrix, cost and operations notes.
- future: a separate backend/ folder for PHP APIs and migrations only after hosting resources are secured.
- Editorial Site source should be imported only after retrieval of the owned original project/ZIP, with provenance documented.

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

## Technical checks
- Verify npm run lint, npm test, npm run build, npm run check:export on unmodified Next.js baseline and after changes. Keep npm network usage minimal.
- Test PWA with real browser/phone where feasible; no forced heavy framework migration.
- Preserve existing Pages workflow trigger on main and do not accidentally deploy branch artifacts.