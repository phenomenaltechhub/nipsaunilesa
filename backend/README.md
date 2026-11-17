# Pharmaideia controlled account backend

Real Node 24.19+ HTTP/SQLite implementation for **isolated development and synthetic tests**, not a publicly deployable service. No third-party runtime packages. The Next.js website/Pages workflow does not serve this directory.

Run `npm run test:backend` from the repository root. Tests create temporary private databases, random reserved-domain identities/passwords and an in-memory mail capture, then remove them. They exercise actual HTTP, cookies, migrations and database transactions. No real student account, payment or email is created.

`npm run dev:backend` requires explicit configuration described in [OPERATIONS.md](../docs/nipsa-platform/m5/OPERATIONS.md). It binds **127.0.0.1 only** and refuses production mode or existing non-synthetic account databases. It does not seed accounts. Test fixture code is never imported by startup or the PWA. Public activation is false.

- [Architecture and threats](../docs/nipsa-platform/m5/ARCHITECTURE.md)
- [Implemented API and security behavior](../docs/nipsa-platform/m5/API_AND_SECURITY.md)
- [Host, backup and integration requirements](../docs/nipsa-platform/m5/OPERATIONS.md)
- [M5 milestone report](../docs/nipsa-platform/MILESTONE_5.md)

Production activation requires an approved hosting/runtime decision, HTTPS and Secure cookies, operational verified email, private storage/keys/backups, capacity/security review and completed pre-launch modules. Removing the controlled-mode boundary alone is **not** a deployment procedure.
