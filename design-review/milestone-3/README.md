# M3 design review — no final selection or editorial replacement

The three Book–Molecule Interlock variations are original vector studies. The existing active M1/M2 assets remain untouched. No variant is selected or applied to the app, manifest, icons or production website. `brand/` contains SVG masters/wordmarks/app symbols; `exports/` contains smartphone-friendly PNG comparisons and context mockups. Login/splash/home-screen/header images are **branding mockups**, not authentication, hosting or real student data.

The editorial HTML is a **read-only design proposal**, not an imported/rebuilt publishing system. The original ChatGPT Sites source was not found, so an honest current-versus-proposed screenshot comparison is impossible. Review exports explicitly identify that gap; the actual Pharmaideia screenshot shows shared design patterns, not the existing editorial interface. No publishing actions, staff accounts, transactions or activity counts are invented.

Before changing the actual editorial interface: retrieve/inspect its owned source and dependencies, inventory existing behavior, make real desktop/mobile before screenshots, compare the approved proposal, identify retained/improved/removed components, obtain the owner's review, and implement/test only approved changes. The specifications here can be reviewed without modifying that system.

Generate logos with `npm run review:m3:logos`. Capture the static proposal, real PWA and comparison documents with `npm run review:m3:design`. These commands use existing Sharp/Chromium tools. They do not deploy, change DNS, activate payments or apply a logo selection.
