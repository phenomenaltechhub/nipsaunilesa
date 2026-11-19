# PHARMAIDEIA — M9 implementation and review report

19 November 2026. **Local implementation and controlled integration are verified; public launch and an online multi-user trial are not authorized or ready.** No real student, live payment, paid service, DNS change, main merge or production deployment occurred. This report incorporates both owner M9 documents without removing earlier launch requirements.

## Checkpoints and preservation

- Verified starting commit: `576bed7c35a9e7c951797065ffe0431b92334dbb`, clean `feature/pharmaideia-m8-community`.
- Authorized isolated working branch: `feature/pharmaideia-m9-integration`.
- Implemented-code endpoint: **`c200ba67667d5ccc5c9bf73e6b8ee28cb1dd11cc`** (initial M9 implementation `94e1c1f` plus separately tested administrator cohort-size fix). The subsequent report/evidence commit adds no application behavior; its exact final SHA is in the delivery receipt and final response.
- M6 `b2df50b77c78af3ba645697cdd9d47b3b6f0dfb8`, M7 engine `8c479b86c52ba75147bf7c17a0add887af7d59cb`, M7 Community `aacd56bebb83377b9b715dee2d299b2f13909710`, M8 `8000069fcdd6296aa64bf68c1646d6f33cea577e` and the reviewed M8 follow-up remain ancestors. No reset, rebase, force push or history rewrite.
- **124/124 previously protected source hashes remain unchanged**, including the engine/brand/public shell/gallery/deployment protections. Account/operation adapters are intentionally extended with additive migrations 008–010; migrations 001–007 remain unchanged.
- Fetched `origin/main` remains `92d890a39d9ac056d81e758ebeafb9b96ed781e0`; development remains `aacd56bebb83377b9b715dee2d299b2f13909710`. The M8 review work is still an unmerged dependency of this branch. A PR against development therefore includes the preserved M8 work until separately integrated; it is not an M9-only diff from current development.

## Actual implementation

| Function | Delivered and controlled evidence | Boundary |
| --- | --- | --- |
| Durable public references | Existing SQLite representation/version/ETag/Last-Modified/revision/withdrawal/history; restart, corruption, rollback, matching 304, audit rollback, bounds, offline and backup tests; UI distinguishes current/cached/unverified/withdrawn/unknown/unreachable | Actual public feed request blocked by CONNECT proxy 403; no producer/publication change |
| Course timetable/assignments/deadlines | Real course-bound representative/admin management, current level/selected-course access, date/overlap checks, corrections/withdrawals/history/audit; week/agenda, course Schedule and private escaped/folded ICS export | Real schedules/official sources must be supplied and reviewed |
| Reviewed study aids/glossary | Independent draft/submission/review/publication/correction/withdrawal; flashcard reveal, server-checked practice, current-access bookmarks/history, searchable glossary/mechanisms/applications/references/related terms | No medical definitions/questions or course information invented. Actual content/licensing/reviewer acceptance external |
| Daily learning | Stable UTC term identity; reviewed corrections update its definition; withdrawal hides it without substitution | No default fabricated term; academic review required |
| Personal/account study state | Original local planner/focus preserved offline. Explicit separate account-plan view reuses components; encrypted own persistence, tab-memory drafts, version-conflict protection, reload/save and session disposal. Topic/resource/study-aid bookmarks and recent aids integrate with Courses | Account plans are not copied into offline public assets/storage. Device/account UX and physical interruption acceptance open |
| Account preferences/batches | Existing 20 avatar IDs/theme with optimistic versions and in-memory theme application; selected eligible pending registration picker, actual 500-record synthetic roster verification with a bounded 64 KiB/fresh-MFA/rate-limited POST, closed-by-default batches, windows, policy/audit and eligibility at proof issuance AND completion | Existing authentication/MFA retained, not reimplemented. No real roster, mail, account activation or payment verification claimed |
| Support operations | Constrained fresh-MFA support role, claim-before-read and own-assignment replies; no moderation/admin/CBT powers. Administrator hand-over, stale/former-assignee denial, role revocation and paginated inbox; actual browser claim/reply/transfer and batch-selection checks | Staffing, real appointments, response/retention/privacy policy and independent operational review required |
| Disposable trial tooling | Random private role credentials, reserved-domain labels/banner, expiry/revocation, exclusive private directory and explicit safe cleanup; refuses source/public directories, symlinks, unrelated files and mixed databases | Loopback/test-only. No externally accessible trial, real email, student database or provider activation |
| Community/CBT/notices/resources | M7/M8 persisted engine, selected batches/timer/scoring/results, adaptive message/notice synchronization, 30-minute editing, replies/reactions/mentions/images/receipts, support/consent and protected resources retained | Existing test transports are not production integrations; no duplicate engine/editorial console |
| Recovery/startup | Expired temporary messages cleaned before restored listener opens; real lost-ACK/restart/idempotency/audit-failure tests; group history remains intact | Complete trusted deletion/revocation/hold replay from stale production backups is still an open launch gate |
| Startup cost | Lazy active-workspace imports and static-only gzip; private JSON and HTML remain uncompressed/no-store | Host capacity and actual Android performance remain unverified |

Normal student layouts retain the approved Classic Standard identity, emerald/teal themes, desktop Dashboard, mobile Home/Courses/Community/Planner/More and truthful empty states. No real academic data or production records enter static exports. The hero remains accurately labelled an AI-generated illustrative composite. Existing gallery download-time watermarking and original images are unchanged.

## Actual validation

Baseline: **220 passed, 0 failed/skipped**. Final complete unit/security run: **240 passed, 0 failed/skipped**, including 20 new M9 cases. Additional focused M9 and trial retests cover the final corrections/cleanup/eligibility guards; they are not added again to the unique 240-test count.

| Check | Actual result |
| --- | --- |
| Clean dependency install | Passed; 375 packages; no dependency/lockfile change |
| Lint | Passed, no warnings/errors in final lint |
| PWA/developer/SW type checks and Next.js type checks | Passed |
| Full and production `npm audit` | Both **0 advisories**. Withdrawn picomatch advisory not suppressed. ESLint 9 maintenance deprecation recorded, not treated as a fabricated security advisory |
| Secret scan | Passed heuristic scan plus review of new runtime/seed boundaries; no actual credential/private record committed. This is not a certification of all historical data |
| Production build/static export | Passed: **35 HTML documents, 72 local assets, 65 valid JSON-LD blocks**, no missing local references |
| Public PWA budget/brand/media | Passed: **46 public assets, 199,959 bytes total, 79,967 bytes JS**, unchanged 200 KB/80 KB ceilings; 20 curated avatars, icon sizes, contrast pairs, approved brand and video assets |
| Existing browser regressions | PWA offline/SW, M4, M5 visuals/accounts, website/gallery, M6 browser/workflows, M7 browser/workflows/Community, M8 browser/interactions/private lifecycle/references/review all passed |
| Existing screenshot comparisons | **16 comparisons passed** in four Playwright tests; baselines not rewritten |
| New M9 browsers | Actual course tab/keyboard switching, study-aid reveal/bookmark, calendar browsing/export/management, account planner navigation/save/reload, enabled/restricted Community, support claim/reply/transfer, eligible batch selection and Help passed |
| Responsive/accessibility | 320/360/390/768/1440px, light/dark, short-height and landscape checks. **43 scoped axe scans, 0 reported violations; two contrast items incomplete**. Separate actual rendered-color follow-up found ratios **6.02–12.66**, but axe retained the same incomplete classification; no accessibility certification claimed |
| Physical Android/installed PWA/TalkBack | **Not run**: no attached physical device/tester. Chromium service-worker/offline and keyboard-height emulation are separate partial evidence |
| Production/third-party integrations/independent assessment | **Not run/blocked**, not passed. No active attack or load scan against production/third parties |

The broad runner initially found an M6 offline-planner regression. The original personal planner was restored as the default and both desktop/mobile M6 tests passed on retest. New-code nested transaction/calendar selector defects and a planner control-style conflict were caught and corrected with API/browser/visual evidence. A frozen test clock exhausted a real rate limit after five viewport personas; the fixture now advances legitimate test windows without disabling server limits. A hidden closed-dialog selector was scoped correctly. Initial and effective outcomes remain in the validation manifest rather than claiming every initial attempt passed.

## Measured performance

Measurements were captured at implementation `94e1c1f`; the later `c200ba6` follow-up changes only administrator activation POST limits, not the measured Community assets or GET/startup path. The preserved M8 `readyMs` starts before navigation and ends after network-idle plus visible composer; it excludes synthetic setup/login and includes a 500ms idle threshold. Three serial before/after trials use 390×844 Chromium, 4× CPU, 180ms latency, 50,000 B/s down/25,000 B/s up and 360 persisted synthetic messages.

| Metric | Before | After |
| --- | --- | --- |
| Ready trials, ms | 11,322 / 11,277 / 11,560 | 7,023 / 7,214 / 7,002 |
| Median | **11,322 ms** | **7,023 ms — 38.0% lower** |
| History | 360 persisted; 300 maximum DOM; latest 30 | Same; no history discarded |
| Used JS heap after cleanup | 2.869–2.872 MB | 2.865–2.868 MB; no capacity/leak certification implied |

Separate **after-only** 90-message profile at the same CPU/network settings: usable input/visible conversation **5,854ms**, FCP **900ms**, Playwright fill round trip **35ms**, 57 requests/129,552 transferred bytes, script encoded/decoded sizes **62,112/168,483 bytes**. No comparable baseline input/transfer profile was captured, so no before/after claim is made for those metrics. These are local lab observations, not physical-device INP or real-host/887-student capacity results.

## Review files and commands

Actual selected [screenshots and captioned walkthrough](../../../design-review/m9/README.md), [validation manifest](../../../design-review/m9/evidence/validation-results.json), [preservation evidence](../../../design-review/m9/evidence/preservation.json) and [changed implementation files](../../../design-review/m9/evidence/implementation-files.txt) are committed for smartphone review. Full raw review archive/bundle and exact final Git receipt are supplied with the delivery. Screenshots contain only labelled synthetic accounts/content; no secret/token/real student record is shown. The final Community preview is **enabled**, while new databases remain closed by default.

```sh
node scripts/pharmaideia-m9-validate.mjs
node scripts/pharmaideia-m9-performance.mjs
node scripts/pharmaideia-m9-contrast.mjs
node scripts/record-m9-walkthrough.mjs
```

Performance comparison needs the preserved three baseline JSON files in the review directory. Run performance separately from other browser suites. Existing `npm test`, lint/build/export/PWA and M6/M7/M8 script commands remain unchanged. See [API/maintenance](M9_API_AND_INTEGRATION.md), [security evidence](M9_SECURITY_VERIFICATION.md) and [controlled trial plan](M9_CONTROLLED_LIVE_TRIAL_PLAN.md).

## Remaining gates and GitHub readiness

- **Externally blocked:** public feed publication/reachability/ETags, original Editorial source and final integration, verified educational content/licences, actual Node/SQLite persistent host/TLS/proxy/worker/storage/email/push/scanner/provider configuration. The bundled 25 public entries include two Navigator candidates; no live total is confirmed and no candidate/location/coordinate was invented or upgraded.
- **Policy-dependent code/operations still incomplete:** expanded compromised-password screening, operational push, safely supported Office/binary document formats, trusted stale-backup deletion/role/hold replay and complete all-domain retention operations, exact approved external-origin/proxy integration, actual email/payment/provider integration, final complete-platform tutorial and original Editorial/paid-Ads/dues-publication work. These remain **before-launch** requirements, not post-launch scope or completed placeholders.
- **Owner/device/independent review:** invited URL/operator/access and privacy consent, retention/legal holds/key custody/offsite backup/RPO/RTO, fair CBT interruption policy, low-end Android/installed-PWA/TalkBack, small timestamp/role-label legibility, real host load/monitoring and expanded independent security assessment. No paid hosting choice or fabricated cost estimate is made.
- Git transport accepted the normal M9 source push. Repository-scoped PR API still returns **Forbidden**; no PR URL is invented. [Prepared PR description](M9_PR_DRAFT.md) targets `development/nipsa-student-platform`, not main. Final branch/head/API outcome is recorded in the delivery receipt. Only the existing main push/manual workflow can deploy Pages; no feature-branch/PR validation workflow is currently configured, no workflow was changed or dispatched, and no production run is claimed.

**Assessment:** suitable for local/synthetic review with meaningful working integrations. Not ready for public launch or an unapproved internet-accessible account service. No further milestone begins automatically.
