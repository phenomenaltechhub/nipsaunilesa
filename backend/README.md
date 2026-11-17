# Pharmaideia controlled account backend

Real Node 24.19+ HTTP/SQLite implementation for **isolated development and synthetic tests**, not a publicly deployable service. No third-party runtime packages. The Next.js website/Pages workflow does not serve this directory.

Run `npm run test:backend` from the repository root. Tests create temporary private databases, random reserved-domain identities/passwords and an in-memory mail capture, then remove them. They exercise actual HTTP, cookies, migrations and database transactions. No real student account, payment or email is created.

`npm run dev:backend` requires explicit configuration described in [OPERATIONS.md](../docs/nipsa-platform/m5/OPERATIONS.md). It binds **127.0.0.1 only** and refuses production mode or existing non-synthetic account databases. It does not seed accounts. Test fixture code is never imported by startup or the PWA. Public activation is false.

- [Architecture and threats](../docs/nipsa-platform/m5/ARCHITECTURE.md)
- [Implemented API and security behavior](../docs/nipsa-platform/m5/API_AND_SECURITY.md)
- [Host, backup and integration requirements](../docs/nipsa-platform/m5/OPERATIONS.md)
- [M5 milestone report](../docs/nipsa-platform/MILESTONE_5.md)
- [M6 actual operations and validation](../docs/nipsa-platform/MILESTONE_6.md)
- [M6 routes, permissions and JSON-document limits](../docs/nipsa-platform/m6/API_AND_PERMISSIONS.md)
- [All remaining pre-launch requirements](../docs/nipsa-platform/m6/PRE_LAUNCH_MATRIX.md)

M6 extends this same service/database with reviewed courses, own progress, targeted notices, persisted general-community interactions/moderation and closed-default two-stage CBT applications/selected-batch planning. `npm run test:m6:browser` and `npm run test:m6:workflows` exercise real controlled UI/API/database flows. No examination delivery engine is claimed; no second backend or production endpoint is introduced.

Production activation requires an approved hosting/runtime decision, HTTPS and Secure cookies, operational verified email, private storage/keys/backups, capacity/security review and completed pre-launch modules. Removing the controlled-mode boundary alone is **not** a deployment procedure.

M7 adds actual controlled examination delivery/scoring/recovery, private question-bank review, visible-only community/notification synchronization, maintenance and reviewed resource delivery. See [M7 report](../docs/nipsa-platform/MILESTONE_7.md), [route/permission/operations contracts](../docs/nipsa-platform/m7/API_AND_OPERATIONS.md), [host decision](../docs/nipsa-platform/m7/ARCHITECTURE_DECISION.md) and [remaining M8 gates](../docs/nipsa-platform/m7/PRE_LAUNCH_MATRIX.md).

Run `npm run test:m7:browser`, `npm run test:m7:workflows` and `npm run review:m7:walkthrough` for actual synthetic integration evidence. Optional controlled TLS uses explicit private `PHARMAIDEIA_TLS_KEY_FILE` and `PHARMAIDEIA_TLS_CERT_FILE`; keys must be owner-only and outside public/export/review paths. No key is provided or generated for production. Email/actual Paystack/scanning/push remain unconfigured or unverified; unsupported operations fail closed. No new npm dependency or public deployment is introduced.
