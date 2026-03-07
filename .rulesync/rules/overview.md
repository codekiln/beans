---
root: true
targets: ["*"]
description: "Project overview and AI development guidelines for Beans"
globs: ["**/*"]
---

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
- Prefer `dev/beads-finish <issue-id>` for the close/sync path so metadata handling is consistent.
- Task worktrees live at `worktrees/beans-<issue-id>` on branches like `codex/beans-<issue-id>`.
- Do not add per-worktree paths to `.gitignore`; rely on the existing wildcard rule `worktrees/beans-*/`.
- Creating or updating Beads issue metadata is not complete until the exported metadata change is committed in git. Default to committing it on `main`; committing it on an active Beads task branch is acceptable when that branch will land in `main` through the normal merge flow.
- Unless the user explicitly asks for a branch or PR workflow, land completed work by updating local `main` from `origin/main`, merging the task branch into `main` locally, and pushing `main` directly.
- In this repo, the default handoff should sidestep PR creation entirely; do not treat pushing the task worktree branch as the normal landing path unless the user requests it.
- Do not describe Beads sync changes as "just metadata" when deciding whether cleanup is complete. In this repo, the `beads-sync` worktree is part of the durable landing path.
- A Beads-managed task is not fully landed until both `main` and `beads-sync` are clean and synced with their matching `origin/*` branches.

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

- Update the unified rules in `.rulesync/rules/`.
- Regenerate AI tool configs with `npx rulesync generate` after changing rules.
- Treat generated agent files (for example `AGENTS.md`, `.codex/memories/*`, `.cursor/commands/*`) as outputs; do not make durable edits there.

## Git LFS

- This repo does not use Git LFS. Avoid configuring or installing Git LFS hooks.

## Node Version Alignment

- Use `.nvmrc` as the single source of truth for the Node version.
- GitHub Actions and the devcontainer must both read the Node version from `.nvmrc` (do not hardcode version numbers elsewhere).
