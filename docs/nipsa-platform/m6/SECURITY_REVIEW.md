# M6 security review and unresolved gates

Reviewed 17 November 2026 against selected current OWASP guidance. Evidence is automated and controlled-browser testing plus source/visual review, **not certification, a penetration test or proof of complete security**. Existing M5 account policies and deployment boundary are preserved.

## Confirmed findings addressed in this increment

| Risk | Implemented control and evidence |
| --- | --- |
| Author/admin self-approval of course corrections | Author and last-editor checks, independent reviewer requirement and revision transactions. Regression includes administrator editing another author's course then attempting approval. |
| Draft/cross-level/object/private result exposure | Published snapshot separation; current course/level/selected roster checks, own progress/request/assignment/result access. Keys/private application data are not in assignment projections. Negative HTTP tests and browser cache/DOM checks executed. |
| Scheduled correction impersonation/stale grants | Original sender preserved separately from actual current publisher; scheduled activation checks publisher's current scope. Administrative correction after original CR revocation tested. |
| Closed/suspended chat bypass and replay | Server gate/current membership/chat suspension on writes, transaction-bound idempotency/fingerprint, owner edit/reaction bounds, reporting/moderation authority. Concurrent replay and spam tests execute actual database writes. |
| CBT approval bypass/roster tampering/planning replay | Initial approval gates stage two; strict owned application states; reviewed question authorization; explicit current selected identities, capacity/slot conflicts, optimistic revisions and no reset of started/submitted evidence. |
| Malicious application files | Closed-by-default/authenticated/stage-bound JSON-only submission, 10,000-byte decoded bound, normalized filename, fatal UTF-8/schema/source/topic/field checks, private authenticated encryption. Tests reject traversal, active/binary types, malformed/oversized/schema-abusive inputs. This is not a general malware-scanning implementation. |
| Accidental answer-key exposure in analytics | Explicit public result schema strips arbitrary future engine fields, question/answer keys and unsupported properties. Projection tests verify safe output. No browser-supplied scoring endpoint exists. |
| Failed audit/partial mutation | Existing transactions include sensitive state and audit writes. Forced audit failure test verifies rollback; fresh sessions/grants are checked after revocation. |
| Admin embedded workflows returned CSRF failure | Canonical `/access/api.mjs` import now shares CSRF state; actual UI request/approve/plan/batch workflow passes with all server checks retained. |
| Selected course-tab text lost contrast | Scoped selected/unselected styles preserve visible labels; computed light/dark contrast assertions and refreshed desktop/mobile screenshots. Axe alone had not resolved this visual issue. |

## Focused standards mapping

Official OWASP ASVS **5.0.0** English CSV and Authorization Cheat Sheet were retrieved successfully from OWASP's GitHub sources. These selected controls guided review, not a claim that every level/control was assessed:

- **V2.2.2**: trusted service-layer validation; strict fields/choices/date/source/topic/document models and prepared SQL.
- **V3.3.4**: existing HttpOnly session cookie; no JS-readable token store. Production Secure-cookie/HTTPS configuration remains blocked with production startup.
- **V3.5.7**: no student data embedded in script responses; protected records use authorized JSON. Dynamic bootstrap contains only a non-sensitive controlled-service marker.
- **V5.2.4**: bounded document/body sizes and rate limits; broader file quotas/scanning remain required before general uploads.
- **V8.1.1–V8.1.2 / V8.2.1–V8.2.3**: documented function/object/field scopes; actual server permission checks and IDOR/cross-level/privilege tests.
- **V15.4.2**: transaction-bound state/revision checks and updates to resist concurrent mutation/TOCTOU.
- **V16.3.2**: safe denied-request codes/correlation IDs and privileged action audits; no secret/message/question payload logging. Full operational detection/alerting remains unverified.

Sources: [ASVS 5.0.0](https://github.com/OWASP/ASVS/tree/v5.0.0/5.0), [versioned requirements CSV](https://github.com/OWASP/ASVS/blob/v5.0.0/5.0/docs_en/OWASP_Application_Security_Verification_Standard_5.0.0_en.csv), [Authorization Cheat Sheet](https://github.com/OWASP/CheatSheetSeries/blob/master/cheatsheets/Authorization_Cheat_Sheet.md). Guidance was consulted read-only; no vendor source was imported.

## High-priority dependency gate — unresolved

Full `npm audit --json` exits nonzero: **14 high dependency entries from one underlying advisory**, [GHSA-fc5q-39xc-vjpf](https://github.com/advisories/GHSA-fc5q-39xc-vjpf), picomatch ReDoS via single-branch repeated extglobs. Affected range `<=4.0.7`; advisory says **Patched versions: None**. Installed `2.3.2` and `4.0.7` are transitive under development-only `eslint-config-next@16.4.6` (fast-glob/micromatch, tinyglobby/fdir, resolver and TypeScript ESLint tooling). Registry's latest published version was `4.0.7` at verification. The 14 entries include affected dependent packages; they are not 14 unrelated vulnerabilities.

`npm audit --omit=dev --json` succeeds with **zero advisories**. The affected pattern parser is not part of the public website/PWA/native backend runtime dependency path. This limits current runtime exposure but does not make development/CI tooling safe for untrusted glob patterns or make full audit pass. No exploit against this project's student-facing service was demonstrated.

No unpatched override/fork, mismatched `eslint-config-next` downgrade, audit suppression or workflow bypass is introduced. Preserve trusted tooling inputs; monitor upstream, adopt a compatible verified patch when published and rerun the full audit/build/regressions. The existing Pages workflow still runs full audit and therefore remains blocked by this finding. Review-branch commit/push does not waive the launch gate. Existing ESLint 9 end-of-support warning is separately recorded for a compatible tooling upgrade, not silently fixed with an unrelated major migration.

## Remaining risks and required review

1. **Production unavailable:** loopback synthetic backend is not verified against Smartweb, HTTPS/proxy/cookie/email/storage/jobs/rate/load behavior. No real accounts/payments/public services activated. Built-in Node/SQLite/OS/cloud-tool patching is outside npm audit.
2. **CBT incomplete:** no server attempt allocation, live protected question delivery, answer autosave/submission, trusted marking run or fair incident adjudication yet. Current projections/interfaces are only the tested foundation. M7/M8 must complete before launch.
3. **Abuse availability:** preserved progressive password lockouts are server-enforced; blocked guesses do not extend deadlines, valid sessions survive and verified recovery bypasses the untrusted password lane. An attacker may still impede the password lane; production edge/global controls, owner recovery and independent availability review remain necessary. No silent weakening of failures 3–7 occurs.
4. **Private browser memory:** no approved private persistent offline cache. Hidden/offline/logout/account transitions clear views and ignore stale renders. In-flight data/JS may remain in browser process memory until collection; this is not secure erasure or protection from a compromised endpoint. Physical shared-device review remains required.
5. **Operations and scale:** SQLite transactional tests do not establish production capacity, multi-process scheduler/fan-out safety or denial-of-service resistance. Full feed/catalogue pagination and durable jobs/real-time transport/metrics remain M7.
6. **Retention/deletion:** existing financial separation, account controls, encrypted backup/restore and audit chain are preserved. Complete all-domain retention/legal holds, independent question ownership, restored-deletion replay, migration upgrade rehearsal, key custody and offsite immutable audit anchors still require institution/operations decisions and tests.
7. **Content/source:** no official academic material or medical definitions were fabricated. Reviewed/licensed sources are still needed. Standalone editorial source remains missing, so no integrated publisher is claimed. Public Drive links remain public external links.
8. **Testing limitations:** 178 automated cases, actual Chromium flows and selected axe scans are partial evidence. Two M6 dashboard axe scans leave contrast review incomplete; independent screen-reader/keyboard/physical Android/iOS and adversarial tests are still launch gates. Gallery browser tests cover four portrait downloads; do not infer exhaustive landscape/huge-image/device coverage.

See [API/permission documentation](API_AND_PERMISSIONS.md), [M7 engine requirements](M7_ENGINE_REQUIREMENTS.md) and [all pre-launch requirements](PRE_LAUNCH_MATRIX.md). No main, production configuration, DNS/hosting, paid service, payment setting or public deployment is changed.
