# M5 hosting, configuration, retention and integration

## Host decision

Node **24.19.0** and built-in SQLite **3.53.3** were verified in the existing Codex executor. PHP, MySQL/MariaDB and their CLI tools were absent. The one Smartweb HTTPS request returned proxy CONNECT **403**; it was not repeatedly retried. No provider support, contract or purchased plan is assumed.

| Production capability | Evidence / next requirement |
| --- | --- |
| Supported Node/PHP runtime and process management | Smartweb unverified. Confirm supported versions, long-running Node routing/process restart, security patch ownership, or approve a tested adapter/alternative stack. |
| SQLite/MySQL, locking and durable storage | Unverified. Confirm persistent local storage, backup-safe DB access, transaction/concurrency behavior; SQLite is not a claim of network-filesystem compatibility. |
| HTTPS and same-origin API | Unverified. Require TLS, Secure cookies, trusted proxy rules and correct origin/Host validation. Current service accepts only its exact loopback origin. |
| Cron/scheduled tasks, email | Unverified. Establish private jobs, authenticated mail delivery, ownership/recovery queues and generic response timing. Current injected test transport sends nothing. |
| Private files/uploads | Unverified. Validate non-public storage, MIME/magic/extension/size inspection, malware protection, permissions, safe download disposition and lifecycle. No upload endpoint is active. |
| Resource limits and approximately 887 students | Unverified. Each scrypt job uses about 128 MiB plus process overhead; concurrency is capped at two. Validate host memory/CPU/worker/storage limits and realistic gradual-adoption load. Entry-process limits are not student-account limits. |
| Logs, offsite backups and restoration | Unverified. Require encrypted offsite storage, independently held keys, monitored scheduled jobs and exercised incident recovery. |
| Real-time messaging | Unverified; do not assume shared hosting supports persistent connections. Approve a secure transport after technical/cost review. |
| Recurring costs | No verified quote. No subscription/hosting/service has been purchased. |

Node/SQLite is a working controlled candidate, **not a finalized Smartweb production decision**. Do not expose or proxy the controlled server to the internet. Runtime, key, recovery and host acceptance must precede any separate production-enablement change.

## Controlled configuration

`npm run dev:backend` uses these environment variables, supplied privately in the executor/shell; never commit values:

| Variable | Safe description |
| --- | --- |
| `PHARMAIDEIA_MODE` | Explicit `development` or `test`; production is rejected. |
| `PHARMAIDEIA_DATABASE` | Absolute path to a private directory/file outside public/student-pwa/out/design-review; default `/tmp/pharmaideia-private/accounts.sqlite`. No real records. |
| `PHARMAIDEIA_SESSION_KEY` | Private random 32-byte key encoded as 64 hex characters. |
| `PHARMAIDEIA_ENCRYPTION_KEY` | A distinct private 32-byte hex key for MFA and controlled encrypted backups. |
| `PHARMAIDEIA_AUDIT_KEY` | A third distinct private 32-byte hex key for audit integrity. |
| `PHARMAIDEIA_PORT` | Loopback listener, default 4175. |

Startup does not seed users. `backend/testing/fixtures.mjs` works only in explicit test mode, generates random reserved-domain accounts/passwords in memory and is used by isolated test scripts. Browser tests exercise the actual database and remove their temporary files. No fixed default password or bootstrap administrator is included. Tests must not be pointed at a real database.

`/access/` provides actual controlled sign-in, ownership activation, recovery, MFA, role switch, password change and logout. `/admin/` is server-protected. The public static PWA has no active account destination. Only the controlled server adds a non-sensitive capability attribute offering its same-origin Account access link in Settings. That attribute grants no permission and contains no personal data. The same public shell may be cached; API/account/admin responses may not.

## Backup and deletion

`encryptedBackup(service, privateDirectory)` takes a consistent SQLite `VACUUM INTO` copy, encrypts it with authenticated AES-256-GCM, writes an exclusive 0600 backup and removes the plaintext temporary copy. `restoreBackup(file, newDestination, config)` refuses overwrite, authenticates decryption and checks SQLite integrity, foreign keys and the audit chain. Restoration and wrong-key/overwrite failures are tested with synthetic data. It is a library operation, **not an operational cron/offsite-backup service**. Keep keys outside backups/source/logs; host-level process/file isolation, recovery custody, external audit anchoring and monitoring need operational validation. Current whole-buffer backup approach needs capacity testing before larger datasets.

Accounts support pending activation, active, temporary restriction, suspension, graduation/expiry, deactivation and pending deletion. Graduated/expired accounts cannot sign in. Controlled pending-deletion delay is seven days; due cleanup is authorized and audited. Own-account destructive actions are denied. Private sessions, roles, proofs and local progress rows cascade; authored unreviewed drafts are removed. Financial references remain with a null account link. No real payment ledger is imported or fabricated.

An approved policy must define graduation transitions, account data retention, legal holds, audit/financial retention, export/deletion ownership, backup expiry and restoration re-application of deletions. Do not infer legal compliance from the test defaults or delete financial records on graduation. No automatic real deletion/job is activated.

## Integration ownership and launch gates

- Public website and original editorial prototype stay separate. Original Sites source is still absent. No duplicate editorial portal or integrated publisher is claimed.
- PWA account administration is independent of public publishing. Future adapters must consume reviewed public editorial data with verified sender/actor attribution.
- Verified dues reconciliation must be server/provider-verified and dispute-aware before any real eligibility import. Current boolean eligibility is trusted synthetic fixture input, **not implemented Paystack verification**. Browser callbacks/screenshots/`paid` fields cannot enable it.
- Actual drafts are private/unreviewed. Reviewed curricula, publishing workflows, protected materials, file scanning/storage, timetable conflicts and rights review remain mandatory.
- Personal progress/notification interfaces work locally; backend synchronization, targeted delivery, persistent preferences and authorized publishing remain to integrate.
- Community policy/suspension is real on the controlled backend, but messages/replies/mentions/reactions/member/moderation transport remains M6/M7 work. Opening a controlled policy gate never fabricates successful chat.
- CBT intake/application/review is assigned M6; secure batch engine/autosave/timing/submission/private analytics is assigned M7. Both are mandatory before launch.
- The optional silent tutorial demonstrates current tools only. Captions/transcript accompany it; update it for the completed application before launch.

All approved features remain required before first public launch. See [M5 completion matrix](PRE_LAUNCH_MATRIX.md); unavailable infrastructure is a launch blocker, not post-launch scope.
