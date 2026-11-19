# Integrate Pharmaideia Community and academic workflows (M8–M9)

Target: `development/nipsa-student-platform`

Head: `feature/pharmaideia-m9-integration`

Website-reference metadata previously disappeared on restart, and approved study workflows were not connected to authenticated storage. This branch persists trustworthy public catalogue state and adds course-linked schedules/calendar export, independently reviewed study aids/glossary, personal bookmarks/history, explicit private account plans, account appearance, selected activation batches and constrained support/trial operations. Current/cached/withdrawn/unverified states remain explicit; unavailable services and academic content are not fabricated.

This branch is based on reviewed local M8 `576bed7`; current development still ends at M7 `aacd56b`. The PR therefore includes the preserved M8 implementation/review fixes as well as M9 until M8 is separately integrated. Review that dependency deliberately; no M7/M8 history was rewritten. The original CBT engine, public website/branding, gallery watermark, static export and Pages workflow remain preserved. Migrations 008–010 are additive; no production database is migrated.

Validation: 240 unit/security tests passed, final lint/types/build/export/PWA/secret checks passed, both audits zero. Existing M6/M7/M8 browsers and 16 screenshot comparisons passed after correcting an offline-personal-planner regression. M9 adds actual responsive academic/support/activation workflows and 43 scoped accessibility scans (zero violations; two contrast items remain incomplete). 124 protected source hashes remain unchanged. Matching three-run slow-network median falls from 11,322ms to 7,023ms (38%). See the [full report](MILESTONE_9.md) and committed review assets for actual results, video, sources and limitations.

No real accounts, live payments, DNS change, paid provisioning or deployment. Physical Android/installed-PWA, actual public feed, production-like infrastructure/providers, Editorial source/content, privacy/backup policies and independent security review remain launch gates. Local/synthetic verification is not production certification. Normal group retention remains separate from temporary DMs/support/audit/financial records.

Request review only. Do not merge into main or deploy by this PR. Current workflow deploys only on main/manual dispatch and has no feature/PR CI trigger; local evidence is supplied, not invented remote checks. PR API access is currently forbidden; this file prepares the normal review submission without bypassing permissions.
