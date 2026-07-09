---
name: github_issue_flow
description: >
  Complete GitHub issue → branch → PR → squash merge workflow using the `gh` CLI.
  Triggers when the user asks to: handle/resolve a GitHub issue, create a PR,
  do a squash merge, or work through the full Git flow end to end.
---

# GitHub Issue Flow (CLI-first)

This skill defines the **standard end-to-end workflow** for this project when resolving a GitHub issue. Always prefer `gh` CLI over the GitHub MCP server for PR and merge operations.

---

## ⛔ Hard Rules — Never Break These

> [!CAUTION]
> **NEVER merge a PR if CI checks are failing.** Do not use `--admin` to bypass check failures.
> - If checks fail, fix the root cause first, push the fix to the branch, and wait for checks to go green before merging.

> [!NOTE]
> **`--admin` is legitimately required on this repo** for the squash merge step.
> This repo requires **1 approval before merging**, but GitHub does not allow self-approval. Since this is a solo-developer repo, `--admin` is the correct bypass — **only** after all CI checks are green. Never use it to skip failing checks.

> [!WARNING]
> **NEVER use `git push --force`**, `rebase`, or `amend` on commits already pushed to remote. Use `git revert` to undo published mistakes.

Other rules:
1. **PowerShell compat**: Never use `&&` — use `;` to chain commands.
2. **Body files**: Write PR bodies to `.pr_body.md` to avoid quoting issues. Delete after merge.
3. **Squash merge**: Always `--squash --delete-branch`. Only add `--admin` if branch protection config is broken (not for check failures).
4. **Conventional commits**: `type(scope): description (#N)` on every commit.
5. **Max 20 files per commit**: Split work into logical batches if needed.

---

## Project Board — BankrollOS Dashboard

| Status | Option ID |
|---|---|
| Todo | `f75ad846` |
| In Progress | `47fc9ee4` |
| Done | `98236657` |

- **Project number:** `25`
- **Owner:** `fidehlg89`
- **Project node ID:** `PVT_kwHOAQBcA84BbRfs`
- **Status field ID:** `PVTSSF_lAHOAQBcA84BbRfszhWDIkk`

---

## Full Workflow

### Step 1 — Read the Issue

```powershell
gh issue view <NUMBER>
```

---

### Step 2 — Move Board → In Progress

Every issue needs its **project item ID** (`PVTI_...`) to update board status:

```powershell
$ITEM_ID = gh project item-list 25 --owner fidehlg89 --format json |
  ConvertFrom-Json |
  Select-Object -ExpandProperty items |
  Where-Object { $_.content.number -eq <NUMBER> } |
  Select-Object -ExpandProperty id

gh project item-edit `
  --project-id PVT_kwHOAQBcA84BbRfs `
  --id $ITEM_ID `
  --field-id PVTSSF_lAHOAQBcA84BbRfszhWDIkk `
  --single-select-option-id 47fc9ee4
```

> [!NOTE]
> When the PR body contains `Closes #<NUMBER>`, GitHub **automatically** moves the issue to **Done** on merge. The manual Done command is only a fallback.

---

### Step 3 — Create Branch

Naming convention: `fix/<slug>`, `feat/<slug>`, `refactor/<slug>`.

```powershell
git checkout -b fix/<slug>
```

---

### Step 4 — Make Changes

- Follow Clean Architecture: `features/`, `shared/`, `lib/`
- No `any` in TypeScript

---

### Step 5 — Local Quality Gates (MANDATORY before commit)

> [!IMPORTANT]
> Run ALL of these before every commit. CI enforces them and will block the merge if any fail.

```powershell
# 1. Prettier — auto-fix formatting
npx prettier --write "src/**/*.{ts,tsx}"

# 2. Prettier check — verify nothing is left (same check as CI)
npx prettier --check "src/**/*.{ts,tsx}"

# 3. Tests — must all pass
npx vitest run
```

> **Note:** Use `npx vitest run`, NOT `bun run test` — bun is not in PATH on this machine.

---

### Step 6 — Version Bump & Changelog (MANDATORY)

Before committing, always bump the project version in `package.json` and update `CHANGELOG.md`:

```powershell
# Bump version (choose patch, minor, or major based on SemVer)
npm version patch --no-git-tag-version
```
Then manually edit `CHANGELOG.md` to add the new version, date, and description of your changes.

---

### Step 7 — Commit (Atomic, ≤ 20 files)

```powershell
git add package.json CHANGELOG.md path/to/file1
git status --short   # verify exactly what is staged
git commit -m "fix(scope): description (#<NUMBER>)"

# Tests in a separate commit if applicable:
git add src/path/to/__tests__/
git commit -m "test(scope): description (#<NUMBER>)"
```

---

### Step 8 — Push Branch

```powershell
git push origin <branch-name>
```

---

### Step 9 — Create PR

Write the body to a temp file to avoid PowerShell quoting issues:

```powershell
@'
## Summary

Fixes #<NUMBER>

<description>

## Changes
- ...

## Testing
- All X tests passing (`npx vitest run`)
- Prettier check: clean

## Checklist
- [x] Prettier formatted (`npx prettier --write`)
- [x] All tests passing
- [x] Conventional commit format
- [x] ≤ 20 files changed
- [x] No --force push
- [x] TypeScript strict, no `any`
- [x] SemVer: PATCH|MINOR|MAJOR
- [x] Version bumped in package.json & CHANGELOG.md updated
'@ | Set-Content -Path ".pr_body.md" -Encoding UTF8

gh pr create `
  --base main `
  --head <branch-name> `
  --title "fix(scope): description" `
  --body-file ".pr_body.md"
```

---

### Step 10 — Verify CI Checks BEFORE Merging

> [!CAUTION]
> **Do NOT merge until all checks are green.** Check status with:

```powershell
# Watch checks in real time (refreshes automatically):
gh pr checks <PR_NUMBER> --watch

# Or view current status once:
gh pr checks <PR_NUMBER>
```

All **3 required status checks** must show `pass`:
| Check | Job |
|---|---|
| `Prettier` | Format check |
| `Tests (vitest)` | Unit tests |
| `Build (Next.js)` | Lint + build (runs after the above) |

Only proceed to Step 11 when all checks show `pass`. If any check fails:
1. Identify the failure (`gh pr checks <PR_NUMBER>`)
2. Fix the issue locally
3. Commit and push to the branch
4. Wait for checks to re-run and go green

---

### Step 11 — Squash Merge → Board moves to Done

> [!NOTE]
> This repo requires 1 approval before merging. As a solo developer you cannot self-approve, so `--admin` is the correct flag here — but **only after all CI checks are green**.

```powershell
gh pr merge <PR_NUMBER> `
  --squash `
  --subject "fix(scope): description (#N)" `
  --body "Closes #<NUMBER>." `
  --delete-branch `
  --admin

Remove-Item ".pr_body.md" -Force
```

`Closes #<NUMBER>` auto-moves the issue to **Done** in the project board.

> [!CAUTION]
> `--admin` is used here **only** because self-approval is impossible, not to bypass failing CI. If any check is failing, fix it first.

---

### Step 12 — Sync Local main

```powershell
git checkout main
git pull
```

---

## Board Status — Manual Override

If the issue status needs manual correction (e.g. `Closes #N` was missing from the merge body):

```powershell
# → Done
gh project item-edit `
  --project-id PVT_kwHOAQBcA84BbRfs `
  --id $ITEM_ID `
  --field-id PVTSSF_lAHOAQBcA84BbRfszhWDIkk `
  --single-select-option-id 98236657
```
