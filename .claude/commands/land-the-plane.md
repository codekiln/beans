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
6. Rebase from the remote branch when needed, then push.
7. Prune closed-task worktrees with `dev/beads-prune-closed-worktrees`.
8. End with a clean or intentionally-dirty working tree that is explained in the handoff.

Final invariant:

- After landing, no closed-task Beads worktree should remain under `worktrees/`.

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
git pull --rebase
git push
dev/beads-prune-closed-worktrees
git status --short --branch
```

## Notes

- If `.gitignore` contains both intentional edits and Beads-generated noise, keep the intentional edits and scrub only the Beads-related lines.
- If the task was not Beads-managed, skip `dev/beads-finish` and use the repo's normal closeout flow.
