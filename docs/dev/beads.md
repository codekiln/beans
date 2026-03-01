# [Beads](https://github.com/steveyegge/beads) in Beans

This repo uses Beads (`bd`) for git-native issue tracking. Issues live in the repo, travel with the code, and sync through the `beads-sync` branch JSONL.

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

## Worktrees (required pattern)

Use Beads-managed worktree creation so all worktrees share the same `.beads` store through redirect wiring.

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

Fast-start helper:

```bash
dev/beads-start <issue-id>
```

This helper runs Beads startup steps in one command: claim issue, ensure worktree, and select branch.
It forces direct mode via `bd --no-daemon` because this repo has reproduced daemon-path hangs in local and worktree sessions.
It also removes the redundant per-worktree `.gitignore` entry that some `bd worktree create` versions append even though the repo already has a wildcard ignore rule.
It warns if the source checkout is already dirty and creates `codex/<issue-id>` first when the installed `bd` expects `--branch` to reference an existing branch.

Finish helper:

```bash
dev/beads-finish <issue-id> ["notes"]
```

This helper standardizes the close/sync path: show issue, optionally append notes, close it, run `bd --no-daemon sync --check`, show `git status --short`, run `bd --no-daemon sync --force`, fall back to `bd --no-daemon export -o .git/beads-worktrees/beads-sync/.beads/issues.jsonl` if needed, and fail if the issue is still missing from `beads-sync/.beads/issues.jsonl`.

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
dev/beads-finish <issue-id> "optional notes"
git push
```

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
