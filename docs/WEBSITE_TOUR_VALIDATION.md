# Website Tour — validation and review

Verified on **24 November 2026**. Branch: `feature/website-tour`. Starting source: `f7a851aeab4295e002e989db639cf8ec4efc6340` (`main`, including PR #6 Gallery/home visibility corrections). Design remains the provisional Guided Canvas direction, awaiting owner review.

## Executed results

| Check | Actual result |
| --- | --- |
| Clean installation | `npm ci` passed before implementation; dependency manifests remain unchanged |
| ESLint | `npm run lint` passed, no warnings/errors |
| TypeScript | `npx tsc --noEmit` passed |
| Unit/security/regression tests | `npm test` passed **90 individual tests**, including the existing 85 and five Tour tests |
| Dependency audit | `npm audit` passed: **zero advisories** across production and development dependencies |
| Production build | `npm run build` passed; static `/website-tour` generated |
| Static export | `npm run check:export` passed: **37 HTML pages, 91 local assets, 69 valid JSON-LD blocks**, no missing internal references or fragment targets |
| Browser interactions | Chromium/Playwright passed at **320, 390, 768 and 1440 px** |
| Automated accessibility | axe-core 4.14.1 whole-document scans: **zero violations** for WCAG A/AA rule tags tested at all four widths; incomplete/manual checks remain review items |
| Media | FFmpeg decoded the complete MP4 without errors; ffprobe verified H.264/AAC playback media and measured duration approximately **286.5 seconds** |
| Captions/transcript | 30 measured speech cues, nine contiguous chapters; text matches the authored narration; browser-loaded English cues become active at the expected playback time |
| Original checklist | SHA-256 remains `d59adce53568283274aac49b9fc7da88b3b9a97ec45a72c936e9e86f86f26c7b`; downloaded original verified |
| Gallery | Closed on initial homepage/Gallery load; open, next/previous, keyboard navigation, zoom, Escape and actual PNG watermarked download verified; Gallery source and original photos unchanged |
| Responsive review | Actual desktop/mobile screenshots inspected; corrected Tour side margins and heading contrast; reduced-motion playback scrolling exercised at 320 px |

The controlled environment requires ordinary elevated process permissions for Node's test-runner child processes. The final test run counted all **90 individual tests**, rather than treating five test-file processes as the result. No security checks were disabled or dependency overrides introduced.

The browser checks cover literal-text search (including injection-shaped input), composed category filtering, reset/empty states, pathway keyboard expansion, pending chapter seeking before metadata, play/pause via keyboard, native fullscreen, volume/mute properties, seek, real duration, loaded captions, transcript keyboard disclosure, video failure fallback, no pre-play MP4 request, no horizontal overflow, no empty image sources, no console/runtime errors in normal flows, homepage Tour entry, Menu navigation, and existing Gallery open/close regression. Expected media failure is induced only in a separate fallback test.

## Media and performance

The final movie is **5,925,776 bytes** (about 5.65 MiB). All Tour public media, including 12 genuine section previews, captions, transcript and poster, totals **6,457,334 bytes**. Large models, raw recordings and WAV intermediates stay outside the repository.

In an unthrottled local Chromium export check, DOMContentLoaded occurred at approximately **508 ms at 390 px** and **351 ms at 1440 px**. No movie request occurred before playback. These are controlled observations with locally fulfilled fonts and analytics disabled; they are not slow-network, physical-device or production performance benchmarks. The real website may differ.

## Review files

- [Desktop Tour, full page](website-tour-review/desktop-full.webp)
- [Mobile Tour, full page](website-tour-review/mobile-full.webp)
- [Desktop homepage entry](website-tour-review/homepage-desktop.webp)
- [Mobile homepage entry](website-tour-review/homepage-mobile.webp)
- [Playable narrated MP4](../public/media/website-tour/walkthrough.mp4)
- [English captions](../public/media/website-tour/captions.vtt)
- [Transcript](../public/media/website-tour/transcript.txt)
- [Timed storyboard and script](WEBSITE_TOUR_STORYBOARD.md)
- [Production, content and hosting guide](WEBSITE_TOUR.md)

The private static preview can be run with `node scripts/website-tour/serve.mjs out 3420`, then `/website-tour`. The environment has no configured public HTTP preview portal; this address is not a public link. Screenshots, the movie and an external review ZIP provide portable review evidence. The ZIP is kept outside the public website repository. The pushed branch provides GitHub-accessible versions of the review assets.

## Outstanding conditions and approvals

- Owner review of provisional visual design, Tour entry placement, pronunciation/pacing and the final educational video. Completion is not final visual approval.
- Real Android/iOS device, mobile OS media controls, screen-reader and human listening review; emulation/axe do not certify these.
- Production domain access is blocked by this environment's proxy. Live Pages playback, CDN seeking/ranges, contact mailbox delivery and external Drive availability are not claimed as tested.
- No externally hosted media account was used. Any future provider/account upload needs authorization. Monitor GitHub Pages bandwidth against anticipated viewing traffic.
- Existing Pages workflow runs on `main` and manual dispatch, not feature PRs. It was preserved. A push to this feature branch does not publish the Tour; do not manually dispatch the deployment as a substitute for PR validation.
- No merge, deployment, DNS/Cloudflare/hosting change, separate PHARMAIDEIA change, Editorial modification, real student record, payment or message was introduced.

After explicit publication approval, merge through normal repository protections, monitor Pages, and perform live homepage/Menu, Tour, captions/seeking, Resources/checklist and Gallery verification. The current work must remain a reviewable feature branch until then.
