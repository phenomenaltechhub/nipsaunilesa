# Future server authentication and recovery specification

M4 status: **specification only**. No real authentication, rate-limit database, mail service, session backend or recovery mechanism is activated. Frontend settings/guidance do not enforce any policy. Relevant standards: [OWASP Authentication](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html), [Forgot Password](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html), [Session Management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html), [NIST SP 800-63B-4](https://pages.nist.gov/800-63-4/sp800-63b.html). The following restriction schedule is the owner's policy, not a claim that NIST prescribes these exact intervals.

## Progressive consecutive failures

| Count of verified failed password attempts | Result |
| --- | --- |
| 1 / 2 | Retry permitted, subject to independent abuse throttles |
| 3 | 5 minutes |
| 4 | 15 minutes |
| 5 | 30 minutes |
| 6 | 60 minutes |
| 7 | 24 hours |
| 8 and later | Continue at a bounded 24-hour restriction; no exponential/permanent extension. Recovery/owner-proof route remains available. Institution/security review must approve this continuation before activation. |

A verified failure **after** the preceding restriction expires advances the sequence. Requests rejected during an active restriction do not verify a password, increment the counter or extend its deadline. A successful authorised login resets the relevant consecutive-failure state. Use server time and an atomic transaction/row lock or equivalent compare-and-swap; simultaneous requests cannot each bypass the threshold. Do not rely on frontend counters, disabled buttons, URL levels or IP alone.

## Deliberate lockout defence is mandatory

An email-only global lock creates an attacker-controlled denial of service. The schedule cannot safely be deployed alone. Keep the untrusted password-attempt lane restricted while providing a separately throttled **verified-owner recovery/step-up lane** using a secure institutional email ownership proof or a properly verified administrator-assisted process. It must not be unlocked merely by another guessed password or client device flag. Valid existing sessions are not revoked because an unauthenticated attacker makes failures. Verified recovery can issue a new session/reset password and reset the appropriate counter without reopening unlimited guessing. If email/identity proof/recovery cannot be made operational and tested, authentication launch is blocked.

Use multiple abuse controls: a keyed/HMAC identifier derived from normalised account input (key remains secret on server), per-action/global resource limits, per-account risk, network-level throttles and bounded recovery issuance. IP is one signal, never the sole control or student identity. No invasive device tracking or permanent device ban. Counter/incident expiry and bounded state retention prevent unbounded records. Prevent slow password-hash exhaustion and credential-stuffing from distributed sources. Security-related password changes/recovery have no waiting period.

## Identity/session boundaries

Only reconciled successful dues records support activation. Ownership verification occurs during activation, not dues registration. Administrative approval and verified position records are separate from self-entered claims. Use established Argon2id or a reviewed compatible password-hashing mechanism supported by the validated host; no custom crypto. Apply compromised-password screening and password-manager-friendly forms in the secure implementation. No shared/default passwords or credential disclosure in logs.

Use Secure/HttpOnly/SameSite cookies, session rotation/expiry/revocation, CSRF protection for writes, narrow CORS and safe same-site redirects. Derive level/student/active grants from current server records on every resource request; recheck role switches/revocations. Generic sign-in/recovery responses and comparable unknown-account hash work prevent enumeration. Do not disclose unfamiliar-account existence through messages, status codes or timing differences. Broad IP or account denial must not bypass verified-owner recovery.

## Recovery, email and administration

Provide Forgot Password and Contact Administrator through operational approved channels. Return generic responses. Tokens must be cryptographically random, stored hashed, short-lived, single-use and atomically consumed; no token in logs, analytics, referrer or public asset/cache. After reset, require the new password and revoke appropriate existing sessions. Administrator assistance requires verified identity, explicit permission, authenticated administrator, reason and durable audit. Never grant a role through recovery. Sensitive runbooks/records require authenticated access and must not be bundled in the public Help assets.

Email requires a validated provider/host capability, institutional-domain ownership, TLS, delivery/bounce handling, issuance limits and reviewed cost before integration. Smartweb capabilities/costs are unconfirmed. No paid service, DNS/mail configuration or live credential is authorised by this specification. Backups and retention must include recovery/counter/audit state appropriately; financial retention remains independent of graduation.

## Required M7/M8 tests

Atomic concurrent failure thresholds; exact deadlines/expired-stage advancement; no deadline extension while blocked; success reset; generic unknown-account responses/timing; distributed guessing/resource limits; deliberate lockout with owner recovery still working; existing-session continuity; reset-token replay/expiry/concurrent consume; account/level/role isolation; CSRF/redirect/session fixation and logout; immediate revocation; recovery logs without secrets. Sequential frontend/model tests cannot establish these server guarantees. No such live tests are claimed in M4.
