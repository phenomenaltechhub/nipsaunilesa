# M8 security review and remaining gates

18 November 2026. Native service/database/browser tests provide partial evidence; they are not independent penetration testing, OWASP certification or public-launch approval. [M7 controls and unresolved gates](../m7/SECURITY_REVIEW.md) remain applicable.

## Threats addressed

| Boundary | Implemented control / executed evidence |
| --- | --- |
| Member → posting/moderation | Current server grants, open/closed/suspension checks, fresh admin MFA, peer-admin boundaries and audited policy changes. Direct unauthorized pin/suspension/removal/report access is denied even after UI capability data was fetched. |
| Owner → editing | Original server send time and owner/revision checks; permitted at 29 minutes and exactly 30 minutes, denied at 30 minutes + 1 millisecond. Another member cannot edit; corrections do not extend the window. Existing removal policy preserved. |
| Browser → text / references | NFC 2,000-code-point validation, inert text nodes, safe canonical known website IDs/URLs, escaped bounded title matching, ambiguous/missing titles not guessed. Scheme/foreign-host/credential/port/query/dot-segment/path-prefix abuse tests and actual inert markup rendering pass. No arbitrary link unfurl/SSRF or user-selected fetch host. |
| Browser → uploads | Auth/body/rate/quota checks and bounded native PNG content/CRC/inflate/scanline validation, canonical re-encoding, private encrypted storage, generated IDs and owner attachment enforcement. Browser conversion is convenience, not the authorization/content boundary. |
| Member → receipts/presence | Owner/authorized-admin receipt inspection, durable actual visible acknowledgements, paginated IDs and transient typing without draft text. Revoked/suspended sessions disappear from presence; hidden DOM is cleared. |
| Reporter → moderator | Immutable encrypted original context, confidential reporter/notes, no public report event, rate limits and fresh-admin review. Legacy snapshots explicitly distinguished. Private reporting exposes only the reported snapshot, not all DMs. |
| Student → private conversation | Specific source message, recipient consent, participant checks, per-request replay, bounded queue/post quotas, block/decline/expiry, server-side cleanup and separate support assignment/retention. Actual restart and support hold-resolution tests execute database behavior. |
| Website → catalogue | Export allowlist, public-only metadata, fixed HTTPS origin/no redirect/student query forwarding, bounded response/time, last-good index/ETag, disabled-by-default external refresh and stop-on-403. Controlled HTTP and actual browser change/withdrawal tests; external live endpoint remains unverified. |
| Network → private state | Existing CSRF/Origin/cookies/session/MFA/role-revocation controls remain. Private no-store modules/JSON/images, no sensitive service-worker/localStorage content, offline/hidden/session clearing, same-ID lost-ack retry. Draft memory is not persistent storage or secure erase. |

## Confirmed issues corrected during browser/security review

1. Context-menu touch release could select a reaction immediately after long-press. Scoped touch-release suppression now prevents that while ordinary vertical scrolling remains available; real CDP touch tests exercise both.
2. A hover action tray could obscure the sender/message. It is now a single small contextual trigger in reserved header space, hidden normally; touch/keyboard menus preserve access without persistent per-message controls.
3. Canonical URL parsing normalized encoded dot segments before rejection. Raw dot/backslash/control checks now reject them. Complete URL tokens prevent a known URL prefix from highlighting a different path.
4. Adding references exposed a composer initialization-order error; real Chromium testing found it and the callback initialization was corrected. Style loading is awaited before layout, eliminating a two-pixel mobile snapshot race instead of loosening screenshot tolerances.
5. An empty conversation failed to auto-display its first incoming message because the latest-ID check expected an existing row. The explicit empty-history branch now refreshes; the real M7 cross-client regression passes.
6. Lazy images lacked reserved dimensions, and reading very long history could detach the latest message window. Dimensions and bounded window/latest-navigation handling now preserve layout and access to all retained records.
7. Legacy 100,000 message-ID validation would eventually make older retained messages unaddressable. Safe-integer ID handling is tested beyond that boundary.
8. An old support case could disappear immediately when its last moderation hold was resolved. The final-resolution retention extension is transactionally tested after simulated 91-day periods; open cases remain held.

## Unresolved / review-required

| Priority | Finding | Action |
| --- | --- | --- |
| High dependency/CI gate | Full `npm audit`: **14 high dependent-package entries** from **one picomatch ReDoS advisory**, [GHSA-fc5q-39xc-vjpf](https://github.com/advisories/GHSA-fc5q-39xc-vjpf), affected `<=4.0.7`; installed 2.3.2/4.0.7 under development ESLint tooling. Registry latest checked: 4.0.7. Production audit: **zero**. | Retain register entry, avoid untrusted glob inputs, apply a supported compatible upstream fix when available and rerun checks. No forced update/unsafe override/audit suppression. The existing full-audit Pages gate would remain blocked. ESLint 9 also emits an existing deprecation notice. |
| Release access | GitHub API request returned 403. Git without a helper lacked credentials; the standard GitHub CLI helper's managed credential was rejected as **Invalid username or token**. | Restore authorized GitHub access in Codex Cloud. No push/PR success or current remote-history verification is claimed. No tokens are printed or requested in chat. |
| Website sync | Production website/feed request proxy 403; the new feed has not been deployed. | Approved feed publication, allowed network and live refresh/withdrawal verification before enabling external refresh. Controlled tests are not external verification. |
| Infrastructure/providers | Host/runtime/persistent disk/TLS/email/push/Paystack/scanner remain unverified/unconfigured. | Preserve production refusal, synthetic-only accounts and fail-closed unsupported files. No live accounts, charges or public backend. |
| Availability | Controlled polling/rate limits/quotas are not 887-user sizing or resource-exhaustion certification; measured slow-mobile startup is about 11 seconds in a shared test runner. | Realistic concurrency/latency/load/worker/failure/capacity review on an approved host before launch. |
| Privacy/retention | New receipts, private snapshots/DMs/support retention require institutional acceptance. SQLite logical deletion does not guarantee erasure from backups/pages/screenshots. | Approve disclosures, retention/legal holds, key custody and restored-deletion procedures. Maintain separate financial retention. |
| Academic/editorial/launch | Original Editorial source, verified reviewed academic content and multiple full-platform pre-launch integrations remain outstanding. | Complete all approved requirements before first public launch; this scoped Community increment does not waive or postpone them. |
| Accessibility/devices | Automated axe, keyboard, CDP touch and resized viewport checks passed; physical Android/iOS and assistive-technology review were not available. | Owner and independent device/screen-reader review; no automated certification claim. |

No M7 question-bank/examination/payment-engine source, approved manifest identity, website logo, gallery watermark implementation, deployment workflow, lockfile, DNS or hosting setting was changed. The public website changes are limited to a static public metadata feed build step and selecting **existing** Navigator records by a validated query ID. No geographical coordinates, official appointments or academic records are invented.
