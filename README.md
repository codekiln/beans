# beans

A coffee log and knowledge garden built with Astro.

## Adding new notes

1. Record daily brew notes in ChatGPT.
2. Create a new markdown file in `src/content/journal` with frontmatter:

```yaml
---
title: Morning pour over
date: 2024-08-19
mood: Calm
brew: V60 pour-over
gear:
  - Ode Gen 2 grinder
  - V60 02
recipe: v60-lean-citrus
tags:
  - citrus
  - calm
---
```

3. Commit and push. GitHub Pages will publish to
   `https://codekiln.github.io/beans`.

## Content collections

- `src/content/journal`: daily brew notes and reflections.
- `src/content/recipes`: recipes with ratios, grind, and timings.
- `src/content/gear`: grinder, brewer, filter, and scale inventory.
