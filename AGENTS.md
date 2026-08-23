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

# [Beads](https://github.com/steveyegge/beads) in Beans

This repo uses modern Beads (`bd`) on the Dolt backend. The runtime source of truth is the shared Dolt project under `.beads/dolt`, with `.beads/metadata.json` describing the active backend and database.

The old JSONL export workflow is migration residue, not the current operating model:

- Do not use top-level `bd --no-daemon`.
- Do not use `no-db`, `bd sync --flush-only`, or `bd import` for normal repo work.
- Do not treat `beads-sync`, `.beads/issues.jsonl`, or `.beads/beads.db` as the live issue store.

## Durable mutation rule

Every Beads mutation in this repo must be pushed durably through Dolt:

```bash
DOLT_REMOTE_PASSWORD="$(gh auth token)" bd dolt push
```

The repo helpers already do this for the Beads mutations they perform. If you create, update, claim, or close an issue manually, run the Dolt push yourself immediately afterward.

## Where data lives

- `.beads/metadata.json` tells you which backend is active. In this repo it should show `backend: dolt` and database `beans`.
- `.beads/dolt/` holds the live Beads runtime data for this clone.
- `.beads/issues.jsonl` may still exist as migration residue or backup material, but it is not the durable source of truth for current operations.
- `bd context`, `bd list`, `bd ready`, and `bd show` should all work directly against the Dolt backend.

## Worktree pattern

Use Beads-managed worktrees so every task checkout shares the same runtime store through the redirect file.

- The repo root checkout stays on `main` and is integration-only.
- Personal non-task WIP belongs in `worktrees/my/main`.
- Beads task work belongs in `worktrees/beans-<issue-id>` on branches like `codex/beans-<issue-id>`.

Preferred startup path:

```bash
dev/beads-start <issue-id>
```

The helper:

- shows the target issue
- refreshes Beads git hooks
- installs the repo-owned `pre-push` guard
- warns if the source checkout is already dirty
- claims the issue and immediately runs `bd dolt push`
- creates `worktrees/beans-<issue-id>` on `codex/beans-<issue-id>`
- repairs the worktree-local `.beads/redirect`
- removes redundant per-worktree `.gitignore` noise if Beads added it

Manual fallback:

```bash
bd show <issue-id>
bd update <issue-id> --claim
DOLT_REMOTE_PASSWORD="$(gh auth token)" bd dolt push
bd worktree create worktrees/beans-<issue-id> --branch codex/beans-<issue-id>
```

## Finish path

Use the repo helper from the task worktree:

```bash
dev/beads-finish <issue-id> ["notes"]
```

The helper:

- shows the issue
- closes it, optionally recording notes in the same mutation
- runs `bd dolt push`
- prints `git status --short`
- shows the closed issue JSON for confirmation

Manual fallback:

```bash
bd update <issue-id> --notes "optional notes" --status closed
DOLT_REMOTE_PASSWORD="$(gh auth token)" bd dolt push
git status --short
bd show <issue-id> --json
```

## Land-the-plane flow

`dev/land-the-plane <issue-id>` is the repo's named end-of-session closeout ritual.

It:

1. Runs default validation (`npm run check:beads-start`, `npm run check:markdown-a11y`, and `npm run build`) unless overridden.
2. Creates requested follow-up Beads issues and pushes each one through Dolt.
3. Auto-commits tracked or untracked task-worktree changes when safe.
4. Delegates closeout to `dev/beads-finish`.
5. Updates the root `main` checkout from `origin/main`.
6. Merges the task branch into root `main`.
7. Pushes `main`.
8. Prunes closed task worktrees.
9. Shows `bd ready` and suggests the next issue.

Successful closeout means:

- the task worktree is clean before prune, or was checkpointed automatically
- root `main` ends clean and synced with `origin/main`
- the task worktree is pruned after closeout
- all Beads mutations created during the session were pushed via Dolt

## Pre-push guard

`dev/beads-start` installs the repo-owned `pre-push` hook wrapper. When you push `main`, the repo guard checks merged `codex/beans-*` branches and blocks the push if their Beads issue is still open.

That guard is status-based now. It no longer relies on the old `beads-sync` JSONL export flow.

## Verification and cleanup

Use these checks when repairing or validating the repo:

```bash
bd doctor --agent --json
bd context
bd ready
bd list
```

If `bd doctor --check=artifacts` reports classic artifacts, clean them:

```bash
bd doctor --check=artifacts --clean -y
```

That cleanup is safe to rerun. Once the repo is fully migrated, it should converge to a no-op.

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

- Prefer `dev/beads-start <issue-id>` when starting a bean-entry task worktree.
- Use Beads-managed worktrees under `worktrees/beans-<issue-id>`.
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
