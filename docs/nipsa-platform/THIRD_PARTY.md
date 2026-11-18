# M2 open-source evaluation and dependency record

Reviewed 17 November 2026. No unrelated project, proprietary dashboard, avatar pack, font or complete UI framework was imported. Original PWA components and vector artwork remain independent. Native HTML links, buttons, radios, labels, dialogs, progress and date controls meet this architecture without a runtime UI library. The tabs follow standard keyboard/ARIA behavior implemented in this repository; they are not copied vendor code.

| Component | Decision, compatibility and scope | Licence / notices | Maintenance and vulnerability evidence |
| --- | --- | --- | --- |
| **axe-core 4.14.1**, Deque Systems | Adopted as one exact-pinned **development-only** accessibility test dependency. Compatible with the existing Node 24/Chromium/Playwright runner; no PWA build framework needed. | **MPL-2.0**. Read bundled `LICENSE`, copyright header and third-party notice requirements. The runner copies the unmodified script, `LICENSE` and `LICENSE-3RD-PARTY.txt` together into a temporary test directory. Nothing from it is shipped in `student-pwa/`, its offline cache or Next.js export. | npm registry reports version 4.14.1 and package metadata modified 2026-11-16. Installed package and lockfile checked; npm audit reports no known vulnerabilities at review. This is a point-in-time result, not a guarantee. |
| **Sharp 0.35.5** | Reused existing development asset tooling; generates original app icons and verifies dimensions. No new runtime dependency. | **Apache-2.0**, bundled licence inspected. Library source is not copied into PWA assets. | Existing pinned package; included in current npm audit. |
| **Leaflet 1.9.4** | Existing website dependency assessed; kept in the Navigator and **not** imported into unrelated PWA academic screens. | **BSD-2-Clause**, Volodymyr Agafonkin/CloudMade attribution and bundled conditions inspected; existing website use/attribution preserved. | No version change in M2; current audit covers it. No claim that it is a newly maintained PWA component. |
| **Playwright 1.62.1** | Existing cloud-provided test tool reused; no application dependency added. Drives real Chromium interaction, screenshots and planner recording. | Installed package reports **Apache-2.0**. It stays tooling, outside app/export/cache. | Version observed in the executor; browser checks use actual installed Chromium. The repository audit does not cover separately provisioned cloud tooling. |

axe-core source: https://github.com/dequelabs/axe-core . Package and upstream notices identify Copyright © 2015–2026 Deque Systems, Inc. Its bundled third-party notices include additional MIT/ISC/BSD notices; retain the complete file, not only the top-level licence. Package integrity is recorded in `package-lock.json`.

No axe source is modified or vendored into repository UI code. If covered files or binaries are redistributed later, retain copyright/licence notices and meet MPL source-availability requirements (including covered modifications); do not assume a minified file alone is sufficient. Keep vendor code separately identifiable. The temporary test copy preserves notices and is removed after the suite. Original PHARMAIDEIA artwork is not derived from a third-party avatar/icon pack.

Before adopting any further component, record its exact source/version, redistribution terms/notices, maintenance evidence, vulnerability review, browser/module compatibility and size impact. Test it in isolation and rerun security/regressions before integration. Prefer a focused dependency only when it adds a concrete benefit. Existing framework and transitive packages retain their own package licences; this table records the M2 adoption decisions, not a replacement for every licence in the root dependency tree.

## M5 reuse decision

No npm dependency is added or version changed. The separate PWA still uses native HTML/CSS/ES modules. Original outlined SVG icons are extended without importing a framework or icon pack. Existing Sharp creates responsive AVIF/WebP crops from the owner-supplied fictional scene; the provenance file records the source and avoids an institutional-photograph claim. Existing Playwright/Chromium/FFmpeg record genuine application interactions; no third-party video/stock photo is imported. The tutorial is a silent original screencast with captions/transcript. Node's built-in crypto/HTTP/SQLite implements the controlled service; runtime patching/host review remains necessary and is outside npm audit's scope.

## M6 reuse and dependency review

No package/version/lockfile change or vendor component/code adoption. Native browser controls, existing M4 models/keyboard tabs, original M5 components and existing Node HTTP/SQLite/crypto are reused. Playwright/Chromium/axe run tests only. OWASP ASVS 5.0.0 and Authorization Cheat Sheet were read as guidance, not copied into application code. No React/framework/icon pack is added to the PWA.

Full audit now finds unpatched development-tool picomatch ReDoS, 14 high dependent-package entries from one advisory; production dependency audit is zero. Historical zero-advisory statements above are point-in-time results and do not describe M6. Existing ESLint 9 deprecation is also recorded. See [security review](m6/SECURITY_REVIEW.md) for versions, sources, boundaries and required upstream remediation. No audit suppression, unsafe override or incompatible configuration downgrade is applied.

## M7 reuse decision

No package/version/lockfile change and no vendor interface/template/code adoption. The same native browser/Node HTTP/HTTPS/SQLite/crypto, original PWA components and existing Sharp/Chromium/Playwright/axe tooling are reused. Temporary OpenSSL certificates test actual local TLS with verification enabled; no keys/binaries are redistributed. Existing system FFmpeg encodes an original synthetic mobile CBT screencast from Chromium/CDP frames; no Playwright binary download or new runtime service is required. Only the generated original video/captions/transcript are review assets. OWASP guidance is referenced, not copied as application source. The full-audit picomatch advisory remains unpatched at the M7 check; production npm audit is zero. See [current security register](m7/SECURITY_REVIEW.md).

## M8 Community reuse evaluation

No dependency/version/lockfile change or external component source import. The supplied image is visual direction; names, notices, branding and proprietary code are not copied into the application. Original outlined SVG geometry, native dialogs/focus management and CSS implement the chat. Public website titles/descriptions come from this repository's actual static export, not a third-party scrape/unfurl service.

| Reference | Decision / compatibility / notices |
| --- | --- |
| Playwright 1.62.1 / Chromium | Existing cloud tool reused for real browser/touch/keyboard/network tests, `expect(page).toHaveScreenshot()` and original recordings. Installed package licence inspected: Apache-2.0. Browser/tool binaries stay outside the PWA/repository; npm audit does not certify separately installed cloud tools. |
| axe-core 4.14.1 | Existing pinned development-only MPL-2.0 tool, bundled licence/notices preserved. No library copied into runtime/offline shell. Automated scans supplement human/device review. |
| Storybook | Considered; not adopted. An actual authenticated service/fixture and four-width Playwright state harness covers the real components without an extra workbench framework or duplicate fake UI. |
| Radix / shadcn | Considered as interaction patterns; not adopted/copied. React-oriented packages do not justify adding React to the native PWA. Native HTML dialogs/labels/buttons and explicit focus restoration are tested instead. |
| Lucide | Considered; not imported. Existing original outlined icon vocabulary is extended in place, avoiding a new icon bundle or copied source/licence obligations. |
| Motion | Considered; not adopted/copied. CSS handles restrained hover/typing states with reduced-motion fallback. |
| Existing Sharp / FFmpeg / Node built-ins | Reused for artifact integrity, original review video and native bounded PNG/crypto/SQLite behavior. No new runtime image, websocket, link-preview or paid SaaS dependency. Existing licences remain applicable. |

Unadopted upstream components were assessed for architectural cost; no current upstream security/licence certification is asserted for code that was not fetched or shipped. Before later adoption, reverify exact version, maintenance, vulnerabilities and redistribution terms/notices. Full audit still reports the unpatched picomatch development-tool advisory; production audit is zero. See [M8 security register](m8/SECURITY_REVIEW.md).
