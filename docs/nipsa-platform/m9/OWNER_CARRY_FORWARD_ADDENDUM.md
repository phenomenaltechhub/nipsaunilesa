# PHARMAIDEIA — M9 Prompt Addendum: M8 Acceptance, Integration and Readiness

**Use:** Append this section to the actual M9 Codex specification. **Do not treat it as an independently approved scope for new M9 features.** If M9's feature specification is missing, prepare a planning/gap assessment first and ask for the approved scope before coding unrelated features.

## Confirmed baseline and preservation constraints

- Platform: PHARMAIDEIA, NIPSA UNILESA student platform/PWA, separate from the public NIPSA website and the independent Editorial dashboard.
- Reported current local branch: `feature/pharmaideia-m8-community`, latest follow-up commit `576bed7`; original M8 implementation commit `8000069`. Verify actual Git state, ancestors and clean worktree independently before changing anything.
- **M7 must remain intact.** No regression in prior account, academic, CBT, resource, planner, moderation, permissions or payment-related behavior.
- The latest M8 report states that Community interactions, moderation, confidential reporting, private assistance, consent-based temporary DMs, 30-minute server-enforced own-message editing, website-content references, real receipts/typing and responsive messaging are implemented in the controlled environment.
- Latest user-provided verification: **220 automated tests passed**, **16 screenshot comparisons passed**, M7 browser workflows passed and **124 protected files unchanged**. Treat these as *reported* until rerun in the current environment. Both dependency audits now reportedly have **zero advisories** following the upstream picomatch advisory withdrawal; no dependency upgrade/suppression occurred. Rerun audits and record their outputs rather than retaining an outdated advisory as open.
- Three previously confirmed M8 bugs were reportedly corrected: failed audit wrongly allowing office changes; stale office labels after role reappointment; unsolicited HTTP 304 falsely implying live synchronization. Verify regression tests continue to cover all three.
- GitHub push/PR and actual live-feed integration were blocked. Nothing was pushed, merged, deployed or made public. Preserve that boundary. Do not claim staging/production readiness from synthetic local tests.

## Add to M9 preflight and acceptance scope

### A. Durable website-content catalogue and honest synchronization — high priority

1. Resolve the current **memory-only website catalogue** restart and staleness policy before considering the reference feature launch-ready. Evaluate a **persisted, versioned snapshot of public metadata**: verified source URL, feed version/ETag, last successful validation time, content identifiers, source revision, content withdrawal state and expiry/freshness rules.
2. On service restart or network loss, never silently label an unverified in-memory or cached catalogue as current. Display cached/unavailable status where necessary. Distinguish **verified fresh**, **cached potentially stale**, **withdrawn**, **unknown** and **unreachable** entries.
3. Preserve the rule: **no invented website URL or page title**. Verified public URLs only. Never promote unverified campus Navigator candidates to verified map points. Safely handle formerly referenced pages that are later removed or renamed; preserve appropriate historical message context without representing dead links as valid.
4. Specify freshness TTL, cache invalidation, storage owner, boot behavior, stale-while-revalidate policy if suitable, retry/backoff, rate limits, permissions and operational alerting. Prefer low-maintenance, bounded storage appropriate to the existing stack. Don't introduce a new database or paid service solely for a trivial cache without comparing simpler options.
5. Test cold start, warm restart, offline start, unreachable feed, ETag `304` only when a previously validated matching representation exists, unexpected/unsolicited `304`, malformed feed, changed title/slug, removed item, rollback, concurrent refresh, replay and recovery. Ensure group/private/support/authorized announcement reference behavior stays consistent.
6. **Live publication/verification is still an external gate.** Build local integration and test fixtures as authorized; do not publish a production feed, modify the public NIPSA site or bypass network permissions without explicit approval. Label externally unverified flows as blocked.

### B. Physical Android and installed-PWA acceptance — high priority

1. Create a focused **real-device acceptance matrix** for representative low-end Android smartphones, including the user's likely constraints of limited memory, mobile data and intermittent power. Test portrait widths around 320–390px and landscape where relevant.
2. Manually verify native keyboard opening/closing, resize/viewport behavior, composer above the keyboard and safe area, scrolling/anchoring during replies, **Enter inserts newline** and **only the send button sends**, 2,000-code-point boundary, Android IME composition, emoji input, long-press context menus, file/image picker, image validation/compression/upload/retry and accessibility touch targets.
3. Test **installed PWA** behavior separately from browser-tab behavior: install/open, service-worker update, offline shell, reconnect, session expiration/revocation, private-data clearing, draft loss/retention semantics, notifications where supported, and no false delivery/read status.
4. Screen-reader and keyboard navigation are required in addition to automated axe scans. Check smaller mobile secondary text (timestamps, level/role labels) for readable contrast and size. Adjust typography if actual users struggle; no broad redesign without evidence.
5. If physical Android or required services are unavailable, mark each case **not run / externally blocked**. Do not substitute emulated browsers and call the physical-device gate passed.

### C. Performance under adverse connectivity — high priority

1. Baseline the reported **11,353 ms controlled ready time** under 390x844, 4x CPU throttling, ~180 ms latency and ~50,000 B/s downstream. Investigate what `ready` measures and report repeatable results rather than assuming this is an actual-device score.
2. Target practical improvements in first usable interaction, input responsiveness, time-to-visible-conversation, scrolling, image previews and resume behavior on low-memory phones. Do not degrade correctness, accessibility or security for a benchmark.
3. Measure before/after loading, long-history memory, 300-message DOM cap, bundle sizes, network transfer, reconnection and visual stability. Report limitations of emulation separately from device measurements. Preserve existing PWA asset budgets unless a justified change is approved.

### D. Recovery, security, privacy and operational readiness

1. Verify durable/private persistence and recovery after backend restart, abrupt disconnect, partially committed sends, lost ACK/retry, cleanup job rerun and restoration from backup. Check that neither deleted temporary DM content nor confidential reports leak through caches, logs, exports or public URLs.
2. Review server-enforced role hierarchy, office reappointment/audit correctness, suspension, Admin official sender attribution, 30-minute message-edit window, confidential report access, private support assignment, consent-based DMs, read receipts and authorization-negative tests. Avoid relying on UI hiding for security.
3. Preserve intentional retention differences across normal Community messages, 24-hour temporary DMs, admin support cases, uploads, audit records and backup recovery. Do not introduce a short timeout for normal group history merely to save storage.
4. Run or explicitly defer external integration checks for hosting/TLS, real private database persistence, email, push, image scanning, payment-provider workflows, feed availability, monitoring, backup/restore and realistic concurrency. **Do not mark these production-verified from local synthetic operations.**
5. Maintain launch requirements for verified educational content, editorial integration, separate administrative security, independent testing and owner approval. Do not silently relax the existing pre-launch matrix or treat all platform functions as complete.

### E. GitHub and release workflow — permission-sensitive gate

1. Confirm latest local commit and clean tree. Keep M8 review work on its isolated branch; do not rewrite M7 or change `main`.
2. **Do not circumvent rejected GitHub credentials**, extract unrelated credentials, force push or bypass branch protections. Ask the owner to restore legitimate account access through the supported workflow. After authorization, verify remote state and push normally, then open the prepared PR against **`development/nipsa-student-platform`**, not `main`.
3. Ensure PR description lists original M8 implementation and follow-up fixes, tests, changed files, migrations, architecture/security notes, known blockers and explicit non-production status. No automated merge or deployment.

## Work sequencing and boundaries

1. Start with a **read-only audit** of the repository/roadmap, M8 report, pre-launch matrix and existing M9 specification if one is provided. Produce a concise status table: `implemented`, `locally verified`, `needs code change`, `needs external access`, `physical-device test`, `blocked by owner decision`.
2. Protect the M8 scope. Repair only confirmed regressions/acceptance failures or approved carry-forward work; track any unrelated feature request separately and seek approval before broadening M9.
3. Make the catalogue persistence/expiry strategy and external integration prerequisites explicit **architecture decisions** before coding them. If multiple viable approaches materially affect cost/security, present options and request approval.
4. Implement approved work incrementally with backend/permission tests, PWA browser tests, screenshot comparisons, axe scans, and regression suites. Preserve synthetic fixtures; do not create real student accounts or fabricate records.
5. Close with a reviewable branch/PR when access allows, exact commit SHA, changed files, measured performance, test commands/results, screenshot/video evidence, dependency audit status, updated decision register and all outstanding gates.

## Done-when criteria

- Existing M7/M8 capabilities still work and all three regression fixes remain covered.
- No fabricated URL, false live-sync claim or unsafe cache state survives restart; catalogue behavior is documented and tested.
- Physical-device tests are recorded honestly as passed, failed or blocked; installed-PWA tests are distinct from mobile browser emulation.
- Performance changes have before/after evidence under consistent conditions; small mobile labels are human-reviewed.
- Security, privacy, backup, retention and external services have explicit verified/blocked status rather than optimistic claims.
- GitHub branch/PR preparation is complete without bypassing auth or touching production.
- **No public launch, production deploy or merge to `main` without the owner's explicit authorization.**

**Important:** This addendum does not itself define or authorize the independent feature scope of M9. If there is an existing M9 prompt, retain that original scope and incorporate these requirements as carry-forward quality and integration gates. If there is no approved M9 prompt, stop after a plan and focused owner questions rather than inventing the milestone.
