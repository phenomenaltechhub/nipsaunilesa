# M6 controlled API and integration contract

Implementation: `backend/src/operations/`, using the same M5 `AccountService`, SQLite connection, session cookie, CSRF, validation, audit and errors. Base path `/api/v1`. This is real isolated HTTP/database behavior, **not a production endpoint**. Startup remains loopback/synthetic only. No Next.js server route or GitHub Pages backend is added.

## Shared rules

- Every protected operation derives identity, current status, academic level and current active grant from the server session. Client IDs/audiences/role controls never grant permission. Level/source/object validation occurs before exposure; non-owned student objects generally return 404.
- Writes require same-origin JSON, the existing CSRF token, valid session and applicable current permission. M5 network/global/account limits remain; new per-action spam/duplicate bounds are added. HTTP JSON body maximum is 16,384 bytes. No permissive CORS or redirect is added.
- Administrative actions require the existing fresh MFA policy; CR/reviewer/executive management also uses the service's current scoped-grant/MFA checks. UI visibility is only convenience. Session/role revocation affects the next protected request.
- Mutations use existing transactional audit and optimistic `revision`/`version` checks. Conflicts return 409 with refresh guidance. Prepared SQL statements and bounded plain text are used. Logs/audit store action, opaque target, scope/revision/count rather than message bodies, question keys or passwords.
- Responses and protected online modules are `private, no-store`. The browser holds protected records in memory only. Bootstrap state contains no student record. Logout/role changes/offline/hidden transitions clear private DOM and invalidate late async renders; the public service worker never caches authenticated routes, APIs or online modules.

## Implemented route groups

| Route (relative to base) | Methods | Authority and behavior |
| --- | --- | --- |
| `/academic/courses`, `/academic/courses/:id` | GET | Current student level plus course audience; published snapshot only. |
| `/academic/manage`, `/academic/manage/:id` | GET/POST; GET/PUT/PATCH | Assigned level and academic permission. Author/admin edit; submit/review/publish/withdraw state machine. Reviewer needs explicit `academic.review`; author and last editor cannot publish own work. |
| `/admin/academic/catalogue`, `/admin/academic/:id/candidates` | GET | Fresh-MFA admin; candidates paginate 50 at a time, current eligibility shown. |
| `/admin/academic/:id/access` | PUT | Admin, revision-bound; level-wide or explicit active same-level roster. Controlled selected roster limit 300; this is a bounded operation, not a total account limit. |
| `/academic/courses/:id/progress`, `/academic/progress-summary` | GET/PATCH; GET | Session owner's records only, current course access. Topic coverage/confidence/revision/difficulty/priority and per-topic version. No caller account-ID override. |
| `/notifications`, `/notifications/preferences` | GET; GET/PUT | Current recipients only; own preferences/read state. Normal optional notices respect preferences; administrative/important/assigned CBT notices remain available. |
| `/notifications/manage`, `/notifications/manage/:id` | GET/POST; PATCH | CR: own assigned level/course; executive: explicit publishing grant; admin: oversight. Existing author or authorized admin correction/withdrawal; history records actual actor separately from public sender. |
| `/notifications/read/:id` | PUT | Current recipient only; read receipt binds current revision so corrections can be unread. |
| `/community/status`, `/community/messages`, `/community/members` | GET; GET/POST; GET | Authenticated active members; 30-message cursor pages, 50-member pages without emails. Closed state still exposes permitted history/member info. Posting requires open gate and no chat-only suspension. |
| `/community/messages/:id`, `/:id/reaction`, `/:id/report` | PATCH; PUT; POST | Owner timed correction/removal; own allowlisted reaction; bounded report. Posting gate applies to message/reaction/owner edits. Reports remain possible while closed. |
| `/admin/community` (existing), `/admin/accounts/:id/chat-suspension` (existing) | PATCH; POST | Admin controls open/closed and chat-only suspension without redeploy; academic access is independent. |
| `/admin/community/reports`, `/admin/community/reports/:id` | GET; PATCH | Admin, revision/decision/reason with audit; dismiss or remove reported content. Removed quotes cannot leak old message text. |
| `/cbt/policy`, `/admin/cbt/policy` | GET; PUT | Members see current intake and warning count; admin changes revision-bound policy. Intake starts closed, delivery flag false. |
| `/cbt/requests`, `/cbt/requests/:id` | GET/POST; GET/PATCH | Own current-level/course preliminary requests and clarification. Admin sees review queue; request does not create an exam. |
| `/admin/cbt/requests/:id/decision` | PATCH | Admin decisions: initial approval, clarification, application approval/revision, reject, close, withdraw, reopen. Every decision has reason/history/audit. Reopen restarts initial review, not automatic stage-two authorization. |
| `/cbt/requests/:id/template`, `/:id/application`, `/:id/document` | GET; GET/POST; POST | Specific initial approval + ownership (or admin review). Template/form or strict protected JSON document. Not a public upload endpoint. |
| `/admin/cbt/requests/:id/questions`, `/admin/cbt/questions/:id` | GET; PATCH | Admin only; encrypted candidate question review and individual authorization. Student assignment API never returns questions/keys. |
| `/admin/cbt/exams`, `/admin/cbt/exams/:id` | GET/POST; PATCH | Admin plan/schedule/reschedule/cancel. Authorized reviewed blueprint + active explicit students required before scheduling. Course withdrawal holds dependent plans; intake/request withdrawal cancels dependent authorizations. |
| `/admin/cbt/exams/:id/blueprint`, `/:id/batches` | PUT; POST | Admin, revision-bound. Explicit student IDs, capacity, date/slot conflicts and same-level/course eligibility checked transactionally. |
| `/admin/cbt/exams/:id/monitor`, `/:id/analytics` | GET | Admin DB-derived selected participant state and reviewed aggregate records. Visible monitor refreshes every 20s. No per-submission notification. |
| `/admin/cbt/results/:assignment` | PATCH | Admin may publish only an existing trusted reviewed result; never creates a score from a client assertion. |
| `/cbt/assignments`, `/:id/results`, `/cbt/results` | GET | Own assigned batch/schedule and separately published result/history only. Unauthorized assignments/results are inaccessible. |

## Academic and content states

Course context is immutable: level → session → semester → code; details/topics/resources may be corrected. Draft → submitted → published or revisions; withdrawal removes student exposure. A previous approved snapshot remains visible while an updated draft is reviewed. Topic ancestry rejects cycles/missing parents. No official courses, lecturers, schedules or definitions are seeded.

Coverage counts leaf topics; confidence, difficulty and priorities remain separate self-reports. Practice/CBT achievement does not follow from ticking coverage. The same M4 model is reused. Stale progress updates fail rather than silently overwrite another device. Local personal outlines/planner are not automatically imported as official course content or authenticated records.

Notification scheduling is **lazy activation on feed/management access**, rechecking the actual current publisher and course; it is not a background cron delivery guarantee. Read/history/preferences persist. Original sender and correction publisher remain distinct. Full feed pagination, operational scheduled jobs and optional consent-based push belong to M7. No device permission is requested in M6.

Community remains exactly one general department space, following the established implementation document. Closed chat is an enforced permission state. No unapproved level rooms/direct messages are added. Writes accept client request UUIDs for replay safety, never a claimed sender. Eight messages/minute and 60/hour plus duplicate checks bound controlled posting; global/network limits also apply. Real-time fan-out/load/reconnection and operational retention still require M7/M8.

## Application documents and examinations

The downloadable application is schema version 1 JSON: approved course/topic IDs, source URLs, proposed date, duration, expected participants, instructions and optional question candidates. The form uses the same server validation. Document submission allows only normalized `.json` names, `application/json`, canonical base64, **1–10,000 decoded bytes**, valid UTF-8, strict fields and bounded reviewed topic/source/question structure. No archive, HTML/SVG, PDF/Word, executable or arbitrary binary is accepted. No supplied filename becomes a storage path. Original application/question/result payloads use the existing authenticated encryption helper and private database; raw uploads are not served as public files. Broader document formats require protected storage/content inspection/scanning and separate tests in M7.

Batch capacity is configurable 1–200 in the controlled implementation; expected participants may be larger and split into explicit batches. This is not a claim that shared hosting supports 200 concurrent exams. Assignments identify actual authorized account IDs. Course/session eligibility is rechecked at planning, schedule and student reads. Started/submitted records cannot be reset by rescheduling. No student start/answer/submit route exists; unsupported delivery calls fail closed. Result tests insert explicitly labelled synthetic trusted-engine output to verify confidentiality/publication contracts only. See [M7 engine gates](M7_ENGINE_REQUIREMENTS.md).

The existing encrypted backup/restore, audit-chain and account-deletion machinery remains. M6 adds message tombstoning and request/exam cleanup, but complete migration-upgrade rehearsal, restored-deletion replay, institutional retention/holds and all M6 domain deletion semantics require M7/M8 acceptance before real records. Financial retention remains independent.
