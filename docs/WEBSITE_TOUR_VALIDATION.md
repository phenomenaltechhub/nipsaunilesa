# Website Tour — final refinement validation

Verified on **24 November 2026** on `feature/website-tour`, continuing from `d6c0528`. Remote `main` already contained PR #7 merge `4810f89` at session start. This session does not merge or deploy the refinements. The Guided Canvas structure and Tour entry points remain provisionally approved; final publication approval is outstanding.

## Executed verification

| Check | Result |
| --- | --- |
| Clean installation | `npm ci` passed; dependency manifests unchanged |
| ESLint | `npm run lint` passed without lint warnings/errors |
| TypeScript | `npx tsc --noEmit` passed |
| Unit/security/regression suite | `npm test`: **93 individual tests passed** (existing 85 plus eight Tour tests) |
| Dependency audit | `npm audit`: **zero advisories**, production and development |
| Production build | `npm run build` passed; `/website-tour` statically exported |
| Export/internal references | `npm run check:export`: **37 HTML pages, 91 local assets, 69 valid JSON-LD blocks**, no missing internal references/anchors |
| Media format | Actual bitstream and ffprobe: H.264 High / yuv420p / 1280×720 / 24 fps; **48 kHz AAC-LC mono** |
| Media duration | Both final streams are **286.5 seconds**; video contains exactly **6,876 frames**. Every encoded chapter meets its original duration and frame count |
| Full decode | FFmpeg decoded the entire final movie without errors |
| Browser | Chromium **154.0.8037.57**, Playwright at **320, 390, 768 and 1440 px** |
| Seeking/captions | All nine chapters seek to completed, decoded positions at every width; their English captions become active at the expected times |
| Accessibility | Whole-document axe-core 4.14.1 WCAG A/AA rule-tag scans: **zero violations** in tested states; keyboard/reduced-motion checks passed |
| Images/screenshots | All visible images decoded and have nonzero intrinsic dimensions before capture; 3 illustrated destination previews on phones and all 11 at tablet/desktop widths |
| Website regression | Homepage visibility, Tour entry/Menu, Gallery closed initial state, open/navigation/Escape passed; Gallery zoom and actual watermarked PNG download exercised in genuine recording |
| Original documents | Orientation Checklist SHA-256 unchanged; original Open/Download actions verified in Chromium |

The clean install reports an existing ESLint 9 support/deprecation notice. No vulnerable dependency was reported; dependency upgrades are outside this focused refinement. No audit or deployment check was disabled. Node tests were executed with the environment permissions required for all individual test cases, not merely counted as test-file processes.

Browser checks also cover literal search and injection-shaped input, category composition, reset/empty state, preserved directory/pathway links, native play/pause/fullscreen, volume/mute properties, transcript disclosure, no movie request before playback (including after directory scrolling), no horizontal overflow, no empty sources, no introduced console/runtime errors, and the deliberate media-failure fallback. Native player evidence is captured after centering/settling the view; no website UI is hidden. Screenshots and viewport emulation do not certify physical-device or screen-reader accessibility.

## Image diagnosis and focused changes

[The original diagnosis](website-tour-review/image-loading-diagnosis.json) reproduced 10 unloaded lazy images at 390 px and five at 1440 px after full-page capture. All decoded after real scrolling. The product keeps native lazy loading; the QA helper now scrolls, awaits decoding and checks image dimensions before screenshots.

On phones, secondary destinations are compact text rows with all descriptions and links retained. At 390 px, the fully loaded page changes from 8,314 to 7,772 px (542 px shorter). All 11 destinations, 13 directory links, six pathways, search and filters remain. Desktop layout is unchanged. The film panel alone is drawn above the ambient decorative watermark to keep playback legible.

The video uses restrained zooms on genuine recorded PDF controls, grading-scale inputs, example calculations and Gallery commands. Welcome/closing recordings use the real session-dismiss action for floating Ads. A narrower landscape Navigator recording makes the actual Map/Directory functionality and missing-coordinate explanation readable without pillarboxing. [Focused change report](WEBSITE_TOUR_REFINEMENTS.md).

## Timing, data and performance

The final movie is **8,006,573 bytes** (about 7.64 MiB); all public Tour media totals **8,536,791 bytes**. No raw recordings, previous movie copies, model weights or WAV intermediates are committed. Actual encoding and integrity data is available in [media-metadata.json](website-tour-review/media-metadata.json).

The narration PCM, caption/transcript bytes and all nine chapter boundaries remain unchanged. A regression test rejected the original 96 kHz AAC configuration. A separate timing test rejected a short intermediate video-only encode; final per-chapter and stream-level assertions prevent cumulative visual drift against the original narration.

In an unthrottled local check, DOMContentLoaded was approximately **331 ms at 390 px** and **474 ms at 1440 px**, with **no movie request before playback**. Existing fonts were locally fulfilled and analytics disabled only in the private QA context. These are local observations, not production/mobile-network benchmarks.

The Orientation Checklist remains SHA-256 `d59adce53568283274aac49b9fc7da88b3b9a97ec45a72c936e9e86f86f26c7b`. Source original photos, Gallery Canvas implementation, public website logos, PHARMAIDEIA, Editorial, package/lock files and deployment configuration are unchanged.

## Review files and remaining conditions

[Desktop/mobile screenshots and evidence](website-tour-review/README.md) · [Final MP4](../public/media/website-tour/walkthrough.mp4) · [Captions](../public/media/website-tour/captions.vtt) · [Transcript](../public/media/website-tour/transcript.txt) · [Script/storyboard](WEBSITE_TOUR_STORYBOARD.md) · [Maintenance/reproduction guide](WEBSITE_TOUR.md)

Physical Android/iOS playback, Safari/Firefox, production CDN seeking/ranges and live-host playback remain **unconfirmed**. Chromium is the only installed browser engine. The environment has no public HTTP preview portal and cannot access the production domain through its network policy. External mailbox/Drive delivery is not claimed as verified. Owner review of the final video and publication approval remain necessary.

Private preview: `node scripts/website-tour/serve.mjs out 3420`, route `/website-tour`. This is not a public phone URL; the pushed branch and downloadable assets provide review access. The existing Pages workflow runs on main/manual dispatch and is preserved. After explicit approval, use a normal refinement PR, wait for required checks/protections, merge only when authorized, monitor Pages and verify the live Tour, captions/seek, Resources PDF and Gallery. No production dispatch, DNS or hosting change is part of this work.
