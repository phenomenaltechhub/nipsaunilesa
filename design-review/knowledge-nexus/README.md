# PHARMAIDEIA — Knowledge Nexus refinement review

Prepared 17 November 2026 on `development/nipsa-student-platform`, continuing verified M3 commit `ea43d47dddadc5d09a32b4e3d919f7344e52a42c`. **These are candidates, not a final identity.** Active PWA/website logos, manifest icons, prior studies and application functionality remain unchanged.

The owner's attached Knowledge Nexus Scholar Edition / Scientific Insignia Student Edition comparison is the visual direction. Geometry is newly authored as editable paths, not a raster trace or a copy of NIPSA National artwork. No uploaded image is embedded in the masters. The earlier Molecular Monogram is not developed further here.

## Review options

| Option | Foundation and fusion decisions | Review files |
| --- | --- | --- |
| **01 / A — Classic** | Retains flowing layered pages and the central hexagonal molecular spine. A mortarboard chevron, lower cap band and optional tassel connect through the upper molecular vertex. Shared optical alignment/weighting brings Insignia balance without a separate enclosing crest. | [Detail](exports/a-classic-detail.png), [six contexts](exports/a-classic-application-previews.png) |
| **02 / B — Institutional** | Cap corners extend into the book's outer cover rails. These shared edges and the lower page fold form the institutional boundary; an extra crest is not placed around Classic. The cap, molecular centre and flowing pages remain visible. | [Detail](exports/b-institutional-detail.png), [six contexts](exports/b-institutional-application-previews.png) |
| **03 / C — Essential** | Retains the cap/band/hexagon/spine and institutional lower fold. One broad inner leaf replaces narrow page bands, thicker bonds improve raster survival, and the tassel is omitted. Extended side rails are reduced to the open book cover. | [Detail](exports/c-essential-detail.png), [six contexts](exports/c-essential-application-previews.png) |

Start with the [numbered comparison](exports/knowledge-nexus-numbered-comparison.png), [native-size comparison](exports/knowledge-nexus-native-size-comparison.png) or [read-only browser review](index.html). The browser page uses no JavaScript, forms, account fields or external requests. Opening `index.html` after extracting the bundle retains actual 16/24/32/48/64px image widths; 512px images scale down to fit narrow screens and remain downloadable at their native dimensions.

## Masters and export system

`masters/`: 54 passive SVG files, with light/dark/mono/white standalone emblems, optical emblems, horizontal/stacked lockups, and standard/optical app icons for each option. All brand lettering is original project-authored path geometry, reused from M3 with refined tracking and lockup spacing. Symbols and wordmarks have no raster, external font, script, external reference or filter dependency. Backgrounds/counters in transparent emblems are genuine transparency. App-icon backgrounds are intentional solid emerald; they are candidate icons and not installed manifest assets.

`exports/sizes/`: 84 genuine PNG files: three options × seven dimensions (16,24,32,48,64,192,512) × standard/optical × standalone/app icon. `size-catalog.json` maps exact names and sizes. `exports/` also contains 14 comparison/detail/context and desktop/mobile Dashboard review images. PNG sheets are smartphone-friendly 1080px wide; individual application captures retain 390/1440px width.

`preview-validation.json`: six actual Chromium viewports on disposable branded copies, working focus controls, no overflow/runtime/external request errors and unchanged source-tree hash. `validation.json`: XML/passive-content checks, two render engines, PNG decode/dimension checks, native CSS sample sizes and colour measurements. `SHA256SUMS`: integrity hashes of review files; not a cryptographic signature or publisher identity guarantee.

## Legibility findings — visual review, not certification

- **16px:** use optical geometry. The board/band and open-book silhouette remain the main cues; individual molecular nodes and the tassel cannot be reliably distinguished. Classic's standard page bands look busy. Institutional's perimeter is heavier and more enclosed. Essential gives the clearest open spaces in this review.
- **24px:** optical cap/book and central molecular aperture are clearer; node circles remain subordinate. Classic/Essential intentionally share the same simplified optical geometry, rather than retaining fine details that close up. Institutional retains its shared perimeter.
- **32px:** the standard Classic/Institutional constructions become useful; fine tassel/leaf details are still secondary. Essential remains the least detailed option.
- **48/64px:** flowing page bands, cap band and central bond structure read more clearly. The Classic/Institutional tassel is visible, with a slight intentional right-side asymmetry.
- **192/512px:** native PNGs and detail sheets show complete page curves, cap geometry, node proportions and lockups. Art is recentered vertically on the 240-unit master for even top/bottom margins.

These observations come from actual native pixel renders and visual inspection, not enlarged artwork alone. They do not prove recognition on every device, physical-phone usability or accessibility conformance. Owner/device review is still required. Molecular geometry is abstract symbolism, not a particular compound or clinical claim. The insignia is a departmental identity candidate, not an official university seal.

## Application previews and safeguards

Each six-context sheet shows smartphone home icon, splash, static student-login branding, actual mobile Dashboard layout, actual desktop application header and promotional presentation. Login/home/splash/promotion are labelled artwork studies. They create no account, service or published announcement. Dashboard/header captures use a temporary copy of the existing PWA with candidate header artwork, exercise the real timer controls, and leave the original tree byte-for-byte unchanged. No fake names, courses, academic dates or institutional records are added.

Reproduce with `npm run review:nexus`; validate existing exports with `npm run check:nexus`. Uses existing Sharp and the cloud-provided Chromium/Playwright tooling; no dependency is added. The preview tool changes only disposable files and deletes them afterwards. The new review folder stays outside the website/PWA export and public offline cache. No production deployment or DNS action is performed.

Selection of A/B/C, final page density, tassel preference and approval of optical-size use remain outstanding. Final asset replacement requires a later explicit owner approval. See [full completion report](../../docs/nipsa-platform/KNOWLEDGE_NEXUS_REVIEW.md).
