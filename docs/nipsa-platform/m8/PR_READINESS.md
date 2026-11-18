# Normal M8 PR preparation

Prepared for execution by Codex in the **existing cloud environment**, once authorized GitHub access is restored. The owner does not need local Git/PC access. This is a runbook, not an opened PR or authorization to merge/deploy.

- Repository: `phenomenaltechhub/nipsaunilesa`.
- Existing head branch: `feature/pharmaideia-m8-community`.
- Intended base: **`development/nipsa-student-platform`**, never main. This keeps the M8 diff separate from the preserved M1–M7 development work.
- Preserve implementation commit `8000069` and the additive review-fix commit; no amend/rebase/reset/history rewriting or force-push.
- Original report/evidence is historical; [requirements review](REQUIREMENTS_REVIEW.md) records current fixes, fresh results, blocked integration and untested conditions.

## Before publication

GitHub previously rejected the standard CLI-managed credential as `Invalid username or token`; API access returned 403. This review did not repeatedly retry that credential under the unchanged configuration. Public advisory-page access does not establish repository write/API access. Current remote heads, open PRs, repository protections and GitHub Actions results are **unverified**.

Restore the authorized GitHub connection/credential in the same workspace, using the platform's secure connection flow. Never paste tokens into chat or commit configuration containing them. Verify access through the actual Git/GitHub client; an environment “connected” label alone is insufficient. If authorized GitHub CLI access is restored but ordinary Git has no credential helper, use the standard helper for that command, for example `git -c 'credential.helper=!gh auth git-credential' fetch origin` and the same prefix for the normal push. This avoids overwriting a working credential setup or storing credentials in remote URLs.

Then execute these ordinary checks in `/workspace/nipsaunilesa`:

```sh
git status --short
git branch --show-current
git remote -v
git fetch origin
git log --oneline origin/development/nipsa-student-platform..HEAD
git diff --stat origin/development/nipsa-student-platform...HEAD
git diff --check origin/development/nipsa-student-platform...HEAD
git merge-base --is-ancestor origin/development/nipsa-student-platform HEAD
git ls-remote --heads origin feature/pharmaideia-m8-community
```

Confirm the tree is clean and only intended M8 changes appear. If the base advanced or a remote feature branch already exists, inspect the divergence and preserve all work. Reconcile through normal reviewed merge commits if needed, rerun affected validation, and stop on unresolved conflicts. Do not blindly pull, overwrite a remote branch, rewrite M7 or use force-push. Do not infer remote freshness from the saved tracking refs.

## Push and review PR

After the remote comparison and required validation pass:

```sh
git push -u origin feature/pharmaideia-m8-community
gh pr list --base development/nipsa-student-platform --head feature/pharmaideia-m8-community
```

Update an existing matching review PR if present. Otherwise create the separate PR using the prepared title/body, preserving real newlines:

```sh
gh pr create --base development/nipsa-student-platform --head feature/pharmaideia-m8-community --title "Integrate M8 Community and website references" --body-file design-review/m8/PULL_REQUEST.md
```

The prepared body is review content; its existence is not proof that a PR exists. Record the actual branch URL, PR URL, remote SHA and checks only after successful provider responses. The body file contains the prepared description; the title and base/head are supplied separately.

## Validation and protections

Use the commands/results in the requirements review, including all unit/backend/security tests, M7 engine/browser workflows, M8 references/interactions/screenshot replay, long-message/short-viewport checks, lint/types/PWA/build/export and secret scanning. Rerun relevant checks after any reconciliation. Keep original screenshot baselines; changes require explicit inspection, not blind regeneration.

The existing Pages workflow runs on **main push / workflow_dispatch**, not pull_request. Consequently local validation cannot be labelled a passed PR check, and a feature push does not demonstrate deployment. Do not trigger the production workflow to obtain a green badge. Once API access works, inspect required checks, reviews, conflicts and protections; report any missing CI coverage or permission blocker. Do not add audit suppressions, disable protections, force-upgrade packages or bypass review. Current full/production npm audits pass after the advisory withdrawal; historical failures remain documented.

**Do not merge or deploy without a new explicit owner approval.** No DNS/hosting changes, paid provisioning, real student activation or live payments are part of this PR. Approval for a development review PR is separate from all real-device, live-feed, host/security/content and full-platform pre-launch acceptance gates.
