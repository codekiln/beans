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

- `.beads/issues.jsonl` is the git-tracked source of truth for issues.
- `.beads/config.yaml` stores repo-level Beads config.
- Local SQLite/daemon files live under `.beads/` and are gitignored.

## Quick start (this repo)

```bash
# Show what is ready to work on
bd ready

# Create an issue
bd create "Add CI content integrity checks"

# Start work
bd update <issue-id> --status in_progress

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

## Issue lifecycle and IDs

- Statuses are usually `open`, `in_progress`, and `closed` (also `blocked` or `deferred` when needed).
- Priority is 0 (highest) to 4 (lowest).
- IDs in this repo use the `beans-` prefix (for example, `beans-eip`). If you ever re-init a fork, `bd init` will derive a prefix from the repo name.

## Sync + git workflow

- Use `bd sync` before pushing so `.beads/issues.jsonl` stays current.
- JSONL merges are handled via a custom git merge driver defined in `.gitattributes`.
- If `bd sync` prompts for a sync branch, set it once with `bd config set sync.branch <branch>` and keep it consistent across clones.
