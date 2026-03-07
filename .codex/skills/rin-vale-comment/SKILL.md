---
name: rin-vale-comment
description: "Generate or regenerate a Rin Vale buddy comment in bean frontmatter for a target bean entry."
---

# Rin Vale comment workflow

Use this skill when asked to add, refresh, or replace a Rin Vale buddy comment on an existing bean entry.

## Command

```bash
$ bean buddy <entry-id-or-slug>
```

Example:

```bash
$ bean buddy 2026-03-05-bean1
```

## Workflow

1. Resolve the bean entry file at `src/content/beans/<entry-id-or-slug>.md`.
2. Read the target entry and a small set of nearby bean logs for context.
3. Update frontmatter in place under:

```yaml
personaComment:
  name: "Rin Vale"
  title: "Campfire Cupping Companion"
  body: "<generated text>"
```

4. Ensure the tag `comment/rin-vale` is present.
5. Replace the existing `personaComment.body` when regenerating; do not append duplicate comment blocks.

## Writing target

- Keep the note concise and tied to the brew details in the entry.
- Include at least one concrete brewing adjustment and explain why it may help.
- Keep the markdown body untouched unless the user explicitly asks for other edits.
