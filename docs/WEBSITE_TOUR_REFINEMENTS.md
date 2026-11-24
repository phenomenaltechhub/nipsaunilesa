# Website Tour — final pre-publication refinements

The provisionally approved Guided Canvas layout, nine chapters, educational structure and Tour entry points are preserved. Work continues on `feature/website-tour` from implementation commit `d6c0528`.

At the start of this session, remote `main` already contained PR #7's merge commit `4810f891ec5cf6f8094f33e7c5b77865ae10c299`. This session does not merge, deploy or change production configuration. These refinements require a new normal review/approval before publication.

## Focused findings and changes

| Area | Finding and correction |
| --- | --- |
| Blank destination art | A full-page capture left **10/11 images unloaded at 390 px and 5/11 at 1440 px**. All 11 decoded after real scrolling at both widths. No missing image or rendering defect was found. Capture tooling now scrolls, awaits `decode()`, verifies intrinsic dimensions and returns to the top; product lazy loading remains intact. |
| Audio compatibility | The original file actually used **96 kHz AAC-LC**. The encoder now explicitly outputs **48 kHz AAC-LC, mono, 64 kb/s** after loudness normalization. A binary AudioSpecificConfig test rejects 96 kHz. |
| Instructional visibility | Fresh genuine recordings add pointer pauses. Short camera zooms highlight PDF Open/Download, the sample grading scale, illustrative inputs, the actual GPA result and Gallery commands. The Navigator uses a responsive 640×360 landscape recording scaled to the common frame, replacing narrow pillarboxing. |
| Chapter synchronization | An intermediate video-only encode exposed short screencast tails. The pipeline now normalizes constant-rate timestamps and holds the final genuine frame only as needed to fill each original chapter slot. Every chapter's duration/frame count is asserted. The final stream is exactly **6,876 frames at 24 fps / 286.5 seconds**, matching the unchanged audio timeline. |
| Mobile length | Eight secondary destinations become compact text rows on phones; the three featured screenshots remain illustrated. The 390 px full page decreases from **8,314 to 7,772 px** (542 px, about 6.5%). All 11 destinations, 13 directory links, full descriptions, filters, search and six student pathways remain. Desktop layout is unchanged. |
| Introductory presentation | Welcome/closing recordings use the website's actual session-dismiss button for floating Ads. No production control is hidden with CSS, no functionality is removed, and the dedicated Student Ads chapter remains. |
| Playback visibility | Only the Tour film panel is stacked above the decorative ambient watermark, keeping footage and controls clear while preserving surrounding branding and layout. |
| Review accuracy | All visible images are decoded before capture. Native-player evidence waits for smooth scrolling to settle, avoiding a misleading transient screenshot beneath the sticky header. |

No website screens were retyped or fabricated. Zooms operate on original recorded pixels and return to full context. Actual `DEMO A/B` calculations remain explicitly illustrative. The sample grading scale is not verified university policy. Gallery downloads remain generated from the original Canvas implementation, and the Orientation Checklist and original photos remain unchanged.

## Preserved timing and media integrity

The original narration PCM is unchanged (SHA-256 `9cf582e689ef7277e275257d77db7009c267b383d71e46f99748868b8a861bed`). Caption and transcript bytes are unchanged:

- Captions: `af82b34e773ac984e873c9df93005841eb3bcf2cd53e2dac0234ce259ea3306d`
- Transcript: `d80a528f42e4f421f4acc8e8a164fc83142a12b7c4f1eb3cce1fb9b8ed31c566`

The nine chapter starts/ends and text remain identical to the approved implementation. [Verified media metadata](website-tour-review/media-metadata.json) includes actual codecs, frame count, stream duration, sample rate, file size, SHA-256 and the camera plan. The video remains H.264 High / yuv420p / 1280×720 / fast-start MP4. Large source recordings, previous movies, models and WAV intermediates are not committed.

## Review and remaining conditions

[Full screenshots and comparison](website-tour-review/README.md) · [Final movie](../public/media/website-tour/walkthrough.mp4) · [Validation](WEBSITE_TOUR_VALIDATION.md)

Playback/seeking and caption alignment are tested in the available **Chromium 154** at 320, 390, 768 and 1440 px. Physical Android/iOS and other browser engines are unconfirmed. The environment cannot verify the live domain/CDN or offer a public HTTP preview portal. These limitations do not imply a production or physical-device pass.

No dependencies, public website logos, Gallery implementation, separate PHARMAIDEIA application, Editorial Dashboard, PDFs, deployment checks, DNS or hosting settings are changed. Final owner publication approval remains outstanding.
