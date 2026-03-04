# Land the plane

`land the plane` is the named end-of-session ritual for this repo. It turns "clean up before you leave" into an explicit checklist so work ends in a state that is easy to resume.

## Command

```bash
dev/land-the-plane <issue-id> ["notes"] [--check "<command>"]... [--follow-up "<title>"]...
```

Use it from the active task worktree after the implementation work is done. The helper is expected to merge that task branch into the separate local `main` worktree and then push `main` directly.

## What the helper does

The helper is intentionally automation-friendly. Work is not considered landed until the issue is synced, local `main` is updated from `origin/main`, the task branch is merged into `main`, and `main` is pushed. The default path should still be easy for an agent to execute without waiting for a human to answer bookkeeping questions.

1. Runs explicit `--check` commands when provided.
2. Otherwise runs a repo default validation command when one is configured. In Beans, that default is `npm run build`.
3. If `--no-checks` is passed, skips validation for that one landing.
4. Creates any requested follow-up Beads issues before closeout.
5. If no follow-up override is provided, defaults to creating no follow-up issues.
6. Runs `dev/beads-finish <issue-id> ["notes"]`.
7. Verifies the separate local `main` worktree is clean before changing it.
8. Updates local `main` from `origin/main` with `git pull --ff-only origin main`.
9. Merges the current task branch into local `main`.
10. Pushes `main` to `origin`.
11. Verifies `main` is no longer ahead or behind `origin/main`.
12. Lists untracked files and stashes for cleanup review.
13. Shows `bd --no-daemon ready`.
14. Emits a next-session prompt built from the first ready issue, if one exists.

## Defaults and overrides

The default path is meant for unattended closeout:

- Run the repo's default validation command when available.
- Assume no follow-up issue is needed unless one is explicitly requested.
- Land via local `main` and push `main` directly rather than pushing the task branch or opening a PR.

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

The helper will fail if the separate `main` worktree is dirty. That is intentional: in this repo, landing should not silently merge into a `main` checkout that already has unrelated local work.

## Cleanup expectations

The helper still does not delete files, branches, or stashes automatically. In this repo that cleanup should stay explicit:

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
