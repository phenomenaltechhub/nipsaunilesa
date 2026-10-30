# Security release checklist and later search-indexing phase

## Before approving the security PR

- Review the `work` → `main` diff, including dependency lockfile, action SHA pins and the security report. Preserve the Guided Tour in this PR. The owner's separate local removal of `<GuidedTour />` is not present in this cloud checkout and must remain separate work; do not discard or overwrite that local edit when synchronizing branches.
- Repository **Settings → Pages → Build and deployment → Source**: confirm **GitHub Actions**. Under **Custom domain**, confirm `nipsaunilesa.com.ng` and **Enforce HTTPS**. Settings URL: https://github.com/phenomenaltechhub/nipsaunilesa/settings/pages . These settings have not been verified here.
- Verify domain ownership through the owning account/organization's **Settings → Pages → Verified domains**, where available. Check authoritative DNS points to the intended GitHub Pages site and has no dangling mapping. Any required DNS change needs a separate owner-approved action; no TXT verification value has been generated.
- From an allowed network, check the HTTP redirect to HTTPS, intended apex/www behavior, valid certificate/hostname/expiry, mixed content and actual response headers. CSP/HSTS/referrer/framing/nosniff policy remains unverified. GitHub Pages cannot apply arbitrary headers through Next.js configuration; consult the security report before considering a separately approved edge policy.
- Repository **Settings → Rules → Rulesets** (or **Settings → Branches → Branch protection rules**): protect `main`, require PR review and appropriate approvals, restrict direct/force pushes and deletion, and choose required checks that actually execute. The preserved deployment workflow runs only on `main` push or manual dispatch, so its new gates do not automatically provide PR checks. Require recorded local/review validation or separately approve a non-deploying PR validation workflow before making its checks mandatory.
- Repository **Settings → Environments → github-pages**: review allowed deployment branches and any available required-reviewer protection; limit production releases to approved branches. Features depend on repository visibility and GitHub plan; no paid upgrade is required by this patch. Settings URL: https://github.com/phenomenaltechhub/nipsaunilesa/settings/environments . Do not run workflow_dispatch solely to validate a PR: that workflow deploys.
- Confirm validation: `npm ci`, `npm run lint`, `npm test`, `npm audit`, `npm run build`, `npm run check:export`; review the report for exact counts and browser limitations.

## Release and after merge — owner actions only

Merging the security PR to `main` triggers the existing production deployment. This agent must not merge or dispatch deployment.

1. Approve release only after reviewing the caveats above. Inspect **Actions → Deploy Next.js to GitHub Pages** for the actual merged commit; confirm build gates, artifact upload and deploy succeed. Local workflow validation is not a GitHub execution result.
2. Inspect the production domain again for redirects/TLS/headers and smoke-test desktop/mobile navigation, ad category filters and contact destinations, homepage notification dismissal, PDF download, executive images, gallery, events and Guided Tour.
3. Check canonical metadata, JSON-LD, `/sitemap.xml` and `/robots.txt` on production. Monitor console errors and broken assets. If a release fails, use a reviewed corrective commit or approved rollback; do not force-push or change DNS impulsively.
4. On the owner's separate development machine, preserve its uncommitted Guided Tour edit (for example in a separate local branch/commit) before updating its checkout. Decide that behavior change separately from this security release.

## Next phase only: Google Search Console and Bing

No search-integration code, DNS changes, verification tokens or submissions belong in the security PR.

1. After the security release is approved and production smoke checks pass, start a separate indexing branch/PR from updated `main` if code/documentation changes are needed.
2. Google Search Console: add the **Domain property** `nipsaunilesa.com.ng` under an owner-controlled account. Domain verification requires Google-provided DNS instructions and a separately approved owner DNS update. Do not invent a TXT value. A URL-prefix property is an alternative with different coverage if Domain verification cannot be arranged.
3. Once verified, submit `https://nipsaunilesa.com.ng/sitemap.xml`, inspect representative canonical URLs with URL Inspection, and review indexing/coverage reports. Submission does not guarantee indexing.
4. Bing Webmaster Tools: preferably import the verified Search Console property with the owner's consent; otherwise add/verify the site using Bing's supported method. Confirm the sitemap and review crawl/indexing diagnostics.
5. Existing `app/sitemap.ts` already emits canonical public static/detail URLs, including eligible premium ad pages; `app/robots.ts` permits crawling and advertises the sitemap. Recheck the served versions after release; no change is presently required merely to submit them.
6. IndexNow is optional and separate: evaluate whether event-driven notifications add value for this static site, how an owner-generated key file would be verified, and whether a non-deploying notification workflow is justified. Do not generate keys or send notifications in this security PR. IndexNow does not replace Google sitemap submission and does not guarantee indexing.
