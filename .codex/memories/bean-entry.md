# Bean entry command

Use this CLI-style command when creating a new Bean entry:

```bash
$ bean log <YYYY-MM-DD> <beanKey>
```

Then create a matching file at `src/content/beans/<YYYY-MM-DD>-<beanKey>.md` with frontmatter fields that align with the beans collection schema, and keep the primary descriptive content in the markdown body.

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
