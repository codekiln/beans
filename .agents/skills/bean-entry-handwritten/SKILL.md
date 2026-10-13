---
name: bean-entry-handwritten
description: >-
  Create or update a bean entry from handwritten scans while preserving line
  breaks, handling CompanionComment formatting correctly, maintaining spans, and
  avoiding low-value boilerplate transcription.
---
# Handwritten bean entry

Use this skill when a bean entry is created or revised from handwritten scans, notebook pages, or photographed brew notes.

## Workflow

1. Import source images into `public/images/` and place them near the related transcription in the bean body.
2. Do two transcription passes before finalizing, especially for place names, timings, and unusual wording.
3. Preserve the author's line breaks instead of normalizing into prose paragraphs.
4. In `CompanionComment`, use the `from` prop as the only attribution.
5. Do not add inline signatures such as `- unicorn` or `- codekiln` inside companion-comment bodies.
6. If exact companion-comment line breaks matter, use explicit `<br />` tags inside the component body.
7. Skip repeated printed-label boilerplate when the scan already preserves it and the text is not central to the entry.
8. If the notes say a consumable span opened, closed, ran out, or was replaced, update the relevant file in `src/content/spans/` in the same task.
9. Close completed spans with `endDate`, create successor spans when a new consumable replaces the old one, and link the transition from the bean body text.
10. If related content lookup reveals duplicate coffee pages for the same roast, consolidate to one canonical content entry rather than keeping parallel duplicates.

## Output target

- The markdown should read like a faithful transcription, not a paraphrase.
- The scans should remain visible in the entry unless the user asks for text only.
- Implied housekeeping should be completed, not merely noted.
