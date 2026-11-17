# PHARMAIDEIA · NIPSA UNILESA

Standalone HTML/CSS/ES-module student companion. It remains outside Next.js `public/` and the GitHub Pages export. No real accounts, private records, payments, messaging or CBT service is activated. All approved functions, including community and CBT, must be completed and validated before first public launch; see the pre-launch matrix.

## Current M4 functionality

- Approved **Knowledge Nexus Classic Standard** identity across PWA header/startup, icons, favicon and manifest. Standard geometry is preserved at every size; no optical substitution. Website logo is unchanged. Source/review history is preserved.
- Dashboard, Courses, Timetable, Study planner, Glossary, Announcements, Settings and Help share one responsive shell. Empty states contain no invented institutional information. No inactive authentication, payment or community controls pretend to work.
- Real personal course-progress outlines: topics/subtopics, coverage, self-assessed understanding, revision, difficulty, priority, filters and per-outline/overall summaries. Leaf topics avoid double counting. Practice and CBT results are separate and absent until actual assessments exist. Personal outlines clear on reload and are not official academic records.
- Existing revision tasks, focus timer, week/agenda navigation and twenty curated avatars remain functional. Only an explicitly opted-in avatar ID may persist; no task, topic, role, identity or receipt enters storage/cache.
- Local notification centre has literal search, priority/read filters, read state, revision-aware corrections and withdrawal handling. The app starts with no notices. Independent test fixtures exercise populated behavior; no sender or live delivery is fabricated. Server targeting/publication/receipts remain integration work.
- Settings offers curated avatars, light/dark/device theme, larger text, session-only notification preferences, privacy clearing, account/recovery information, About and support links. No browser push is requested. Authenticated sign-out/recovery controls await actual sessions.
- Searchable non-sensitive Help covers students, reps, executives, administration, editorial ownership, privacy/security, community rules and CBT workflows. Private runbooks require future authenticated delivery.

## Developer and content boundary

`developer-tools/` is separate, loopback-only and absent from student cache/export. It includes module statuses and unreviewed course/context/topic/resource/schedule preparation. Level/session/semester fields describe proposals, never permissions. Authenticated rep management must be server-scoped by level/course. File descriptors are not binary/malware validation. No upload endpoint exists.

Preparation models and the populated draft renderer are excluded from the student runtime. Thin shared category metadata retains the student course structure. The integrity check verifies that every static runtime import is precached; size reductions do not omit code that the student UI downloads. The original **200,000-byte public shell / 80,000-byte JavaScript** budgets remain unchanged. No runtime/development dependency is added for M4. UI patterns use native controls and original components; no React UI library is imported into this PWA.

## Review and validation

```sh
npm run preview:pwa
npm run preview:developer
npm run check:pwa
npm run check:brand
npm test
npm run test:pwa:browser
npm run test:developer:browser
npm run test:m4:browser
npm run test:website:browser
```

Preview servers bind loopback only (4173/4174). Localhost URLs are not owner-accessible public links. M4 screenshots, a real mobile recording and validation logs are under `/workspace/artifacts/pharmaideia-m4/`. The M4 suite uses temporary copies/fixtures and the existing system FFmpeg through a temporary recorder directory; no encoder download/new package is needed. Chromium/axe/viewport checks do not certify physical Android/iOS installability, full accessibility or backend security. Regular-profile Chromium installation eligibility is checked separately from incognito test contexts.

The explicit public cache is v4. Increment it whenever shipped assets change. No runtime API/response caching; private data, questions/keys, personal state, drafts, test tools and diagnostics are never precached. Updates wait for user choice and preserve unrelated caches. New backend integrations require server authorization, CSRF/rates/session controls and security tests, not changing a client flag.

## Before launch

Read `docs/nipsa-platform/MILESTONE_4.md` and `m4/LAUNCH_COMPLETION_MATRIX.md`, `AUTHENTICATION_POLICY.md`, `NOTIFICATIONS_AND_PROGRESS_API.md`, `CBT_AND_COMMUNITY_ARCHITECTURE.md`. Verified academic/glossary content, rights, editorial source, funded validated hosting/email/private storage/realtime services, operational backend security and M8 acceptance are still required. No approved function is silently deferred beyond launch. Proposed app subdomain remains unconfigured. No deployment, DNS, live Paystack or real student-data collection is part of M4.
