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
$ bean log <YYYY-MM-DD> <beanKey>
```

`bean` is display text for CLI-style formatting and naming conventions in this project. Do not paste this command into the markdown body of the entry.

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

### Observations
- <note>

### Brew log
- <note>
```

## Notes

- Omit optional fields or entire objects when unknown.
- Keep the primary descriptive content in the markdown body.
- Images in the markdown body must use the `/beans/images/` path.
- Do not include an inline body preamble like `` `$ bean log YYYY-MM-DD beanX` ``; the entry header already renders the command prompt.
