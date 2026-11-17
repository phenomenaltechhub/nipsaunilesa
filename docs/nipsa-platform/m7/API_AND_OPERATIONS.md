# M7 controlled APIs and operations

Base `/api/v1`, same native M5/M6 AccountService/database/session/CSRF/role checks. No second backend, Next.js API, public deployment or real account is introduced. M7 migration 005 preserves M6 question/blueprint data while permitting administrator-authored bank questions without inventing student applications. Synthetic upgrade/FK tests exercise the real migration.

## Examination authority and state

All student examination operations require the current Student active role, own explicit selected assignment, current account/session and course/academic-level access. Administrative management requires the existing fresh MFA check. Role/level/session changes take effect on the next protected request. Every write retains Origin/Host, same-site cookie and CSRF checks.

| Endpoint | Methods | Behavior |
| --- | --- | --- |
| `/admin/cbt/question-bank?courseId=…` | GET/POST | Authorized bank listing/draft creation; optional course-filtered admin list. MCQ single answer, 2–6 options, 1–20 marks, reviewed topic/category/difficulty/source/explanation. |
| `/admin/cbt/question-template`, `/admin/cbt/question-import` | GET/POST | Approved versioned JSON template, at most 10 draft questions per bounded import. Strict fields/content/source validation, no arbitrary files or automatic approval. |
| `/admin/cbt/questions/:id` | PATCH | Revision-bound correction/approval/withdrawal with reason, encrypted versions and audit. Application-derived questions retain application authorization. Correction/withdrawal holds affected schedules. |
| `/admin/cbt/exams/:id/delivery` | GET/PUT | Explicit question release, UTC opening/closing windows and instructions. Questions start withheld; no question content is delivered through assignment/entry APIs. Started windows cannot be changed. |
| `/admin/cbt/batches/:id/window` | PUT | Administrator-selected closing time, duration and attempt limit. Defaults inherit examination policy; actual student deadline is clamped by both batch and global closing times. No student membership changes through this route. |
| `/cbt/assignments/:id/entry` | GET | Own instructions/window/attempt metadata only. Exact selected identity, not a generic public examination link. |
| `/cbt/assignments/:id/attempts` | POST | Allocate a real numbered attempt transactionally, within the released slot and attempt limit. Reject concurrent active attempts for the assignment/account. Freeze approved question/key revisions privately. |
| `/cbt/attempts/:id` | GET | Own current writer session; safe question projection/answers/server time/deadline. No keys or explanations. Finished attempts contain no question projection. |
| `/:id/answers` | PATCH | Revision-bound changes plus replay UUID; encrypted answers, flags and HMAC write evidence. Same UUID/body safely acknowledges a lost response; changed replay or stale revision fails. |
| `/:id/resume` | POST | Explicitly take over the writer lease in a valid own session; preserve saved answers/original deadline and record reconnection. Previous writer cannot continue. |
| `/:id/events` | POST | Replay-safe visibility/navigation/interruption/disconnection/reconnection observations with server receipt timestamps. No asserted client time or automatic penalty. |
| `/:id/submit` | POST | Atomic finalization and server marking; duplicate final submission rejected. No client score/timer/payment flag is accepted. |
| `/:id/results`, `/cbt/attempt-history` | GET | Own separately published results/history. Score, percentage, topic/category performance, unanswered items, time and revision cues; never official university grades. |
| `/admin/cbt/exams/:id/monitor`, `/:id/summary` | GET | Actual selected participation, attempts/incidents, batch counts and latest marked attempt per student aggregates. No completion notice per submission. |
| `/admin/cbt/attempts/:id/analytics`, `/:id/review` | GET/PATCH | Authorized marking review/incident note, result release or withholding. Answers/explanations require a separate explicit release after the global window closes. Default release is scores/analytics only. |

Existing M6 initial request → initial approval → full application → question review → selected scheduling remains intact; intake remains closed by default. Periodic examinations require explicit administrator planning/selection. No student callback creates examinations, scores or eligibility.

The server alone sets start/deadline/finish time and attempts. Browser countdown uses the last server sample and a monotonic clock; changing device Date.now does not grant extra time. Answers/flags are acknowledged by the backend, preserved between questions and restored after restart/resume. Rapid answer/flag changes coalesce safely, and failed acknowledgements retry the same idempotency key. Saved responses survive restarts; unsent responses cannot be guaranteed after connection loss, endpoint failure or private-view disposal. No private offline disk cache is introduced.

A different session must explicitly Resume to acquire the attempt writer lease. Optimistic revisions prevent lost concurrent updates. Expiry marks saved responses server-side; cancellation closes active attempts for review without inventing a submitted examination. Rescheduling cannot reset started/submitted evidence. Current published course access is rechecked; revoked access/held questions stops delivery while saved evidence remains private.

## Fair integrity and results

Two/three warnings remain configurable (default three). Visibility/navigation observations count warnings; network gaps/disconnections are separate. A missing heartbeat can indicate interruption, not proven network loss or misconduct. Repeated observations flag administrative review without invalidating an examination or changing scores automatically. Browsers cannot physically prevent all navigation or guarantee anti-cheating enforcement. Recovery never resets the server deadline.

Server scoring uses frozen approved keys, not browser assertions. Pending results are withheld; administrator review, publication and later withholding are actual state transitions. Post-window question/answer disclosure is separately controlled. Topic scores and below-70% revision cues are development preparation feedback, not approved pass/mastery thresholds or institutional certification. Reviewed academic owners must approve the final interpretation policy before public use.

## Community, notification and progress synchronization

One general departmental community remains; no DM/level rooms are added. Persisted message/reaction/policy/moderation/role/suspension changes advance a stream version. Visible clients poll changes every 12 seconds without overlapping requests, back off to 120 seconds on errors and stop when hidden/offline/disposed. Current server membership/open-close/chat suspension governs every write. An active draft is preserved instead of being silently replaced; the interface asks the student to refresh updates when ready. Closing never removes academic access.

Notifications poll the authenticated feed every 20 seconds, with preferences/read receipts/corrections/withdrawal/explicit expiry and cursor pagination. Expanded history is not silently discarded; refresh guidance appears for synchronization. A delivery receipt means the authorized feed response was fetched, not that a student read it or received device push. No push permission is needed for in-app delivery. Operational push is unconfigured/unverified and never claimed.

A supervised in-process five-second maintenance cycle activates due notices with current publisher checks, catches up expiry/cancellation, records actual maintenance state and expires attempts. Reads retain safe catch-up behavior. This is an actual controlled worker, not verified production task supervision. Restart catch-up uses persistent deadlines/state. Native provider/host scheduler reliability, capacity, monitoring and alerts still need operational verification.

M6 authenticated course progress/topic coverage/confidence/difficulty/priority and notification preferences/read state remain versioned private database records; another device obtains saved state through authorized reads. Local personal planner/focus tools remain independent and usable where safe. Hidden/offline/logout/401/role changes clear private views and stale asynchronous rendering. No tokens, questions, answers, private results or admin records enter service-worker caches/localStorage/static export.

## Protected resources

`GET/POST /academic/resources`, `PATCH /academic/resources/:id`, `POST /:id/file`, `GET /:id/download` extend the same course authorization/review system. Representatives submit within their level; independent reviewer approval publishes immutable metadata/file references. Corrections preserve the old approved snapshot until reviewed; withdrawal removes access. Direct Drive/Docs URLs use existing strict destination validation and remain external with their owner's sharing permissions.

Upload limits: authenticated academic-management role/MFA and rate limit before large body processing; 1 MiB decoded file, normalized ASCII basename, canonical base64, private encrypted database storage, generated opaque file ID, SHA-256 integrity, 20 MiB/course and 100 MiB controlled aggregate quota. Download authorizes current course/level and approved file reference, uses attachment disposition/private no-store/nosniff. Draft downloads require management permission.

Strict UTF-8 `.txt` content is validated for control/active content and served as a plain-text attachment. PDF headers/trailer and active features are checked, but **a configured verified scanner is mandatory**. Scanner absence/outage/rejection fails closed before persistence. Tests use explicitly synthetic scanner verdicts to exercise the boundary; no real malware-scanning service is claimed. DOCX/PPTX/archives/executables/SVG/HTML are rejected. Approved Office-format support needs real safe inspection/scanning and protected operations before launch.

## Accounts, TLS, mail and payments

Existing M5 password hashing/recovery/MFA/sessions/roles are reused. Failures 3–7 still impose 5/15/30/60 minutes/24 hours. Blocked guesses do not extend deadlines or revoke valid sessions; verified-owner recovery is independent. No claim that local rate tests prove resistance to distributed lockout/DoS.

Native controlled HTTPS accepts explicit private key/certificate files via `PHARMAIDEIA_TLS_KEY_FILE` / `PHARMAIDEIA_TLS_CERT_FILE`. Both are required together; bounded regular files/no symlinks/public paths, owner-only key permissions. HTTPS sets Secure/HttpOnly/SameSite cookies and retains exact-origin/CSRF checks; forwarded headers never grant trust. Tests perform actual local TLS with certificate verification enabled. Startup still binds loopback, requires synthetic accounts and refuses production mode. Host TLS/reverse proxy/cookie/email operations remain unverified.

No operational mail provider or credentials are configured. Existing ownership/recovery transport tests and generic failure responses remain real controlled behavior; they are not evidence of email delivery. No real account is activated.

Native Paystack adapter implements fixed HTTPS endpoint initialization/verification, bounded responses/timeouts, raw HMAC-SHA512 webhook verification, idempotent records/replay handling, amount/currency/reference/provider-ID checks and refund/reversal/dispute holds. Only test-domain responses/test credentials are allowed. Amounts come from a trusted approved server package configuration; no fees are invented and client `paid=true` cannot authorize anything. `POST /payments/webhook` is the sole signature-authenticated CSRF exception; unconfigured provider fails closed. Admin-only `/admin/payments/status`, `/orders`, `/orders/:id/verify` support controlled tests. Webhooks cannot create student records or activate eligibility; reconciliation/approved roster ownership remains a separate gate. No card data is stored.

Provider tests inject labelled synthetic transports/verdicts; actual Paystack connectivity/credentials/merchant sandbox and real email/scanner/push infrastructure were not verified. No payment or public service is activated. See [architecture decision](ARCHITECTURE_DECISION.md), [security review](SECURITY_REVIEW.md) and [M8 gates](PRE_LAUNCH_MATRIX.md).
