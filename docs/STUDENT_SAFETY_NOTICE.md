# Student Safety Notice

Base: `c5a31bb` (latest main at implementation start, including Tour refinements). Branch: `feature/student-safety-notice`. Publication requires owner approval; no merge or deployment is performed.

## Content and policy

The exact displayed wording is maintained in `app/student-safety/content.ts` and exported as plain text in this review directory. Departmental physical registration/payment procedures are confirmed by the project owner. Amounts, landlords, agents, bank accounts, portals and deadlines are not invented. University tuition/admission channels are distinguished from departmental procedures and from separate authorised NIPSA dues/advertising transactions. No payment service is activated.

An attempt to inspect `https://unilesa.edu.ng/` returned proxy CONNECT 403. The university's exact interaction behavior was not verified or copied. Its owner-specified landing-notice purpose is the reference; this implementation uses NIPSA's own assets and styling.

## Behavior and privacy

The homepage renders the dialog closed on the server. After hydration, a 600 ms timer opens the active published notice. Another open dialog postpones this attempt; the Gallery is never overlaid with a second modal. The scoped `:not([open])` rule explicitly removes the closed notice from layout.

Close, I Understand and Escape all dismiss it. Local storage contains only `nipsa.student-safety.dismissed-version = student-safety:2026-11-24.1`. Matching notice versions remain dismissed across reloads and visits. A materially revised version displays again. If storage is denied, a module-memory fallback prevents repeated interruptions during client navigation; a full reload may show it again. The permanent normal-flow “Student Safety Notice” button reopens it without changing eligibility. Reopening starts at the heading.

No student details, credentials, reporting evidence or legal consent are collected. No notice-specific requests, tracking events, cookies, external scripts or dependencies are introduced. Existing website analytics/Ads behavior is preserved.

## Accessibility

A native modal dialog provides top-layer presentation and background inertness. It has a labelled heading/description, initial heading focus, explicit Tab/Shift+Tab edge handling, Escape dismissal, focus restoration and document-scroll restoration. Header/close and footer actions stay visible while the content scrolls internally. Reduced motion is respected. Official external navigation uses `target="_blank" rel="noopener noreferrer"`.

The permanent entry is beside the existing homepage Tour introduction, in normal flow. No floating element or Gallery/Tour/Portal/navigation replacement is introduced.

## Maintenance and future Editorial integration

The typed source contains ID, title, intro/sections/closing, category, publication/updated dates, version, status, optional expiry and links. Only published, date-eligible, unexpired notices appear. Invalid dates fail closed. Update copy/dates and deliberately increment the version for a material revision. Keep the notice ID stable. Check wording and tests before publication.

This is a static content source. Future Editorial integration must authenticate editors, enforce publication permissions server-side, review policy changes, validate dates/URLs, escape text and audit author/version changes. No Editorial backend, browser-authorised publishing or reporting database is connected.

## Reproduction and review

```sh
npm run lint
npm test
npm run build
npx tsc --noEmit
npm run check:export
node scripts/website-tour/serve.mjs out 3420
TOUR_FONT_DIR=/path/to/approved-fonts TOUR_AXE_PATH=/path/to/axe.min.js \
  node scripts/student-safety/browser-smoke.mjs /path/to/captures
```

Playwright/Chromium and axe are external QA tools, not added application dependencies. Open `/` in a fresh browser context for automatic display, dismiss and reload for persistence, then reopen using Student Safety Notice. To simulate a new version, store an earlier value under the dismissal key; do not collect personal data. For storage denial use the provided isolated browser test.

Review assets and executed results are in `student-safety-review`. Chromium viewport emulation and automated accessibility checks do not establish physical-device or screen-reader certification. University-site inspection and live-production verification remain unavailable under this environment's network policy. Final publication requires owner approval and normal repository checks.
