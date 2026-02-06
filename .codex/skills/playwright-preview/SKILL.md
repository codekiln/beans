---
name: playwright-preview
description: "Capture container-local UI screenshots with Playwright for Codex previews. Use when Codex needs a headless browser snapshot of a running dev server page (e.g., /beans/ routes) or to describe the Playwright screenshot workflow."
---

# Playwright preview workflow

Use the repo helper script to capture screenshots from the running Astro dev server.

## Steps

1. Ensure Playwright + Chromium are installed.

```bash
npm install
node_modules/.bin/playwright install --with-deps chromium
```

2. Start the dev server in the target worktree.

```bash
npm run dev
```

3. Capture a screenshot with the helper script.

```bash
node dev/playwright/screenshot.mjs \
  "http://localhost:4321/beans/log/2026-02-05-bean1/" \
  "dev/playwright/preview.png" \
  --full-page
```

## Notes

- Always use container-local `http://localhost:<port>` URLs so Playwright can reach the dev server.
- Use `--full-page` for long pages and `--wait=500` (ms) if you need a short settle time.
- If `npm run dev-local` is used, switch the URL to port `4322`.

## MCP server

Start the Playwright MCP server to enable screenshots + accessibility tree:

```bash
npx -y @playwright/mcp@latest --port 5173 --viewport-size 1440x900 --caps vision
```

The MCP endpoint is `http://localhost:5173/mcp` (SSE at `/sse`).
