Please also reference the following rules as needed. The list below is provided in TOON format, and `@` stands for the project root directory.

rules[1]:
  - path: @.codex/memories/bean-entry.md
    description: Bean entry command and content template
    applyTo[1]: src/content/beans/**

# Additional Conventions Beyond the Built-in Functions

As this project's AI coding tool, you must follow the additional conventions below, in addition to the built-in functions.

# Beans Project Overview

Beans is a CLI-inspired coffee log built with Astro. The site content lives in `src/content` and content helpers live in `src/data`; the UI is composed of Astro components, layouts, and styles in `src/`.

## General Guidelines

- Always generate previews using the `/beans/` base prefix (for example: `/beans/log/<slug>`).
- When a user requests changes, load `AGENTS.md` first and provide a preview in ChatGPT Codex. This is mainly for Codex Cloud tasks so you get a visual check in ChatGPT; in Codespaces you can rely on `npm run dev` for local preview.
- Follow existing project conventions and patterns; mirror nearby code style when editing files.
- Prefer small, focused changes that keep the CLI-inspired tone of the site intact.
- Use the existing utilities (such as `withBase`) for building paths and links in components.
- Keep content changes in `src/content` and presentation changes in `src/components`, `src/layouts`, or `src/styles`.
- Keep the primary descriptive content for data models in the markdown body, not frontmatter arrays.
- When adding new pages, use `.astro` files and include the base layout.

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

## Node Version Alignment

- Use `.nvmrc` as the single source of truth for the Node version.
- GitHub Actions and the devcontainer must both read the Node version from `.nvmrc` (do not hardcode version numbers elsewhere).

## Landing the Plane (Session Completion)

**When ending a work session**, you MUST complete ALL steps below. Work is NOT complete until `git push` succeeds.

**MANDATORY WORKFLOW:**

1. **File issues for remaining work** - Create issues for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **PUSH TO REMOTE** - This is MANDATORY:
   ```bash
   git pull --rebase
   bd sync
   git push
   git status  # MUST show "up to date with origin"
   ```
5. **Clean up** - Clear stashes, prune remote branches
6. **Verify** - All changes committed AND pushed
7. **Hand off** - Provide context for next session

**CRITICAL RULES:**
- Work is NOT complete until `git push` succeeds
- NEVER stop before pushing - that leaves work stranded locally
- NEVER say "ready to push when you are" - YOU must push
- If push fails, resolve and retry until it succeeds
