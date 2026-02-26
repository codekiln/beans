# Design document: virtual CLI for BEATS tasks + Beans terms

## Context

This site already simulates command output surfaces such as `bean log` and `bean roaster`. The next command namespace is `term`, with singular lookup usage (for example: `bean term RDT`).

## BEATS task lookup snapshot

Using the BEADS/Beats CLI (`bd`), issue searches for terminology-related work currently return no matching open issues.

- Query intent: terminology section, term namespace, glossary support
- Suggested next BEATS action: create a new task for term namespace rollout and content backfill

## Product goals

1. Make term lookups feel like a real CLI reference command.
2. Keep command syntax singular for detail lookup: `bean term <token>`.
3. Preserve existing CLI-themed visual language and page chrome.

## Command model

- Index command: `bean terms`
- Detail command: `bean term <TERM>`
- Example detail command: `bean term RDT`

## UI behavior

### 1) Terms index (`/beans/terms/`)

- Render list of known terms and one-line summaries.
- Keep entries concise and scan-friendly.
- Link each term to a dedicated detail route.

### 2) Term detail (`/beans/terms/<slug>/`)

- Sticky command bar should display `$ bean term <TERM>`.
- Hero section should identify the term command.
- Definition section renders markdown content for rich explanations.
- Optional alias section should appear at the bottom and support expansions (for abbreviations like RDT).
- Dates section should show `date-created` and `date-updated` at the bottom.

## Content model

Each term entry should include:

- `name`: display label (for example `RDT`)
- `aliases`: optional expanded names
- `summary`: short line for index view
- markdown body: full definition and operational notes
- Filesystem metadata should be used for dates:
  - `date-created`: file created time
  - `date-updated`: file modified time

## Rollout notes

- Start with one canonical seed term: `RDT`.
- Add top-nav discoverability from the homepage.
- After first release, backfill additional glossary terms from recurring bean notes.
