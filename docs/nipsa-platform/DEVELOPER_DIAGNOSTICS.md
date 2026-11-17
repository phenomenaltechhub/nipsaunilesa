# Developer diagnostics and clean student interface

The owner requested Dashboard naming, fewer development notices, realistic empty states and separate developer diagnostics. The student app now shows academic content areas and working personal tools. It contains no diagnostic destination or browser role/developer switch. Community and CBT have discoverable restricted/empty views. Live payments and public accounts remain disabled. M5 adds a separate loopback-only synthetic account/admin service; its server-enforced behavior is tested, but no public backend is active.

Diagnostics live under `developer-tools/`, outside the PWA and Next.js export. `npm run preview:developer` explicitly starts a **loopback-only** server on port 4174, with allowed file prefixes limited to tooling and the reusable public source/styles/assets it needs. Other repository paths/dot files return 403. No service worker is registered by tooling, and its forms/data are absent from the student public precache. `npm run check:pwa` enforces this export/cache exclusion. No externally accessible diagnostics host is provisioned.

This is a distribution and server file boundary, not a client-side access control. The public repository's non-sensitive source/status records are naturally readable on GitHub. Do not put secrets or protected logs in this directory. If externally hosted or forwarded later, require real server authentication/authorization before exposure; a hidden URL or JS flag would be insufficient. The project owner can review screenshots from the cloud without PC setup.

## Recorded modules

`developer-tools/modules.js` provides stable IDs and recorded implementation statuses. These are not live health probes or fabricated operational statistics:

- `UI-DASH-001`: Dashboard/navigation implementation.
- `ACA-001`, `ACA-002`, `ACA-003`: course metadata, resources and schedule/deadline validation, tested locally; official content/APIs pending.
- `FILE-001`: descriptor-only validation; actual secure uploads pending.
- `AUTH-001`, `RBAC-001`: real controlled backend authentication, MFA, sessions, role/level enforcement and audit tested; production host/email/HTTPS and full module integration pending.
- `PAY-001`: approval-required payment integration; no live verification.
- `EDT-001`: editorial source dependency.
- `MSG-001`: messaging infrastructure dependency.
- `PWA-001`: public cache/update implementation; physical-device review pending.

The content workbench reuses the actual academic models, form components and course hub. Only local metadata is accepted; it is never a management permission, publication or persisted academic database. It remains available for independent development and testing while the student-facing app has clean empty states. Preparation records clear on reload. The diagnostic page exposes no real accounts, logs, private data, credentials or payment records.

## UI copy and hierarchy

Top-level Overview is renamed **Dashboard**; the course tab is **Course details**. Dashboard prioritises courses, timetable/deadlines, actual personal study priorities and announcements. M5 adds the requested short academic photographic hero with original actions and explicit fictional-student attribution. Redundant shortcut rows and repeated infrastructure warnings remain removed. Student views use “No courses available”, “No timetable entries”, “No announcements” and “No study materials added”. No missing entries are replaced with fabricated data.

Essential interaction feedback remains: offline status, update choice, valid input errors and the lifetime of in-memory personal tasks/timer. Preference-save failures remain actionable. Technical limitations, API contracts and developer statuses are kept in documentation/tooling. Clean copy is not a claim that backend services exist; public services remain inactive. See [M5 architecture](m5/ARCHITECTURE.md) for the actual controlled backend and its enforced activation boundary.
