# Academic progress and notifications integration contracts

M4 implements independent tab-memory tools and input/rendering validation. **No endpoint below is live.** Client metadata/roles/level fields are not authorisation. Future server checks are required even when local validators pass. Use versioned schemas, UTC timestamps, opaque IDs, bounded pagination and error envelopes with correlation IDs, without confidential payload logging.

## Academic hierarchy and progress

Hierarchy: assigned academic level → reviewed session → semester → course → syllabus/topics/subtopics/materials. The developer workbench validates proposed context, categories, sources and same-context schedule conflicts, but marks everything local/unreviewed. Student personal outlines are separate, non-confidential labels in tab memory. No official curriculum is seeded and no public static file contains private materials.

- `GET /api/v1/academic/courses?session=...&semester=...`: current approved account, server-derived level, reviewed publication state, course object permission. Parameters filter only within authorised scope; no cross-level visibility.
- `GET /api/v1/academic/courses/{id}`: source/version/description/units/session/semester, approved syllabus, hierarchical topics, rights-reviewed resources, announcements/schedule/deadlines. No unpublished files or answer keys.
- Representative writes: explicit level-wide grant covering the actual course, review/version checks, source/rights validation, transactional schedule conflicts and audit. Student/executive position strings cannot grant these rights.
- `GET/PATCH /api/v1/me/progress/{courseId}`: own student identity only; course/level access and topic/syllabus revision checks. Client sends bounded topic state, never a student ID or computed grade. Server calculates coverage independently, rejects unknown IDs/stale versions and records changes safely. Sync conflicts use server revision/ETag and explicit reconciliation; never silently overwrite another device's changes.

Separate measures: (1) syllabus leaf-topic coverage, (2) self-assessed understanding, (3) reviewed practice performance, (4) authorised CBT results. Parent topics are not double counted with their subtopics. Confidence and completion are not evidence of mastery. Overall coverage weights topic counts, not an average of percentages from differently sized courses. Zero topics means no coverage value, not a fabricated 0% assessment. Question outcomes must derive from actual approved attempts; no browser score claim is official.

Private progress is never exported into public JSON or shell caching. Until secure APIs exist, current local outlines/tasks/receipts clear on reload. Only the pre-existing allowlisted avatar ID may persist after opt-in. Future local persistence of protected course/progress data needs a separate privacy review, logout/retention design and explicit consent where applicable.

## Notification envelope and delivery

Fields: ID, revision, title/message, public sender name and verified position, immutable server actor/audit reference, scope (`all`, assigned `level`, authorised `course`), priority, publication time, optional server scheduling, correction/withdrawal state and server-owned recipient rights. Future API schemas must distinguish public attribution from the authenticated actor. No live sender identity is invented in M4; synthetic fixtures exist only in test tools.

- `GET /api/v1/me/notifications`: server selects all-student plus authorised assigned-level/course/admin notices. No caller-controlled student/level grant; filter/search is applied inside that recipient set. Do not send inaccessible drafts/scheduled content and rely on the browser to hide it.
- `PUT /api/v1/me/notifications/{id}/receipt`: own receipt, current recipient permission and notice revision; CSRF/rate limits and idempotency. Corrections with new revisions require a new receipt. No cross-student receipts.
- Publication/correction/withdrawal/schedule endpoints: explicit current permission; CRs limited to their assigned level/courses; all-student and administrative messages need separate grants. Audience, sender entitlement and actor are verified server-side. Course IDs must belong to the permitted level; a hidden control is irrelevant.
- Scheduling: trusted server clock/task runner with job ownership, retries/idempotency, approval and failure monitoring. The client never publishes by changing its clock.
- Audit actor, target opaque ID, scope, revision, action, timestamp and reason; protect content/PII and logs. Withdrawn content must no longer be delivered as active; retain required restricted audit history under policy.

The current local inbox checks consistent metadata, bounded counts, revision ordering, literal search, priorities, reading state, publication time and withdrawals. These are functional UI/data tests, not sender verification, scheduling or secure delivery. Empty states remain truthful. Session-only preferences prepare future integration; mandatory security/administrative notices cannot be suppressed. Browser push is opt-in, with scoped subscriptions, revoke/expiry support and generic lock-screen payloads; no permission is requested or push activated in M4.

## Required server/security acceptance

Every 100/200/300 and role combination; cross-course/student IDOR; stale/revoked rep grants; forged attribution; CSRF/injection/rate limits; scheduled/private leaks; correction/withdrawal races; receipt ownership/version conflicts; offline/private-cache exclusion; authenticated cross-device sync and logout. Future upload controls need byte/signature/container/size validation, malware scanning, private storage and safe authorised downloads; M3 descriptor validation alone is insufficient.
