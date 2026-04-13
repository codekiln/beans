---
description: Bean entry command and content template
applyTo: src/content/beans/**
---
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
