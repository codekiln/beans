# RSS Reader Harness

This repo now includes a fixture-driven RSS reader compatibility harness for work that changes feed markup or content ordering.

## Goals

- Inspect what Beans emits in `dist/rss.xml`
- Compare that against a real terminal reader ingestion path using local `eilmeldung`
- Give agents a browser-preview surface they can open, screenshot, and compare in Codex
- Keep known reader failures visible, especially the March 29 inline companion loss

## Fixture coverage

The harness snapshot covers:

- inline companion comments
- persona / buddy comments
- body-image posts
- preview-image posts
- no-image posts

March 29 (`/beans/log/2026-03-29/`) is tracked explicitly because real readers have dropped the `grounds sniff` companion block even though the RSS XML contains it.

## Commands

Build the site first:

```bash
npm run build
```

Run the non-destructive compatibility check:

```bash
npm run check:rss-reader-harness
```

Refresh the committed browser snapshot data:

```bash
npm run update:rss-reader-harness
```

## What the harness does

`dev/rss-reader-harness.mjs`:

1. Reads the built `dist/rss.xml`
2. Pulls the selected fixture items out of the feed
3. Starts a local static server for the built `dist/`
4. Creates an isolated `eilmeldung` Local RSS profile
5. Imports the local feed through OPML and runs `eilmeldung --sync`
6. Reads the resulting SQLite article rows
7. Records RSS HTML, eilmeldung summary text, and eilmeldung plain-text content for the fixtures

The script does not depend on your personal eilmeldung profile. It creates a throwaway config and state directory every run.

## Browser workflow

After updating the snapshot, start the local dev server:

```bash
npm run dev-worktree
```

Open:

```text
/beans/dev/rss-reader-harness/
```

That page shows, for each fixture:

- a browser-card preview driven by the captured reader summary
- the raw RSS article HTML
- the terminal-reader plain-text capture

For Codex previews, use the existing Playwright helper:

```bash
node dev/playwright/screenshot.mjs \
  "http://127.0.0.1:4321/beans/dev/rss-reader-harness/" \
  "dev/playwright/rss-reader-harness.png" \
  --full-page
```

Adjust the port if `npm run dev-worktree` chooses a different one.

## Terminal workflow

The terminal side uses local `eilmeldung` when available.

The harness intentionally inspects three surfaces from the synced article row:

- `html`: what the reader stored as article HTML
- `summary`: the shortened preview text many readers lean on in list/card views
- `plain_text`: the flattened terminal-readable content

This matters for the March 29 bug: the full RSS HTML still contains the `grounds sniff` block, while the shortened summary can lose the section heading and companion text. That makes content-order regressions visible even when XML validity checks pass.

## Recommended loop for RSS changes

```bash
npm run build
npm run check:rss-rendering
npm run check:rss-reader-harness
npm run update:rss-reader-harness
```

Then inspect `/beans/dev/rss-reader-harness/` before landing the change.
