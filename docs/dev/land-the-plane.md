# Land the plane

`land the plane` is the named end-of-session ritual for this repo. It turns "clean up before you leave" into an explicit checklist so work ends in a state that is easy to resume.

## Command

```bash
dev/land-the-plane <issue-id> ["notes"] [--check "<command>"]... [--follow-up "<title>"]...
```

Use it from the active worktree after the implementation work is done.

## What the helper does

The helper is intentionally strict. Work is not considered landed until the branch is rebased, pushed, and the remaining work is accounted for explicitly.

1. Requires either one or more `--check "<command>"` entries or an explicit `--no-checks`.
2. Requires either one or more `--follow-up "<title>"` entries or an explicit `--no-follow-up`.
3. Creates any requested follow-up Beads issues before closeout.
4. Runs `dev/beads-finish <issue-id> ["notes"]`.
5. Runs `git pull --rebase`, then `bd --no-daemon sync --check` and `bd --no-daemon sync --force`.
6. Pushes the current branch to `origin`, setting upstream if needed.
7. Verifies `git status --short --branch` no longer reports the branch as ahead or behind.
8. Lists untracked files and stashes for cleanup review.
9. Shows `bd --no-daemon ready`.
10. Emits a next-session prompt built from the first ready issue, if one exists.

## Required acknowledgements

The command will fail if you do not account for these two questions:

- What validation command proves this work is acceptable?
- What remaining work needs its own Beads issue?

For doc-only or no-code changes, use `--no-checks`. If the task is truly finished with no follow-up, use `--no-follow-up`.

Examples:

```bash
dev/land-the-plane beans-2wm "Documented the new workflow" \
  --check "npm run check:land-the-plane" \
  --check "npm run check:beads-finish" \
  --no-follow-up
```

```bash
dev/land-the-plane beans-abc "Closed with a follow-up" \
  --no-checks \
  --follow-up "Add branch cleanup suggestions to land-the-plane output"
```

## Cleanup expectations

The helper still does not delete files, branches, or stashes automatically. In this repo that cleanup should stay explicit:

- Remove debugging artifacts and scratch files only when they are clearly disposable.
- Drop stashes only when you created them and know they are obsolete.
- Clean up old branches after the work is merged or intentionally abandoned, not as part of every closeout.
- Leave meaningful local changes alone if they belong to open follow-up work; convert them into a Beads issue instead of silently discarding them.

## Suggested ritual

1. Finish the implementation and run any checks that matter for the task.
2. Run `dev/land-the-plane <issue-id> "optional notes" ...`.
3. Review the reported untracked files and stashes.
4. If another issue is ready, copy the suggested prompt into the next session.

## Relationship to Beads

`dev/land-the-plane` extends `dev/beads-finish`. `beads-finish` is still the lower-level close/sync helper; `land-the-plane` is the repo's full handoff ritual.
