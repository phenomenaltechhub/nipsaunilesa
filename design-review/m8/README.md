# PHARMAIDEIA M8 Community review

Actual authenticated application screenshots and a Chromium recording, using isolated **synthetic** accounts/messages. The primary preview is **enabled**. Production and the initial default-closed backend policy are unchanged. No localhost link is public access.

- [Enabled mobile, 390px](screenshots/390-community-final.png)
- [Enabled desktop, 1440px](screenshots/1440-community-final.png)
- [Website-content picker, mobile](screenshots/390-website-picker.png) / [desktop](screenshots/1440-website-picker.png)
- [Automatic draft preview](screenshots/390-website-automatic-preview.png) / [dark appearance](screenshots/390-website-dark.png)
- [Group information, mobile](screenshots/390-group-info.png) / [desktop](screenshots/1440-group-info.png)
- [Touch context menu](screenshots/390-touch-context.png), [real read-by IDs](screenshots/390-read-by.png), [typing](screenshots/390-typing.png), [image](screenshots/390-image.png)
- [Restricted footer](screenshots/390-locked.png), [claimed private assistance](screenshots/390-support-reply.png)
- [Private consent request](screenshots/390-private-request.png), [accepted conversation](screenshots/390-private-accepted.png), [expired](screenshots/390-private-expired.png)
- [Authorized announcement reference](screenshots/390-website-notification.png)
- [Mobile walkthrough MP4](media/m8-community-walkthrough.mp4), [captions](media/m8-community-walkthrough.vtt), [written transcript](media/m8-community-transcript.txt)
- [Local review gallery/player](index.html): download/unzip the review archive to keep relative images/captions together. Never treat it as a deployed application.

The 25-entry catalogue uses actual exported public website metadata. Departmental Orientation is an existing website title; its unspecified details remain unspecified. No Pharmly/Pharmily Hangout page or campus coordinates were invented. Catalogue refresh was tested through controlled HTTP and real browser version changes; the production feed remains undeployed/proxy-blocked.

## Visual comparison and observations

The supplied visual reference was inspected in image tooling, then compared to actual application screens throughout implementation. It guides emerald navigation, white header, warm neutral timeline, mint outgoing bubbles, compact sender/level lines and docked composer. Its sample identities/announcements were not copied. PHARMAIDEIA retains its approved Classic Standard identity and existing academic navigation; this is an original native implementation, not WhatsApp branding or copied UI code.

| Area | Verified M7 baseline | M8 actual outcome |
| --- | --- | --- |
| [390px before](baseline/390-baseline.png) / [after](screenshots/390-community-final.png) | Existing full-height messages, visible action links and Enter-to-send | Compact bubbles, contextual touch/keyboard actions, button-only send, plus attachment/website picker and preserved five-destination navigation |
| [1440px before](baseline/1440-baseline.png) / [after](screenshots/1440-community-final.png) | Existing academic sidebar and conversation | Same app identity/sidebar; chat-specific white header, 920px history measure, 74% bubble cap and permanently docked composer |
| Group info | Separate directory dialog | Title opens role-ordered right sheet; actual people and separate official Admin projection, no invented President |
| Context tools | Persistent controls near messages | Hidden normal state, single subtle hover trigger, touch long-press / Shift+F10 actions, no clipped stacked trays |
| Mobile constraints | Basic responsive chat | 360/390/768/1440 checks, additional 320px and 390x540 keyboard-resize emulation, bounded composer extras, no horizontal overflow |

These are human visual observations and automated geometry/screenshot evidence, not physical Android or screen-reader certification. [Layout metrics](evidence/layout-metrics.json), [performance](evidence/performance.json), [Community scans](evidence/accessibility.json) and [reference scans](evidence/website-references-axe.json) record actual results. Forty-two scoped M8 axe scans reported zero violations/incomplete checks. Other historical project scans retain their own scope/limitations.

## Reproduce

Use the existing Node 24 environment with installed Chromium/Playwright (observed cloud Playwright 1.62.1). Browser scripts start real private temporary services and remove synthetic databases afterward. They do not create a public server or real account.

```sh
npm ci
npm run lint
npx tsc --noEmit
npm test
npm run check:pwa
npm run test:m8:browser
npm run test:m8:interactions
npm run test:m8:private
npm run test:m8:references
npm run test:m8:performance
npm run test:m8:visual
npm run test:m7:browser
npm run test:m7:workflows
npm run test:m6:browser
npm run test:m6:workflows
npm run build
npm run check:export
npm run test:website:browser
npm run check:secrets
npm audit --omit=dev
npm audit
npm run review:m8:community
```

The full audit currently exits nonzero for one known unpatched picomatch advisory across 14 development-tool dependency entries. Do not suppress it or claim it passed. `npm audit --omit=dev` reports zero. No npm package/version/lockfile change was made.

`npm run test:m8:visual` replays 16 baselines using `expect(page).toHaveScreenshot()`. Regeneration is a separate intentional command, `npm run test:m8:visual -- --update-snapshots`, followed by human inspection and a normal replay. Timestamp masking/reduced motion and fixed .003/.15 tolerances are documented in the test; never update snapshots merely to hide a regression. The M8 browser suite also backs the preserved `test:m7:community` entry point with stronger four-width interaction coverage.

[Milestone report](../../docs/nipsa-platform/MILESTONE_8.md), [security register](../../docs/nipsa-platform/m8/SECURITY_REVIEW.md), [API/privacy/maintenance](../../docs/nipsa-platform/m8/API_PRIVACY_AND_OPERATIONS.md), [remaining pre-launch matrix](../../docs/nipsa-platform/m8/PRE_LAUNCH_MATRIX.md), [changed files](FILES_CHANGED.txt) and [prepared PR text](PULL_REQUEST.md) accompany the review.

GitHub publication is blocked by an invalid managed credential/API access. The review branch/commit is local until authorized access is restored; no remote branch or PR success is implied. The downloadable review archive contains a Git bundle/binary patch and final commit verification. Target the existing **development/nipsa-student-platform** branch for a future PR, never main or production.
