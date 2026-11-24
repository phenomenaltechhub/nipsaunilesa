# Website Tour — implementation and maintenance

The `/website-tour` page retains the provisionally approved **Guided Canvas** layout, educational structure, nine chapters and Tour entry points. Final media and publication approval remain outstanding. The initial implementation was already merged externally through PR #7 before this refinement session; these refinements are confined to `feature/website-tour` and are not authorized for merge or deployment.

## Implemented experience

- Native HTML video playback, English captions, nine seekable chapters, readable and downloadable transcript, and an error fallback.
- No autoplay. `preload="none"` and a genuine poster defer the movie request until a visitor chooses playback.
- Eleven searchable public destinations, category filters and six expandable student pathways work independently of the video.
- A normal-flow homepage entry, desktop `Tour` button, `Tour` in the existing Menu at all widths, and a contextual Resources link. No popup, floating obstruction or obsolete guided overlay.
- Existing header/footer, canonical/Open Graph metadata, breadcrumbs and sitemap. No application dependencies added.

Media lives under `/media/website-tour/`, separate from the clean `/website-tour` page, so a public asset directory cannot compete with the extensionless HTML route on static hosting.

## Truthful boundaries

Recordings and section previews were freshly captured from a local production static export of corrected `main` commit `f7a851aeab4295e002e989db639cf8ec4efc6340`, including the merged Gallery/home visibility correction. Stage 1 media is historical and is not used. The private environment cannot access the production domain through its proxy, so these are source-build demonstrations, not claims of a live-host recording.

The original Orientation Checklist remains byte-for-byte unchanged (SHA-256 `d59adce53568283274aac49b9fc7da88b3b9a97ec45a72c936e9e86f86f26c7b`). Its Open action and original download are demonstrated. A headless PDF popup is not substituted with fabricated document footage.

GPA entries `DEMO A` and `DEMO B` are isolated illustrative inputs: 3 × 5 and 2 × 4 over 5 units = 4.60. A recording annotation identifies them as examples. The sample scale is not verified university policy. Browser-only tools are not authenticated academic records. PHARMAIDEIA is Coming Soon. Public Community information is distinct from its future app chat. Navigator has zero verified mapped destinations and no routes; candidate records and mobile Map/Directory switching are shown without invented pins. Student Ads sample labels and published external-contact boundaries are retained. No messages, orders or payments are sent.

Mailbox delivery, external Drive access, physical phones, production CDN range responses and production playback remain unverified. Browser tests emulate viewports; they do not constitute physical-device or accessibility certification.

## Content and future Editorial integration

`app/website-tour/content.ts` owns introductory copy, typed destination records, pathways and descriptions. `app/website-tour/media.json` owns the verified date, pinned source commit, local media URLs and measured chapter timing/transcript paragraphs. `scripts/website-tour/narration.json` is the complete authored recording script. See [the timed storyboard](WEBSITE_TOUR_STORYBOARD.md).

A future authenticated Editorial API may supply this same public schema after validation: title/description/canonical path, intro, public media URL, poster, caption language/URL, transcript, ordered chapter IDs/titles/start/end, destinations/alt text, pathways, FAQs and verification date/source version. Accept same-origin paths or explicitly approved HTTPS media hosts; reject script/data URLs, unsafe redirects, arbitrary HTML and unsupported MIME types. Keep text escaped and publish only reviewed public content. Authorize and audit changes on the Editorial server. No Editorial service, publishing system, upload endpoint or backend was introduced here.

When significant website functionality changes, re-record affected chapters, regenerate timing/captions/transcript together and update `verifiedOn`. Do not simply change the date on old footage. Review expiring events, advertising listings and availability statements before publication.

## Media production and licences

The shipped MP4 is an edited genuine screen recording, with original educational narration generated locally using an English neural voice. No third-party account or media upload was used. Raw recordings, WAV files, large model weights, historical Stage 1 footage and Python environments are excluded from Git and the static site.

Production tools (outside website dependencies):

- Playwright 1.62.1 and installed Chromium, for real navigation/controls/downloads and recordings. Playwright Apache-2.0; Chromium third-party notices remain with the installed browser.
- FFmpeg 7, H.264/yuv420p at 1280×720/24 fps, 48 kHz AAC-LC mono at 64 kb/s, fast-start MP4. The output sample rate and profile are explicit encoder settings and are verified against the actual bitstream. Codec/tool licensing remains with the installed binaries; neither is redistributed in the app.
- `sherpa-onnx==1.13.8`, Apache-2.0 ([licence](website-tour-licences/SHERPA_ONNX_LICENSE.txt)). Version 2.0.3 removed this model's built-in pronunciation frontend and was unsuitable for this workflow; it is not used.
- Piper `en_US-ljspeech-high` neural model: [release archive](https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/vits-piper-en_US-ljspeech-high.tar.bz2), SHA-256 `00c6408d2409050312193b0d40ae07fde28af7d3d45a56efcc55440db516b935`. Its [model card](website-tour-licences/LJSPEECH_MODEL_CARD.txt) identifies the public-domain [LJ Speech dataset](https://keithito.com/LJ-Speech-Dataset/). Only generated narration is shipped; model weights and bundled pronunciation tools are not redistributed. The voice is synthetic, not an institutional spokesperson. Owner review of pronunciations is still appropriate.
- Existing DM Sans and Space Grotesk families were fulfilled locally in the capture browser because Google Fonts is blocked here. OFL-1.1 fonts are tooling inputs only; no website font or styling substitutions were committed. Analytics was a no-op only in the private capture/test contexts.
- axe-core 4.14.1, MPL-2.0, used outside the app for automated checks. The application does not load axe or Playwright.

### Reproduce

Use an authorized private workspace, an immutable copy of the source commit's `out/`, an external Python environment, Playwright/Chromium/FFmpeg, and the verified voice model. Do not put tooling caches in `public/`.

```sh
npm ci
npm run build
node scripts/website-tour/serve.mjs /path/to/immutable-source-export 3421
# In another terminal:
python3 -m venv /path/to/production-venv
/path/to/production-venv/bin/pip install sherpa-onnx==1.13.8 numpy
/path/to/production-venv/bin/python scripts/website-tour/produce-audio.py /path/to/extracted-model /path/to/work
TOUR_FONT_DIR=/path/to/fonts node scripts/website-tour/record.mjs /path/to/work
TOUR_FONT_DIR=/path/to/fonts node scripts/website-tour/capture-sections.mjs
python3 scripts/website-tour/encode.py /path/to/work
```

Optional `TOUR_CHAPTER=gallery` or a comma-separated list of chapter IDs re-records selected chapters without discarding completed recordings; encoding reads each individual chapter log. `PLAYWRIGHT_BROWSERS_PATH` may be needed for the installed recording FFmpeg binary. `CHROMIUM_PATH` can override the browser path. `TOUR_SOURCE_URL` defaults to the private source server. Preview stills are produced separately by `capture-sections.mjs`; recordings do not overwrite them unless `TOUR_CAPTURE_STILLS=1` is explicitly set. Capture logs record genuine action times, raw media paths and errors. They contain only public site data and isolated examples.

Audio cue lengths are measured from generated PCM samples and padded to the storyboard's minimum action time. VTT cue boundaries follow those exact spoken segments, including the short lead-in; the same text generates the narration and transcript. The encoder trims capture pre-roll, adds the corresponding chapter narration, normalizes loudness and concatenates chapters. Navigator uses an authentic 640×360 responsive landscape viewport, scaled to the same 16:9 frame, so its actual Map/Directory controls and explanation are readable without pillarboxing. Pointer highlighting and the explicit GPA example annotation are recording aids only, not website modifications. Welcome/closing footage uses the real floating Ads control’s session-dismiss action; no CSS hides production functionality. `editing.json` defines short, smoothly eased camera zooms over the original recorded pixels for the PDF buttons, sample scale, example inputs/result and Gallery commands. The encoder keeps one continuous narration stream, forces 48 kHz AAC-LC after loudness normalization, and records verified encoding metadata in the application manifest and `docs/website-tour-review/media-metadata.json`. It does not retype, replace or fabricate website screens. Screencast tails can be slightly shorter than their wall-clock slots; the encoder holds each final genuine frame as needed and asserts exact 24 fps chapter frame counts, preventing cumulative drift against the unchanged narration. Both final streams must meet the original 286.5-second timeline.

### Hosting decision

Use the optimized local MP4 for this review: it works with GitHub Pages, introduces no account or embed tracking, and can be replaced atomically with its captions/timeline. The movie is below the 25 MiB regression-test ceiling. The page loads only its poster and lazy section images until playback. A complete view transfers approximately the encoded movie size; evaluate projected monthly viewing traffic against GitHub Pages limits before publication. If traffic requires external hosting, obtain owner approval first, preserve caption/transcript access and test provider privacy, CORS, range seeking and mobile playback. Do not commit raw production assets or silently switch providers.

## Verification and release

```sh
npm ci
npm run lint
npx tsc --noEmit
npm test
npm audit
npm run build
npm run check:export
node scripts/website-tour/serve.mjs out 3420
# Requires external QA tools, no new application dependencies:
TOUR_FONT_DIR=/path/to/fonts TOUR_AXE_PATH=/path/to/axe.min.js \
  node scripts/website-tour/browser-smoke.mjs /path/to/review-output
ffprobe -v error -show_format -show_streams public/media/website-tour/walkthrough.mp4
ffmpeg -v error -i public/media/website-tour/walkthrough.mp4 -f null -
```

For screenshots, `loadReviewImages` scrolls each visible image into view, awaits `decode()`, checks intrinsic dimensions and then returns to the top. Full-page capture alone does not trigger all native lazy images. Keep product lazy loading intact. Secondary phone destinations are compact text rows with all descriptions and links retained; the three featured previews remain illustrated.

See `WEBSITE_TOUR_VALIDATION.md` for executed results and remaining review requirements. A private server is not a public preview URL. Downloadable review screenshots and media are provided separately and linked in the PR/review report.

After owner design/narration approval: review the focused PR into `main`, wait for all required checks and repository protections, explicitly authorize merge/publication, merge using the supported method, monitor GitHub Pages, then verify `/website-tour`, homepage/Menu entry points, MP4 range seeking/captions, Resources PDF and Gallery on the live domain. No DNS, Cloudflare, hosting or separate app changes are required.
