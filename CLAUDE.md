# Beans Project Overview

Beans is a CLI-inspired coffee log built with Astro. The site content lives in `src/data` and the UI is composed of Astro components, layouts, and styles in `src/`.

## General Guidelines

- Always generate previews using the `/beans/` base prefix (for example: `/beans/log/<slug>`).
- When a user requests changes, load `AGENTS.md` first and provide a preview in ChatGPT Codex.
- Follow existing project conventions and patterns; mirror nearby code style when editing files.
- Prefer small, focused changes that keep the CLI-inspired tone of the site intact.
- Use the existing utilities (such as `withBase`) for building paths and links.
- Keep content changes in `src/data` and presentation changes in `src/components`, `src/layouts`, or `src/styles`.
- When adding new pages, use `.astro` files and include the base layout.

## Code Style

- Use 2 spaces for indentation.
- Use double quotes for strings.
- Keep markup and text line wrapping consistent with surrounding files.

## RuleSync Workflow

- Update the unified rules in `.rulesync/rules/`.
- Regenerate AI tool configs with `npx rulesync generate` after changing rules.
