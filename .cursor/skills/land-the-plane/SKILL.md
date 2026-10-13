---
name: land-the-plane
description: Close out a Beans work session cleanly by validating work, landing on main, and pruning the finished task worktree.
---
# Land the plane

Use this skill when implementation work is done and the session needs a clean, resumable closeout.

## Goal

Leave the branch and working tree in a state another session can pick up immediately.

## Workflow

1. Review `git status --short` before doing anything else.
2. Run the relevant validation for the task.
3. Land and push `main` with `dev/land-the-plane <issue-id>`.
4. End only after `main` is clean and synced, or explain the concrete blocker.

## Final invariant

- After landing, the finished task worktree should no longer remain under `worktrees/`.
- After landing, `main` must be clean and synced with `origin/main`.
