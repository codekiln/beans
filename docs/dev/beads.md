# [Beads](https://github.com/steveyegge/beads) in Beans

This repo uses Beads (`bd`) for git-native issue tracking. Issues live in the repo, travel with the code, and sync through the `beads-sync` branch JSONL.

## Source of truth workflow

Treat product code and Beads metadata as related but different artifacts with different durable homes:

- Product code source of truth: the task branch and task worktree where you make code changes, usually `codex/<issue-id>` in `worktrees/beans-<issue-id>`, then `main` after landing.
- Beads metadata source of truth while editing: the shared `.beads/beads.db` store that all Beads-managed worktrees in this clone use.
- Beads metadata durable git source of truth: `.git/beads-worktrees/beads-sync/.beads/issues.jsonl` on the `beads-sync` branch after `bd --no-daemon sync --force` or the export fallback writes the latest DB state there.

Commit intent follows that split:

- Commit product code changes on the task branch worktree.
- Let the Beads sync flow write durable metadata to the `beads-sync` worktree and branch.
- Do not treat the task worktree's `.beads/issues.jsonl` as the durable export target.
- Do not move product code onto `beads-sync` or use `beads-sync` as the review or landing branch for site changes.

## Durable metadata rule

Creating or updating Beads metadata is not complete until the exported metadata change is committed in git. No commit means the enqueue/update action is not done.

- Default behavior: sync/export the tracked Beads metadata and commit that change on `main`.
- Exception: when you are already inside an active Beads task worktree, committing the metadata change on that task branch is acceptable, with the expectation that it lands in `main` through the normal merge/landing flow.
- Verification requires both `bd --no-daemon show <issue-id>` and a matching entry in `.git/beads-worktrees/beads-sync/.beads/issues.jsonl`.

## How it is installed

### Devcontainer
The devcontainer installs the Beads CLI (`bd`) via `.devcontainer/postCreate.sh` if it is not already available.

### Local install (optional)
If you are not using the devcontainer, install Beads manually with the upstream installer:

```bash
curl -fsSL https://raw.githubusercontent.com/steveyegge/beads/main/scripts/install.sh | bash
```

## Where data lives

- `.beads/beads.db` is the runtime issue database that `bd show`, `bd list`, and other CRUD commands read from in this repo.
- `.git/beads-worktrees/beads-sync/.beads/issues.jsonl` is the durable sync artifact for the `beads-sync` branch workflow used here.
- The current checkout's `.beads/issues.jsonl` can lag behind the sync branch copy, so do not treat it as proof that a DB mutation has been exported.
- `.beads/config.yaml` stores repo-level Beads config.
- Local SQLite/daemon files live under `.beads/` and are gitignored.

## Branches and worktrees

- `main`: the durable branch for product code after landing.
- `codex/<issue-id>` in `worktrees/beans-<issue-id>`: the normal place to make code and doc changes for one task.
- `beads-sync` in `.git/beads-worktrees/beads-sync/`: the durable place for exported Beads metadata that must stay in sync with `origin/beads-sync`.

The expected pattern is:

1. Start from a clean clone or worktree with Beads installed.
2. Run `dev/beads-start <issue-id>` from the repo root checkout.
3. Make code changes only in `worktrees/beans-<issue-id>` on `codex/<issue-id>`.
4. Run `dev/beads-finish <issue-id>` or `dev/land-the-plane <issue-id>` so the shared DB is exported into `beads-sync`.
5. Land code to `main`, and make sure `beads-sync` is also clean and pushed.

## Preflight checklist

Use this checklist the same way in a local devcontainer, Codespaces, Codex Desktop, or Codex Cloud:

- Run commands from the repo root checkout, not from an unrelated clone.
- Confirm `bd` is installed and prefer `bd --no-daemon` in this repo.
- Confirm the current checkout is not carrying unrelated dirt before you create a new task worktree.
- Verify the shared Beads store and worktree wiring with `bd --no-daemon where` or `bd --no-daemon worktree info`.
- Use `dev/beads-start <issue-id>` instead of hand-rolling `git worktree` plus `bd` commands.

## Worktrees (required pattern)

Use Beads-managed worktree creation so all worktrees share the same `.beads` store through redirect wiring.

Worktree roles in this repo are explicit:

- The repo root checkout stays on `main` and is integration-only. Use it for fetch/merge/push cleanup, not for active edits.
- Personal non-task WIP belongs in `worktrees/my/main`.
- Beads task work belongs in `worktrees/beans-<issue-id>` on branches like `codex/<issue-id>`.

```bash
# Preferred startup path in this repo
dev/beads-start <issue-id>

# Low-level Beads command used by the helper
bd --no-daemon worktree create worktrees/<issue-id> --branch codex/<issue-id>

# Inspect configuration
bd --no-daemon worktree list
bd --no-daemon worktree info
bd --no-daemon where
```

Do not create ad hoc worktrees outside `worktrees/` for regular agent workflows.
This repo already ignores `worktrees/beans-*/`, so startup flows must not leave per-worktree ignore entries behind in `.gitignore`.
If you want a personal `main` worktree, create or refresh it separately from the root checkout, for example with `git worktree add worktrees/my/main main`.

Fast-start helper:

```bash
dev/beads-start <issue-id>
```

This helper runs Beads startup steps in one command: claim issue, ensure worktree, and select branch.
It forces direct mode via `bd --no-daemon` because this repo has reproduced daemon-path hangs in local and worktree sessions.
It also removes the redundant per-worktree `.gitignore` entry that some `bd worktree create` versions append even though the repo already has a wildcard ignore rule.
It warns if the source checkout is already dirty and creates `codex/<issue-id>` first when the installed `bd` expects `--branch` to reference an existing branch.

Concrete start sequence:

```bash
bd --no-daemon where
bd --no-daemon show <issue-id>
dev/beads-start <issue-id>
cd worktrees/beans-<issue-id>
git status --short
```

Finish helper:

```bash
dev/beads-finish <issue-id> ["notes"]
```

This helper standardizes the close/sync path: show issue, optionally append notes, close it, run `bd --no-daemon sync --check`, show `git status --short`, run `bd --no-daemon sync --force`, fall back to `bd --no-daemon export -o .git/beads-worktrees/beads-sync/.beads/issues.jsonl` if needed, and fail if the issue is still missing from `beads-sync/.beads/issues.jsonl`.

Concrete metadata sync sequence:

```bash
git -C worktrees/beans-<issue-id> status --short
dev/beads-finish <issue-id> "optional notes"
git -C .git/beads-worktrees/beads-sync status --short
rg "<issue-id>" .git/beads-worktrees/beads-sync/.beads/issues.jsonl
```

Closed-worktree cleanup helper:

```bash
dev/beads-prune-closed-worktrees
```

This helper removes Beads task worktrees under `worktrees/beans-*` when their corresponding Beads issue is already closed. Use `--dry-run` to inspect targets first and `--force` only when a closed-task worktree is intentionally disposable despite local dirt.

Land-the-plane helper:

```bash
dev/land-the-plane <issue-id> ["notes"] [--check "<command>"]... [--follow-up "<title>"]...
```

This is the repo's named session closeout ritual. By default it runs the repo's standard validation command when available, assumes no follow-up issue is needed, runs `dev/beads-finish`, rebases and pushes, verifies the branch is synced with origin, then surfaces cleanup state and a next-session prompt. Humans can override the defaults with explicit flags. See `docs/dev/land-the-plane.md`.

Successful closeout for a Beads-managed task means all of the following are true:

- the task worktree is clean, and any tracked edits were committed before landing
- `main` is clean and synced with `origin/main`
- `beads-sync` is clean and synced with `origin/beads-sync`
- no closed-task Beads worktree remains under `worktrees/`

`dev/land-the-plane` treats the root checkout as the integration target. It fails if the root `main` checkout is dirty, ignores unrelated dirt in worktrees such as `worktrees/my/main`, auto-commits tracked task-worktree changes when safe, commits and pushes `beads-sync` metadata when closeout dirties that worktree, and fails if the task worktree is ambiguous (for example because of untracked files or merge conflicts).

## Quick start (this repo)

```bash
# Show what is ready to work on
bd --no-daemon ready

# Create an issue
bd --no-daemon create "Add CI content integrity checks"

# Start work atomically (safe with many concurrent agents)
bd --no-daemon update <issue-id> --claim

# Add notes or acceptance criteria
bd --no-daemon update <issue-id> --notes "Validate all bean entry links"
bd --no-daemon update <issue-id> --acceptance "- CI fails on broken slugs"

# Finish work
bd --no-daemon update <issue-id> --status closed

# Sync JSONL with local changes and force export to beads-sync JSONL
bd --no-daemon sync --force
```

## Core commands

```bash
# List issues (all, or filter by status/label)
bd --no-daemon list
bd --no-daemon list --status open
bd --no-daemon list --label content

# Show details
bd --no-daemon show <issue-id>

# Edit title/description
bd --no-daemon update <issue-id> --title "New title"
bd --no-daemon update <issue-id> --description "Expanded scope"

# Add labels and priority (0 = highest, 4 = lowest)
bd --no-daemon update <issue-id> --add-label ci --add-label content --priority 1
```

## Dependencies

Use dependencies to express blockers so `bd ready` only shows unblocked work.

```bash
# Make A depend on B (A is blocked by B)
bd --no-daemon dep add <issue-a> <issue-b>

# Inspect dependency tree or blocked items
bd --no-daemon dep tree <issue-id>
bd --no-daemon blocked
```

For larger async workflows, prefer:

```bash
# Manage async waits
bd --no-daemon gate list
bd --no-daemon gate check

# Serialize merge conflict resolution in multi-agent queues
bd --no-daemon merge-slot check
bd --no-daemon merge-slot acquire
bd --no-daemon merge-slot release
```

## Issue lifecycle and IDs

- Statuses are usually `open`, `in_progress`, and `closed` (also `blocked` or `deferred` when needed).
- Priority is 0 (highest) to 4 (lowest).
- IDs in this repo use the `beans-` prefix (for example, `beans-eip`). If you ever re-init a fork, `bd init` will derive a prefix from the repo name.

## Sync + git workflow

- Install hooks in each active clone/worktree:

```bash
bd --no-daemon hooks install
```

- Use `bd --no-daemon sync --check` before syncing/pushing.
- Use `bd --no-daemon sync --force` before pushing, then verify the issue is present in `.git/beads-worktrees/beads-sync/.beads/issues.jsonl`.
- Treat issue creation/update as incomplete until that tracked JSONL change is part of a git commit.
- Default path: make that commit on `main`.
- Worktree exception: if the metadata change happens inside an active Beads task worktree, commit it on that task branch and let it reach `main` through the normal landing flow.
- JSONL merges are handled via a custom git merge driver defined in `.gitattributes`.
- If JSONL conflicts occur, use `bd --no-daemon resolve-conflicts` (or normal git merge flow with the Beads merge driver).
- Keep sync branch consistent across clones/worktrees. This repo standard is `beads-sync`.
- Keep deploy workflows branch-filtered (for example, Pages deploy only from `main`) so metadata sync branch updates do not trigger site deploys.

## Reliability notes

Observed on March 1, 2026:

- `bd show <issue-id>` and direct SQLite queries could see `beans-e2z` in `.beads/beads.db` even while both the main checkout `.beads/issues.jsonl` and `beads-sync` JSONL were missing it.
- Plain `bd` commands sometimes stalled until rerun with `--no-daemon`.
- `bd --no-daemon sync --flush-only` updated the `beads-sync` JSONL timestamp without exporting the new issue.
- `bd --no-daemon sync --force` was not sufficient on its own; in this repo it could still leave a valid DB row absent from the exported `beads-sync` JSONL.
- `bd --no-daemon export -o .git/beads-worktrees/beads-sync/.beads/issues.jsonl` reliably wrote the full SQLite state when `sync` missed a dirty issue.

For this repo, treat the runtime DB and the exported JSONL as separate checks:

- `bd --no-daemon show <issue-id>` proves the issue exists in SQLite.
- `rg "<issue-id>" .git/beads-worktrees/beads-sync/.beads/issues.jsonl` proves the issue is durably exported to the tracked sync branch metadata.

## Operator checklist for metadata changes

Use this sequence whenever you create or update Beads issue metadata.

```bash
# 1. Create or update the issue in direct mode
bd --no-daemon create "Title here"
# or
bd --no-daemon update <issue-id> --notes "Updated details"

# 2. Sync/export the tracked metadata
bd --no-daemon sync --check
bd --no-daemon sync --force
# If sync still misses the issue, export explicitly
bd --no-daemon export -o .git/beads-worktrees/beads-sync/.beads/issues.jsonl

# 3. Verify the issue ID is present in the tracked JSONL
rg "<issue-id>" .git/beads-worktrees/beads-sync/.beads/issues.jsonl

# 4. Make a git commit that contains the metadata change
git add .git/beads-worktrees/beads-sync/.beads/issues.jsonl
git commit -m "chore(beads): sync <issue-id> metadata"
```

Completion rule:

- On `main`, the metadata change is complete only after the tracked JSONL change is committed on `main`.
- In an active Beads task worktree, the metadata change is complete once that tracked JSONL change is committed on the task branch that will later merge back to `main`.

## Session checklists

Session start:

```bash
bd --no-daemon prime
bd --no-daemon where
bd --no-daemon worktree info
bd --no-daemon sync --status
bd --no-daemon ready
dev/beads-start <issue-id>
```

Session end:

```bash
dev/land-the-plane <issue-id> "optional notes"
```

If you only need the lower-level close/sync step, `dev/beads-finish` remains available.

## Hook health checks

```bash
bd --no-daemon hooks list
bd --no-daemon doctor --check-health
```

## Solo-dev sync branch policy

- This repo uses `beads-sync` as a persistent metadata branch.
- Keep deploy workflows filtered to `main` only.
- Avoid merge-and-delete behavior for `beads-sync`; if deleted remotely, recreate it before next sync.

## Worktree lock troubleshooting

If branch checkout fails with a message like `fatal: '<branch>' is already checked out at '.git/beads-worktrees/<name>'`:

```bash
# Remove stale beads-managed worktrees
rm -rf .git/beads-worktrees

# Prune stale git worktree metadata
git worktree prune

# Retry normal branch/worktree commands
git worktree list
```

Then verify Beads state:

```bash
bd --no-daemon worktree list
bd --no-daemon sync --status
bd --no-daemon doctor --check-health
```
