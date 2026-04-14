---
name: term-entry
description: Create a new glossary term entry with the correct schema, compact body, and lightly sourced Beans field-guide tone.
---
# Term entry

Use this skill when creating a new glossary term entry.

## Command

```bash
$ bean term-entry "<TOPIC>" "<TERM>"
```

`bean` is display text for CLI-style formatting. Do not paste this command into the markdown body.

## Required behavior

1. Treat the request as two inputs: `TOPIC` and `TERM`.
2. Create the filename by slugifying the term into lowercase kebab-case.
3. Write the file directly under `src/content/terms/`.
4. Include frontmatter matching the terms collection schema:

```yaml
---
name: "<display term>"
summary: "<very short one-line summary>"
aliases:
  - "<optional alias>"
---
```

5. Keep the primary descriptive content in the markdown body, not frontmatter arrays.
6. Use exactly one markdown heading, and it must be the term itself.
7. Write only 1 or 2 short paragraphs in the body.
8. Attach 2 to 4 trustworthy hyperlinks directly to the relevant claim or example.
9. Create the file instead of stopping at a draft or diff-only response.

## Notes

- Use markdown inline links for citations.
- Keep the summary short enough to read cleanly on `/beans/terms/`.
- If the requested term text is awkward as a display label, you may normalize the display name slightly while preserving the user's intent.
