Please also reference the following rules as needed. The list below is provided in TOON format, and `@` stands for the project root directory.

rules[3]:
  - path: @.codex/memories/bean-entry.md
    description: Bean entry command and content template
    applyTo[1]: src/content/beans/**
  - path: @.codex/memories/rulesync.md
    description: Rulesync usage and devcontainer installation
    applyTo[1]: docs/dev/rulesync.md
  - path: @.codex/memories/beads.md
    description: Beads issue tracking and bd CLI usage
    applyTo[1]: **

# Additional Conventions Beyond the Built-in Functions

As this project's AI coding tool, you must follow the additional conventions below, in addition to the built-in functions.

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

## Beads Workflow

- Run `bd prime` at session start (or after context compaction) to refresh the current Beads workflow contract.
- Use Beads (`bd`) as the task source of truth; do not track tasks in ad hoc markdown lists.
- Do not use TodoWrite/TaskCreate as the task system in this repo; use Beads issues instead.
- Create or claim the bead before coding, keep status current during work, and close/sync when done.
- For multi-agent work, prefer `bd ready` and atomically claim with `bd update <issue-id> --claim`.
- Use Beads-managed worktrees going forward: `bd worktree create worktrees/<branch-name> --branch <branch-name>`.
- Keep worktrees under `worktrees/` subfolders only.
- Run `bd sync --check` before `bd sync`/push when task state changed.
- Avoid `bd edit` in agent sessions because it opens an interactive editor.

### Session Start

```bash
bd prime
bd where
bd worktree info
bd sync --status
bd ready
```

### Session End

```bash
bd show <issue-id>
bd sync --check
git status --short
bd sync
git push
```

- Keep Beads hooks healthy: run `bd hooks list` and `bd doctor --check-health` periodically.

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

## Git LFS

- This repo does not use Git LFS. Avoid configuring or installing Git LFS hooks.

## Node Version Alignment

- Use `.nvmrc` as the single source of truth for the Node version.
- GitHub Actions and the devcontainer must both read the Node version from `.nvmrc` (do not hardcode version numbers elsewhere).
