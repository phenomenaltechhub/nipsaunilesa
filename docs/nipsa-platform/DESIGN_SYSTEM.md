# Academic design system and M2 component maintenance

Keep the original Book–Molecule Interlock identity, emerald/teal palette and NIPSA affiliation. M2 refines the existing shell; it does not restart the project or alter website branding. Editable masters and generated icons remain under `student-pwa/assets/brand/`.

## Shared components and navigation

- `styles/tokens.css`: shared typography, color, spacing, radii, shadows, focus treatment, content/sidebar widths and minimum 44px control height. Seven normal-text color combinations are checked for at least 4.5:1 contrast. Do not lower contrast for glass effects.
- `components/dom.js`: typed, textContent-based elements/icons/headings/empty states. Heading level is explicit where a standalone empty state needs an h2.
- `components/academic.js`: shared academic navigation, section headers, availability notices and keyboard-operable tabs. Arrow keys cycle tabs; Home/End choose the ends. Use stable accessible names and retain focus visibility.
- Main academic destinations: Overview, Courses, Timetable, Study planner and Glossary. Mobile bottom navigation prioritises Overview/Courses/Timetable/Planner; More retains Glossary, Notifications, Account and the unchanged closed community. A course-hub structure route highlights Courses as its parent.
- No academic-level selector pretends to grant access. Assigned level/session/student identity remain unavailable before real authentication. The public course explorer is clearly a structure without a selected course or published syllabus.

Use the same page heading, academic navigation, card spacing and availability language across course, timetable and study screens. Empty states explain the missing evidence/integration and offer only working actions. Do not add fake metrics, sample student profiles, official dates, course codes, assessments or decorative action buttons that imply a backend exists.

## Local tools versus academic records

Personal revision tasks are bounded to 30, plain-text length 1–120 and optional valid calendar dates between 2000 and 2200. They live in module memory for the current tab, survive route changes and clear on reload. They are never sent to a server, stored in browser storage or placed in Cache Storage. Show this lifetime explicitly, discourage sensitive data, and distinguish them from official assignments/deadlines. The dashboard summary derives from actual current-tab actions, not seeded progress.

The existing focus timer remains a real elapsed-time tool. It resets when leaving/reloading its view as disclosed. No push/background reminders or device permissions are requested. Timetable controls navigate real device-calendar dates and switch Week/Agenda layouts; an empty date cell means **not connected**, not proof that no class is scheduled. Institution-sourced events require later reviewed data and backend access enforcement.

## Curated avatar system

Twenty original SVG illustrations cover pharmacology, science, lab apparatus, books and diverse male/female clinician illustrations. No real faces, profile uploads, imported illustrations or implied verified professional identities. Individual masters are under `assets/avatars/`; the UI uses one atlas SVG request with generated CSS positions, so 20 choices do not cause 20 network requests. The alphabetic IDs map to the curated registry in `modules/account/avatars.js`.

Native radio inputs occupy each full visual choice, with visible parent focus and selected borders. Keep accessible labels as actual visible names. Category filtering does not fabricate records. The preview says that it is appearance only and not a signed-in identity.

Only the allowlisted avatar ID can be saved to `pharmaideia.avatar.v1`, after explicit opt-in. No role, level, username, task or credential belongs in that key. Invalid data is ignored; denied storage leaves the in-memory selection usable and clearly reports failure. Opt-out removes the preference where storage permits. This is not account/profile synchronisation.

Regenerate original assets with `npm run assets:pwa`. Keep deterministic source geometry editable and preserve brand masters. Review any future avatar changes for passive SVG content and accessible names.

## Performance, caching and review

`npm run check:pwa` enforces a 200,000-byte uncompressed public-shell budget and 80,000-byte JavaScript budget, validates icons and the 20 passive SVG choices. These are reproducible payload checks, not a measured low-end-phone speed score. No external fonts, analytics, UI frameworks or API polling are introduced. Lazy real academic material access requires future secure APIs; do not bundle private content for speed.

The explicit public cache advances from M1 version v1 to M2 v2. New modules, avatar CSS and the single public atlas are allowlisted; no private/API response or personal-plan state is cached. Bump the cache version whenever shipped public assets change and run the real update/offline suite. Keep axe, Playwright fixtures/recordings and test-only tools outside the shipped cache/export.

`npm run test:pwa:browser` captures actual desktop/mobile states and scans rendered academic screens with the pinned axe tool. It also tests keyboard tabs, plan lifecycle, safe text, avatar persistence and denied storage, date navigation, offline reload and explicit worker updates. Inspect screenshots manually. Automated scans and Chromium viewport sizes are not proof of full WCAG conformance, screen-reader usability, iOS installation or real-device performance; record remaining manual review honestly.

## M3 current interface corrections

The preceding M2 description is historical. Current student navigation uses **Dashboard**, Courses, Timetable, Study planner, Glossary, Announcements and Preferences. Course details replaces the Overview tab. Inactive account/community/management services are absent from student routes; curated appearance controls remain under Preferences. The original community source is retained for later secure integration.

Dashboard now prioritises course information, timetable/deadlines, actual personal study priorities and announcements. Its hero/shortcut-card row and repeated availability/development notices are removed. Use concise empty headings: “No courses available”, “No timetable entries”, “No announcements”, “No study materials added”. Empty calendar cells use a dash. These are absence-of-loaded-data states, not confirmation that an official schedule has no events. Technical limits belong in contracts/diagnostics, not every student card. Essential offline/update/input-error feedback and task/timer lifetimes remain visible.

The separate developer-only workbench and module-status page are under `developer-tools/`, outside the student cache/website export. See `DEVELOPER_DIAGNOSTICS.md` for the loopback server boundary and future authentication gate. The academic forms are session-only unreviewed metadata preparation, not operational representative management. No student-facing “developer mode” or role flag is an access control.

Cache v3 retains the explicit public-only policy and excludes developer views/inactive community. The same strict payload budgets, avatar preferences and original active branding remain. Three alternative Book–Molecule studies live only in `design-review/milestone-3/`; owner selection is pending. Editorial patterns are a read-only proposal pending original source and design approval, never an applied publishing-interface redesign.
