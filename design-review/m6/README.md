# PHARMAIDEIA M6 review evidence

Actual Chromium captures of the existing PWA connected to the controlled native backend. **All populated records are synthetic isolated test fixtures, not university courses, notices, students or examinations.** No credentials, real identities, database snapshots or private production records are included. These files are outside the Next.js export and PWA cache.

Open or download the PNGs directly from GitHub on a smartphone. Long images are full-page captures; the fixed mobile navigation appears at the viewport position where the capture was taken. No localhost address is a public preview.

| Experience | Desktop | Smartphone |
| --- | --- | --- |
| Dashboard and illustrative hero | [1440px](screenshots/1440-dashboard.png) | [390px](screenshots/390-dashboard.png) |
| Searchable course catalogue | [1440px](screenshots/1440-courses.png) | [390px](screenshots/390-courses.png) |
| Saved course progress and labelled tabs | [1440px](screenshots/1440-course-progress.png) | [390px](screenshots/390-course-progress.png) |
| Targeted notifications | [1440px](screenshots/1440-notifications.png) | [390px](screenshots/390-notifications.png) |
| Closed community | [1440px](screenshots/1440-community-closed.png) | [390px](screenshots/390-community-closed.png) |
| Open community with actual persisted test messages | [1440px](screenshots/1440-community-open.png) | [390px](screenshots/390-community-open.png) |
| Closed CBT intake | [1440px](screenshots/1440-cbt-closed.png) | [390px](screenshots/390-cbt-closed.png) |
| Searchable M6 Help; existing optional video retained | [1440px](screenshots/1440-help.png) | [390px](screenshots/390-help.png) |
| Administrator selected-batch monitoring | [1440px](screenshots/1440-cbt-administration.png) | [390px](screenshots/390-cbt-administration.png) |
| Own assigned CBT schedule; delivery explicitly unavailable | [1440px](screenshots/1440-cbt-assigned.png) | [390px](screenshots/390-cbt-assigned.png) |

Additional actual workflow views: [independent course review](screenshots/1440-academic-review.png), [initial CBT request](screenshots/1440-cbt-request.png).

The monitoring test makes one explicitly test-only database interruption projection to prove refreshed administrative status. It does **not** perform or pretend to perform student examination delivery/submission. No unreviewed question or answer-key image is included as public academic content.

## Validation and limits

- `accessibility.json` and `workflow-accessibility.json`: 22 M6 axe snapshots, zero detected violations. Two dashboard scans require manual contrast review; course-progress scans have no incomplete items after the tab fix. This is not accessibility certification or physical-device evidence.
- The mobile course tabs wrap, all seven labels are checked for clipping, selected light/dark contrast is asserted, and Arrow/Home/End switching is exercised. Personal planner/offline and existing website regressions remain tested.
- The hero is an illustrative composite depicting fictional students; no real institutional photo-session claim is made. Approved Knowledge Nexus — Classic Standard vector/logo/icons remain unchanged.
- Full dependency audit is **not clean**: one unpatched high picomatch development-tool advisory appears as 14 high dependency entries. Production npm audit is clean; no audit suppression or deployment is performed.
- Complete actual results, security findings, remaining M7/M8 requirements and file changes: [M6 report](../../docs/nipsa-platform/MILESTONE_6.md), [security review](../../docs/nipsa-platform/m6/SECURITY_REVIEW.md), [pre-launch matrix](../../docs/nipsa-platform/m6/PRE_LAUNCH_MATRIX.md), [file inventory](FILES_CHANGED.txt).

Reproduce with `npm ci`, `npm run lint`, `npx tsc --noEmit`, `npm run check:pwa`, `npm test`, both npm audits, `npm run build`, `npm run check:export`, `npm run test:m6:browser`, `npm run test:m6:workflows` and the regression commands in the report. Browser scripts need the existing Cloud Chromium/Playwright tooling; run in the controlled environment. Test fixtures are temporary and never used by operational startup.

The optional [existing 45.5-second personal-tools video](../../student-pwa/media/study-tools.mp4), captions, transcript and poster are retained. It does not claim to demonstrate incomplete examination delivery or the final whole platform.

No main change, merge, deployment, real account, live payment, DNS/hosting modification or M7 implementation is part of this review increment.
