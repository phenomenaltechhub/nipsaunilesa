# PHARMAIDEIA — MILESTONE 09 (M9)
## Final integration, reliability, and controlled-live testing preparation

**Status:** New standalone implementation instruction, 19 November 2026. This is the **original M9 prompt**, not an addendum and not a request to locate an earlier M9 file. It incorporates the outstanding M8 recommendations. M9 does **not** authorize public production launch and does **not** declare that all future development or testing is finished.

### Codex assignment

You are developing **PHARMAIDEIA**, the separate NIPSA UNILESA student academic platform and installable PWA. **Proceed with M9 implementation and verification** within the existing project, using real repository evidence. Do not stop simply because no previously written M9 specification exists: **this document defines the M9 scope**. Start with a concise preflight analysis, then implement the items below wherever the code and permissions permit. Ask the owner only about genuine blocked architectural decisions, external credentials, missing source ownership or production authority; continue safe independent implementation meanwhile.

## 1. What M9 is—and is not

M9 is the **last planned feature/integration consolidation milestone before a distinct controlled-live trial and expanded vulnerability testing phase**, subject to the gap inventory. It closes incomplete approved workflows and makes the app suitable for controlled review by temporary test participants. Security testing continues **during** M9 and will be repeated after live test infrastructure is connected and after later backend/production changes. M9 may be followed by further development if controlled testing exposes faults or an approved requirement remains unfinished.

Do not confuse these independent projects:

1. **PHARMAIDEIA PWA:** academic workspace, user accounts, progress, timetable/planner, CBT, notifications, resources, community, support, student administration and their backend.
2. **NIPSA UNILESA public website:** `nipsaunilesa.com.ng`, existing Next.js static-export site with approved pages, branding and content.
3. **NIPSA Editorial Dashboard:** separate content-authoring, reviewing and publishing application. Its implementation can begin independently; do not build a second editorial portal inside PHARMAIDEIA.

M7 already contains the operational CBT engine; do **not** reimplement CBT as a new M9 feature. M8 already implemented controlled Community functions. M9 must ensure these remain correct and close outstanding technical/integration work.

## 2. Required preflight and branch safety

- Inspect current Git HEAD, clean/dirty state, ancestry, remotes, branches, `AGENTS.md`, relevant roadmap and `PRE_LAUNCH_MATRIX`, M7/M8 reports, migration state, actual test commands and architecture before touching code.
- Reported M8 review branch: `feature/pharmaideia-m8-community`, latest reported local follow-up commit `576bed7`; initial M8 commit `8000069`. These are *reported identifiers*, not proof of the present checkout. M7 must remain intact. M8's initial report cites M7 `8c479b8` and preserved parent `aacd56b`; verify rather than hardcode.
- User-reported latest local verification: **220 tests passed, 16 screenshot comparisons passed, 124 protected file hashes unchanged**, plus M7 browser workflows. Dependency production/full audits reportedly show **zero advisories** after the upstream picomatch advisory withdrawal; rerun both before restating.
- Three M8 regression defects were reportedly fixed: office changes incorrectly persisted after an audit failure; obsolete office labels returned after reappointment; and unsolicited HTTP `304` was incorrectly treated as successful synchronization. Retain or strengthen tests covering all three.
- **Create an isolated M9 working branch** from the actual correct, locally available M8-reviewed ancestry. Preserve unrelated user changes. Do not rewrite M7/M8 history, overwrite protected assets, rebase/force-push, or modify `main`.
- If M8 has not reached `development/nipsa-student-platform` because GitHub auth is rejected, use the verified local M8 HEAD as the M9 base. Record the ancestry and unresolved integration dependency. Do not claim a remote PR exists.
- Produce a baseline gap register with: `implemented`, `locally verified`, `requires implementation`, `requires external access`, `requires physical-device test`, `requires owner decision`. Reconcile **every approved pre-launch PWA function** with the current matrix. A missing feature is **not** silently removed from scope.

## 3. Main M9 implementation deliverables

### A. Durable website-content catalogue and trustworthy references — Priority 0

The current Community website-reference integration reportedly relies on a **memory-only catalogue**. Resolve this before controlled-live trials.

1. Implement a durable, versioned **public-metadata-only** catalogue snapshot using the simplest robust storage already present in the backend. Evaluate existing SQL storage versus a bounded atomic file snapshot, with restart, concurrency, permissions and operational cost considerations. Do not add a paid provider or second database without an explicit reason and approval.
2. Define stored source URL, verified canonical URL, stable item ID, type, title, source revision/feed version, ETag/Last-Modified if provided, validation and last-success times, withdrawal state, and controlled expiry/freshness semantics. Store no private student data in a public catalogue.
3. Distinguish in the server and UI: **verified current**, **cached but possibly stale**, **withdrawn/removed**, **unavailable/unreachable**, **unknown/unverified**. Do not display an offline/restarted cache as currently live.
4. An HTTP `304` is usable only when the client has the matching previously verified representation; unsolicited `304` must not imply successful synchronization. On network loss, preserve known references with honest stale status. On deleted/renamed pages, retain intelligible message history while avoiding dead links masquerading as valid.
5. Keep existing attachment-menu website suggestions, `/website` title matching, preview card, highlighted title and rendering in group/private/support messages and authorized announcements. **Never invent URLs**, content titles, campus locations or verified map markers. The last reported controlled feed had 25 public entries, two unverified Navigator candidates and zero verified markers; recheck live data before reporting totals.
6. Handle malformed/empty feeds, unexpected status codes, cold/offline start, service restarts, duplicate items, concurrent refreshes, replay, version rollback, withdrawal, rename, retry/backoff, timeout, rate-limit, data-size bounds and operator diagnostics.
7. **External gate:** public website feed publication, actual network reachability and production ETag behavior require authenticated access/approval. Implement contract and synthetic integration tests without publishing or modifying production.

**Acceptance:** Durable references survive restart, freshness state is accurate, withdrawn/unknown items cannot become invented live links, and existing M8 reference flows stay intact.

### B. Approved-function completion and cross-module consistency — Priority 0

Walk the actual pre-launch matrix from M1–M8 and close any **in-scope, independently implementable** gap rather than declaring a checklist item done based on a mock. Focus on real integration among:

- Student identity, login/session/MFA/role changes and authorization;
- Course resources, academically reviewed content, planner, timetable and saved progress;
- CBT applications, selected batches, question protection, timed attempts, save/resume/retry, authoritative grading, confidential results and topic-level feedback;
- Announcements/notification state, including role/level scoping, stale roles, publisher attribution, delivery receipts where applicable and synchronization;
- Community moderation, member hierarchy, Admin official sender, reporting/support confidentiality, consent-based temporary DMs, server-enforced editing, images, reactions, presence/receipts and website references;
- Payment/reconciliation, protected uploaded files and scanning **only to the extent the existing integration/test credentials and approval permit**.

Do not redesign finished CBT or Community features. Repair genuine acceptance failures, and document any feature blocked by original Editorial source, academic content review, infrastructure or external service access. Never invent university data, appointments, question banks, student identities, grades, paid transactions, official editorial approvals or messages.

### C. Preview/test-environment readiness and disposable test identities — Priority 0

Prepare a **controlled internet-accessible testing mode** architecture and runbook that can safely host the PWA for invited testers without making it public production. Distinguish:

1. **Frontend-only preview:** can exercise layout, navigation, static shell, theme, public content, offline assets and clearly labelled **synthetic demo scenarios**. It cannot establish genuine server authentication, persistence, SQL injection resistance, tenant isolation or payment validity.
2. **Isolated controlled test backend:** needed for **real disposable accounts** and end-to-end authenticated, database, permission, messaging, CBT, upload and notification workflows. The existing controlled backend may be used only after verifying data isolation, secure host configuration, credentials and approval. This is not the production student database.
3. **Later production/backend acceptance:** retest every backend-sensitive finding after actual service connections and deployment configuration. Test success in a demo is not a production security certification.

Implement isolated synthetic seed/cleanup routines and role-specific temporary identities **only in the test environment**, if one exists and is authorized: student, course rep/office holder, support attendant, administrator and necessary constrained roles. Test identities must be plainly labelled, non-real, time-bound/revocable and incapable of contacting or impersonating real students. Avoid hardcoded publicly usable passwords, real email sends, real money movement or exposed test-secrets. Provide a test-access matrix, consent/privacy notice for invited testers, environment banner, test-data retention/cleanup instructions and revocation procedure.

**Do not deploy a backend or public preview automatically.** Prepare reproducible preview builds/configuration and require owner approval, valid hosting/access and domain/URL before enabling externally accessible accounts. If authorized infrastructure is absent, complete local test harnesses and leave the externally hosted gate `blocked`.

### D. Mobile and installed-PWA reliability — Priority 1

- Test browser layouts at 320/360/390/768/1440px in dark/light modes and short-height/landscape combinations. Add automation for viewport resizing and keyboard-height scenarios.
- Plan and perform **physical low-end Android** tests when a device/tester is actually available: keyboard opening/closing, scroll anchoring, composition/emoji, Enter/Shift+Enter newline (only button sends), precise 2,000-code-point boundary, 30-minute edit window, touch long-press, file/image chooser, native file-size/type errors, retries, readable timestamps and role labels.
- Test **installed PWA separately**: install, offline app shell, service-worker update, reconnect, app resume, session expiry, revoked access, draft handling, private-data clearing, no stale personal data across accounts, and notification behavior where supported.
- Keep authenticated API/data out of precache and public static export; preserve strict private caching/no-store boundaries. Do not promise offline delivery or sync where the backend cannot perform it.
- Use real screen-reader/manual keyboard checks when possible in addition to automated accessibility scans. Missing physical devices are **not run**, not passed.

### E. Performance, data safety and recovery — Priority 1

- Re-measure the M8 controlled **11,353 ms ready time** at reported 390x844, 4x CPU, ~180ms RTT and ~50,000 B/s downstream. First determine the `ready` metric's definition. Compare repeatable before/after time-to-usable-input and visible conversation; seek meaningful improvements without changing approved behavior or concealing benchmark failures.
- Audit static shell budget, total JS transfer, first paint, first interaction, long-message history, 300-node rendering cap, memory, image previews, slow upload and recovery, and reconnection under weak connections.
- Simulate backend restart, dropped ACK/retry, duplicate request, partial write, concurrent role/audit update, expired temporary DM, confidential report assignment, backup/restore and repeated cleanup without data leakage.
- Define **normal group messages versus 24-hour temporary DMs versus support cases versus uploads versus audit logs** as distinct retention categories. Do not indiscriminately erase normal Community history. Check logs, exports, thumbnails, caches and backups for private data exposure.
- Document actual backup ownership, encryption/key handling, recovery point/time objectives if selected by the owner, restore rehearsal and failed-restore handling. Do not invent a successful production recovery.

### F. Continuous security verification and future vulnerability-testing plan — Priority 0 throughout

Use a scoped application-security checklist based on the **official OWASP ASVS 5.0** and OWASP Web Security Testing Guide, adapted to the actual attack surface. Build regression tests, review and fix confirmed code problems throughout M9. For authorized, isolated test endpoints only, include:

- SQL/NoSQL injection and parameterization; stored/reflected DOM XSS, markdown/link rendering and untrusted website metadata; CSRF/CORS and SSRF where network fetching exists;
- Authentication and MFA bypass, account enumeration, reset/recovery token handling, session fixation/expiry/revocation, token leaks, rate limiting;
- Object-level and function-level authorization (IDOR/BOLA/BFLA), role reappointment/removal, audit transaction atomicity, privilege escalation and official Admin attribution;
- File upload MIME/magic validation, image bombs, path traversal, malicious attachments, storage/download permissions, scanner failure modes;
- Confidential support/DM/report isolation, consent expiration, encryption/key handling, logging, backups, transport security, secrets and dependency audit;
- CBT answer/question-bank leakage, grade manipulation, clock/attempt bypass, replay, duplicate submissions and result visibility;
- Error handling, redirects, clickjacking/content security policy as appropriate, service-worker scope and cache poisoning.

Do not attack real university systems, production services or third-party domains. Destructive fuzzing, load/DoS simulation and active scans require a disposable authorized test environment and explicit permission. Vulnerability tools are **evidence generators**, not proof of safety. Record exploitability, severity, affected role/data, reproducible test, minimal fix and retest. Label `not applicable` only with a technical reason; label blocked tests as `not executed`. Do not publish exploit steps containing live credentials or private data.

### G. Editorial/public-site integration contract — Priority 1

The Editorial Dashboard is a **separate project that may commence immediately**. Do not absorb its scope into M9. For PHARMAIDEIA, implement/test only stable integration contracts and safe read-only consumers for approved content, identity/authorization mapping where expressly intended, and publisher attribution. The public NIPSA site and Editorial Dashboard are separate authorities; local preview approvals do not count as official publication. Define versioned feed schema, validation, change/withdrawal rules, link safety, ownership, refresh behavior and failure states. Keep all outbound publication, GitHub write, approval and production capabilities disabled until approved sources and authenticated backend are available.

## 4. Testing sequence and evidence

Perform tests as code changes are made, then run a clean final M9 suite:

1. Type/lint/build/static export/PWA/offline asset checks, dependency audits, secret scan, migrations and schema changes.
2. All existing M6/M7/M8 automated and browser regression suites, including M8's three repaired bugs and protected-file hash comparison.
3. Automated API contract, authorization-negative, restart/cache/synchronization, component and cross-module workflows, and test-account isolation/cleanup.
4. Real-browser screenshot comparisons at mobile/desktop sizes, modal/keyboard/dark/connection-failure states, and scoped accessibility scans; **visually review the actual captures**, not only pass counters.
5. Repeatable adverse-network measurements and capacity tests in **authorized disposable environments only**. Never confuse local concurrency with real production capacity.
6. Create a separate **Controlled Live Trial & Security Test Matrix** for the *next phase*: frontend-only versus isolated-backend expectations, device/browser profiles, roles, objectives, authorized testing rules, data cleanup, vulnerability categories, severity workflow and owner sign-off.

Do not treat an unrun test, missing GitHub credential, unavailable physical device, unreachable feed or missing Editorial source as a passing check. Mark each gate explicitly `passed`, `failed`, `not run`, `blocked` or `not applicable` with explanation.

## 5. GitHub, deployment and owner approvals

- GitHub authentication was previously rejected. Never bypass permissions, extract unrelated credentials, force push, alter branch protections or claim success. On legitimate restoration, verify current remote history, submit normal review PRs into `development/nipsa-student-platform`, not `main`.
- Do not modify DNS, public `nipsaunilesa.com.ng`, production payments, real student accounts, editorial content or publication settings without specific approval.
- Do not publicly release the PWA as a full service or activate real student signups by this instruction. A separate **controlled online preview** can be authorized after test-hosting, access restrictions, data isolation and owner approval have been reviewed.
- Write all decisions and blocker ownership down. For material architecture choices (new paid services, production credentials, multi-user access, retention, security-risk acceptance) present concrete options and ask the owner rather than silently choosing.

## 6. Deliverables and finish criteria

Create/revise in the project:

- `MILESTONE_9.md` — exact start/end commits, feature-by-feature evidence, changed-file list, preserved M7/M8 checks, tests, actual measurements and blocked integrations.
- `M9_DECISION_REGISTER.md` — proposed/approved/blocked decisions, rationale, owner and consequence.
- `M9_PRE_LAUNCH_MATRIX.md` — exhaustive approved-function inventory with no deferred launch requirements hidden.
- `M9_CONTROLLED_LIVE_TRIAL_PLAN.md` — disposable identities, frontend-only vs test-backend semantics, access control, Android/PWA cases, incident/report handling, cleanup and rollback.
- `M9_SECURITY_VERIFICATION.md` — ASVS/WSTG control mapping, confirmed findings, mitigations, negative tests, outstanding independent assessment.
- Actual mobile/desktop visual evidence, useful walkthrough, before/after performance, tests/scripts and reviewable local commit or authorized PR materials. Provide an archive/bundle when GitHub access is blocked, with working downloadable paths; do not claim a download exists if unverified.

M9 is complete for **development-branch review** when every implementable M9 requirement has passed its relevant tests, M7/M8 regressions are absent, evidence is attached, temporary-account/test-mode boundaries are secure, and external/physical/live gates are honestly identified. M9 completion does **not** imply full security certification, live trial completion, backend production verification or permission to launch.

**Execution instruction: inspect, implement, verify, document and hand off. Do not stop because the former M9 addendum said an original prompt was missing; this is that prompt.**

### Technical reference baselines

- OWASP ASVS 5.0: https://asvs.owasp.org/
- OWASP Web Security Testing Guide: https://wstg.owasp.org/
- NIPSA existing public site: https://nipsaunilesa.com.ng/
