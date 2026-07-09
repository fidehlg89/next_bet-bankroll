---
trigger: always_on
---

# 🚀 Version Control & Code Review Skills

You are an expert at version control. A pristine, semantic, and highly readable Git history is the hallmark of a Senior Engineer. Follow these strict rules for version control and code review.

## 1. Semantic Versioning (SemVer)
We use Semantic Versioning (`x.y.z`) for all releases and major commits.
- **MAJOR (`x.0.0`)**: Incompatible API changes, major framework migrations (e.g., Lovable SPA to Next.js).
- **MINOR (`0.y.0`)**: Adding new functionality or features in a backward-compatible manner.
- **PATCH (`0.0.z`)**: Backward-compatible bug fixes and minor tweaks.

*Skill Execution:* Always evaluate if your changes warrant a version bump, and explicitly mention the semantic version impact in your commit descriptions or release notes.

## 2. Micro-Commits & File Limits (MAX 20 FILES)
Massive commits are impossible to review effectively and are prone to merge conflicts.
- **Hard Limit:** Never modify, add, or delete more than **20 files** in a single commit or branch without explicit justification and architectural review.
- **Context Isolation:** Split your work logically. Do not mix refactoring with new feature development in the same commit.
- **Frequent Commits:** Commit small, atomic changes. If you are fixing a UI bug and updating a database schema, those are two separate commits.

## 3. Conventional Commits Standard
Commit messages must be semantic, readable, and machine-parseable.
Format: `type(scope): description`
- `feat:` A new feature.
- `fix:` A bug fix.
- `docs:` Documentation only changes.
- `style:` Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc).
- `refactor:` A code change that neither fixes a bug nor adds a feature.
- `perf:` A code change that improves performance.
- `test:` Adding missing tests or correcting existing tests.
- `chore:` Changes to the build process or auxiliary tools and libraries such as documentation generation.

## 4. The Lovable History Rule
**CRITICAL:** This project syncs with Lovable. 
- **NEVER** use `git push --force`.
- **NEVER** rebase, amend, or squash commits that have already been pushed to the remote `main` or active remote branches.
- If a mistake was pushed, use `git revert` to create a new forward-moving commit.

## 5. Branching Strategy
- Use isolated branches for specific contexts: `feature/xyz`, `bugfix/abc`, `refactor/123`.
- Always verify changes locally before committing.
- **CRITICAL**: Never merge branches into `main` without explicit approval from the USER.
- **Merge Strategy**: Always use **"Squash and merge"** when merging Pull Requests into `main`. This ensures a clean history with single semantic commits and prevents sync issues with the Lovable editor.
- Read `.agents/rules/anlysis.md` for context-switching review rules.

*Enforcement:* If an agent is asked to commit work, it MUST review the number of changed files first. If the file count exceeds 20, the agent MUST stop, group the files into logical batches, and perform multiple sequential commits.

## 6. Version Bumping & Changelog
Whenever you resolve an issue, implement a feature, or fix a bug, you MUST:
1. Bump the `version` field in `package.json` according to SemVer principles (`patch` for bugfixes, `minor` for new features, `major` for breaking changes).
2. Update the `CHANGELOG.md` file in the root directory following the [Keep a Changelog](https://keepachangelog.com/) format.
3. Include these changes as part of your final commit or pull request.
