# Beads in Beans

This repo uses Beads for git-native issue tracking. Issues live in the repo, travel with the code, and are synced as JSONL under `.beads/`.

## How it is installed

### Devcontainer
The devcontainer installs the Beads CLI (`bd`) during `postCreateCommand` if it is not already available.

### Local install (optional)
If you are not using the devcontainer, install Beads manually with the upstream installer:

```bash
curl -fsSL https://raw.githubusercontent.com/steveyegge/beads/main/scripts/install.sh | bash
```

## Where data lives

- `.beads/issues.jsonl` is the git-tracked source of truth for issues.
- `.beads/config.yaml` stores repo-level Beads config.
- Local SQLite/daemon files live under `.beads/` and are gitignored.

## Common commands

```bash
# Create an issue
bd create "Add CI content integrity checks"

# List issues
bd list

# Show details
bd show <issue-id>

# Update status
bd update <issue-id> --status in_progress
bd update <issue-id> --status done

# Sync JSONL with local changes
bd sync
```

## Workflow notes

- Use `bd sync` before pushing to keep `.beads/issues.jsonl` up to date.
- Beads JSONL merges are handled via a custom git merge driver defined in `.gitattributes`.
- The issue prefix for this repo is `beans-` (for example, `beans-eip`).
