# M6 implementation boundaries and threats

Verified start: 880f0024eefcf2beff7729dc355013ed5730ee0d on development/nipsa-student-platform; clean tree. Main remains 92d890a39d9ac056d81e758ebeafb9b96ed781e0. No AGENTS.md was found in the workspace. M5 baseline is run before changes. Existing native Node/SQLite account service is extended, not replaced. All records remain synthetic in isolated tests; production mode/listening and real activation remain blocked.

Priority threats: cross-level/object access, self-approval and stale revisions, revoked grants/sessions, notification audience tampering and spam, replayed chat writes, moderator impersonation, unsafe content/URLs, CBT intake bypass, premature application/question/result access, batch membership/capacity/concurrency attacks, malicious documents, audit failures and sensitive offline data.

Controls: current server identity on each request; fresh MFA for management; transactions and revision comparisons; published academic snapshots separate from drafts; scoped recipients and current course access; opaque IDs and idempotent message creation; safe DOM text; bounded validated JSON documents stored privately/encrypted rather than arbitrary binary uploads; explicit selected student batches; private question keys/results; no student-facing delivery engine in M6. No client completion callbacks may manufacture results or notifications.

One departmental community is retained. The approved roadmap explicitly forbids level chatrooms and direct messages. Read-only history remains available when posting is restricted; protective reporting and authorized moderation remain available. Messages/replies/reactions/edits require the actual posting gate and current account privileges.

Protected account modules are served by the existing backend and mounted into the existing PWA routes. They are not copied into the public export or offline shell. Clear private views on hidden/logout/revocation, reject stale async rendering and perform no background polling while hidden. Offline personal M4 tools remain independent. No new paid service/dependency, deployment, DNS, hosting or main changes are authorized.
