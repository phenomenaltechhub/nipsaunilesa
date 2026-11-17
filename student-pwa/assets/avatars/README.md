# Curated PHARMAIDEIA avatars

Twenty original static vector illustrations, generated from hand-authored geometry in `scripts/generate-pharmaideia-avatars.mjs`. No third-party avatar pack, real face, student identity or uploaded image is used. Clinician illustrations are appearance choices, not verified professional positions.

The editable individual SVGs and `atlas.svg` are reproducible with `npm run assets:pwa`. The UI uses one atlas request, generated CSS positions and allowlisted IDs in `src/modules/account/avatars.js`. Keep all SVGs passive: no scripts, external references, event handlers or foreign objects. The integrity check verifies all 20 files and the atlas.

Selection is a native labelled radio-card control with a full-card pointer target and keyboard focus. Only an explicitly opted-in curated ID may persist on the device. Account records and profile-photo uploads remain unavailable. See `docs/nipsa-platform/DESIGN_SYSTEM.md` for boundaries and maintenance.
