# M3 academic models and integration contract

Status: independent models/validation and a local developer workbench implemented. No student records, private materials, institutional course catalogue or official schedule is bundled. No academic write/read API is operational. An HTTPS reference is not verification. All prepared records have a derived `local-unreviewed` state which callers cannot set to approved through input fields.

## Reusable metadata

- Course: short normalised code, title ≤120 characters, proposed integer units 0–10, proposed level 100/200/300, optional description and HTTPS evidence reference. Bounds are preparation policy, not a statement of official university course rules. Duplicate code/level proposals are rejected.
- Resource: existing local course ID, title, category (lecture notes, presentations, practical materials, past questions, assignments, revision, syllabus, related links), description and direct Drive/Docs URL. Categories organise individual courses; no separate level PWAs.
- Schedule/deadline: existing local course ID, title, class/assignment/examination/activity kind, valid date, start/deadline time, optional end and HTTPS source reference. Classes/exams require same-day end after start. Overlapping classes/exams within the same proposed level are rejected, including across courses. Deadlines are non-blocking. These local checks do not enforce server level permissions.
- File descriptor: plain bounded filename, declared MIME/extension consistency, positive integer bytes ≤10 MiB for PDF/PPTX/DOCX metadata. This does **not** inspect bytes, containers, file signatures, malware or actual permissions. No file picker/upload endpoint is enabled. Server storage must generate opaque object keys rather than trusting a filename.

Only explicit documented fields are accepted. Unknown approval/role flags are rejected as schema violations, not as proof of working RBAC. The store starts empty, returns defensive snapshots, caps 20 courses/80 resources/80 events, and exists only in current-tab memory. Removal affects local dependent metadata only; no institutional records are deleted. Nothing is persisted or submitted by the workbench.

Drive/Docs links use exact hostname/path checks, HTTPS, no credentials/unsafe ports/encoded controls, canonical direct paths and only a bounded resource-key argument where supplied. Tracking/redirect arguments are discarded. Links are labelled external and open with `noopener noreferrer`. Publicly shared Drive links remain public; this app cannot impose confidentiality on them. Rights and actual access must be reviewed separately.

## Future authenticated API boundary

Candidate `/api/v1/academic` contracts, after hosting validation:

| Operation | Required server checks | Response / failure requirements |
| --- | --- | --- |
| List courses and course resources | Current session, account approval, assigned academic level, object scope | Paginated reviewed records only; no cross-level leakage; generic forbidden/not-found handling |
| Propose/update course information | Explicit representative grant for assigned level or narrowly authorised administrator; derive scope from session | Reject unknown fields/invalid version; author/actor audit; do not trust body level or client approval flags |
| Add/replace/archive resources | Course/level permission, rights/source review, canonical external URL or secure file pipeline | Preserve revisions/last-updated/source, archive safely, audit replacement; no public private-file URLs |
| Schedule classes, assignments, deadlines/exams | Current level/course grant; timezone/session/date rules; conflict validation in a transaction | Explicit official-versus-representative provenance; conflict response; no client-only conflict guarantee |
| Private file upload/download | CSRF, rate limits/quotas, server size/signature/container checks, malware scan, private storage and object authorisation | Scan/quarantine before availability, safe names/types/download headers, short-lived authorised delivery if supported |
| Approve academic content | Separately granted reviewer permission; current revision and evidence | Durable actor audit and approval workflow; frontend state cannot approve |

Envelope: schema version, opaque IDs, server revision, UTC timestamps plus validated institutional timezone/session metadata, review/source provenance and audience. Dates displayed from the current public timetable are device-calendar dates, not official university entries. Timezone/session/units/upload limits must be institution/host approved before live use. Server data must be revalidated regardless of browser checks; strict session cookies, CSRF/CORS, rate limits, audit and immediate grant revocation remain required.

No real user identity, role, grade, matriculation identifier or payment information is collected by these components. End-to-end permission, upload/malware and institutional publishing tests remain blocked on real infrastructure; metadata unit/browser tests do not establish them.
