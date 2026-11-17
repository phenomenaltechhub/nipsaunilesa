# PHARMAIDEIA M7 — actual controlled review evidence

Actual Chromium screenshots and original recording of the existing PWA connected to the native backend. Every populated view is an explicitly synthetic isolated fixture, not a university course, student, notice, question bank or examination result. No credentials, real identities, private keys or database dumps are included. These review files stay outside the public export/offline cache.

## Community: enabled group-chat preview

Start with the [enabled mobile chat](community/390-community-enabled.png), [enabled desktop chat](community/1440-community-enabled.png) and [actual mobile recording](community/m7-community-preview.mp4) ([captions](community/m7-community-preview.vtt), [transcript](community/m7-community-transcript.txt)). The recording finishes enabled. This is the real authenticated chat with temporary synthetic accounts and administrator-enabled posting, not a notification panel or a public service.

| Group-chat state | Desktop | Mobile |
| --- | --- | --- |
| Enabled, fixed header/composer and left/right bubbles | [1440px](community/1440-community-enabled.png) | [390px](community/390-community-enabled.png) |
| Quoted reply and persisted reaction | [1440px](community/1440-community-replies.png) | [390px](community/390-community-replies.png) |
| Dark theme | [1440px](community/1440-community-enabled-dark.png) | [390px](community/390-community-enabled-dark.png) |
| Restricted, readable history and disabled composer | [1440px](community/1440-community-restricted.png) | [390px](community/390-community-restricted.png) |

Additional [320px layout](community/320-community-enabled.png) and [shortened viewport](community/390-community-keyboard-resize.png) evidence accompanies 90-message pagination, keyboard, correction and reporting checks. Shortened-viewport emulation is not a physical-device keyboard test. [Detailed implementation/security/test evidence](../../docs/nipsa-platform/m7/COMMUNITY_UI_REVIEW.md). The backend's initial policy remains closed.

## Preserved M7 academic and examination preview

| Experience | Desktop | Android-sized viewport |
| --- | --- | --- |
| Light dashboard/accurate AI-composite attribution | [1440px](screenshots/1440-dashboard-light.png) | [390px](screenshots/390-dashboard-light.png) |
| Dark dashboard/contrast correction | [1440px](screenshots/1440-dashboard-dark.png) | [390px](screenshots/390-dashboard-dark.png) |
| Actual active CBT, two questions/saves/flags/server timer | [1440px](screenshots/1440-cbt-active.png) | [390px](screenshots/390-cbt-active.png) |
| Server-confirmed submitted attempt | [1440px](screenshots/1440-cbt-submitted.png) | [390px](screenshots/390-cbt-submitted.png) |
| Own administrator-released server-marked feedback | [1440px](screenshots/1440-cbt-results.png) | [390px](screenshots/390-cbt-results.png) |
| Searchable current Help; existing optional video retained | [1440px](screenshots/1440-help.png) | [390px](screenshots/390-help.png) |
| Actual administrative attempt monitoring/result review | [1440px](screenshots/1440-admin-attempts.png) | [390px](screenshots/390-admin-attempts.png) |

Additional mobile evidence: [reviewed course resource](screenshots/390-reviewed-resource.png), [cross-client Community synchronization](screenshots/390-community-synchronized.png), [targeted notification synchronization](screenshots/390-notifications-synchronized.png), [offline/expired-session private clearing](screenshots/390-expired-session.png).

Full-page images include the fixed mobile navigation at the capture viewport position; open/download the PNG directly on a smartphone. These are browser viewport tests, not physical Android device tests. No localhost URL is presented as public access.

## Actual walkthrough

- [Original mobile CBT MP4](media/m7-cbt-walkthrough.mp4)
- [Captions](media/m7-cbt-walkthrough.vtt)
- [Written transcript](media/m7-cbt-walkthrough-transcript.txt)

The silent recording shows actual selected entry, instructions, two synthetic questions, saved answers/flags, submission and administrator-released server feedback. One intentionally incorrect fixture answer produces the real 50% example result; it is not an invented student grade. Administrative review occurs through the real controlled API outside the student's recorded view. No login credentials or real records are recorded. This is review evidence, not a claim that the final complete-platform onboarding video is finished. The existing in-app M5 tutorial/captions/transcript remains unchanged and does not autoplay.

## Validation and scope

`accessibility.json` / `workflow-accessibility.json` record 18 M7 axe scans with zero detected violations. Four dashboard scans require image-background contrast assessment; `hero-contrast.json` measures 22 actual glyph/backdrop regions across both viewports/themes, all meeting their applicable thresholds. The updated cross-client chat scan separately retains one incomplete `.chat-text` contrast check (axe detects overlap); the ten focused chat scans have no incomplete checks. Independent acceptance remains required. This supplements visual review, not accessibility certification. `performance.json` records a local 50-request burst and explicitly rejects a production-capacity claim. `asset-integrity.json` records actual PNG dimensions/hashes.

Reproduce: `npm ci`, `npm run lint`, `npx tsc --noEmit`, `npm run check:pwa`, `npm test`, `npm run test:m7:browser`, `npm run test:m7:workflows`, `npm run review:m7:walkthrough`, both npm audits, `npm run build`, `npm run check:export` and the preserved regression commands in the report. Use existing Cloud Chromium/Playwright/FFmpeg tooling; no new application dependency is needed.

Community follow-up: `npm run test:m7:community` and `npm run review:m7:community`. Its ten additional axe scans are in `community/accessibility.json` (zero violations/incomplete checks). The original 18 M7 scans remain separately recorded. `community/FILES_CHANGED.txt` lists the follow-up rather than rewriting the original M7 inventory.

Full audit remains blocked by one unpatched high picomatch development-tool advisory (14 dependent-package entries); production npm dependencies audit clean. Real provider/host/email/scanner/push services remain unverified or unavailable. Full approved pre-launch completion and independent/device review remain mandatory; no real accounts, payments, main merge, deployment, DNS/hosting change or automatic M8 work occurred.

[M7 report](../../docs/nipsa-platform/MILESTONE_7.md) · [security register](../../docs/nipsa-platform/m7/SECURITY_REVIEW.md) · [remaining M8 requirements](../../docs/nipsa-platform/m7/PRE_LAUNCH_MATRIX.md) · [intended changed-file inventory](FILES_CHANGED.txt).
