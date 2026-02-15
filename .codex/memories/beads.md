# Beads issue tracking in Beans

This repository uses **Beads** as the issue tracker. Beads data is local to the repo under `.beads/`.

- Runtime store: `.beads/beads.db` (SQLite)
- Git exchange artifact: `.beads/issues.jsonl` (committed and merged with code)
- Database/cache/runtime files: `.beads/beads.db*` plus daemon/runtime state files
- CLI command: `bd`

## Expected agent behavior

- Treat Beads as the default task system for this repo.
- When a user asks about "tasks", "issues", or ticket IDs like `beans-2xn`, use `bd` first.
- Prefer `bd list`/`bd show` over manually reading JSONL unless debugging storage-level issues.
- Prefer `bd ready` to find actually claimable work (dependency-aware), not only `bd list --ready`.
- Use atomic claim for multi-agent safety:
  - `bd update <issue-id> --claim`
- This project is used in three execution environments:
  - GitHub Codespaces
  - Local devcontainer
  - Local execution
- Preferred worktree layout for local execution:
  - `${PROJECT_ROOT}/worktrees/${BRANCH_NAME}`
  - Keep all worktrees in subdirectories under `${PROJECT_ROOT}/worktrees/` (no worktree checkout directly at `${PROJECT_ROOT}/worktrees`).
  - Ensure `${PROJECT_ROOT}/worktrees/README.md` exists and states that all worktrees should live in subfolders of that directory.
- Create worktrees with Beads-aware wiring:
  - `bd worktree create worktrees/<branch-name> --branch <branch-name>`
  - `bd worktree list`
  - `bd worktree info`
- Do not rely on legacy `BEADS_NO_DAEMON` guidance; current `bd` defaults to direct mode and `--no-daemon` is deprecated.
- Auto-start intent:
  - If the user asks to "get started" on `<issue-id>` with Beads/worktree workflow, execute immediately:
    1. `bd prime`
    2. `bd update <issue-id> --claim`
    3. `bd worktree create worktrees/<issue-id> --branch codex/<issue-id>`
    4. continue into implementation work without waiting for extra confirmation.

## Common commands

```bash
bd worktree create worktrees/<branch-name> --branch <branch-name>
bd ready
bd list --status open --type task
bd show <issue-id>
bd create "<title>"
bd update <issue-id> --claim
bd close <issue-id>
bd sync --check
bd sync
```

Use Beads IDs exactly as written (example: `beans-2xn`).

## Multi-agent coordination

- Use dependencies and blockers, then let `bd ready` route agents to unblocked work.
- Use `bd gate` for async waits (human, timer, CI, PR, bead).
- Use `bd merge-slot` to serialize merge-conflict resolution when many agents converge on shared branches.

## Git integration

- Install Beads hooks in active clones/worktrees:
  - `bd hooks install`
- Ensure merge driver remains configured so `.beads/issues.jsonl` merges are handled by `bd`.
- If sync branch is required, keep one shared value across clones/worktrees (this repo uses `beads-sync`).

## Task completion workflow (required)

When finishing a Beads task in local Codex Desktop execution:

1. Close the Beads issue first (before push), for example:
   - `bd close <issue-id> --reason "<short reason>"`
2. Commit the Beads tracking changes produced by that close action (typically `.beads/issues.jsonl`, plus any related Beads metadata files that changed).
3. Rebase the worktree branch on top of `origin/main`.
4. Commit the task code/content changes on the worktree branch.
5. Merge the worktree branch into local `main`.
6. Push `main` to `origin` (do not push only the worktree branch).
7. Push only after both code changes and Beads state changes are committed.

Quick verification before push:

```bash
bd show <issue-id>
bd sync --check
git status --short
```
