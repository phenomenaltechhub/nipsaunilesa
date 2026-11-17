# Threat model and security gates

Status: M1 architecture/threat model and tested public-shell boundaries. **No server authentication, authorization, payment verification, recovery, upload or audit-log implementation exists yet.** These requirements must be implemented and tested in the backend before those features are described as secure or operational.

## Trust boundaries and threats

| Boundary | Threat | Required control and future negative tests |
| --- | --- | --- |
| Public repository/static export | Student records, secrets or protected notes become public forever | No private datasets or credential inputs; use secret-name documentation only. Review/scan commits, assets and generated exports. Never bundle protected course content. Secret-pattern checks are heuristic, not a guarantee or full history audit. |
| Browser → identity API | Enumeration, brute force, CSRF, session theft, open redirects | Server identity checks, generic timed responses, throttling per action/account/IP, Argon2id, secure HttpOnly/SameSite cookies, rotation, expiration, CSRF validation for writes, narrow CORS, allowlisted same-site redirects. No tokens/password hashes in browser storage. Test missing/expired/revoked sessions and forged requests. |
| Identity → student resource | Cross-student/level access, stale roles, self-promotion | Deny by default. Server derives student and level from session. Check object ownership, permission and scope on every action. Position assignments are separate grants, never self-selected claims. Recheck current grants on every active-role change/request. Test all 100/200/300 cross-level combinations and revocation. |
| Provider → payments/dues roster | Forged redirects/screenshots/webhooks, wrong amounts, duplicate or disputed imports | Trusted server/provider reconciliation, reference/amount/currency/merchant/status checks, provider signature verification, replay defence and idempotent transactions. Reject pending/failed/refunded/disputed or mismatched payments. Browser callbacks never activate accounts. |
| Upload → storage/download | Script files, polyglots, path traversal, bombs, malware, unauthorised originals | Server MIME/content/signature validation, allowlisted extensions, bounded bytes/pixels, normalised generated names, quotas and malware scanning; private storage outside web root. Authorise every upload/download and log actions without content. Scan before promotion. Test spoofed types, SVG/HTML, paths, oversized payloads and cross-level access. |
| Publisher → content | XSS, impersonation, bypassed approval, unpublished media leaks | Plain-text or sanitised allowlisted rich content; server review/version state machine. Verify public sender separately from durable authenticated actor. Public snapshots contain approved content only. Never trust a client approval boolean. |
| Member → community | Posting while closed/suspended, forged sender/replies, spam | One server-owned general community, initially closed. Server checks status, membership and chat-only suspension on every write. Check reply/mention IDs, lengths and rate limits; no caller-supplied identity. Only explicitly authorised PWA administrators may change status, with transactional audit. Academic access survives chat suspension. |
| Recovery/admin → account | Shared passwords, account takeover, unaudited suspension | Verified recovery procedure, single-use hashed expiring reset token, atomic consume, new password immediately, revoke existing sessions. No compromised-account waiting period. Audit approval, recovery, suspension, reactivation and role/batch changes. |
| Offline browser → disk/shared device | Persistent private data, stale content, lost local state | Only an explicit credential-free public-shell allowlist is precached. No dynamic API/attachment caching, no push permissions, no student records in IndexedDB/localStorage. Future logout must clear private in-memory state and any approved private cache. Provide shared-device logout advice when authentication exists. |

## Permissions and identity model (contract only)

- Student: own authorised academic resources and personal settings, within assigned level. No role grants or publishing rights by default.
- Level representative: explicitly granted academic-management permissions for a whole assigned level, across its courses; never all levels implicitly.
- Executive/Vice President/other position: identity title, not automatic administration. Notification publication requires a separate explicit permission/scope.
- PWA administrator: individually granted account/level/role/moderation/community/glossary/audit responsibilities. Sensitive operations may require reauthentication/MFA; validate feasible implementation before launch.
- Editorial administrator: full editorial technical **and** publishing rights. Editor-in-Chief, editors, contributors, media editors and Ads reviewers have separate workflow scopes. Several users can hold one role. No staff accounts are created.
- One student account can carry several current grants. Switching the active role never creates a new identity or widens the server's underlying grants. Immediate revocation is mandatory. Editorial administration and student-account administration are separate domains.

## Data lifecycle, logs and operations (required before M7/M8)

Collect only approved registered name, institutional email, matriculation identifier, academic level/admission year and relevant verified position, for disclosed purposes. Registration details do not prove an executive/representative role. No real records or payment exports may enter this public repository, build logs or screenshots.

Audit actor ID, action, target opaque ID, changed scope/status, timestamp, reason and correlation ID in an access-controlled append-only store. Never log credentials, reset tokens, webhook secrets, full provider payloads, unnecessary matriculation/email values or message bodies. Account approval/suspension/recovery, grants/revocation, community toggles, publications and payment reconciliation must be auditable. Define restricted audit access and tamper detection.

Graduation deactivates access and schedules eventual deletion/anonymisation under a disclosed policy. Exact retention periods require institution/legal approval; financial records must be preserved according to applicable obligations, independently of graduation. Define export/access/correction/deletion procedures and restoration-aware deletion handling. Do not invent a legally sufficient retention duration.

Backups need encrypted offsite copies, least-privilege access, retention limits and a tested restoration into an isolated environment. Document RPO/RTO after host capability/cost review. Incident response must include session revocation, secret rotation, content rollback and notification responsibility. Paid services and host provisioning require approval.

## Current tests versus future security tests

Current unit/browser tests can establish allowlisted local routes, safe DOM rendering, fail-closed disconnected services, a bounded public offline cache, working local timer, session-memory revision plans, safe optional avatar preferences and website regressions. Only the curated avatar ID is eligible for opt-in device storage; personal tasks remain in memory and must never become a public cache/export. Tests **cannot** establish backend auth, cross-level/IDOR isolation, role revocation, community-toggle enforcement, payment signatures/reconciliation, upload security, password recovery or durable admin audit logs. Those integration/security suites remain a M7/M8 release gate against a real test backend. Do not replace them with assertions that documentation or disabled controls exist.
