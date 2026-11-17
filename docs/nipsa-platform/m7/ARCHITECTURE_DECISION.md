# M7 architecture decision — controlled integration before host selection

17 November 2026. Verified clean start: b2df50b77c78af3ba645697cdd9d47b3b6f0dfb8, development/nipsa-student-platform. Existing Next.js public website/Pages delivery stays unchanged. No production deployment, paid provisioning, DNS or real-account activation is authorized.

## Evidence and decision

The selected cloud executor runs Node 24 with native HTTP/SQLite/crypto and Chromium. M5/M6 implement real transactional private database operations in one backend. The configured network is restricted; no hosting/email/payment credentials are configured. One read-only Smartweb request failed at the proxy with CONNECT 403. This does not establish that Smartweb lacks Node support, nor verify any hosting plan, price or capacity. Do not repeatedly retry the blocked destination or recommend a provider on this evidence.

Continue this same backend in the synthetic loopback test environment. Do not migrate the public website, create a competing PHP service, provision a host or remove the production-disabled startup boundary. HTTPS cookie/mail/provider adapters can be implemented and tested independently without claiming a live integration.

| Requirement | Existing controlled evidence | Required provider evidence before selection |
| --- | --- | --- |
| Runtime | Node 24/native SQLite runs locally | Supported maintained Node/native SQLite version; persistent process management/restarts; build/runtime limits |
| Persistent DB/transactions | Private SQLite WAL, prepared statements, transactions/migrations | Persistent local disk with correct locks/fsync, disk quotas/backups; no ephemeral/network filesystem assumptions; realistic write concurrency |
| HTTPS/cookies/secrets | Actual controlled local TLS with verified certificate and Secure/HttpOnly/SameSite cookies; session/CSRF enforcement | Trusted provider TLS termination, exact public origin, private environment/key custody, no arbitrary forwarded-host trust |
| Protected files | Private database/directory boundary | Private persistent storage, content inspection/scanner, quotas, authorized attachment downloads and backups |
| Email | Injected synthetic transport only | Approved verified sender/provider, TLS, delivery/abuse limits, costs and recovery operations |
| Tasks/monitoring | Can execute bounded maintenance in the existing process | Reliable supervised task execution, restart catch-up, restricted health/logs, alerting and resource metrics |
| Networking/webhooks | GitHub/package access; provider destinations unverified | Approved outbound email/Paystack connectivity, inbound HTTPS webhook routing, timeout/retry limits |
| Backup/restoration | Existing encrypted snapshot and verified restore tests | Encrypted offsite storage, key separation, approved retention/deletion/financial holds, restore rehearsal/RPO/RTO |
| Capacity/cost | Approximately 887 students is a planning input only | Actual simultaneous CBT/chat/academic load measurements, memory/CPU/entry-process/bandwidth/disk limits and total recurring NGN costs |

## Transport choice

Use bounded adaptive authenticated polling for controlled community/notification synchronization. This requires ordinary short HTTP requests, survives intermittent mobile connections and adds no persistent-connection service/dependency. Pause while hidden/offline; use cursors/change versions, avoid overlapping requests and back off after failures. SSE/WebSockets remain alternatives to reassess against verified infrastructure and measured load, not prerequisites to invent an unsupported shared-hosting deployment. No claimed production throughput follows from local polling tests.

The controlled global API guard remains 1,000 requests/minute. If all 887 students viewed Community at once, a 12-second interval alone would imply about 74 requests/second, above that controlled guard before other work. The local 50-request burst is not a capacity sign-off. M8 must measure realistic concurrency, choose/tune delivery intervals/quotas/transport on the approved host and verify abuse protection without silently weakening limits. No production scale is claimed.

## Financial assessment and release gate

No prices are verified. Obtain a dated written quote covering runtime/persistent disk, TLS, database, outbound email, backups, storage/scanning, networking and support before recommending any plan. Shared-host entry-process limits are concurrent work, not the number of student accounts. A small supervised Node host with persistent local disk may fit the architecture, but affordability/capacity must be demonstrated; no provider is selected here.

Independent security/accessibility/Android review, full approved pre-launch scope and owner release authorization remain M8 gates. Editorial publishing remains a separate source-blocked workstream; only contracts are prepared here. Every approved feature must be complete before first public launch, not deferred after it.
