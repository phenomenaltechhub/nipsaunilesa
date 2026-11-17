# CBT and general community — complete before launch

M4 status: architecture/policy only, no operational engine or messaging service. Both are **mandatory pre-launch deliverables**, not post-launch work. M6 builds complete interaction/review components; M7 implements secure server storage/delivery/administration; M8 validates end to end. Missing infrastructure blocks launch. No real student, question, answer key, application or result is in this public repository.

## CBT programme and intake

Purpose: approved pre-semester-examination assessment, not routine mid-semester testing. Administrator controls initial-request intake OPEN/CLOSED on the server, with audit. Students and level representatives may submit initial requests within their verified authority. Initial approval permits a full application, not an examination or role grant.

Candidate lifecycle: Requested → Initial Review → Rejected / Approved for Application → Application Submitted → Academic Review → Approved / Revisions Requested → Scheduled → Completed / Cancelled → Archived. Use separate request/application/examination entities with versioned server transitions; enforce actor/scope, idempotency and audit. A browser status flag cannot advance a state.

Full applications include approved downloadable blank templates, securely uploaded completed documents, course/topic proposals and rights-reviewed question submissions. Final templates/form fields need institutional approval; none is fabricated as an official form in M4. Uploads require authentication/object ownership/CSRF, bounded MIME/extension **and actual byte/container inspection**, malware scanning/quarantine, opaque storage names, private originals, safe downloads and retention. Do not bundle private submissions or question banks into static files. Academic reviewers approve question correctness, provenance/licence, syllabus/topic mapping, difficulty policy and version; author and approver are separately audited.

## Examinations, selected students and fixed batches

Entities: reviewed question-bank revision; exam/syllabus revision; server schedule and timing policy; fixed-capacity batch; explicit eligible student memberships; attempt; ordered delivered question set; versioned answers/acknowledgements; submission; result; incident/review. Administrators select actual authorised students and batch capacity. No public enrolment or caller-selected batch membership.

Every exam/question/answer/result request checks the current approved session, exam/batch membership, time window, attempt state and object ownership. No out-of-batch student gets question content, even if an ID/URL is guessed. Course scope and membership must survive grant/suspension changes according to the approved exam-continuity policy. Use opaque IDs, not identities in URLs. Sessions use secure cookies; protect writes with CSRF and narrow CORS/rate limits.

The server is authoritative for start/deadline, attempt count, question versions, answer version and submission. Starting uses a transaction and uniqueness constraints, so refresh/multiple tabs/races cannot create extra attempts. Question payloads contain only authorised questions/options, never answer keys or scoring rules that disclose answers. Do not preload other batches or full banks. Secure delivery/confidentiality cannot rely on browser obfuscation.

Autosave: bounded response updates per attempt/question, monotonically increasing revision and idempotency key, server acknowledgement and conflict response. Retried/reordered saves must not overwrite a newer answer. Submission atomically freezes the accepted revision; retries return the same result. Recover to the last server-acknowledged state after reconnect/session renewal. Keep transient pending changes in memory, not public caches/localStorage. Network loss does not grant client control of time; any accommodation follows reviewed policy and administrative audit. Clear private exam state on appropriate logout/expiry, while explaining recovery outcomes.

## Administrative monitoring

An authenticated admin dashboard automatically refreshes authorised batch participation, active/awaiting/submitted counts, save health, completion and incidents using a bounded event/polling channel. Final cadence/capacity requires validated hosting/load tests; avoid unbounded per-student polling. Individual submission notifications are unnecessary and are not the design. Student identity/result visibility is limited to permitted exam staff; aggregate public statistics must not leak identities or small-group results.

## Page-visibility policy and fairness

Browsers cannot physically prevent all navigation, screenshots, calls, device failures or cheating. Observe real visible→hidden transitions where supported, not every focus/blur event. Debounce duplicate/lifecycle events and retain a small bounded event queue with timestamps and reconnect state; client events are untrusted signals. The approved policy must define what counts as one interruption and how genuine disconnects, accessibility tools, OS calls/backgrounding and device failures are reviewed.

Intended sequence: first qualifying interruption → warning; second → stronger warning; third → administrative incident flag and **only additional action explicitly permitted by the reviewed examination policy**. No automatic grade penalty, accusation, forced submission or exclusion merely because the third event occurs. Provide accessible text warnings, acknowledgement, reporting/appeal and an administrator review trail. Do not require invasive device tracking, camera/audio or unrelated device permissions. Server timing/attempt controls remain effective even when client visibility events are missing or forged.

## Results and revision recommendations

Automatic marking uses reviewed server-side keys and versioned rules, tested against independently approved expected results. Preserve question/review/scoring revisions and authorised corrections. Results are private to the student/permitted administrators. Course/topic weakness summaries show actual sample counts, uncertainty and assessment provenance; they do not treat self-reported coverage as mastery. Personal revision recommendations reference reviewed topics/resources and approved rules, not invented medical claims/questions. Retention/deletion/access and appeals require institutional policy. Private results/keys never enter public exports, logs, static assets or lock-screen notifications.

## General departmental community

Exactly one authenticated departmental group, not level chat rooms. Required components: message composition/history, verified registered sender name/level/positions, swipe reply/quoted reply, mentions, reactions, profile/member/group information, reporting and authorised moderation. One account may hold several verified positions without duplicate identities. No audio calls or Pharmily AI are in scope.

The final service starts CLOSED as an **administrative restriction on a completed implementation**. Authorised PWA administrators can OPEN/CLOSE any time; server checks current status on every send/edit/reaction as policy defines, including stale sockets and REST fallbacks, and atomically records responsible actor/reason/time. Chat-only suspension/reinstatement is separate from academic access/account suspension. Validate reply/message/mention membership and permissions, plain text/sanitised content, size/frequency limits, pagination, moderation scope and retention. No browser role switch/hidden button grants permission.

Transport/real-time hosting is unprovisioned. Smartweb shared hosting must not be assumed to support persistent connections or particular entry-process capacity. Validate capability/cost first; external real-time infrastructure may be needed. No public fake message/member records or browser-only administrative toggle is substituted for secure implementation.

## Required M7/M8 adversarial tests

CBT: cross-student/batch/course attempts, concurrent starts/capacity limits, server clock manipulation, replay/reordered answer saves, submit/save races, network recovery, expiry/logout, private question/result/cache/log leakage, file spoofing/bombs/malware, question-review bypass, scoring revisions, interruption fairness/accessibility, polling/real-time load and audit integrity.

Community: write while closed via stale client/socket/API, forged sender/role/mentions, cross-member object access, current suspension/revocation, close/send races, flood/spam/injection, report/moderation scopes, recovery/retention and proof academic access survives chat-only sanctions. These require an actual secure test backend; M4 local UI/unit tests do not establish them.
