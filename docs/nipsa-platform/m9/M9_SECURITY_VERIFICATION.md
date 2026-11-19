# M9 security verification

Scope: owned, disposable local backend databases and Chromium only. No university/production/third-party attack, external scanner, load campaign, real account or payment was used. Automated results are evidence, not certification. See the final report/results manifest for executed commands and gate outcomes.

## Control mapping

This is a topic-level application of [OWASP ASVS 5.0](https://owasp.org/www-project-application-security-verification-standard/) and [WSTG](https://owasp.org/www-project-web-security-testing-guide/stable/), not a claim to pass every requirement or a formal ASVS level. Official upstream pages were requested read-only once on 19 November; this environment's proxy returned CONNECT 403. Exact current clause reconciliation and independent review remain open. No guessed numeric control identifiers are used.

| Control topic | Implemented defense / executed evidence | Remaining verification |
| --- | --- | --- |
| Authentication/MFA/session/recovery | Preserved M5–M7 hashing, generic errors, single-use proof, fresh MFA, HttpOnly cookies, rotation/revocation and approved lockout progression; prior backend/security tests plus M9 trial/batch expiry and stale grants | Real email/provider, proxy/Secure-cookie deployment, compromised-password data/adapter and independent lockout/abuse review |
| Authorization/BOLA/BFLA | Current server session, active grant, level/course/selected roster/owner on protected requests; support grant only assigned cases; batch/role/session removal checked immediately | Invited multi-device and actual host tests; real appointments/eligibility review |
| Input/business logic/concurrency | Allowlisted fields, bounded content and dates, class overlaps, optimistic revisions, independent author/reviewer, explicit withdrawal, idempotent answer/send request IDs, transactional audit | Broader approved scale/adversarial concurrency; content-owner review |
| Injection/XSS/links | SQL values parameterized; dynamic study history identifiers are fixed internal constants; UI textContent/node rendering; fixed production catalogue origin and safe shared destination validation; private JSON never rendered as HTML | Independent browser/producer integration tests with actual sources |
| CSRF/CORS/SSRF | Existing exact Host/Origin/CSRF and same-site controls; no wildcard CORS; catalogue downloader fixed HTTPS source, redirect/MIME/stream/timeout bounds; user sources are links, not fetched by backend | Actual reverse proxy/TLS configuration; no arbitrary URL-fetch service is added |
| Durable catalogue trust | Migration 008 transactions/digests/ETag match/history/tombstones; cold boot cached; malformed/empty/old feed cannot replace last-good representation; same-content publication-sequence highwater enforced | Real publisher revision/ETag contract, bounded compaction policy and source access |
| CBT confidentiality/integrity | Original engine/bank/scoring routes unchanged; M7 tests verify selected students, server clock/expiry, answers/retry, duplicate submission, role change, withheld/released own results, monitoring | Academic question review, incident fairness policy, physical interruptions and deployed-host assessment |
| File handling | Existing protected delivery, canonical private filenames, size/content/CRC/bounds, scoped downloads; unsafe PDFs fail closed without verified scanner; no unrestricted imports | Actual scanner/storage integration; Office formats still not implemented/authorized as safe |
| Confidentiality/retention/recovery | Existing encrypted DM/support/report/backups; 24-hour DM cleanup before listener opens after restore; normal group history retained; support fresh-MFA claim/transfer, scoped report access and paginated inbox | Trusted latest revocation/deletion/hold replay after old backups, offsite keys, legal policy, secure deletion and restoration quarantine |
| Offline/cache/data exposure | Existing public-only SW allowlist; private authenticated APIs/modules no-store; in-memory personal preferences/plan state disposed; trial files 0700/0600, no credentials in source or logs | Physical installed-PWA/shared-device/browser recovery inspection and real proxy cache tests |
| Configuration/performance | Production refusal, loopback and reserved-domain guards retained; static-only gzip; dynamic JSON and HTML uncompressed; route-level lazy imports, DOM cap unchanged | Provider runtime/persistence/worker limits, authorized load/capacity and monitoring |
| Logging/audit | Existing append-only keyed audit and atomic role/message/course operations; M9 catalogue/study/batch/support decisions audited; logs only safe request IDs/error codes | Independent audit-key custody/immutable offsite anchor and operational incident ownership |

## Confirmed findings and corrections

1. **Catalogue reliability/trust — medium:** memory-only accepted metadata vanished on restart, and a bundle could look current after a source failure. Existing references could lose withdrawal/rename provenance. Migration 008 persists a validated representation/history/withdrawals and reports honest boot/freshness/transport states. Seven M9 tests exercise actual restart, corruption/304 rejection, rollback, same-content sequence rollback, withdrawal, retry, atomic audit failure and encrypted backup recovery. The three earlier M8 regression fixes (office audit rollback, stale office reappointment, unsolicited 304) remain tested.
2. **Support operations — access/availability gap:** only full administrators could answer cases; latest-100 inbox cutoff could hide older conversations; revoked staff ownership had no hand-over operation. Migration 010 adds fresh-MFA constrained support with no moderation/admin/CBT powers, stable paging and explicit fresh-administrator reassignment. API tests cover denial before claim, other assignee isolation, role revocation, administrator-only transfer and 60-case paging. This is an approved operational gap closure, not evidence of a previously exposed private case.
3. **Restore expiry window — medium privacy risk:** cleanup previously waited for the periodic worker after restore. Startup now expires/removes existing temporary-message payloads before listening. A real encrypted-backup restore test verifies no expired private message is served and ordinary group messages remain. This does not solve production deletion or revocation replay from stale backups; see open risks.
4. **Startup performance — confirmed engineering cost:** eager loading of all authenticated modules and uncompressed static code delayed Community under the controlled adverse link. Lazy active-route imports and static-only gzip reduce transfer without compressing private JSON/HTML or weakening no-store. HTTP negative tests cover unauthorized modules and `gzip;q=0`; the final serial benchmark supplies actual timings.

New-code failures caught before completion: nested rate-limit transactions in study authoring/practice and invalid select-option construction in the timetable. Corrected and covered by API/browser retests. They are development defects, not claimed production incidents.

## New regression commands

```sh
node --test backend/tests/m9-catalogue.test.mjs backend/tests/m9-study.test.mjs backend/tests/m9-trial.test.mjs backend/tests/m9-recovery.test.mjs
node scripts/pharmaideia-m9-browser.mjs
node scripts/pharmaideia-m9-validate.mjs
node scripts/pharmaideia-m9-performance.mjs
```

Performance comparison needs the three preserved M8 baseline JSON files under the review directory; keep benchmark/browser suites serial. Validation runner writes command/status/duration/log evidence and fails on any failed command. No test secrets are printed. Use the existing M7/M8 browser suites too; new tests do not replace prior exploit-focused coverage.

## Open launch/security gates

- **High, release gate:** no verified production-like service, operational email, independent external authentication/recovery review or actual backup security-state replay. Do not activate real users or restore an old DB to a public listener. Integrity-valid backup data can still contain deleted/revoked material; operator quarantine/current security journal is required before a real restore.
- **High, release gate:** approved private documents/Office formats cannot be accepted as safe until actual scanners/validation/storage are verified. Existing unsupported formats fail closed.
- **Integration gate:** actual Paystack sandbox/webhooks/reversals/fees/eligibility, consent/roster sources, push keys/devices, live website producer, Editorial source/publication/attribution and academic content review remain unverified. A simulated provider response is not transaction verification in production.
- **Owner decision:** privacy/retention/legal holds and final restore/deletion/financial policies, RPO/RTO, operator/key custody, trial invitation/response policy and fair examination incident policy. No short expiry was imposed on normal group history.
- **Not run:** physical Android/installed-PWA/TalkBack, independent penetration test, actual host concurrency/resource exhaustion/monitoring. Local bounded concurrency and axe are partial evidence only.
- **Dependency status:** both final audits report actual results in the M9 report; the withdrawn picomatch advisory is not suppressed. Clean npm installation warns that ESLint 9 is out of maintenance; this is recorded as a development-tool maintenance issue, not a fabricated security advisory. No force upgrade or override was introduced.
