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
- Keep the repo root checkout on `main` as an integration-only worktree; do not use it for active feature edits.
- Personal non-task WIP belongs in `worktrees/my/main`.
- Task worktrees live at `worktrees/beans-<issue-id>` on branches like `codex/beans-<issue-id>`.
- Product code changes belong on the task branch/worktree and land on `main`.
- Do not add per-worktree paths to `.gitignore`; rely on the existing wildcard rule `worktrees/beans-*/`.
- Unless the user explicitly asks for a branch or PR workflow, land completed work by updating the root `main` checkout from `origin/main`, merging the task branch into root `main` locally, and pushing `main` directly.
- In this repo, the default handoff should sidestep PR creation entirely; do not treat pushing the task worktree branch as the normal landing path unless the user requests it.
- A task is not fully landed until `main` is clean and synced with `origin/main` and the task worktree is pruned.

## Content Guidelines

- Bean entry markdown bodies are rendered directly as HTML using Astro's content rendering.
- **Bean body images (static files):** add the file under **`public/images/`** in the repo (e.g., `public/images/2026-04-01-scan.jpg`). Astro serves `public/` at the site root and the project `base` is `/beans/`, so that file is reachable at **`/beans/images/...`**. Do **not** nest another `beans` folder (`public/beans/images/` is wrong for this setup).
- **Bean body markdown:** reference those assets with the full URL path including base, e.g., `![alt](/beans/images/file.png)`.
- **Frontmatter images:** use `/images/...` without the `/beans/` prefix (components apply `withBase`); the file still lives under **`public/images/`**.
- When a bean entry is created from user-supplied images or scans, import those files into `public/images/` and display them in the post by default unless the user explicitly requests otherwise.
- Markdown bodies support all standard markdown features: headings, paragraphs, lists, links, images, code blocks, etc.

## Code Style

- Use 2 spaces for indentation.
- Use double quotes for strings.
- Keep markup and text line wrapping consistent with surrounding files.

## RuleSync Workflow

- Rulesync is the AI config system of record for this repo.
- Keep durable guidance in `.rulesync/rules/` and reusable agent workflows in `.rulesync/commands/`.
- If a generated AI config file and a Rulesync source file disagree, fix the Rulesync source and regenerate instead of editing the generated file directly.
- Regenerate AI tool configs with `npx rulesync generate` after changing rules.
- Treat generated agent files (for example `AGENTS.md`, `CLAUDE.md`, `.agents/skills/*`, `.cursor/rules/*`) as outputs; do not make durable edits there.

## Git LFS

- This repo does not use Git LFS. Avoid configuring or installing Git LFS hooks.

## Node Version Alignment

- Use `.nvmrc` as the single source of truth for the Node version.
- GitHub Actions and the devcontainer must both read the Node version from `.nvmrc` (do not hardcode version numbers elsewhere).

# Bean entry command

Use this CLI-style command when creating a new Bean entry:

```bash
$ bean log <YYYY-MM-DD> [HHMM]
```

Then create a matching file at `src/content/beans/<YYYY-MM-DD>-<beanKey>.md` with frontmatter fields that align with the beans collection schema, and keep the primary descriptive content in the markdown body.

`bean` is not an installed command in this repository. Treat this as display text for UI/agent responses and file naming only.

## Identifier rules

- Keep `beanKey` and `id` in frontmatter, plus the `src/content/beans/<YYYY-MM-DD>-<beanKey>.md` filename, as the internal content identity.
- For display commands and public URLs, use the date alone when that date has exactly one bean entry:
  - command: `$ bean log 2026-03-08`
  - URL: `/beans/log/2026-03-08/`
- When a date has multiple bean entries, derive the public identifier from the top-level `time` using 24-hour `HHMM`:
  - command: `$ bean log 2026-02-05 0452`
  - URL: `/beans/log/2026-02-05-0452/`
- If a multi-entry date ever lacks `time`, fall back to a simple ordinal such as `1` or `2` for the public identifier.
- Preserve backward compatibility for existing `/beans/log/<YYYY-MM-DD>-beanN/` links by keeping those legacy paths available as aliases.

## Worktree convention for bean-entry tasks

- Use task worktrees under `worktrees/beans-<issue-id>`.
- Do not add individual worktree paths to `.gitignore`; this repo already ignores them via `worktrees/beans-*/`.

## Markdown Body Content

The markdown body is rendered directly using Astro's content rendering. You can use:
- Standard markdown: paragraphs, headings, lists, blockquotes, code blocks
- Links: `[text](url)`
- Images: `![alt text](/beans/images/filename.png)`

### User-supplied source images

- When a user provides one or more source images for a bean entry, treat those images as part of the entry by default.
- Import the supplied image files into `public/images/` with a date-and-title-based filename that matches nearby bean-entry conventions.
- Display the imported images in the markdown body with `/beans/images/...` links unless the user explicitly asks for a text-only entry or asks you not to show the images.
- If the entry uses multiple scanned pages, prefer placing each page image near the related section of transcription or reflection instead of leaving the scans out.
- If one supplied image is a clear primary page, also set the bean frontmatter `image` to that file unless there is a stronger established cover image.

### Static image files (disk vs markdown)

- **Commit the file at** `public/images/<filename>` (same folder as frontmatter body images).
- **In the bean markdown body**, use the path that includes the site base: `/beans/images/<filename>` (not a second `beans` segment on disk).
- **Frontmatter `image.src`** uses `/images/<filename>` without the `/beans/` prefix; `withBase` adds base in components. The asset file is still **`public/images/<filename>`**.

**Important**: Do not add an inline body preamble like `` `$ bean log YYYY-MM-DD` `` or `` `$ bean log YYYY-MM-DD HHMM` `` in the markdown body. The UI renders the bean log command prompt in the entry header.

## Rin Vale Buddy Comment Frontmatter

Bean entries may include optional Rin Vale buddy comment metadata in frontmatter:

```yaml
personaComment:
  companion: "rin-vale"
  body: "<single comment body>"
```

- `personaComment.companion` should point to the companion slug from `src/content/companions/`.
- When a `personaComment` is present, include the tag `comment/rin-vale` in the bean entry `tags` list.
- Regeneration replaces `personaComment.body` instead of appending additional comments.
- Buddy comments should read like a knowledgeable coffee friend and include practical, actionable brew advice linked to the logged details.

## Examples

### Frontmatter Image
```yaml
image:
  src: "/images/example.png"  # No /beans/ prefix
  alt: "Description"
```

### Markdown Body Image
```markdown
<!-- File on disk: public/images/example.png -->
![Description](/beans/images/example.png)  <!-- URL includes Astro base /beans/ -->
```

# Companion content

Companions are a first-class content model for recurring coffee presences in Beans. Use `src/content/companions/` for companion profiles and `/companion/` routes for the list and detail pages.

## Important distinction

- `virtual coffee companion` is a repository and content-model concept.
- It is usually **not** the right prose style for the companion pages themselves.

Future edits should preserve that distinction.

## Voice and framing

- Companion detail pages should read like private notebook material, field notes, or remembered encounters, not product copy.
- Avoid feature-language that explains or justifies the existence of the companion to readers.
- Avoid “character wiki,” “NPC bio,” or overt lore-dump framing unless the user explicitly asks for that tone.
- Prefer concrete observed details, remembered scenes, habits, weather, tools, and repeated patterns over abstract explanation.
- It is often better to imply character through image and recollection than to state the character in summary form.
- Short lines, compressed phrasing, and journal-like fragments are acceptable when they fit the surrounding voice.

## Rin Vale specifically

- Rin Vale should feel like a remembered recurring figure in the coffee journal, not a branded AI helper.
- The page should sound like it was written for the author, not composed as onboarding copy for site visitors.
- Understatement is usually better than overt whimsy when handling the strangeness of a companion on a coffee blog.

## Companion list page

- The list page should follow the site's CLI conceit at the top with the invoked command for that page.
- The body list itself should not read like a menu of CLI commands.
- Prefer linking each companion by name, with portrait and brief descriptive text alongside it.

# Rulesync in Beans

This repo uses Rulesync to keep AI tool rules, skills, and subagents consistent across editors and agents. It reads the unified Rulesync sources under `.rulesync/` and generates tool-specific files with `npx rulesync generate`.

Rulesync is the AI config system of record for this repository. Treat files under `.rulesync/` as the durable source and treat generated agent/editor configs as outputs.

## Devcontainer install

The devcontainer installs Rulesync globally for easy CLI access in `.devcontainer/postCreate.sh`:

```bash
npm install -g rulesync
```

## Local usage

Rulesync is also listed in `devDependencies`, so you can run it with:

```bash
npx rulesync generate
```

## Source of truth

- Keep durable AI coding guidance changes in `.rulesync/rules/*.md`.
- Keep reusable workflow prompts and task abstractions in `.rulesync/skills/*/SKILL.md`.
- Keep delegated specialist agents in `.rulesync/subagents/*.md`.
- Generated files like `AGENTS.md`, `CLAUDE.md`, `.agents/*`, `.cursor/*`, and `.claude/*` should be treated as derived output from Rulesync.

## Update workflow

1. Edit `.rulesync/rules/*.md` for durable guidance, `.rulesync/skills/*/SKILL.md` for reusable in-context workflows, and `.rulesync/subagents/*.md` for delegated specialist agents.
2. Run `npx rulesync generate`.
3. Review the generated diffs in `AGENTS.md`, `CLAUDE.md`, `.agents/*`, `.codex/*`, `.cursor/*`, `.claude/*`, `.github/*`, and other Rulesync-managed outputs.
4. If generated output looks wrong, fix the Rulesync source files and regenerate instead of patching generated files directly.
