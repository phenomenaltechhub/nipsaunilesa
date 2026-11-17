# System ownership and future integration contracts

Prepared, not connected. No backend endpoints, staff/student accounts, emails or live payment pages are activated. The independent editorial source is unavailable; this is an integration contract, not a claim that it was imported.

| Information/action | Owner | Consumer | Current status |
| --- | --- | --- | --- |
| Public announcements, news, memos, events, opportunities | Editorial | Website; selected official PWA feeds | Existing website TypeScript data; editorial connection source-blocked |
| Public resources, Ads packages/review/expiry, gallery albums/media and approved executive details | Editorial | Website and selected PWA public views | Existing public site preserved; remote workflows planned |
| Precise Campus Navigator records | Editorial with reviewed evidence | Website | Existing preview preserved; no invented records/coordinates |
| Courses, level timetables, deadlines, restricted materials | PWA academic management | Assigned students and level representatives | Infrastructure-blocked; no protected content in static assets |
| Student identity, activation, roles, access and chat control | PWA administration | PWA | Contracts only; not delegated to every executive |
| Dues payment/provider record | Paystack + authorised reconciliation | Future activation roster | Hosted page requires separate approval; no page is activated |
| Notifications | Editorial owns public source; PWA owns targeting/delivery | Authenticated student feed | No parallel public-content editor; selected PWA publishing grants required |
| General community | PWA administration + approved moderators | One authenticated departmental group | Closed/unavailable; real-time service not provisioned |

## Common API envelope and enforcement

Proposed same-origin `/api/v1/` behind the future app host; confirm Smartweb routing before finalising. Use TLS, server sessions, CSRF protection for writes and strict input/schema bounds. The browser supplies no authoritative student ID, level or role. Return generic availability/auth errors; use opaque IDs, pagination, revisions/ETags, server timestamps and correlation IDs without private payload logs. Reject forbidden cross-level/cross-owner reads and writes before data is returned. No endpoint is implemented in M1.

Service modules: authentication/sessions; student records; scoped roles; academic levels/courses; schedules; materials/private downloads; notification targeting; public gallery metadata; Ads reviews; payment reconciliation; audit; community; secure uploads; scheduled jobs. Split operational permissions rather than making positions universal administrators. Define authenticated admin APIs separately from public published snapshots.

## Dues → reconciliation → activation

Dues registration is payment plus approved minimum details, **not** another membership test; no email OTP and no registration batches. An approved Paystack-hosted page can collect fields without storing secret keys in a static site. The unlisted website information route is planned; it must not imply that hiding its navigation is access control. Disclose policies, data use, applicable charges and amounts before checkout. Do not publish registrations.

Protect successful-registration exports at the provider/authorised storage. Reconciliation must verify the actual provider record and expected merchant/reference/status/amount/currency, reject disputes/reversals and handle duplicates idempotently; a callback, screenshot or claimed paid boolean is never sufficient. Import only approved fields through an authenticated operation; keep provider references protected and avoid redundant copies of personal information. Future webhooks require the provider's current signature/replay procedures and independent server verification; confirm official documentation during implementation.

PWA activation may have batches. Match reconciled records without enumeration, verify institutional email ownership, confirm registered details, create a securely hashed password and await administrator approval. Role claims need independent trusted records. Price/email/retention decisions and institutional email-format rules need approval; do not guess them from examples. Email service availability, delivery/abuse controls and any costs must be documented before integration.

## Editorial publication and attribution

Future editorial source import needs owned source/export, provenance, dependencies, current local-storage schema and licensed media—not a rewritten duplicate console. Public snapshots carry content ID, type, revision, approved status, published/scheduled/expiry timestamps, source references and optional verified sender ID. The server separately stores the immutable actor ID, workflow transitions and revision audit. Client-edited sender text never permits impersonation. Publishing transitions: draft → review → revision/approval → scheduled/published → updated/archive. Administrator has full technical and publishing rights; several users may share a role.

Gallery contracts include album/category/caption/alt text, rights/consent/withdrawal, moderation, original/private storage references, safe public derivatives, scheduling, versions and archive state. Unpublished/sensitive originals remain private. The existing website-controlled **download-time** watermark composites an unchanged public original and the approved NIPSA identity. M4 will refine its shared helper, memory bounds, filenames, portrait/landscape layout, output quality and errors. Direct public-original saves and screenshots cannot be prevented by this mechanism.

Ads transition through submission, review, package/custom quote, policy consent, approved checkout, trusted paid reconciliation, final editorial approval, publication, expiry/renewal. Prices/categories are authorised server configuration; charges must be disclosed. Recurring payments remain planned and inactive. A verified payment does not skip final editorial review.

## Hosting/operational acceptance

Validate PHP/MySQL compatibility, server-enforced sessions/roles, private file storage/scanning, cron, email, backups/restore and real-time options before choosing infrastructure. No Next.js server capability is assumed on GitHub Pages. Do not provision services or activate payments in order to satisfy a UI milestone. Production DNS, CORS/cookie domains, HSTS/security headers, webhook endpoints and scheduled jobs require a reviewed deployment plan. M7/M8 must exercise real failure/retry/recovery paths, access revocation and audited state transitions before launch.
