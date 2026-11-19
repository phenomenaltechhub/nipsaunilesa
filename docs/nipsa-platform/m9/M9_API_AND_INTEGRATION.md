# M9 integration and maintenance

This extends the existing Node/SQLite service. The public Next.js export, GitHub Pages workflow, website branding and separate Editorial source are unchanged. No provider, second database or framework was added. Empty databases contain no invented courses, scientific definitions, students, questions or transactions.

## Website catalogue

Migration 008 stores only validated public metadata in the existing private database: fixed source URL, canonical destination, ID/type/title/description, actual optional publisher revision/sequence, content digest, accepted ETag/Last-Modified, validation time, per-item withdrawal and bounded version history. SQLite transactions include the audit entry; failed writes never update the in-memory representation. Existing private file permissions and encrypted backups cover these tables. A file snapshot was rejected because it would add a separate atomicity/backup/locking mechanism.

Source remains `https://nipsaunilesa.com.ng/pharmaideia-content.json`; version 1 public feed validation is shared with the existing consumer. `sourceRevision` and positive integer `publicationSequence` are optional **actual producer values**, not values invented by this consumer. Version is SHA-256 of the normalized items. No outbound publishing, GitHub write or arbitrary-source fetch is enabled. The private authenticated response adds `catalogueStatus` and per-item freshness; remote producers cannot assert these states themselves.

| Representation | Server/UI behavior |
| --- | --- |
| Never validated bundle | Unverified; source status explicit; not called live |
| Valid persisted representation after boot | Cached; preserved validation timestamp; never automatically current |
| Accepted 200 or matching conditional 304 | Current for configured freshness window (15 minutes default, allowed 1–60 minutes) |
| Freshness expires, source fails or goes offline | Keep last-good public metadata, display cached/may-have-changed and unreachable/blocked source state |
| Item omitted by accepted complete feed | Retain historical title/label and withdrawal date; no clickable destination |
| Unknown/corrupt item or corrupt cold representation | No invented destination or fallback resurrection; full validated 200 needed for recovery |

304 requires an accepted matching ETag **and** intact persisted body/version. A changed content version cannot replay an earlier accepted version or older generation time unless an explicitly higher actual publication sequence authorizes republishing. Once a sequence exists, it cannot disappear or decrease, including when item content is identical. Renames preserve historical message labels and expose the current known title. Previously referenced withdrawn items may remain intelligible during edits but cannot be newly selected as valid destinations.

Limits: 1 MiB feed/snapshot, shared item-count limit, 5,000 retained IDs, 256 distinct content versions and 8 MiB durable item payloads. Exceeding a limit rejects the refresh and exposes a safe diagnostic code; it does not erase tombstones. No automatic compaction policy is authorized. Five-second timeout, single-flight fetch, fixed-origin HTTPS/no redirects, streaming bounds, search throttling, retry/backoff and stop-on-403 remain enforced. Administrative diagnostics expose counts/states and safe errors, not credentials or private records. Real publication, source revision commitment, ETag behavior, monitoring and compaction approval remain external gates.

## Academic tools

Migration 009 links all private course tools to the existing reviewed course publication/access model. Endpoints use the existing session cookie, CSRF/origin checks and per-request account/role/MFA revocation. Nothing is shipped in the static export or service-worker precache.

| Endpoint under `/api/v1` | Access / contract |
| --- | --- |
| `GET /academic/calendar[?courseId=&from=&to=]` | Current user's reviewed courses/level/selected-course grants; bounded date period |
| `GET /academic/calendar?manage=true&courseId=` | Current scoped manager or fresh administrator; includes withdrawn entries |
| `POST /academic/calendar`, `PUT /academic/calendar/:id` | Course ID, kind (`class`, `assignment`, `deadline`, `event`), bounded title/description, UTC ISO start/end, HTTPS source; update requires revision |
| `DELETE /academic/calendar/:id` | Scoped authorized withdrawal with revision, version history and audit |
| `GET /academic/calendar/export` | Own authorized calendar only; escaped ICS download, no student identity fields; downloaded copy is user's responsibility |
| `GET /study/content[?courseId=&kind=&q=]`, `/study/daily` | Published reviewed content only; practice answer keys/explanations omitted before an authorized answer check |
| `/study/manage` GET/POST; `/:id` PUT/PATCH | Same course-level management/review, global glossary restricted to fresh administrators; draft → submit → independent review → publish/revise/withdraw; versioned corrections retain previous publication until reviewed |
| `PUT /study/content/:id/bookmark`, `POST .../visit` | Own bounded bookmarks/recent history; revoked/withdrawn content disappears from projection |
| `POST /study/content/:id/practice` | Own authenticated idempotent request ID, current published revision and answer; server checks answer; practice feedback stays distinct from protected CBT/official grades |
| `/study/bookmarks` GET/PUT | Own current-access topic/resource bookmarks; never authorizes access to archived content |
| `/study/plan` GET/PUT | Own encrypted revision plan; existing 30-task validation reused; optimistic revision conflicts fail explicitly rather than overwrite another device |
| `/study/preferences` GET/PUT | Existing 20 approved avatar IDs and allowlisted theme; optimistic version; no name/level/role self-assignment |

Schedule conflicts reject overlapping classes within a level. Sources are labelled administrator/representative maintained, not implied university certification. UTC inputs and localized displays are explicit. Timetable week/agenda controls and private ICS export, course Schedule/Revision tabs, flashcard reveal, server-marked practice, bookmarks/recent links, dashboard entries and searchable reviewed glossary use these real APIs. The UTC daily term identity is fixed for the day; an independently approved correction updates its reviewed definition, and withdrawal hides it instead of silently substituting another term. Content review/licensing and actual schedules remain academic-owner responsibilities.

The default personal tab planner/focus remain unchanged and usable offline. An explicit Open account study plan action reuses the original components in a separate authenticated view. Save is explicit; saved plans synchronize; unsaved account edits stay in this tab across navigation until reload/sign-out. Optimistic conflicts never overwrite another device; reloading a saved plan is an explicit discard action. Account plans are removed from the DOM on session/offline disposal, never copied into the offline personal shell and never put in localStorage; drafts are memory-only and cleared on account change/logout/revocation. Theme is applied in memory and device appearance restored on disposal; account appearance does not claim to overwrite every separate device preference.

## Support, activation and trial boundaries

Migration 010 preserves existing grants while adding a constrained `support` role. `support.manage` and fresh MFA authorize claiming/reading/replying only to an assigned assistance case. This grants no report moderation, student administration, official Admin sender, academic publication or CBT authority. Role removal revokes sessions immediately. Only a fresh administrator can reassign a case, with version checks, current eligible target and an audit record. A requester cannot assign/claim their own assistance case. Confidential reports remain administrator-only. `/admin/community/support` supplies a paginated metadata queue/eligible assignees for the existing moderation panel. Private inbox paging replaces the old latest-100 cutoff without granting broader private-message access.

Optional activation batches contain **existing** pending, dues-verified synthetic registrations. New batches are closed. Admin endpoints `/admin/activation/batches`, `/:id` and `/admin/activation/policy` require fresh MFA, exact selected accounts/time window and optimistic revisions. The creation endpoint allows a bounded 64 KiB roster only after fresh administrator authorization and a 10/hour actor limit; other JSON bodies retain their existing limits. A real controlled 500-record selected-roster test passes; this is not a concurrent-user capacity test. Batch policy does not create payment evidence. When enabled, both proof issuance and proof completion enforce membership/open state; closing a batch invalidates further activation completion. Public responses remain generic. Existing individual activation remains the default unless an administrator explicitly enables batches. No real registrations are imported.

Trial tables are private, test-only and time-bound. See [trial plan](M9_CONTROLLED_LIVE_TRIAL_PLAN.md). The backend still refuses production mode, real email domains and non-loopback listening. Hosted previews require separately reviewed infrastructure and approval. No real accounts/payments or outbound email are enabled.

## Maintenance and recovery

Run migrations through existing startup, never by editing applied migrations. Versions 001–007 remain byte-for-byte unchanged. Review disk usage before lifting quotas. Keep private catalogue and application records out of `public`, `student-pwa`, `out`, design-review assets and logs. Static code/art may use gzip; HTML and dynamic JSON remain uncompressed to avoid combining secrets and reflected content. Private API/static-module cache boundaries remain no-store. Lazy imports load only the active authenticated workspace.

Startup runs existing Community/temporary-thread cleanup before opening the listener. A restored snapshot therefore cannot briefly serve expired DM content while waiting for the periodic worker. This is **not** complete production deletion/role-revocation replay: restore still requires a trusted latest security/hold/deletion record and an operator quarantine procedure. Never expose an old restored database to users merely because integrity/audit verification passes. Offsite custody, key rotation, financial/legal retention, backup expiry, RPO/RTO and recovery ownership need institutional decisions.


| Retention category | Current controlled behavior / remaining owner decision |
| --- | --- |
| Ordinary group history | No newly imposed expiry; DOM capped at 300 while persisted history remains paginated; moderation history/access policies retained |
| Temporary DMs | Pending expiry and 24 hours from acceptance; message payload removed when expired/blocked/closed; terminal metadata purged after seven days; logical deletion cannot erase screenshots/backups |
| Support cases | Separate from temporary DM; closed cases normally retained 90 days; open report holds prevent cleanup, final hold resolution extends review retention; no silent normal-history purge |
| Confidential reports | Restricted encrypted snapshots; resolved private reports removed after controlled 90-day period; actual legal/hold policy needs institutional approval |
| Group images/uploads | Unreferenced Community images cleaned after one hour; referenced images/materials follow existing owner/access/retention, not a blanket short lifetime; scanning/storage acceptance remains required |
| Personal study state | Own records/cascades and encrypted plan; explicit account-deletion/financial separation retained; institutional deletion/export and backup replay policy still open |
| Audit/financial records | Append-only audit and separate financial records preserved; no deletion simply because a student graduates; final lawful retention/key custody/offsite anchoring requires owner decision |
| Catalogue history/trial files | Bounded public metadata retained until reviewed compaction; isolated trial TTL/revoke/explicit destroy is separate from all production retention categories |
