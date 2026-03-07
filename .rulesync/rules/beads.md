---
root: false
targets: ["*"]
description: "Beads workflow and closeout invariants"
globs: ["docs/dev/beads.md"]
---

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

## Durable closeout invariant

For this repo, Beads metadata on `beads-sync` is part of the durable landing path, not incidental cleanup noise.

- Do not describe a dirty `beads-sync` worktree as "just metadata" when deciding whether work is done.
- A Beads-managed task is not fully landed until both `main` and `beads-sync` are clean and synced with `origin/main` and `origin/beads-sync`.
- If `.git/beads-worktrees/beads-sync/.beads/issues.jsonl` is modified, cleanup is not complete yet.

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

This is the repo's named session closeout ritual. By default it runs the repo's standard validation command when available, assumes no follow-up issue is needed, runs `dev/beads-finish`, rebases and pushes, verifies the branch is synced with origin, then surfaces cleanup state and a next-session prompt.

Successful closeout for a Beads-managed task means all of the following are true:

- `main` is clean and synced with `origin/main`
- `beads-sync` is clean and synced with `origin/beads-sync`
- no closed-task Beads worktree remains under `worktrees/`

Humans can override the defaults with explicit flags. See `docs/dev/land-the-plane.md`.
