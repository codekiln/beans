# Beans Beads Workflow

Use `bd` for all task tracking in this repository.

## Session start

```bash
bd where
bd worktree info
bd sync --status
bd ready
```

Rules:
- Use `bd ready` to find unblocked work.
- Claim atomically with `bd update <issue-id> --claim`.
- Keep worktrees under `worktrees/` and create them with:
  - `bd worktree create worktrees/<branch-name> --branch <branch-name>`
- Do not use TodoWrite/TaskCreate/markdown task lists as the task system.
- Avoid `bd edit` in agent sessions.
- If user asks to "get started" on a bead, execute immediately:
  - claim bead
  - create/ensure worktree
  - begin implementation
  - do not stop for extra confirmation

## During work

```bash
bd show <issue-id>
bd update <issue-id> --status in_progress
```

- Add dependencies with `bd dep add`.
- Use `bd gate` for async waits.
- Use `bd merge-slot` when serializing merge/conflict resolution.

## Session end

```bash
bd show <issue-id>
bd sync --check
git status --short
bd sync
git push
```

## Repo policy

- Sync branch is `beads-sync`.
- Keep deploy workflows branch-filtered to `main`.
- Keep `beads-sync` as a persistent metadata branch (do not rely on merge-and-delete).
