# Bean entry command

Use this CLI-style command as a **formatting convention** when creating a new Bean entry:

```bash
$ bean log <YYYY-MM-DD> <beanKey>
```

`bean` is not an installed command in this repository. Treat this as display text that mirrors the site's CLI-inspired UI and maps to file naming.

Then create a matching file at `src/content/beans/<YYYY-MM-DD>-<beanKey>.md` with frontmatter fields that align with the beans collection schema, and keep the primary descriptive content in the markdown body.

## Voice and Tone

- Mirror the author's voice from recent entries: reflective, sensory, and occasionally lyrical.
- First-person voice is acceptable when it appears in source notes; do not force depersonalized phrasing.
- Preserve the user's supplied section structure when provided (including custom labels like `i. grind`, `ii. brew`, `iii. transition`, `iv. listen`, `v. observe`) instead of remapping to default headings.
- Keep details concrete and lived-in (environment, process friction, listening context, timing anomalies) while avoiding generic filler.

## DRY Rules (Frontmatter vs Body)

- Do not restate structured metadata in the markdown body when it is already visible in the UI from frontmatter.
- In `Brew Notes`, focus on process deltas, mistakes, experiments, and anomalies rather than repeating recipe, dose, water, grinder, grind, coffee, brewer, or time values already in frontmatter.
- In `Context`, avoid repeating cup index, date, or time that the title/header already conveys unless the repetition adds new nuance.
- Run a final redundancy pass before finishing: remove any sentence that only duplicates frontmatter data without adding interpretation.

## Tagging Rules

- Add tags only when they provide a filter path not already available through structured fields/navigation.
- Do not tag recipe, brewer, grinder, roaster, or coffee identity when those are already represented in frontmatter and linked in UI.
- Prefer tags for cross-cutting context not captured elsewhere (for example: cup index, day-of-week, weather/conditions, workflow state, notable experiment).
- Keep tags minimal and high-signal; avoid synonym or near-duplicate tags.

## Markdown Body Content

The markdown body is rendered directly using Astro's content rendering. You can use:
- Standard markdown: paragraphs, headings, lists, blockquotes, code blocks
- Links: `[text](url)`
- Images: `![alt text](/beans/images/filename.png)`

**Important**: Images in the markdown body must use the full `/beans/images/` path prefix, not `/images/`. This is different from frontmatter images which use `/images/` and are handled by the `withBase` utility in the component.

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
