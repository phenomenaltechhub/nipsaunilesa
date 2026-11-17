# PHARMAIDEIA · NIPSA UNILESA

Independent HTML/CSS/ES-module student companion. This directory is **not** copied into the Next.js `public/` folder or GitHub Pages export. Authentication, payments, private academic delivery, server permissions and messaging remain infrastructure-dependent. No backend or student records are connected. The clean student interface does not imply otherwise.

## Review in Codex Cloud

From the repository root:

```sh
npm run preview:pwa
npm run preview:developer
npm run check:pwa
npm test
npm run test:pwa:browser
npm run test:developer:browser
npm run review:m3:design
```

The PWA preview binds loopback port 4173; the separate developer server binds loopback port 4174. These are development tools, not phone-accessible public links. The environment has no supported shared-browser forwarding interface. Actual desktop/mobile screenshots are saved under `/workspace/artifacts/pharmaideia-m3/`; design exports are also under `design-review/milestone-3/exports/`. `npm run review:pwa:planner` records the working planner; set `PHARMAIDEIA_REVIEW_DIR` to choose its artifact directory.

## Student interface through M3

- **Dashboard**, Courses, Timetable, Study planner, Glossary, Announcements and Preferences share one responsive shell. Empty states are concise; no official course, event, term, identity or academic-level assignment is invented. Inactive community, login, payment and management operations are not offered.
- Dashboard prioritises courses, timetable, deadlines, actual personal study priorities and announcements. No marketing hero, redundant shortcut-card row, fake activity statistics or repeated development banners.
- Course details include keyboard-accessible details/topics/materials/schedule/revision tabs. The empty catalogue does not offer a fabricated course to select. No protected content is bundled. Calendar controls browse real device-calendar dates and switch Week/Agenda; these dates are not official institutional schedules.
- Personal revision tasks support valid optional dates, completion, filtering and removal. They remain in tab memory across routes, clearing on reload. The working focus timer resets on leaving/reloading its view. Neither is a server-synced academic record.
- Twenty original curated avatars remain available. Only an allowlisted appearance ID may persist after explicit opt-in. No account identity, roles, tasks or credentials enter browser storage.
- Manifest, original active icons, explicit public-only offline shell and user-controlled updates remain functional. Connectivity feedback appears only when offline. Install availability depends on browser/secure context; technical setup errors go to the developer console, without sensitive details.

## Developer diagnostics and academic preparation

`developer-tools/` sits **outside** the student app/cache and website export. It records module IDs and implementation statuses, not live health statistics. An explicitly started loopback server restricts file prefixes; other repository/dot-file requests return 403. No browser role flag grants developer access. Public source is naturally readable on GitHub, so tooling contains no secrets or protected logs. External hosting/forwarding would require real server authentication first.

The separate content workbench uses reusable `src/modules/academic/models.js` and course-detail components. It validates bounded course/resource metadata, direct external Drive/Docs links and actual dates/times; detects proposed same-level class/exam conflicts; and derives an unreviewed status. All metadata starts empty, stays in memory and clears on reload. No API, publication, permission grant, file upload or institutional approval occurs. File descriptor checks are not malware/binary validation. See the academic contracts and diagnostics guide.

## Structure and security

`assets/brand/`: preserved active M1/M2 Book–Molecule identity and icons.
`styles/`: shared design tokens and responsive shell.
`src/components/`: textContent-based DOM composition, shared navigation/tabs.
`src/modules/`: academic, personal study and appearance components; inactive community source retained.
`src/state/`: allowlisted local navigation, no student role/identity state.
`src/api/`: disconnected service boundary; rejects without requests.
`src/pwa/`, `sw.js`: public asset allowlist, registration and update handling.

No untrusted text is parsed as HTML. No external scripts/fonts/analytics, uploads, account forms or permission prompts are added. `connect-src 'self'` supports public shell installation, not authentication. New sensitive integrations require server enforcement and integration tests, never just changing a client flag. No runtime PWA npm dependency is introduced; axe is an isolated development-only test tool with notices retained.

The M3 public cache is v3. Increment its version when shipped assets change and test installation/update/offline behavior. Never add private/API response caching. Personal tools and developer proposals do not enter Cache Storage. Unrelated app caches remain preserved during updates.

## Integration and release gates

Read `docs/nipsa-platform/ARCHITECTURE.md`, `SECURITY.md`, `INTEGRATION_CONTRACTS.md`, `ACADEMIC_CONTRACTS.md`, `DEVELOPER_DIAGNOSTICS.md` and `MILESTONE_3.md`. Verified academic content, secure operational hosting and approval remain required before public service activation. The proposed app subdomain is not configured. Do not deploy this directory, change DNS, enable live Paystack or collect private student information for this milestone. Headers such as HSTS/frame-ancestors require real hosting configuration.

Three original identity alternatives and the editorial layout are **review proposals**, outside the app. No final variant is selected or applied. The original editorial source remains unavailable and has not been replaced/integrated.
