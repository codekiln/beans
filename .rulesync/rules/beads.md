---
root: false
targets: ["*"]
description: "Beads workflow and closeout invariants"
globs: ["docs/dev/beads.md"]
---

# [Beads](https://github.com/steveyegge/beads) in Beans

This repo uses Beads (`bd`) for git-native issue tracking. Issues live in the repo, travel with the code, and sync through the `beads-sync` branch JSONL.

## Source of truth workflow

Treat product code and Beads metadata as related but different artifacts with different authoritative homes:

- Product code authoritative branch: the task branch and task worktree where you make code changes, usually `codex/<issue-id>` in `worktrees/beans-<issue-id>`, then `main` after landing.
- Beads metadata authoritative working store: the shared `.beads/beads.db` database that all Beads-managed worktrees in this clone use while issues are being edited.
- Beads metadata authoritative tracked export: `.git/beads-worktrees/beads-sync/.beads/issues.jsonl` on the `beads-sync` branch after this repo's export flow writes the latest DB state there.
- Checkout-local mirror files: each checkout's `.beads/issues.jsonl` reflects local working state for that checkout and may change during Beads commands even when no authoritative export commit has happened yet.

Commit intent follows that split:

- Commit product code changes on the task branch worktree.
- Let the Beads sync flow write the authoritative tracked metadata export to the `beads-sync` worktree and branch.
- Do not treat the task worktree's `.beads/issues.jsonl` as the authoritative export target.
- Do not move product code onto `beads-sync` or use `beads-sync` as the review or landing branch for site changes.

## Durable closeout invariant

For this repo, Beads metadata on `beads-sync` is part of the durable landing path, not incidental cleanup noise.

- Creating or updating Beads metadata is not complete until the exported metadata change is committed in git. No commit means the enqueue/update action is not done.
- Default behavior: sync/export the tracked Beads metadata and commit that change on `main`.
- Exception: when you are already working inside an active Beads task worktree, committing the metadata change on that task branch is acceptable, with the expectation that it lands in `main` through the normal merge/landing flow.
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
- `.git/beads-worktrees/beads-sync/.beads/issues.jsonl` is the authoritative tracked export for the `beads-sync` branch workflow used here.
- The current checkout's `.beads/issues.jsonl` is only a checkout-local mirror, so do not treat it as proof that a DB mutation has been exported.
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

This helper runs Beads startup steps in one command: claim issue, ensure worktree, repair the repo-local `.beads` redirect when needed, and select branch.
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

This helper standardizes the close/sync path: show issue, optionally add notes, close it, run `bd --no-daemon sync --check`, show `git status --short`, export the shared DB into `.git/beads-worktrees/beads-sync/.beads/issues.jsonl`, and fail if the issue is still missing from the authoritative tracked export in `beads-sync/.beads/issues.jsonl`.

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

- the task worktree is clean, and any tracked edits were committed before landing
- `main` is clean and synced with `origin/main`
- `beads-sync` is clean and synced with `origin/beads-sync`
- no closed-task Beads worktree remains under `worktrees/`

`dev/land-the-plane` treats the root checkout as the integration target. It fails if the root `main` checkout starts dirty, ignores unrelated dirt in worktrees such as `worktrees/my/main`, auto-commits tracked or untracked task-worktree changes when safe, restores the root checkout's local `.beads/issues.jsonl` mirror after `dev/beads-finish`, commits and pushes the authoritative `beads-sync` export when closeout dirties that worktree, prunes closed-task Beads worktrees before declaring success, and fails if the task worktree is ambiguous because of merge conflicts.

Humans can override the defaults with explicit flags. See `docs/dev/land-the-plane.md`.

## Operator checklist for issue metadata changes

Use this checklist whenever you create or update Beads issue metadata.

```bash
# 1. Create or update the issue in direct mode
bd --no-daemon create "Title here"
# or
bd --no-daemon update <issue-id> --notes "Updated details"

# 2. Check sync health and export the tracked metadata
bd --no-daemon sync --check
bd --no-daemon export -o .git/beads-worktrees/beads-sync/.beads/issues.jsonl

# 3. Verify the issue ID is present in the tracked JSONL
rg "<issue-id>" .git/beads-worktrees/beads-sync/.beads/issues.jsonl

# 4. Commit the metadata change
git add .git/beads-worktrees/beads-sync/.beads/issues.jsonl
git commit -m "chore(beads): sync <issue-id> metadata"
```

Completion rule:

- On `main`, the metadata change is complete only after the tracked JSONL change is committed on `main`.
- In an active Beads task worktree, the metadata change is complete once that tracked JSONL change is committed on the task branch that will later merge back to `main`.
