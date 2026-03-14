---
description: Close out a Beans work session
---
# Land the plane

Use this command when implementation work is done and the session needs a clean, resumable closeout.

## Goal

Leave the branch, Beads metadata, and working tree in a state that another session can pick up immediately.

## Workflow

1. Review `git status --short` before doing anything else.
2. Scrub Beads-related `.gitignore` changes before commit or push.
3. Run the relevant validation for the task.
4. Create any explicit follow-up Beads issues that are still needed.
5. Run `dev/beads-finish <issue-id> ["notes"]` when the work is Beads-managed.
6. Commit and push `beads-sync` if `.git/beads-worktrees/beads-sync/.beads/issues.jsonl` changed during the session.
7. Land and push `main` only after `beads-sync` is durably synced.
8. Prune closed-task worktrees with `dev/beads-prune-closed-worktrees`.
9. End only after both `main` and `beads-sync` are clean and synced, or explain the concrete blocker.

Final invariant:

- After landing, no closed-task Beads worktree should remain under `worktrees/`.
- After landing, `main` must be clean and synced with `origin/main`.
- After landing, `beads-sync` must be clean and synced with `origin/beads-sync`.

## `.gitignore` cleanup rule

Some Beads worktree flows can append redundant ignore entries for per-worktree paths even though this repo already ignores `worktrees/beans-*/`.

Before landing:

- Inspect `.gitignore` if it is modified.
- Remove or unstage any Beads-generated ignore lines that duplicate the existing wildcard rule or only reflect temporary worktree setup.
- Do not commit `.gitignore` churn caused by Beads startup/cleanup unless the user explicitly asked for a real ignore-rule change.

## Suggested command sequence

```bash
git status --short
npm run build
dev/beads-finish <issue-id> "optional notes"
git -C .git/beads-worktrees/beads-sync status --short --branch
git -C .git/beads-worktrees/beads-sync add .beads/issues.jsonl
git -C .git/beads-worktrees/beads-sync commit -m "chore(beads): sync issue metadata"
git -C .git/beads-worktrees/beads-sync push origin beads-sync
git push origin main
dev/beads-prune-closed-worktrees
git status --short --branch
```

## Notes

- If `.gitignore` contains both intentional edits and Beads-generated noise, keep the intentional edits and scrub only the Beads-related lines.
- If the task was not Beads-managed, skip `dev/beads-finish` and use the repo's normal closeout flow.
- `dev/beads-start` installs the repo-owned `pre-push` guard, which blocks `git push origin main` when merged `codex/beans-*` work still has open or unsynced Beads metadata.
- Do not describe a dirty `beads-sync` worktree as "just metadata" in the final handoff. In this repo that state means cleanup is still incomplete.
