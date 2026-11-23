# Orientation Checklist update

Prepared 23 November 2026 on `update/orientation-checklist-2026`, based on
`origin/main` at `92d890a39d9ac056d81e758ebeafb9b96ed781e0`.

## Document and scope

The owner's upload is named `Nipsa-study-skills-guide.pdf`, but its content is
**Orientation Checklist — 2026 Edition**, 11 A4 pages. It is published in this
branch as `public/resources/department-orientation-checklist.pdf`, unchanged:

- Size: 520,311 bytes.
- SHA-256: `d59adce53568283274aac49b9fc7da88b3b9a97ec45a72c936e9e86f86f26c7b`.
- Document text was treated as content, not implementation instructions.
- No JavaScript, encryption or interactive PDF forms were reported by `pdfinfo`.

The existing Study Skills Guide PDF is a separate document and remains unchanged.
The PDF's original content, layout, embedded links and unpublished-contact
placeholders are preserved. No institutional information was invented.

The owner requested **PDF only**. The old TXT checklist is removed; every current
website reference now points to the PDF or its Resources card. Previously saved
direct links to the retired `.txt` file will no longer resolve after publication.

## Changed files

- `public/resources/department-orientation-checklist.pdf`: original uploaded PDF.
- `public/resources/department-orientation-checklist.txt`: retired.
- `app/resources/page.tsx`: 2026 edition, PDF/11-page metadata, separate Open and
  Download links, stable `orientation-checklist` anchor.
- `app/page.tsx`: updated checklist description in the Resources preview.
- `app/announcements/[slug]/page.tsx`: orientation announcement links directly to
  the checklist card.
- `app/globals.css`: card-specific anchor spacing and minimum 44px action height.
- `scripts/check-static-export.mjs`: verifies PDF output, byte preservation and
  the card anchor/link.
- This review and publication note.

No PHARMAIDEIA, Editorial, portal integration, gallery, dependencies, DNS,
Cloudflare, domain configuration or deployment workflow files were changed.
The separate M9 branch remains at `50342e3484d98c1684fbeb1f59391510270017c6`.

## Verification

Executed successfully:

```sh
npm ci --no-fund
npm run lint
npm test
npm run build
npm exec tsc -- --noEmit
npm run check:export
git diff --check
```

- 72 unit/security tests passed.
- Static export: 35 HTML documents, 72 local assets and 65 valid JSON-LD blocks;
  no missing internal references.
- Source, exported, HTTP-served and browser-downloaded PDF bytes matched the
  uploaded SHA-256. All 11 pages rendered successfully with Poppler and were
  inspected in a page comparison sheet.
- Playwright/Chromium against the production export at 1440×1000, 390×844 and
  320×740 passed: PDF-only actions, opening a new tab, safe tab isolation, PDF
  content type, download name/integrity, keyboard order/visible focus, 44px
  controls, no horizontal overflow, orientation announcement anchor, homepage
  and header navigation, unchanged other resource links, no runtime errors.
- Existing `scripts/campus-navigator-browser-smoke.mjs` passed at 1440×1100 and
  390×844, including search, filters, details and mobile view switching.
- Browser review captures and the repeatable checklist browser script are
  supplied as chat artifacts. Third-party requests were blocked during capture.

Initial build attempts hit a local-port sandbox restriction. After local access
was granted and the failed generated cache was moved aside, the normal
`npm run build` passed. No build configuration was altered.

Not established: physical Android/iOS or Safari behavior, native PDF-viewer visual
rendering in headless Chromium, live hosting content types/cache behavior, or
post-publication functionality. Browser tab requests/downloads and independent
PDF rendering were verified; those are separate checks.

## Existing dependency release blocker

`npm audit --json` completed with exit 1: **8 moderate vulnerable package entries**
in the unchanged dependency tree. These affect Next.js and ESLint's transitive
TypeScript/minimatch tooling. No high or critical advisories were reported.

- Next.js 16.4.3: audit recommends 16.4.6; reported issues concern server cache,
  response handling, Edge cookies and image optimization. This site exports
  static files with image optimization disabled, so those server features are
  not running on GitHub Pages. This is not a claim of general immunity.
- Transitive `minimatch` advisory: `GHSA-g3hv-75wg-m249`, propagated through the
  TypeScript ESLint packages. Audit reports a supported fix is available.

Dependencies were preserved to keep this document update focused. The existing
Pages workflow runs unfiltered `npm audit`, so these findings must be resolved
and revalidated before approval to publish. No audit check was bypassed or
silenced.

## Exact publication steps — only after owner approval

1. Review a PR from `update/orientation-checklist-2026` into `main`, including the
   PDF itself. Resolve the existing dependency findings in separately reviewed
   maintenance work and repeat the validation commands above.
2. Obtain the owner's approval for the final diff. Do not merge while required
   checks or the audit fail.
3. Merge the approved PR using the repository's permitted normal merge method.
   Do not force-push or change protections.
4. Monitor **Deploy Next.js to GitHub Pages** for the resulting `main` commit.
   Its existing install/lint/tests/audit/build/export/upload/deploy steps should
   all succeed. Feature-branch pushes do not trigger this main-only workflow.
5. After deployment, open `https://nipsaunilesa.com.ng/resources#orientation-checklist`
   and test Open and Download on desktop and a physical smartphone. Verify
   `https://nipsaunilesa.com.ng/resources/department-orientation-checklist.pdf`
   returns a PDF with the original 11 pages and matching bytes. Confirm the
   orientation announcement and the existing Study Skills Guide still work.

No merge, production deployment, DNS or hosting change was performed for this
update. GitHub PR creation/access results are reported in the accompanying chat.
