Please also reference the following rules as needed. The list below is provided in TOON format, and `@` stands for the project root directory.

rules[4]:
  - path: @.codex/memories/beads.md
    description: Beads workflow and closeout invariants
    applyTo[1]: docs/dev/beads.md
  - path: @.codex/memories/bean-entry.md
    description: Bean entry command and content template
    applyTo[1]: src/content/beans/**
  - path: @.codex/memories/companions.md
    description: Companion content model and prose guidance
    applyTo[3]: src/content/companions/**,src/pages/companion/**,src/data/companions.ts
  - path: @.codex/memories/rulesync.md
    description: Rulesync usage and devcontainer installation
    applyTo[1]: docs/dev/rulesync.md

# Beans Project Overview

Beans is a CLI-inspired coffee log built with Astro. The site content lives in `src/content` and content helpers live in `src/data`; the UI is composed of Astro components, layouts, and styles in `src/`.

## General Guidelines

- Always generate previews using the `/beans/` base prefix (for example: `/beans/log/<slug>`).
- When a user requests changes, load `AGENTS.md` first and provide a preview in ChatGPT Codex.
- Follow existing project conventions and patterns; mirror nearby code style when editing files.
- Prefer small, focused changes that keep the CLI-inspired tone of the site intact.
- Use the existing utilities (such as `withBase`) for building paths and links in components.
- Keep content changes in `src/content` and presentation changes in `src/components`, `src/layouts`, or `src/styles`.
- Keep the primary descriptive content for data models in the markdown body, not frontmatter arrays.
- When adding new pages, use `.astro` files and include the base layout.
- For Beads-managed work, prefer `dev/beads-start <issue-id>` so startup uses the repo's Beads worktree flow and cleanup.
- Prefer `dev/beads-finish <issue-id>` for the close/push path so metadata handling is consistent.
- Keep the repo root checkout on `main` as an integration-only worktree; do not use it for active feature edits.
- Personal non-task WIP belongs in `worktrees/my/main`.
- Task worktrees live at `worktrees/beans-<issue-id>` on branches like `codex/beans-<issue-id>`.
- Product code changes belong on the task branch/worktree and land on `main`; Beads metadata lives in the shared Dolt runtime under `.beads/dolt`.
- After every Beads mutation, run `DOLT_REMOTE_PASSWORD="$(gh auth token)" bd dolt push`, or use the repo helpers that already do this for their own Beads writes.
- Do not add per-worktree paths to `.gitignore`; rely on the existing wildcard rule `worktrees/beans-*/`.
- Unless the user explicitly asks for a branch or PR workflow, land completed work by updating the root `main` checkout from `origin/main`, merging the task branch into root `main` locally, and pushing `main` directly.
- In this repo, the default handoff should sidestep PR creation entirely; do not treat pushing the task worktree branch as the normal landing path unless the user requests it.
- Treat `beads-sync`, `.beads/issues.jsonl`, `.beads/beads.db`, `bd --no-daemon`, `bd sync --flush-only`, and `bd import` as migration residue rather than current workflow.
- A Beads-managed task is not fully landed until `main` is clean and synced with `origin/main`, the task worktree is pruned if it was closed, and the session's Beads mutations have been pushed via Dolt.

## Content Guidelines

- Bean entry markdown bodies are rendered directly as HTML using Astro's content rendering.
- Images in markdown body content must use the full `/beans/images/` path (e.g., `![alt](/beans/images/file.png)`).
- Images in frontmatter use `/images/` path without the `/beans/` prefix (handled by `withBase` utility in components).
- Markdown bodies support all standard markdown features: headings, paragraphs, lists, links, images, code blocks, etc.

## Code Style

- Use 2 spaces for indentation.
- Use double quotes for strings.
- Keep markup and text line wrapping consistent with surrounding files.

## RuleSync Workflow

- Rulesync is the AI config system of record for this repo.
- Update the unified rules in `.rulesync/rules/`.
- If a generated AI config file and a Rulesync source file disagree, fix the Rulesync source and regenerate instead of editing the generated file directly.
- Regenerate AI tool configs with `npx rulesync generate` after changing rules.
- Treat generated agent files (for example `AGENTS.md`, `.codex/memories/*`, `.cursor/commands/*`) as outputs; do not make durable edits there.

## Git LFS

- This repo does not use Git LFS. Avoid configuring or installing Git LFS hooks.

## Node Version Alignment

- Use `.nvmrc` as the single source of truth for the Node version.
- GitHub Actions and the devcontainer must both read the Node version from `.nvmrc` (do not hardcode version numbers elsewhere).
