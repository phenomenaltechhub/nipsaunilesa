# PHARMAIDEIA · NIPSA UNILESA

Independent HTML/CSS/ES-module student companion. This directory is **not** copied into the Next.js `public/` folder or GitHub Pages export. No backend, account, payment, private academic content or messaging service is connected. This is ongoing production development, not a substitute for those services.

## Work locally in Codex Cloud

From the repository root:

```sh
npm run preview:pwa
npm run check:pwa
npm test
npm run test:pwa:browser
npm run review:pwa:planner
```

The preview server is loopback-only on port 4173. Use a supported cloud preview interface if available; a localhost address alone does not give the owner smartphone access. Browser checks save actual screenshots outside the repository under `/workspace/artifacts/pharmaideia-m2/` by default. The planner review command records actual mobile controls to a WebM artifact, without injecting application state or inventing student/course data.

## Available through M2

- Desktop sidebar, smartphone navigation and keyboard-accessible page switching.
- Cohesive overview, course/glossary empty-catalogue search, course-hub structure tabs and a Week/Agenda date browser. No courses, official schedules or levels are invented. Notifications/accounts remain unavailable and the one general community stays closed.
- A working personal revision list with optional target dates, completion, filtering, removal and a dashboard summary. It is bounded, stays in memory for this tab, survives route changes and clears on reload; it is not an academic record or server-synced plan.
- A real, in-memory focus timer: select duration, start, pause, resume and reset. It stores no student data or study history and resets on navigation/reload.
- Twenty original curated avatars and category selection. The single atlas keeps loading light. Only an allowlisted avatar ID can be stored on the device after explicit opt-in; no account/profile synchronisation is claimed.
- Manifest, original icons, explicit public-only offline shell and opt-in update handling. Install availability depends on the browser and secure context. Service worker setup failure is visible. The device-online label is connectivity information, **not** a claim that student services are online.

## Structure

`assets/brand/`: editable Book–Molecule artwork and generated icons.
`styles/`: shared design tokens and responsive shell.
`src/components/`: safe DOM composition and accessible shared UI.
`src/modules/`: academic, study, community and account components.
`src/state/`: allowlisted local navigation; no student identity or role state.
`src/api/`: disconnected service boundary; rejects without sending requests.
`src/pwa/`, `sw.js`: public asset allowlist, registration and update handling.

No untrusted text is inserted as HTML. No external scripts, fonts, analytics, uploads, account forms or permission prompts are added. The personal study form is local-only, with no submission endpoint. `connect-src 'self'` permits the public shell's service-worker installation; it is not authentication. The service boundary never issues API requests. Future integrations require new server enforcement and security review, not changing a browser status flag.

See `docs/nipsa-platform/DESIGN_SYSTEM.md` and `THIRD_PARTY.md` for component rules and the reviewed development-only axe accessibility tool. No runtime npm dependency is added to the PWA; axe and its preserved notices are used only in isolated browser tests, never in the public cache/export.

Before publishing any later public-shell revision, increment the version in `src/pwa/cache-policy.js` and test installation/update/offline behavior. Cache versions must change when their assets change. Keep the explicit public allowlist; never introduce runtime caching of private/API responses. Updates wait for the user before reloading, and leaving/reloading the timer view discards its in-memory session as disclosed.

## Deployment and integration gates

Read `docs/nipsa-platform/ARCHITECTURE.md`, `SECURITY.md` and `INTEGRATION_CONTRACTS.md`. Do not deploy this directory, change DNS, link an unready account portal into production, enable live Paystack, or collect student information as part of this milestone. The proposed app subdomain is a plan, not configured hosting. Security headers such as `frame-ancestors`, HSTS and permissions policies require real host configuration; an HTML meta policy cannot replace them.
