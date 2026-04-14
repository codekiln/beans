---
name: land-the-plane
description: >-
  Close out a Beans work session cleanly by validating work, finishing
  Beads-managed tasks correctly, landing on main, and pruning closed worktrees.
targets: ["*"]
---

# Land the plane

Use this skill when implementation work is done and the session needs a clean, resumable closeout.

## Goal

Leave the branch, Beads metadata, and working tree in a state another session can pick up immediately.

## Workflow

1. Review `git status --short` before doing anything else.
2. Scrub Beads-related `.gitignore` changes before commit or push.
3. Run the relevant validation for the task.
4. Create any explicit follow-up Beads issues that are still needed.
5. Run `dev/beads-finish <issue-id> ["notes"]` when the work is Beads-managed.
6. Make sure any manual Beads mutations were pushed with `bd dolt push`.
7. Land and push `main`.
8. Prune closed-task worktrees with `dev/beads-prune-closed-worktrees`.
9. End only after `main` is clean and synced, or explain the concrete blocker.

## Final invariant

- After landing, no closed-task Beads worktree should remain under `worktrees/`.
- After landing, `main` must be clean and synced with `origin/main`.
- After landing, the session's Beads mutations must already be durable through Dolt.

## `.gitignore` cleanup

- Inspect `.gitignore` if it is modified.
- Remove or unstage Beads-generated ignore lines that duplicate the existing `worktrees/beans-*/` wildcard rule.
- Do not commit `.gitignore` churn from Beads startup or cleanup unless the user explicitly asked for a real ignore-rule change.
