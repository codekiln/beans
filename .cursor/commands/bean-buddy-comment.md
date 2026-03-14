---
description: Generate or regenerate a Rin Vale buddy comment for an existing bean entry
---
# Bean buddy comment

Use this workflow command when asked to generate or regenerate a Rin Vale buddy comment for an existing bean entry.

## Command format

```bash
$ bean buddy <entry-id-or-slug>
```

Example:

```bash
$ bean buddy 2026-03-05-bean1
```

## Behavior

1. Resolve the target entry to `src/content/beans/<entry-id-or-slug>.md`.
2. Load that entry and a small set of relevant prior entries from `src/content/beans/` for context.
3. Write the generated comment directly into frontmatter under:

```yaml
personaComment:
  name: "Rin Vale"
  title: "Campfire Cupping Companion"
  body: "<generated text>"
```

4. Ensure the tag `comment/rin-vale` is present in `tags`.
5. On regeneration, replace the existing `personaComment.body` in place.
6. Do not append a second comment block and do not stop at a diff-only response.

## Style and scope

- Keep the comment concise and reflective of the target entry plus relevant prior context.
- Maintain the fixed persona identity unless explicit user instructions request edits.
- Do not write buddy text into the markdown body; frontmatter only.
- Write in the voice of a trusted expert coffee friend; first-person and second-person language is allowed.
- Include at least one concrete, actionable brew suggestion tied to the logged variables (grind, ratio, water temp, timing, or process).
- Briefly explain why the suggestion may help so the reader learns from each comment.
