# PHARMAIDEIA · NIPSA UNILESA

Independent HTML/CSS/ES-module student companion. This directory is **not** copied into the Next.js `public/` folder or GitHub Pages export. No backend, account, payment, private academic content or messaging service is connected. This is ongoing production development, not a substitute for those services.

## Work locally in Codex Cloud

From the repository root:

```sh
npm run preview:pwa
npm run check:pwa
npm test
npm run test:pwa:browser
```

The preview server is loopback-only on port 4173. Use a supported cloud preview interface if available; a localhost address alone does not give the owner smartphone access. Browser checks save actual screenshots outside the repository under `/workspace/artifacts/pharmaideia-m1/` by default.

## Available in this milestone

- Desktop sidebar, smartphone navigation and keyboard-accessible page switching.
- Overview, course/glossary empty-catalogue search, notifications availability, account availability and one closed community view. No level selector claims access to private dashboards.
- A real, in-memory focus timer: select duration, start, pause, resume and reset. It stores no student data or study history and resets on navigation/reload.
- Manifest, original icons, explicit public-only offline shell and opt-in update handling. Install availability depends on the browser and secure context. Service worker setup failure is visible. The device-online label is connectivity information, **not** a claim that student services are online.

## Structure

`assets/brand/`: editable Book–Molecule artwork and generated icons.
`styles/`: shared design tokens and responsive shell.
`src/components/`: safe DOM composition and accessible shared UI.
`src/modules/`: academic, study, community and account components.
`src/state/`: allowlisted local navigation; no student identity or role state.
`src/api/`: disconnected service boundary; rejects without sending requests.
`src/pwa/`, `sw.js`: public asset allowlist, registration and update handling.

No untrusted text is inserted as HTML. No external scripts, fonts, analytics, uploads, account forms or permission prompts are added. `connect-src 'self'` permits the public shell's service-worker installation; it is not authentication. The service boundary never issues API requests. Future integrations require new server enforcement and security review, not changing a browser status flag.

Before publishing any later public-shell revision, increment the version in `src/pwa/cache-policy.js` and test installation/update/offline behavior. Cache versions must change when their assets change. Keep the explicit public allowlist; never introduce runtime caching of private/API responses. Updates wait for the user before reloading, and leaving/reloading the timer view discards its in-memory session as disclosed.

## Deployment and integration gates

Read `docs/nipsa-platform/ARCHITECTURE.md`, `SECURITY.md` and `INTEGRATION_CONTRACTS.md`. Do not deploy this directory, change DNS, link an unready account portal into production, enable live Paystack, or collect student information as part of this milestone. The proposed app subdomain is a plan, not configured hosting. Security headers such as `frame-ancestors`, HSTS and permissions policies require real host configuration; an HTML meta policy cannot replace them.
