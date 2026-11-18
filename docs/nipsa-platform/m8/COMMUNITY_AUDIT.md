# M8 Community audit and implementation boundary

Starting checkpoint: aacd56bebb83377b9b715dee2d299b2f13909710; clean existing checkout and preserved M6/M7 history. The attached 18 November M8 specification explicitly requests a dedicated review branch; `feature/pharmaideia-m8-community` branches from that checkpoint. This supersedes historical instructions to use only the development branch for earlier milestones. No production merge/deployment is authorized.

| Requirement | Existing M7 | M8 work |
| --- | --- | --- |
| Authenticated messages/replies/members/moderation/current session checks | Real native Node/SQLite operations | Preserve endpoints, persistence, academic/CBT boundaries and default-closed policy |
| Compact chat, title drawer, contextual actions, composer | Full-height chat, visible actions, Enter sends | Real-component UI changes; button-only send, Unicode code-point limit, keyboard/touch contexts |
| Official Admin sender, read acknowledgements, presence, search/pins | Missing | Additive migration and authorized native operations |
| Report original context | Confidential admin endpoint; current-message reference only | Encrypted snapshot, private confirmation and decision audit |
| Images | No chat images | Bounded canonical PNG only; browser conversion/compression; native content inspection/private storage; no arbitrary files |
| Private assistance/temporary consent-based DMs | Not implemented/previously unapproved | Newly approved here; actual participant-scoped encrypted threads, consent/block/expiry and independent support policy |
| Real hosting/email/push/scale/production readiness | Unverified/blocked | Remains blocked; loopback synthetic service is not a public production service |

Existing roles are student, representative, executive, administrator and reviewer. No President/other office records exist. Do not invent holders or titles from the reference image. Actual existing role grants provide identity labels; an administrator-maintained approved-office configuration can refine executive ordering. Technical moderation requires the existing active administrator role and fresh MFA; an executive/CR label does not grant moderation. Peer administrators cannot suspend one another through chat controls.

The public Next.js website, static export, approved Classic Standard identity, gallery watermarking and M7 examination engine are preserved. The supplied image establishes composition, not academic/personnel data. Baseline authenticated Chromium screenshots are captured at 360/390/768/1440 pixels before editing. All populated review data is explicitly isolated synthetic test data. M8 Community is a scoped increment, not completion of every outstanding pre-launch matrix item.
