# Approved PHARMAIDEIA identity — Classic Standard

Owner approval in M4, 17 November 2026: **Knowledge Nexus — Classic — Standard**. The source is `design-review/knowledge-nexus/masters/a-classic-*` standard artwork. Graduation cap, flowing open-book geometry, molecular structure, emerald/teal palette and proportions are preserved. No Institutional/Essential/optical substitution is authorised, including at 16px. Small molecular details soften at tiny sizes as noted in the review; that does not authorise a different variant.

- `symbol.svg`, `symbol-dark.svg`, `symbol-mono.svg`, `symbol-mono-light.svg`: approved standard geometry, transparent light/dark/one-colour artwork.
- `logo-primary.svg`, `logo-dark.svg`, `logo-stacked.svg`: original path-based wordmarks, no font dependency.
- `app-icon-master.svg`, `favicon.svg`, `icon-{16,24,32,48,64,192,512}.png`: same Standard artwork; no responsive optical replacement.
- `maskable-master.svg`, `maskable-{192,512}.png`: Standard geometry proportionally inset into an opaque background, with artwork inside the maskable safe circle.
- `apple-touch-icon.png`, `favicon-32.png`: ordinary platform assets. Manifest icon paths retain their existing purpose/scope and now contain approved artwork.

Regenerate using `npm run assets:pwa`; check with `npm run check:brand` and the exact-geometry unit test. The generator reads preserved approved SVG masters and changes only accessible title metadata before rasterising. No raster is embedded in a master. Startup/Dashboard branding uses these assets; platform splash presentation depends on browser/OS. Main website identity/watermark is separate and unchanged.

Original M1 source geometry/generator is preserved under `design-review/brand-history/` and Git history. Previous review families remain unchanged. Historical generators are not the current identity build commands.
