# M7 implementation dependencies and CBT engine gates

M6 provides real application/review/planning/batch/assignment/monitoring operations. It deliberately returns `deliveryOperational: false`; no start/answer/submit API exists. Student assignments are real plans, not operational examinations. This boundary must remain explicit until the following flows pass end to end.

## Server authority and confidentiality

1. Bind attempts to current session identity, active account, course access, exact selected assignment, approved immutable question revision and authorized slot. Deny non-members and cross-student reads/writes. Recheck revocations/holds/cancellation before every protected operation. No anonymous attendance count substitutes for a roster.
2. Use server UTC time, transactionally enforced attempt allocation and server deadlines. No local clock, client asserted score, callback or visibility boolean can create submission authority. Prevent parallel-attempt/replay/race bypass; preserve final immutable submission and marking inputs.
3. Deliver only the current authorized question projection at the permitted time, without keys, review notes or another student's answers. Keep materials/answers/results out of public paths, static exports, browser diagnostics/logs and service-worker caches. Restricted storage and operator permissions require actual host verification.
4. Implement bounded, revision-aware answer autosave with idempotent sequence handling, acknowledged persistence, reconnect reconciliation and clear unsaved/error feedback. Avoid private persistent offline question caches. Define fair recovery for lost network/power and server restarts without trusting the device clock or overwriting submitted evidence.
5. Atomically submit/expire/interruption-review transitions; define server jobs and recovery for unclosed attempts. Admin monitoring must reflect actual attempt/submission state, not a completion notification per student. Retain the M6 prohibition against planning resets of started/submitted records.

## Observable integrity and fairness

M6's pure interruption projection accepts the configured two/three warning threshold and separates visibility loss from disconnections. M7 must bind events to an authorized attempt, enforce monotonic replay-resistant event sequence and record server receipt/time/context with minimal data. Show accessible warnings; distinguish observational evidence from proven misconduct. Browsers cannot physically prevent all navigation or detect every form of cheating.

Incoming calls, accessibility tools, device failure and network changes must not automatically fail/penalize a student. Repeated visibility interruptions may flag administrative review. Define documented incident adjudication, appeal/recovery and any additional authorized action before use. Do not market browser page visibility as secure proctoring. No invasive device tracking is approved.

## Results and academic meaning

Connect reviewed/licensed questions and authoritative keys to the trusted server marker, then persist encrypted result inputs/projection. Separate total score, topic/category performance, unanswered questions, completion time, incorrect-answer review and longitudinal history from self-reported syllabus coverage/confidence. Current M6 projection's below-70% topic list is a development revision cue, not an approved pass/mastery criterion; academic owners must approve the final recommendation policy.

Only a reviewed result may be published by an authorized administrator. Students see their own published projection; protected future-bank keys are not exposed merely because a test ended. Define an approved post-exam question/answer disclosure policy. Browser tests currently use a clearly labelled test-only interruption/state fixture and trusted-result inserts; these are not evidence of working marking or examination delivery.

## Other M7 dependencies (all before launch)

- Finish every outstanding [matrix](PRE_LAUNCH_MATRIX.md) academic/glossary/planner/bookmark/flashcard/calendar/upload and account operation; obtain verified institutional content and licences rather than populating fake records.
- Complete authenticated community real-time transport/fan-out and multi-client delivery/recovery/load controls using verified hosting capabilities. Preserve one general room, administrator-controlled closed/open state, current identity and chat-only suspension separation.
- Complete notification scheduler/pagination/push opt-in, private profile/settings/progress synchronization and complete role/ownership checks across modules.
- Validate approved backend runtime/DB/transactions, production HTTPS/cookies, outbound verified email, private file storage/scanning, scheduled jobs, backups/keys/offsite retention and realistic concurrent load. Smartweb suitability is not established; do not purchase, provision or assume PHP hosting runs this Node service.
- Obtain original editorial source and review proposed interface changes before integration. Public publishing/payment verification/eligibility exports remain separately owned and must use approved provider sandbox flows first.
- Implement/rehearse migration from prior controlled schemas, all-domain deletion/retention/holds and restored-deletion replay. M6 uses existing encrypted backup/restore primitives; they are not a complete production retention programme.

M8 must verify the complete system on physical devices, independent accessibility/security review, adverse mobile-network/load scenarios, academic/rights/privacy acceptance, backup recovery and dependency remediation. None of these is post-launch scope. Real accounts, payments, production publication, paid services, DNS/hosting and deployment still require explicit authorization.
