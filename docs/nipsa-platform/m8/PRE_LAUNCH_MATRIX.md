# M8 Community increment: pre-launch completion matrix

Every approved function still requires implementation, integration, security testing and owner review **before first public launch**. This task does not authorize production or reduce the approved product. Carry forward every non-Community row in the [M7 full matrix](../m7/PRE_LAUNCH_MATRIX.md); historical “no DM expansion” is superseded only by the explicitly approved M8 consent-based temporary DM/support specification.

Vocabulary: **L** implemented and locally tested; **C** integrated in controlled synthetic service/browser; **P** verified on production-like external infrastructure; **B** external-blocked; **N** not implemented. No M8 integration is classified P.

| Function | Current evidence | Remaining before launch |
| --- | --- | --- |
| Green/teal full-window Community, five mobile destinations, themes, title/member drawer, keyboard/touch contexts | L/C actual four-width screenshots, 16 snapshot comparisons and real interactions | Owner design review, physical device/screen-reader acceptance |
| Group history/replies/mentions/reactions/search/pins, pagination/latest navigation | C actual DB persistence, 360 retained messages/300 DOM cap, long-press/keyboard/replay/restart tests | Real host scale, accessibility and approved history/image retention |
| Official Admin, current roles/office precedence, policy/suspension/removal | C protected APIs, fresh MFA/current grants, real actor audit, no invented appointments | Real approved staff/appointments/operational review; no accounts seeded |
| Owner group corrections through 30 minutes | C exact inclusive boundary, other-owner/late/revision tests | Owner UX review; removal window remains separate |
| Image messages | C canonical PNG validation/private encrypted delivery/quota; client PNG/JPEG conversion | Format/browser/storage/retention review. General PDF/Office resource scanning remains B/N as M7 |
| Actual read receipts and typing | C visible-only acknowledgements/IDs, expiry and revocation checks | Privacy disclosure, scale/physical-device review; no proof-of-attention claim |
| Confidential reports/moderation | C encrypted originals, private decisions/audit, legacy distinction | Independent security and responsible case-retention review |
| Locked footer/private administrator support | C real claimed-agent queue/persistence/hold retention; no public case content | Staffing, response policy, retention/restore acceptance |
| Consent-based temporary private replies | C request/accept/decline/block/report/24-hour expiry/deletion and restart tests | Privacy/safeguarding/retention approval, external device/backup acceptance |
| Website title search, picker, keyword/URL previews, linked titles, notice/private integration | L/C 25 actual public page/record entries, controlled refresh/change/withdrawal tests | B production feed publication/network and external client verification; memory-only last-good/restart staleness still needs acceptance; original Editorial source/integration still B, no fabricated destinations |
| M5 auth/recovery/MFA, M6 courses/progress/notices/application workflow, M7 full CBT/resources/payments | C original controls preserved and regression-tested | All outstanding content/provider/security/operational rows in M7 matrix remain mandatory |
| PWA offline/public shell, personal planner/focus, approved branding and public website/gallery | L/C preserved shell budgets, type/integrity/browser/gallery-original tests | Full approved academic tools/content/operational synchronization and launch acceptance remain per M7 matrix |
| Dependency gate | Fresh full/production audits pass with zero advisories after the official advisory withdrawal; versions unchanged | Continue monitoring; historical finding retained, no false claim of a package patch or passed GitHub check |
| Public backend/hosting/email/push/payments/scanning/capacity/backups | B/N as recorded in M7 | Validate/approve affordable infrastructure; no public activation by removing a guard |
| GitHub review publication | Local dedicated branch and commit prepared | B invalid managed GitHub credential/API access; restore access then normal push/PR against development branch |

No automatic next milestone, production merge/deploy, DNS change, live payment, real student activation or paid provisioning is performed.

Current detailed classification, reproduced corrections and fresh results: [M8 requirements review](REQUIREMENTS_REVIEW.md). Physical-device/live-feed execution: [acceptance protocol](DEVICE_AND_LIVE_SYNC_ACCEPTANCE.md). Normal publication after access restoration: [PR runbook](PR_READINESS.md). No P (production-like verified) status is earned by these controlled checks.
