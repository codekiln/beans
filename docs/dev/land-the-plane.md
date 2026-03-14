# Land the plane

`land the plane` is the named end-of-session ritual for this repo. It turns "clean up before you leave" into an explicit checklist so work ends in a state that is easy to resume.

## Command

```bash
dev/land-the-plane <issue-id> ["notes"] [--check "<command>"]... [--follow-up "<title>"]...
```

Use it from the active task worktree after the implementation work is done. The helper is expected to merge that task branch into the separate local `main` worktree and then push `main` directly.

In Beans, the repo root checkout is the integration-only `main` worktree. Keep active edits out of the root checkout. If you want personal WIP on `main`, keep that in `worktrees/my/main`; Beads task work still belongs in `worktrees/beans-*`.

## What the helper does

The helper is intentionally automation-friendly. Work is not considered landed until the issue is synced, local `main` is updated from `origin/main`, the task branch is merged into `main`, and `main` is pushed. The default path should still be easy for an agent to execute without waiting for a human to answer bookkeeping questions.

1. Runs explicit `--check` commands when provided.
2. Otherwise runs the repo default validation commands when configured. In Beans, the defaults are `npm run check:beads-start` and `npm run build`.
3. If `--no-checks` is passed, skips validation for that one landing.
4. Creates any requested follow-up Beads issues before closeout.
5. If the task worktree has tracked or untracked repo edits, auto-commits them with a checkpoint commit before closeout.
6. Verifies that the checkpoint commit actually advanced `HEAD` and left the task worktree clean before closeout continues.
7. If the task worktree is ambiguous because of unresolved merges, fails before closeout.
8. Runs `dev/beads-finish <issue-id> ["notes"]`.
9. Verifies the root `main` checkout is clean before closeout starts. Dirty `worktrees/my/main` does not block landing.
10. Updates root `main` from `origin/main` with `git pull --ff-only origin main`.
11. Merges the current task branch into root `main`, and if that merge conflicts, fails with the unresolved file list.
12. Restores the root checkout's local `.beads/issues.jsonl` mirror if `dev/beads-finish` dirtied it during closeout.
13. Commits and pushes `.git/beads-worktrees/beads-sync/.beads/issues.jsonl` on the `beads-sync` branch when closeout dirties that worktree.
14. Pushes `main` to `origin` only after `beads-sync` is durably synced, so the repo's `main` push guard sees the closed/exported issue state.
15. Prunes closed-task Beads worktrees with `dev/beads-prune-closed-worktrees`, including the task worktree that just landed, and fails if that worktree still exists afterward.
16. Verifies the landed task commit is now reachable from root `main`.
17. Verifies the task worktree has been pruned, root `main` plus `beads-sync` both end clean, and that root `main` plus `beads-sync` are synced with origin.
18. Reports the landed SHAs for the task branch, root `main`, and `beads-sync`.
19. Lists untracked files and stashes for cleanup review.
20. Shows `bd --no-daemon ready`.
21. Emits a next-session prompt built from the best ready issue, preferring ready task/bug work, then lower priority number, then current ready order.

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
The repo's `pre-push` guard also blocks manual `git push origin main` when a merged `codex/beans-*` task branch still has an open Beads issue or unsynced `beads-sync` metadata. `dev/land-the-plane` satisfies that guard by pushing `beads-sync` before `main`.

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

`dev/land-the-plane` extends `dev/beads-finish`. `beads-finish` is still the lower-level close/sync helper; `land-the-plane` is the repo's full handoff ritual.
