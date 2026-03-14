---
paths:
  - src/content/beans/**
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

**Important**: Images in the markdown body must use the full `/beans/images/` path prefix, not `/images/`. This is different from frontmatter images which use `/images/` and are handled by the `withBase` utility in the component.
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
![Description](/beans/images/example.png)  # Includes /beans/ prefix
```
