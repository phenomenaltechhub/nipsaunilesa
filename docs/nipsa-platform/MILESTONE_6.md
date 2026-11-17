# M6 — Academic operations, community, notifications and CBT workflows

Review date: 17 November 2026. Branch: `development/nipsa-student-platform`.
Verified starting commit: `880f0024eefcf2beff7729dc355013ed5730ee0d`; clean working tree, existing branch and remote inspected before edits. `main` started at `92d890a39d9ac056d81e758ebeafb9b96ed781e0` and is not changed by this work. The implementation document, Issue #3, M5 report/matrix and security/architecture documentation were reviewed. No applicable AGENTS.md was found. No new repository, branch or environment was created.

**M6 implements real controlled backend workflows and connects them to the existing PWA. It does not complete the PWA or authorize public operation.** The native Node 24/SQLite service remains loopback-only, synthetic-only and production-disabled. Smartweb compatibility, real email, real accounts, payments and production deployment remain unverified/inactive.

## Implemented and tested

| Area | Actual behavior and integration |
| --- | --- |
| Academic operations | Migration 004 extends the existing database. Courses have level/session/semester context, validated topics/subtopics/resources/syllabus, draft submission, independent reviewer publication, correction history and withdrawal. Students receive published snapshots only; editing a correction does not expose its draft. Author and last editor cannot approve their own changes. Admin can select a course roster; current course/level access is checked on every protected operation. Context-complete M5 drafts migrate without being published; the old draft API delegates to the same course implementation. |
| Course progress | Existing M4 coverage/confidence/revision/difficulty/priority controls and calculations are reused with real per-account SQLite persistence and optimistic version checks. Courses and overall dashboard show self-reported coverage and revision priorities; this is not an academic mastery claim. Local personal outlines/planner/focus remain independent. |
| Notifications | Actual composition, department/level/course audiences, CR boundaries, scheduling on feed access, verified sender/publisher attribution, correction/withdrawal/history, read receipts and preferences. Revoked publishers cannot activate scheduled notices. CBT invitations target explicitly assigned students; submissions do not create completion notices. |
| General community | One departmental space, closed by default, visible in navigation. Real persisted messages, ordered pagination, replay-safe posting, quoted replies, swipe-to-reply, mentions, reactions, member/profile dialogs, owner corrections/removal, reports and administrative moderation. Existing backend open/close and chat-only suspensions govern writes. Reporting/moderation and permitted read-only history remain available while closed. No direct messages or level rooms are introduced. |
| CBT applications | Closed-by-default intake; own stage-one requests; administrator decisions with reasons/history; stage two only after initial approval; downloadable JSON template, structured form and bounded private JSON-document submission; clarification/revision/reopen/rejection/closure/withdrawal. Applications and candidate question content are encrypted in the existing private database. A request never creates an examination automatically. |
| CBT planning | Administrator question authorization, examination plans, reviewed blueprints, dates/durations/attempt policy, explicitly selected students, capacity/slot checks, fixed batches, scheduling/rescheduling/cancellation and invitations. Own assignment isolation and server-derived administrative monitoring are implemented. Started/submitted state cannot be reset through planning. Visible monitor refreshes every 20 seconds; no hidden-tab polling. |
| CBT analysis/integrity foundation | Trusted-engine score/topic/category/unanswered/time/revision projection and strictly filtered result output; admin publication and own result/history interfaces. Configurable two/three visibility warnings, disconnection separation and no automatic penalty. These models are tested with isolated engine-output fixtures; **no operational attempt, question delivery, autosave, marking run or student examination submission exists in M6**. |
| PWA/admin integration | Authenticated online modules mount inside the existing routes and use the same session/CSRF module. Existing admin account/MFA/roles/audit UI gains academic, announcement, moderation and CBT sections. Private views are cleared on hidden/offline/account changes; private responses/modules are excluded from the service-worker cache and static export. |
| Help/identity | Searchable actual M6 student/representative/admin guidance extends existing Help. Optional M5 video, captions, transcript and no-autoplay behavior remain. Approved Classic Standard logo/icons, emerald/teal, sidebar, light/dark themes and five mobile destinations are preserved. Hero attribution now says “Illustrative composite · fictional students”. |

The community is a functioning controlled HTTP/database implementation, not a fake closed screen. Cross-client real-time delivery, production transport, load/abuse operations and full community acceptance remain M7/M8 gates. Academic timetables/deadlines, reviewed glossary content, protected binary materials and other approved outstanding functions remain explicitly assigned in the [pre-launch matrix](m6/PRE_LAUNCH_MATRIX.md). No institutional content or student records are invented.

## Security review and corrections

Every new protected route uses the same current session/account/grant checks and existing CSRF, Origin/Host, body bounds, rate controls, private errors and no-store response policy. Writes use existing transactions/audits and compare revisions where concurrent edits matter. Failed audit writes roll back state. Untrusted text is inserted as DOM text; resources use the existing URL/category validators. Application upload is authenticated, stage-bound, JSON-only, strictly schema-validated and encrypted; it is not a general file-upload service.

Focused tests cover cross-level notifications/course access, CR escalation, self-approval/last-editor approval, stale revisions/replay, closed/suspended community writes, moderation ownership, two-stage CBT access, malicious documents, exact batch identities, slot conflicts, assignment/result isolation, question protection, session/role revocation and atomic rollback. Existing M5 password restrictions remain 5/15/30/60 minutes/24 hours after failures 3–7. Blocked guesses do not extend deadlines or revoke valid sessions; verified-owner recovery remains a separate lane. This mitigates targeted lockout abuse but does not establish production DoS resilience.

Integration testing found and fixed an admin CSRF-module alias mismatch: admin now imports the canonical `/access/api.mjs`, sharing the actual token state with embedded operations. No CSRF check was removed. Visual review found and fixed a selected-course-tab contrast conflict; computed light/dark contrast assertions were added. Mobile course tabs now wrap so all seven labels fit without a clipped horizontal strip; Arrow/Home/End behavior is exercised. Results use an explicit output schema so arbitrary engine fields/answer keys cannot leak into student analytics. See [security review](m6/SECURITY_REVIEW.md) and [threat model](m6/THREAT_MODEL.md).

## Actual validation results

Baseline before edits: lint, strict public PWA checks and **155 tests passed**. Final checks below were actually run; successful checks do not override the audit blocker.

| Command/check | Result |
| --- | --- |
| `npm ci` | Passed; 375 packages installed. Existing ESLint 9 deprecation warning recorded. |
| `npm run lint` | Passed, no warnings/errors; backend `no-undef` checks enabled. |
| `npx tsc --noEmit` | Passed website type check. |
| `npm run check:pwa` | Passed strict public PWA/service-worker/developer JS checks and integrity/budgets. New backend/online `.mjs` modules are linted and runtime-tested, not represented as strictly TypeScript-checked. |
| `npm test` | **178 passed, 0 failed:** 122 public/academic/security cases, 33 preserved M5 backend cases, 23 M6 backend cases. Real HTTP/database tests use temporary synthetic accounts, not production. |
| `npm audit --json` | **Failed: 14 high dependency entries, one underlying picomatch advisory. No patched release published at verification.** See below. |
| `npm audit --omit=dev --json` | Passed: zero production dependency advisories. Does not cover Node/SQLite/OS/cloud tools. |
| `npm run build` / `npm run check:export` | Passed; 35 HTML documents, 72 local assets, 65 valid JSON-LD blocks, no missing internal references. Backend/PWA private data absent from public export. |
| `npm run test:m6:browser` | Passed Chromium 1440px/390px: real sign-in, course search/keyboard tabs/persisted progress, notice receipts/preferences, community closed/open/reply/reaction, closed CBT, searchable Help/video, offline private-state clearing and preserved personal planner. Selected tab contrast checked in light/dark. |
| `npm run test:m6:workflows` | Passed real UI CR submission → independent course approval; CBT stage one → initial approval → template/form → application/question approval → plan → explicit selected batch → schedule → own assignment; desktop/mobile monitor. One test-only database interruption projection verifies monitor refresh; it is not a delivered examination or a simulated successful submission. |
| `npm run test:pwa:browser` | Passed 1440/390/320/768px navigation/tabs/tools/storage-denied/offline/cache/update regressions. |
| `npm run test:m4:browser` | Passed desktop/mobile progress/search/dark/large-text/privacy/notification harness; icon/manifest eligibility inspected. No physical-device installation claimed. |
| `npm run test:m5:accounts:browser` | Passed desktop/mobile sign-in/MFA/roles/admin DB writes/community policy/audit/logout. |
| `npm run test:website:browser` | Passed desktop/mobile home, Portal, resources, Ads, gallery, Navigator. Four portrait gallery downloads decoded as valid watermarked JPEGs; original bytes/top content preserved. Existing Canvas helper unchanged. |
| `npm run test:developer:browser` | Passed desktop/mobile workbench, server file boundaries and automated accessibility checks. |
| `npm run check:brand` / `npm run check:m5:assets` | Passed seven approved Standard sizes/maskable bounds and eight responsive hero files; existing 45.5s/344,483-byte captioned video/poster/transcript valid. |
| `npm run check:secrets` / `git diff --check` | Passed heuristic credential scan and whitespace check. No actual student records, keys, database snapshots or credentials are included in review assets. |
| Automated accessibility | 22 M6 snapshots across both suites: zero detected axe violations. Two dashboard scans contain `color-contrast` items requiring manual review. Targeted tab contrast is additionally asserted; progress scans have no incomplete items after the fix. This is not accessibility certification; physical Android/iOS, screen-reader and independent keyboard/contrast acceptance remain required. |

Full audit: [GHSA-fc5q-39xc-vjpf](https://github.com/advisories/GHSA-fc5q-39xc-vjpf), high ReDoS in repeated extglob parsing, affected picomatch `<=4.0.7`, advisory lists **no patched version**. Installed `2.3.2` and `4.0.7` occur only under development dependency `eslint-config-next@16.4.6`; its dependent packages account for the 14 entries. Registry latest was `4.0.7`. No unsafe major override, mismatched Next ESLint downgrade, audit suppression or security-workflow bypass is applied. Untrusted glob patterns must not be executed in this tooling. Track a real upstream fix and rerun audit before release; the existing Pages workflow's full audit remains a release blocker. Review-branch publication is not production approval.

## Performance and review evidence

Public offline shell: 46 allowlisted assets, **199,997 source bytes / 79,976 JavaScript bytes**. Authenticated online operations add approximately 76 KB of uncompressed UI source, plus the small bootstrap; these modules are outside the public offline budget and load only with a controlled authenticated session. No new npm dependencies or third-party application requests are added. These byte counts and Chromium layout checks are not a load test or mobile performance score. Capacity for approximately 887 students remains unverified.

See [downloadable review inventory](../../design-review/m6/README.md) for actual desktop/mobile PNGs and axe evidence. Every populated screenshot uses clearly labelled synthetic test records. The video remains [the existing personal-tools walkthrough](../../student-pwa/media/study-tools.mp4); a final full-platform recording belongs to M8 after all workflows work. No localhost link is presented as public access.

## Files, dependencies and next tasks

- Backend: `backend/migrations/004_operations.sql`, `backend/src/operations/*`, existing HTTP/service integration, M6 fixtures/tests.
- Connected UI: `backend/ui/bridge.mjs`, `backend/ui/operations/*`, canonical API/admin integration and responsive styles.
- Public changes: hero attribution/provenance/generator wording and cache version only. Main Next.js logo, gallery code, production workflow, deployment/DNS and package-lock remain unchanged.
- Quality/review: targeted ESLint configuration, two M6 browser scripts/package commands, developer module statuses, M6 docs and review assets. Full intended inventory is in `design-review/m6/FILES_CHANGED.txt`.

No external component/library/code was adopted. Existing native browser/Node APIs, original components, Sharp, Playwright/Chromium and axe are reused under the recorded [third-party policy](THIRD_PARTY.md). Editorial source was searched for and remains absent; no existing prototype is replaced and no public publishing connection is claimed.

**M7:** finish all outstanding academic/content/upload/synchronization operations, secure real-time community delivery, complete server-controlled CBT engine and private analytics, activation batches/approved eligibility and operational integrations. [Engine requirements](m6/M7_ENGINE_REQUIREMENTS.md) and [API/permission map](m6/API_AND_PERMISSIONS.md) define the exact current boundary.

**M8:** finish every matrix row, independent security/content/accessibility review, real-device/load/recovery/retention acceptance, dependency remediation and owner review. Required external decisions: approved host/runtime/HTTPS/email/storage/backups; owned editorial source; reviewed institutional/academic content and rights; retention/legal ownership; provider/merchant permissions where relevant. No paid service or real-account activation is inferred.

Commit/push verification is reported with the final Git SHA after the review commit; this document does not contain a self-referential commit hash. All M6 work stays on the existing development branch. No main merge, production deployment, hosting or DNS change is performed.
