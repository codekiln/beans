---
name: bean-entry
description: >-
  Create a new bean entry with the correct file shape, public identifier,
  frontmatter, imported images, and Beans-specific markdown conventions.
---
# Bean entry

Use this skill when creating a new bean entry.

## Command

```bash
$ bean log <YYYY-MM-DD> [HHMM]
```

`bean` is display text for CLI-style formatting and naming conventions in this project. Do not paste this command into the markdown body.

## Target file

Create:

```text
src/content/beans/<YYYY-MM-DD>-<beanKey>.md
```

## Public identifier rules

- Keep the filename, frontmatter `id`, and frontmatter `beanKey` in the internal `<YYYY-MM-DD>-<beanKey>` format.
- Use the date by itself for the public command prompt and route when that date has only one bean entry.
- If the date has multiple bean entries, use top-level `time` converted to 24-hour `HHMM` as the public identifier.
- If time is missing on a multi-entry date, use a simple ordinal fallback such as `1` or `2`.

## Template

```markdown
---
id: "<YYYY-MM-DD>-<beanKey>"
beanKey: "<beanKey>"
date: "<YYYY-MM-DD>"
time: "<HH:MM>"
title: "<short title>"
tags:
  - "<tag>"
coffee:
  roaster:
    name: "<roaster name>"
    slug: "<roaster-slug>"
  roast:
    name: "<roast name>"
    slug: "<roaster-slug>/<roast-slug>"
brew:
  brewer:
    name: "<brewer name>"
    slug: "<brewer-slug>"
  recipe:
    name: "<recipe name>"
    slug: "<recipe-slug>"
brewDetails:
  dose: "<dose>"
  water: "<water>"
  ratio: "<ratio>"
  grinder:
    name: "<grinder name>"
    slug: "<grinder-slug>"
  grind: "<grind description>"
  setting: "<setting>"
  temp: "<temperature>"
  release: "<release time>"
  total: "<total time>"
  time: "<brew time>"
gear:
  - label: "<label>"
    value: "<value>"
    slug: "<slug>"
---

<note>
```

## Notes

- Omit optional fields or entire objects when unknown.
- Keep the primary descriptive content in the markdown body.
- Save new assets under `public/images/`.
- In the bean markdown body, link images with `/beans/images/<filename>`.
- If the user supplied images or scans, import them and display them in the entry by default.
- For multi-page scans, place each image near the corresponding section and use the clearest page as the frontmatter `image` when appropriate.
- For handwritten or scan-based entries, also apply the `bean-entry-handwritten` skill.
- Do not include an inline body preamble like `$ bean log YYYY-MM-DD`; the entry header already renders the command prompt.
