Title: Integrate M8 Community chat, private support and website references

Base: development/nipsa-student-platform
Head: feature/pharmaideia-m8-community

The existing authenticated Community gains a responsive green/teal group-chat interface with contextual touch/keyboard actions, button-only multiline send, real read acknowledgements/typing, official Admin attribution, confidential moderation, protected image delivery, consent-based expiring replies and separately assigned private support. Owner group messages can be corrected through 30 minutes from their original send time, with server ownership/time/revision enforcement.

Students can reference actual public website content using attachment suggestions, `/website`, known titles or canonical URLs. Previews appear above messages and linked titles open the existing public destination. The shared picker also supports private/support messages and authorized notices. Static website builds generate a public-only metadata feed; external refresh remains off until approved publication/network verification. Existing Navigator candidates remain explicitly unverified; no coordinates, official records or missing article URLs are invented.

Validation: 216 unit/backend/security tests; lint/type/PWA checks; four-width actual browser/touch/keyboard/private/privacy/reference suites; 16 Playwright screenshot comparisons; scoped axe scans; long-history/slow-device measurements; M5/M6/M7/public-site/gallery regressions; successful production build/static export. Review screenshots, captioned recording, exact commands and limitations are in design-review/m8 and docs/nipsa-platform/MILESTONE_8.md.

Production dependency audit has zero advisories. Full audit remains blocked by the existing unpatched picomatch development-tool advisory (14 high dependent entries, one advisory); no audit suppression or unsafe override is introduced. Real infrastructure/provider/source/retention/device/capacity acceptance remains mandatory before launch. No production deployment, real account/payment activation, workflow/DNS/hosting change or main merge is included. Original approved branding, gallery watermarking and M7 engine contracts remain preserved.

Publication note: this is prepared PR text, not evidence of an opened PR. GitHub currently rejects the cloud managed credential. Restore authorized access, verify the remote and push normally before opening a review PR against the development branch. Do not bypass checks or force-push.
