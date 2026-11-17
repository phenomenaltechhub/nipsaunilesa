# M7 Community group-chat clarification

17 November 2026. Follow-up to the preserved M7 engine commit `8c479b86c52ba75147bf7c17a0add887af7d59cb`; M6 checkpoint remains `b2df50b77c78af3ba645697cdd9d47b3b6f0dfb8`. Work stays on `development/nipsa-student-platform`.

## Implemented and tested

The existing authenticated Community route now uses a full-height group-chat workspace. The group header, posting-policy explanation and composer stay visible while the conversation scrolls. Other members' messages align left; the signed-in user's messages align right. Bubbles contain verified sender identity, academic level/authorized positions, timestamps, quoted replies, mentions and reactions. Member/profile, reaction and message-action dialogs retain keyboard access. One general departmental group is preserved; no direct messaging or additional rooms are introduced.

The composer sends on Enter, inserts a line break on Shift+Enter and avoids submitting during IME composition. It retains the draft until a real server acknowledgement, preserves the retry request identity after failure and stores no private draft in persistent browser storage. Pagination preserves message order and reading position. Synchronization preserves the draft/scroll position and offers a go-to-latest control when the reader is above recent messages. The existing touch reply gesture remains available.

Restricted posting keeps the same chat layout and readable history. The composer, reply and reaction actions are disabled with an explanation. Reporting remains available. Administrators can reopen messaging without redeployment. These visual controls do not grant authority: unchanged native backend checks enforce active account/session/grants, closed/open policy, chat suspensions, ownership, edit window, rate limits, idempotency and moderation audit records on protected operations.

No backend default, authentication model, retention policy, database schema, public website, approved identity, deployment workflow or production configuration changed in this follow-up. The M7 engine, local study tools and five-destination mobile navigation remain intact. Logout/offline/expiry private-view clearing continues through the existing application lifecycle. New styles load only for the authenticated chat workspace.

## Review evidence: enabled first

- [Enabled mobile](../../../design-review/m7/community/390-community-enabled.png) and [desktop](../../../design-review/m7/community/1440-community-enabled.png).
- [Mobile replies/reactions](../../../design-review/m7/community/390-community-replies.png) and [desktop](../../../design-review/m7/community/1440-community-replies.png).
- [Restricted mobile](../../../design-review/m7/community/390-community-restricted.png) and [desktop](../../../design-review/m7/community/1440-community-restricted.png).
- [Actual mobile walkthrough](../../../design-review/m7/community/m7-community-preview.mp4), [captions](../../../design-review/m7/community/m7-community-preview.vtt) and [transcript](../../../design-review/m7/community/m7-community-transcript.txt).

An authenticated administrator opens messaging only in temporary isolated test databases. All displayed accounts/messages are explicitly synthetic. The recording ends enabled, while exercising restriction and reopening through the real backend. No real accounts or public messaging were activated. Screenshots/recordings are review artifacts outside the static export and service-worker cache, not publicly hosted services.

## Executed validation

`npm run test:m7:community` checks desktop 1440px and mobile 390px enabled/restricted layouts, ordered pagination through 90 messages, a long unbroken-string message, fixed-composer geometry, PageDown timeline navigation, keyboard send/newline, persisted reply/reaction, member/profile dialogs, Escape/focus return, owner correction, and reporting while closed with database-derived administrative receipt. A direct closed-state posting bypass returns 403. Additional 390×540 shortened-viewport and 320×740 checks confirm the composer stays above the approved Home/Courses/Community/Planner/More navigation without horizontal overflow. Ten axe scans detect zero violations and zero incomplete checks. Light/dark layouts are included.

`npm run test:m6:browser`, `npm run test:m7:workflows`, all 194 unit/backend/security cases, lint, website types, PWA checks, production build and static-export checks were rerun successfully after the chat replacement. The M7 workflows include actual cross-client Community synchronization and offline-expired-session clearing. `npm run review:m7:community` captures actual send/reply/reaction and administrative policy transitions using the existing Chromium/FFmpeg tools. No npm dependency was added.

These are automated Chromium tests and scoped visual inspection, not accessibility certification, physical Android/keyboard/screen-reader testing, production hosting validation or an independent penetration test. The previously executed complete M7 validation and its remaining gates remain recorded in [the milestone report](../MILESTONE_7.md). Full npm audit still reports the existing unpatched development-tool advisory; this follow-up changes no dependency versions. Production dependencies previously audited clean. External hosting/email/scanner/provider/push services and all unfinished approved M8 scope remain pre-launch requirements.

The separate cross-client workflow also reports zero violations but leaves one `.chat-text` contrast check incomplete: axe says its background cannot be determined because another element overlaps it. The exact node/diagnostic is retained in [workflow-accessibility.json](../../../design-review/m7/workflow-accessibility.json); it is not suppressed or counted as a successful contrast measurement. The captured message appears readable on its white bubble, and the ten focused chat scans have no incomplete checks. Independent contrast/screen-reader/device acceptance remains a pre-launch gate.
