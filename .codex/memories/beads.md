# Beads issue tracking in Beans

This repository uses **Beads** as the issue tracker. Beads data is local to the repo under `.beads/`.

- Source of truth: `.beads/issues.jsonl`
- Database/cache/runtime files: `.beads/beads.db*` and daemon state files
- CLI command: `bd`

## Expected agent behavior

- Treat Beads as the default task system for this repo.
- When a user asks about "tasks", "issues", or ticket IDs like `beans-2xn`, use `bd` first.
- Prefer `bd list`/`bd show` over manually reading JSONL unless debugging storage-level issues.
- In git worktrees, avoid daemon mode to prevent branch mix-ups:
  - `export BEADS_NO_DAEMON=1`

## Common commands

```bash
bd list --status open --type task
bd show <issue-id>
bd create "<title>"
bd update <issue-id> --status in_progress
bd close <issue-id>
bd sync
```

Use Beads IDs exactly as written (example: `beans-2xn`).
