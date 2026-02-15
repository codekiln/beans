# [Beads](https://github.com/steveyegge/beads) in Beans

This repo uses Beads (`bd`) for git-native issue tracking. Issues live in the repo, travel with the code, and are synced as JSONL under `.beads/`.

## How it is installed

### Devcontainer
The devcontainer installs the Beads CLI (`bd`) via `.devcontainer/postCreate.sh` if it is not already available.

### Local install (optional)
If you are not using the devcontainer, install Beads manually with the upstream installer:

```bash
curl -fsSL https://raw.githubusercontent.com/steveyegge/beads/main/scripts/install.sh | bash
```

## Where data lives

- `.beads/beads.db` is the runtime issue database used by `bd`.
- `.beads/issues.jsonl` is the git-tracked sync artifact exchanged between clones/branches.
- `.beads/config.yaml` stores repo-level Beads config.
- Local SQLite/daemon files live under `.beads/` and are gitignored.

## Worktrees (required pattern)

Use Beads-managed worktree creation so all worktrees share the same `.beads` store through redirect wiring.

```bash
# Preferred pattern in this repo
bd worktree create worktrees/<branch-name> --branch <branch-name>

# Inspect configuration
bd worktree list
bd worktree info
bd where
```

Do not create ad hoc worktrees outside `worktrees/` for regular agent workflows.

Fast-start helper:

```bash
dev/beads-start <issue-id>
```

This helper runs Beads startup steps in one command: claim issue, ensure worktree, and select branch.

## Quick start (this repo)

```bash
# Show what is ready to work on
bd ready

# Create an issue
bd create "Add CI content integrity checks"

# Start work atomically (safe with many concurrent agents)
bd update <issue-id> --claim

# Add notes or acceptance criteria
bd update <issue-id> --notes "Validate all bean entry links"
bd update <issue-id> --acceptance "- CI fails on broken slugs"

# Finish work
bd update <issue-id> --status closed

# Sync JSONL with local changes
bd sync
```

## Core commands

```bash
# List issues (all, or filter by status/label)
bd list
bd list --status open
bd list --label content

# Show details
bd show <issue-id>

# Edit title/description
bd update <issue-id> --title "New title"
bd update <issue-id> --description "Expanded scope"

# Add labels and priority (0 = highest, 4 = lowest)
bd update <issue-id> --add-label ci --add-label content --priority 1
```

## Dependencies

Use dependencies to express blockers so `bd ready` only shows unblocked work.

```bash
# Make A depend on B (A is blocked by B)
bd dep add <issue-a> <issue-b>

# Inspect dependency tree or blocked items
bd dep tree <issue-id>
bd blocked
```

For larger async workflows, prefer:

```bash
# Manage async waits
bd gate list
bd gate check

# Serialize merge conflict resolution in multi-agent queues
bd merge-slot check
bd merge-slot acquire
bd merge-slot release
```

## Issue lifecycle and IDs

- Statuses are usually `open`, `in_progress`, and `closed` (also `blocked` or `deferred` when needed).
- Priority is 0 (highest) to 4 (lowest).
- IDs in this repo use the `beans-` prefix (for example, `beans-eip`). If you ever re-init a fork, `bd init` will derive a prefix from the repo name.

## Sync + git workflow

- Install hooks in each active clone/worktree:

```bash
bd hooks install
```

- Use `bd sync --check` before syncing/pushing.
- Use `bd sync` before pushing so `.beads/issues.jsonl` stays current.
- JSONL merges are handled via a custom git merge driver defined in `.gitattributes`.
- If JSONL conflicts occur, use `bd resolve-conflicts` (or normal git merge flow with the Beads merge driver).
- Keep sync branch consistent across clones/worktrees. This repo standard is `beads-sync`.
- Keep deploy workflows branch-filtered (for example, Pages deploy only from `main`) so metadata sync branch updates do not trigger site deploys.


## Session checklists

Session start:

```bash
bd prime
bd where
bd worktree info
bd sync --status
bd ready
```

Session end:

```bash
bd show <issue-id>
bd sync --check
git status --short
bd sync
git push
```

## Hook health checks

```bash
bd hooks list
bd doctor --check-health
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
bd worktree list
bd sync --status
bd doctor --check-health
```
