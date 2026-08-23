---
name: playwright-preview
description: >-
  Capture local dev-server screenshots with Playwright for Beans preview
  workflows, especially for `/beans/` routes and visual verification of new
  pages or content edits.
---
# Playwright preview

Use this skill when you need a headless browser preview of a running Beans page.

## Workflow

1. Ensure Playwright and Chromium are available.

```bash
npm install
node_modules/.bin/playwright install --with-deps chromium
```

2. Start the Astro dev server in the target worktree.

```bash
npm run dev
```

3. Capture a screenshot with the repo helper.

```bash
node dev/playwright/screenshot.mjs \
  "http://localhost:4321/beans/log/2026-02-05-bean1/" \
  "dev/playwright/preview.png" \
  --full-page
```

## Notes

- Use container-local `http://localhost:<port>` URLs so Playwright can reach the dev server.
- Use `--full-page` for long entries and `--wait=500` when the page needs a short settle.
- If `npm run dev-local` is used, switch the URL to port `4322`.
- Prefer `/beans/` routes in previews so screenshots match the deployed base path.

## MCP

If needed, start the Playwright MCP server:

```bash
npx -y @playwright/mcp@latest --port 5173 --viewport-size 1440x900 --caps vision
```

The MCP endpoint is `http://localhost:5173/mcp` with SSE at `/sse`.
