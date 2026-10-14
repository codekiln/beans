# Land the plane

`land the plane` is the named end-of-session ritual for this repo. It turns "clean up before you leave" into an explicit checklist so work ends in a state that is easy to resume.

## Command

```bash
dev/land-the-plane <issue-id> [--check "<command>"]...
```

Use it from the active task worktree after the implementation work is done. The helper is expected to merge that task branch into the separate local `main` worktree and then push `main` directly.

In Beans, the repo root checkout is the integration-only `main` worktree. Keep active edits out of the root checkout. If you want personal WIP on `main`, keep that in `worktrees/my/main`; task work still belongs in `worktrees/beans-*`.

## What the helper does

1. Runs explicit `--check` commands when provided.
2. Otherwise runs the repo default validation commands when configured. In Beans, the defaults are `npm run check:markdown-a11y` and `npm run build`.
3. If `--no-checks` is passed, skips validation for that one landing.
4. If the task worktree has tracked or untracked repo edits, auto-commits them with a checkpoint commit before closeout.
5. Verifies that the checkpoint commit actually advanced `HEAD` and left the task worktree clean before closeout continues.
6. If the task worktree is ambiguous because of unresolved merges, fails before closeout.
7. Verifies the root `main` checkout is clean before closeout starts. Dirty `worktrees/my/main` does not block landing.
8. Updates root `main` from `origin/main` with `git pull --ff-only origin main`.
9. Merges the current task branch into root `main`, and if that merge conflicts, fails with the unresolved file list.
10. Pushes `main` to `origin`.
11. Removes the task worktree that just landed with `git worktree remove`, and fails if that worktree still exists afterward.
12. Deletes the merged task branch locally with `git branch -d`, using the branch that was checked out in the task worktree (not limited to `codex/beans-*`). Skips safely for detached `HEAD` or if the ref is already gone; fails with a clear message if deletion is expected but cannot run.
13. Verifies the landed task commit is now reachable from root `main`.
14. Verifies the task worktree has been removed and root `main` ends clean and synced with origin.
15. Reports the landed SHAs for the merged task branch and root `main`.
16. Lists untracked files and stashes for cleanup review.

## Defaults and overrides

The default path is meant for unattended closeout:

- Run the repo's default validation command when available.
- Land via the root `main` checkout and push `main` directly rather than pushing the task branch or opening a PR.
- Ignore unrelated dirt in `worktrees/my/main`.

Humans can override that on a one-off basis:

- `--check "<command>"`: replace the default check with one or more explicit commands.
- `--no-checks`: skip checks for that landing.
- `--require-checks`: force explicit `--check` entries for that run.

Examples:

```bash
dev/land-the-plane 66 \
  --check "npm run check:land-the-plane" \
  --check "npm run check:markdown-a11y"
```

The helper will fail if the root `main` checkout is dirty. That is intentional: in this repo, landing should not silently merge into the integration checkout when the root already has unrelated local work.

## Cleanup expectations

The helper removes the landed task worktree automatically after a successful landing. Other cleanup still stays explicit:

- Remove debugging artifacts and scratch files only when they are clearly disposable.
- Drop stashes only when you created them and know they are obsolete.
- The merged task branch for this landing is removed automatically; other stale local branches are still a manual cleanup concern.
- Leave meaningful local changes alone if they belong to open follow-up work; convert them into an issue instead of silently discarding them.

## Suggested ritual

1. Finish the implementation and run any checks that matter for the task.
2. Run `dev/land-the-plane <issue-id> ...` from the task worktree.
3. Review the reported untracked files and stashes.
