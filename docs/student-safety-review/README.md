# Student Safety Notice — review

The popup uses the owner-confirmed departmental policy and NIPSA's existing identity. The university reference site was proxy-blocked; its exact popup behavior was not copied or claimed as verified.

- [Exact popup wording](NOTICE_TEXT.md)
- [Implementation, privacy, versioning and maintenance](../STUDENT_SAFETY_NOTICE.md)
- [Desktop popup](desktop-popup.webp)
- [Mobile popup](mobile-popup.webp)
- [Mobile scrolled content and official university link](mobile-popup-bottom.webp)
- [Desktop homepage after dismissal](desktop-homepage-dismissed.webp)
- [Mobile homepage after dismissal](mobile-homepage-dismissed.webp)
- [Desktop permanent reopening entry](desktop-entry.webp)
- [Mobile permanent reopening entry](mobile-entry.webp)

Validation: 96 individual tests passed, including existing security, Gallery, academic tools, Navigator and Tour tests plus three notice tests. ESLint, TypeScript, production build and static-export validation passed (37 HTML pages, 91 local assets, 69 JSON-LD blocks). Dependency audit reports zero advisories; dependencies are unchanged.

Chromium at 320/390/768/1440 px verified automatic display, Close/I Understand/Escape, matching-version persistence, old-version redisplay, manual reopening, focus containment/restoration, viewport fit, internal scrolling and reachable actions. Whole-document axe WCAG A/AA scans found zero violations in these tested modal states. Gallery and Tour playback/seeking worked after dismissal. Isolated tests verified denied storage, coordination with another open dialog, and unobstructed server-rendered homepage when JavaScript is disabled. QA observed only read-only GET/HEAD traffic (existing Next.js prefetch uses HEAD); no notice submissions or new collection endpoint exists.

Physical phones and screen readers were not tested. Browser emulation/axe is partial evidence, not accessibility certification. The popup requires JavaScript; without storage permission, a full reload may show it again. The local preview is on port 3420 at `/`, not a public phone URL. Review screenshots are genuine browser captures; font files were fulfilled locally from the existing approved families and analytics disabled in the QA context only.

No merge or production deployment has been performed. Final owner approval is required.
