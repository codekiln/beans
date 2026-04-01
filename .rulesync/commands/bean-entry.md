---
description: "Create a new bean entry"
targets: ["*"]
---

# Bean entry template

Create a new bean entry file at:

```
src/content/beans/<YYYY-MM-DD>-<beanKey>.md
```

Use the CLI-style command in your response before writing the file:

```bash
$ bean log <YYYY-MM-DD> [HHMM]
```

`bean` is display text for CLI-style formatting and naming conventions in this project. Do not paste this command into the markdown body of the entry.

## Public identifier rules

- Keep the file name, frontmatter `id`, and frontmatter `beanKey` in the internal `<YYYY-MM-DD>-<beanKey>` format.
- For the public command prompt and route, use the date by itself when it is the only bean entry on that date.
- If the date has multiple bean entries, use the top-level `time` converted to 24-hour `HHMM` as the public identifier.
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
  roastLevel: "<roast level>"
  profile: "<flavor profile>"
  blend: "<blend info>"
brew:
  brewer:
    name: "<brewer name>"
    slug: "<brewer-slug>"
  method: "<brew method>"
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
- **Images:** save new assets under **`public/images/`**. In the bean markdown body, link with **`/beans/images/<filename>`** (base + path). Do not use **`public/beans/images/`** on disk.
- Do not include an inline body preamble like `$ bean log YYYY-MM-DD` or `$ bean log YYYY-MM-DD HHMM`; 
  the entry header already renders the command prompt.
