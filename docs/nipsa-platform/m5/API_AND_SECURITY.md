# M5 implemented account service and security contract

Status: **implemented and integration-tested in an isolated synthetic environment**. No real student authentication, payment verification, live community transport or CBT engine is activated. Interface declarations are not used as evidence of these services working.

## Data and boundaries

`backend/migrations/001_accounts.sql` establishes private accounts, trusted academic levels, lifecycle statuses, appointments, sessions, failure/rate state, proofs, audit, community policy/chat suspensions and a minimal financial-retention reference table. `002_academic.sql` adds actual unreviewed academic-draft persistence and a future progress table. `003_recovery.sql` adds MFA recovery approval. Migrations run transactionally and preserve data on restart. Progress synchronization has **no operational API yet**.

Database files/directories must be private and outside static roots; path normalization and symlink/permission checks fail closed. SQL uses bindings. Only explicit safe fields leave account APIs. Startup refuses non-reserved `.example.invalid` account records. There is no account-creation, payment callback or upload API. Direct static requests cannot retrieve backend sources, databases, dot files or files outside the public root. The administrator UI and its files require a current server-authorized administrative session.

## Actual versioned endpoints

All are under `/api/v1`. Writes require exact same Origin, current session and session-bound CSRF token, JSON content type, strict accepted keys and a 16 KB body maximum. Responses are private/no-store and never enter the PWA cache. Errors contain a stable code and opaque request ID; logs contain only request ID/code.

| Endpoint | Implemented behavior / boundary |
| --- | --- |
| `GET /health`, `GET /session` | Actual DB health; anonymous session bootstrap or current safe account stage, active role and CSRF token. No password/MFA secret returned. |
| `POST /auth/login`, `/auth/logout`, `/auth/password` | Password verification, session rotation, immediate logout, owner password change and revocation of all other sessions. |
| `POST /auth/activation/start`, `/complete` | Eligibility from trusted `dues_verified` record, expiring ownership proof, password creation, pending administrator approval. No browser payment assertion can establish eligibility. |
| `POST /auth/recovery/start`, `/complete` | Generic request response; single-use expiring owner proof, new password, revoked sessions, unchanged suspension. |
| `POST /auth/mfa-recovery/start`, `/complete` | Owner proof plus separate current administrator approval. Owner selects new password and replaces MFA atomically; old password/sessions cannot race factor removal. |
| `POST /mfa/enroll`, `/confirm`, `/verify` | Current-password enrollment, encrypted pending/active TOTP secret, expiry, replay prevention and brute-force restrictions. |
| `POST /auth/role` | Database appointment lookup, fresh MFA for privileged role, rotated session. Submitted labels never grant a role. |
| `GET /accounts/:id/profile` | Self only; current MFA-authorized administrator may inspect another account. No cross-student record access. |
| `GET /admin/accounts?offset=…` | Authorized paginated database list, 100 rows/page; safe account/appointment fields. |
| `PATCH /admin/accounts/:id` | Audited status/level change and immediate session invalidation. Activation requires verified dues/ownership/password. Reassignment removes old level appointments. Self-suspension/deletion denied. |
| `POST /admin/accounts/:id/roles` | Audited scoped appointment/revocation, session invalidation, no self-demotion or representative cross-level/global-notice grant. |
| `POST /admin/accounts/:id/recovery`, `/mfa-recovery` | Audited recovery authorization. Password proof delivered only to the owner test transport. MFA approval uses **non-secret request reference**, never the owner token; another administrator is required. |
| `GET /admin/audit`, `/admin/config` | Protected redacted audit and operational status; no keys, password hashes, proof tokens or private configuration dump. |
| `POST /admin/deletion/run` | Audited due-account deletion after configured delay; retained financial references survive with account link removed. |
| `GET /academic/courses` | Own server-assigned level, truthful empty reviewed catalogue. No institutional course records invented. |
| `GET/POST /academic/drafts` | Actual private unreviewed drafts, server validation and scoped MFA-authorized representative/reviewer/admin writes. Students cannot publish or read management drafts. |
| `GET /community/status`, `PATCH /admin/community` | Actual stored policy, revision and audited authorized open/close. |
| `POST /admin/accounts/:id/chat-suspension` | Chat-only restriction/reinstatement separate from academic access. |
| `POST /community/messages` | Actual gate/suspension enforcement; after a permitted gate returns **503 transport pending**, never fabricated messaging success. |

## Passwords, sessions and recovery

Scrypt N=131072, r=8, p=1 with random 16-byte salts and 64-byte derived values; constant-time comparison. Passwords normalize NFC, allow 15–128 Unicode code points, reject null/ill-formed/oversize/all-space and a small known-password list. No forced composition rules or periodic waiting periods. **The small list is not a complete compromised-password screen**; approved updated screening is a pre-launch requirement.

Opaque 256-bit session IDs are HMAC-indexed in SQLite; browser cookies are HttpOnly/SameSite=Strict, not localStorage tokens. Login, MFA and role switching rotate IDs. The current session row (including after asynchronous hashing), account security versions, status and current grants are checked server-side; role/status/level changes revoke existing sessions. Controlled defaults: 20-minute idle / 8-hour absolute lifetime; sensitive admin operations require MFA within 10 minutes. Cookies are HTTP loopback-only in this environment; public operation must require HTTPS/Secure and a separately reviewed deployment configuration. Production mode is refused now.

Consecutive password failures: 1/2 retry, 3=5 minutes, 4=15, 5=30, 6=60, 7=24 hours, later failures capped at 24 hours. A failure after expiry advances the sequence; blocked requests never extend the deadline. Success resets it. Inactive counters expire after 30 days in controlled configuration. A transaction rechecks state after expensive verification, preventing concurrent bypass. HMAC subjects conceal addresses in abuse/audit records. Network/global/account lanes and two concurrent expensive hash jobs bound work; forwarded IP headers are not trusted.

Existing valid sessions survive an attack on the password lane. A separate verified-owner recovery lane remains available during password restrictions. This reduces lockout harm but **does not establish production availability** without operational email and abuse-resistant support. Generic known/unknown account responses are tested; production transport timing, queue behavior and distributed denial-of-service resistance need host-level validation.

Recovery tokens are random, stored only as HMAC hashes, expire after 15 minutes and are consumed atomically with session/token revocation. Mail is injected into memory for tests. No SMTP or delivery provider is connected. MFA recovery keeps the existing factor until completion; another currently authorized administrator approves a non-secret reference, while only the owner retains the secret proof. A reviewed emergency process is required for loss of the only available administrator; no insecure bypass is provided.

## Permissions and audit

Students: own profile and own-level reviewed academic access. Representatives: assigned level only with fresh MFA for drafts and level notices; no department-wide grant. Reviewers: assigned level and explicit academic-review permission. Executives: explicit responsibilities only. Administrators: fresh MFA, active administrator role and current DB appointment. Multiple accounts/appointments and active-role switching are supported; no staff or real student account is created.

Audit rows are append-only under database triggers and HMAC-chained. Sensitive mutations and their audit event share a transaction; failed audit writes roll back changes. No passwords, mail addresses, proof tokens or message bodies are logged. Audit actor/target IDs are pseudonymous, **not anonymous**. Host/database owners with keys remain in the trust boundary; external immutable anchoring and approved retention must be added before launch. Database exceptions return a generic service-unavailable response.

Academic validation, API/error/CSRF/Origin/Host guards, single-use recovery, MFA, authorization, deletion and restoration have executable tests. This is not a penetration-test certification or a claim of complete security.

## Guidance references and verification limit

Security review follows established NIST SP 800-63B-4 and OWASP authentication, password-storage, session-management, CSRF and authorization principles. Official reference URLs: https://pages.nist.gov/800-63-4/sp800-63b.html , https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html , https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html and https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html . One NIST and one OWASP request each failed with proxy CONNECT 403; no retry was made. Current online text could not be reverified, and no certification/conformance claim is made. TOTP is not phishing-resistant; privileged production access requires a reviewed MFA/recovery policy and assessment of phishing-resistant options before launch.
