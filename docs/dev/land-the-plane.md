# Land the plane

`land the plane` is the named end-of-session ritual for this repo. It turns "clean up before you leave" into an explicit checklist so work ends in a state that is easy to resume.

## Command

```bash
dev/land-the-plane <issue-id> ["notes"] [--check "<command>"]... [--follow-up "<title>"]...
```

Use it from the active task worktree after the implementation work is done. The helper is expected to merge that task branch into the separate local `main` worktree and then push `main` directly.

In Beans, the repo root checkout is the integration-only `main` worktree. Keep active edits out of the root checkout. If you want personal WIP on `main`, keep that in `worktrees/my/main`; Beads task work still belongs in `worktrees/beans-*`.

## What the helper does

1. Runs explicit `--check` commands when provided.
2. Otherwise runs the repo default validation commands when configured. In Beans, the defaults are `npm run check:beads-start`, `npm run check:markdown-a11y`, and `npm run build`.
3. If `--no-checks` is passed, skips validation for that one landing.
4. Creates any requested follow-up Beads issues before closeout and pushes each one through Dolt.
5. If the task worktree has tracked or untracked repo edits, auto-commits them with a checkpoint commit before closeout.
6. Verifies that the checkpoint commit actually advanced `HEAD` and left the task worktree clean before closeout continues.
7. If the task worktree is ambiguous because of unresolved merges, fails before closeout.
8. Runs `dev/beads-finish <issue-id> ["notes"]`.
9. Verifies the root `main` checkout is clean before closeout starts. Dirty `worktrees/my/main` does not block landing.
10. Updates root `main` from `origin/main` with `git pull --ff-only origin main`.
11. Merges the current task branch into root `main`, and if that merge conflicts, fails with the unresolved file list.
12. Pushes `main` to `origin`.
13. Prunes closed-task Beads worktrees with `dev/beads-prune-closed-worktrees`, including the task worktree that just landed, and fails if that worktree still exists afterward.
14. Verifies the landed task commit is now reachable from root `main`.
15. Verifies the task worktree has been pruned and root `main` ends clean and synced with origin.
16. Reports the landed SHAs for the task branch and root `main`.
17. Lists untracked files and stashes for cleanup review.
18. Shows `bd ready`.
19. Emits a next-session prompt built from the best ready issue, preferring ready task/bug work, then lower priority number, then current ready order.

## Defaults and overrides

The default path is meant for unattended closeout:

- Run the repo's default validation command when available.
- Assume no follow-up issue is needed unless one is explicitly requested.
- Land via the root `main` checkout and push `main` directly rather than pushing the task branch or opening a PR.
- Ignore unrelated dirt in `worktrees/my/main`.

Humans can override that on a one-off basis:

- `--check "<command>"`: replace the default check with one or more explicit commands.
- `--no-checks`: skip checks for that landing.
- `--follow-up "<title>"`: create a follow-up issue before landing.
- `--require-checks`: force explicit `--check` entries for that run.
- `--require-follow-up`: force explicit `--follow-up` entries for that run.

Examples:

```bash
dev/land-the-plane beans-2wm "Documented the new workflow" \
  --check "npm run check:land-the-plane" \
  --check "npm run check:beads-finish"
```

The helper will fail if the root `main` checkout is dirty. That is intentional: in this repo, landing should not silently merge into the integration checkout when the root already has unrelated local work.
The repo's `pre-push` guard also blocks manual `git push origin main` when a merged `codex/beans-*` task branch still has an open Beads issue. `dev/land-the-plane` satisfies that guard by delegating issue closeout to `dev/beads-finish` before pushing `main`.

## Cleanup expectations

The helper does prune closed Beads task worktrees automatically after a successful landing. Other cleanup still stays explicit:

- Remove debugging artifacts and scratch files only when they are clearly disposable.
- Drop stashes only when you created them and know they are obsolete.
- Clean up old branches after the work is merged or intentionally abandoned, not as part of every closeout.
- Leave meaningful local changes alone if they belong to open follow-up work; convert them into a Beads issue instead of silently discarding them.

## Suggested ritual

1. Finish the implementation and run any checks that matter for the task.
2. Run `dev/land-the-plane <issue-id> "optional notes" ...` from the task worktree.
3. Review the reported untracked files and stashes.
4. If another issue is ready, copy the suggested prompt into the next session.

## Relationship to Beads

`dev/land-the-plane` extends `dev/beads-finish`. `beads-finish` is still the lower-level close/push helper; `land-the-plane` is the repo's full handoff ritual.
