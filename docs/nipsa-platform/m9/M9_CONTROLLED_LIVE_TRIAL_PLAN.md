# Controlled trial and expanded security test matrix

**No hosted trial or public launch is authorized or running.** Local isolated tooling is implemented; externally hosted authentication remains blocked. Owner must approve the exact URL, operator, invited participants, provider costs, TLS/access control, private persistent storage, privacy/retention and rollback before enabling internet access. GitHub Pages alone cannot run Node/SQLite. The backend deliberately remains test/development-only and loopback-only; do not bypass these guards to publish it.

## Test modes

| Mode | What it proves | What it cannot prove |
| --- | --- | --- |
| Frontend-only shell | Layout/navigation/brand/offline public shell; explicitly synthetic demo interactions | Server authentication/authorization, database durability, private messaging, injection resistance, payments |
| Current isolated loopback backend | Actual random synthetic accounts, SQL transactions, role/level checks, cookie/CSRF flows, persisted Community, CBT and study tools | Public HTTPS/proxy/email/push/provider operations, physical device or real host capacity |
| Approved future isolated online backend | Invited multi-device accounts and real transport/provider test connections after configuration review | Production readiness until separately accepted; no real student database/payment credentials |
| Later production-like acceptance | Exact deployed runtime/storage/TLS/jobs/key custody/restores/monitoring, independently reviewed | Not implied by any current unit/browser pass |

## Reproducible disposable local access

Use a new absolute private directory outside repository/public exports. Do not reuse a data directory. Commands never print passwords or keys:

```sh
node scripts/pharmaideia-trial.mjs seed /tmp/pharmaideia-owner-trial
node scripts/pharmaideia-trial.mjs run /tmp/pharmaideia-owner-trial
node scripts/pharmaideia-trial.mjs revoke /tmp/pharmaideia-owner-trial
node scripts/pharmaideia-trial.mjs destroy /tmp/pharmaideia-owner-trial
```

Seed refuses repository/public-asset directories. It defaults to eight hours (library supports 1–72), creates a new 0700 directory, separate random 32-byte keys and private 0600 manifest/credential files. Give each invited tester only their assigned credential through an approved private channel; never share the full credential file or put it in a PR/screenshot/archive. Privileged testers must enroll their own MFA. No hardcoded password, mail transport, real transaction, academic content, examination or community message is seeded. Community and CBT intake remain closed by default. To demonstrate enabled chat, an authorized fresh-MFA test administrator explicitly opens it through existing controls. Review scripts create labelled synthetic content only in their isolated fixtures.

Expired/revoked membership is checked on each protected request/login, not just by cleanup. Revoke invalidates the environment/members/sessions. Destroy verifies private manifest, database and exact file allowlist; refuses symlinks/unrelated files/mixed-account databases; does not recursively discard unrelated work. Backups outside this ephemeral directory require separate reviewed cleanup. Expired credentials must not be reused; repeat revoke is safe. Failed seed leaves private files for inspection, not publicly exposed output. Local app banner and session metadata explicitly identify the synthetic isolated trial. Do not remove these labels in a hosted trial.

| Trial identity | Permitted test purpose | Explicit denial tests |
| --- | --- | --- |
| Students 100/200/300 | Own approved courses, study state, notices, group participation when open, own assigned CBT/results | Other levels/accounts/batches/results, publication, role changes |
| 200L representative | Assigned-level course/schedule/resource/notice submissions | 100/300 scope, independent approval, administrative CBT controls |
| Reviewer 200L | Independent review within level | Self-approval, global glossary publication, account powers |
| Executive | Only explicitly granted responsibilities; no office invented by seed | Global admin power/official Admin sender without administrator grant |
| Support attendant | Fresh-MFA claimed/assigned assistance only | Unclaimed message body, another assignee's case, moderation/admin/CBT powers |
| Administrator | Fresh-MFA account/role/activation/community/CBT decisions | Stale/revoked sessions; self-demotion/deletion and invalid identity/eligibility inputs |

## Invited tester notice and incident handling

Use only synthetic information. Do not enter real names, matriculation numbers, passwords reused elsewhere, health information, financial details or confidential university material. Other testers can see group messages/read receipts and take screenshots; temporary conversations are not end-to-end encrypted and follow their stated expiry. Support/report data is restricted to assigned authorized staff/moderators. Explain trial expiry, accessible support contact, consent/withdrawal and actual cleanup date before invitation. Owner must name a privacy/incident contact and approve retention; current local defaults are not a legal policy.

Only authorized isolated URLs/accounts are in test scope. No production/third-party attacks, brute-force/load/destructive fuzzing, external scanners, real charges or account creation. Report findings privately with synthetic reproduction, role, affected records, severity, minimal correction and retest evidence. Stop the trial for confirmed confidentiality/authentication/answer-key exposure; revoke test sessions, preserve bounded private evidence and let the accountable owner decide reopening. Do not publish credentials/exploit data. Rate limits and protected caching remain enabled during the trial.

## Next-phase acceptance

| Area | Cases | Current state |
| --- | --- | --- |
| Desktop/mobile Chromium | 320/360/390/768/1440 light/dark, landscape, short-height resize, keyboard tabs, long history, restricted and enabled chat | Local automated evidence; see M9 report; not physical certification |
| Physical low-end Android | Native keyboard/IME composition/emoji; Enter/Shift+Enter only newline; button sends; 2,000 code points; 30-minute edit; long-press vs scroll; chooser/type/size errors/retry; talkback/touch/labels/contrast | **Not run**: no attached Android device/tester |
| Installed Android PWA | Install standalone, scope/icon/safe-area, SW update, offline shell, app resume/reconnect/expiry/revocation, draft semantics, clearing across accounts, device notification choices | **Not run** on physical installed app; Chromium SW/offline tests are separate partial evidence |
| Multi-role controlled use | Level isolation, fresh/revoked grants, member hierarchy, official attribution, support claim/transfer, temporary consent and report confidentiality | Local API/browser tests; invited real multi-device session acceptance blocked |
| CBT | Selected rosters, authoritative timer, save/lost ACK/restart/resume, duplicate final submission, interruptions/role change/cancellation, withheld/released own results and analytics | Preserved M7 controlled tests; actual network/power/fair-policy/academic reviewer acceptance remains open |
| Live website | Authenticated source access/public feed approval, actual revisions/ETags, rename/withdrawal, blocked/unreachable recovery | Proxy CONNECT 403; contract tests pass locally; no publication attempted |
| Providers | Test email delivery/MFA recovery, push on chosen device, actual sandbox Paystack signatures/reversals/reconciliation, verified scanner failure/success | External credentials/services/approval blocked; no production claim |
| Infrastructure/recovery | Private persistent disk, Node 24/SQLite compatibility, HTTPS cookies/proxy, worker, backup custody/restore quarantine, revocation/deletion/hold replay, disk pressure, monitoring, realistic approved load | Not production-like verified; host/operator/retention/RPO/RTO decisions required |
| Independent security | ASVS/WSTG categories, adversarial roles, injection/IDOR/CSRF/uploads/CBT/payments/caching, findings triage/retest | Local regression evidence only; expanded independent assessment after actual connections |

No gate is silently deferred beyond first public launch. Controlled testing can require additional development; M9 does not declare the entire platform or infrastructure complete.
