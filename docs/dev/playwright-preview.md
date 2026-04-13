# Playwright previews for Codex

Use Playwright to capture container-local screenshots of the running dev server for Codex previews.

## Install (devcontainer)

The devcontainer post-create step installs Playwright and Chromium automatically. The MCP server runs via `npx` on start. If you are working in a worktree (post-create does not run there), install them manually:

```bash
npm install
node_modules/.bin/playwright install --with-deps chromium
```

## Start the dev server

```bash
# Default Astro port (4321)
npm run dev

# Worktree-friendly localhost server with automatic port selection
npm run dev-worktree

# Codespaces-friendly port (4322)
npm run dev-local
```

## Take a screenshot

```bash
# Full-page screenshot against the local dev server
node dev/playwright/screenshot.mjs \
  "http://localhost:4321/beans/log/2026-02-05-bean1/" \
  "dev/playwright/preview.png" \
  --full-page
```

Notes:
- Use container-local `http://localhost:<port>` so the headless browser can reach the dev server.
- Pass `--full-page` for long pages and `--wait=500` (ms) if you need a short settle time.
- If you are working in `worktrees/beans-*`, prefer `npm run dev-worktree` so Astro can choose a free localhost port automatically.
- If you started `npm run dev-local`, switch the URL to port `4322`.

## MCP vision loop (screenshots + accessibility tree)

For repo-local Codex usage, keep the Playwright MCP server in Rulesync as a `stdio` entry and regenerate:

```bash
npx rulesync generate
```

That generates `.codex/config.toml` with a `playwright` MCP server that Codex starts itself via `npx @playwright/mcp@latest`.

Then in Codex:

```
open http://localhost:4321/beans/log/2026-02-05-bean1/
screenshot
accessibilityTree
```

If you need the HTTP transport for another client or for manual debugging, you can still run:

```bash
npx -y @playwright/mcp@latest --port 5173 --viewport-size 1440x900 --caps vision
```

Legacy SSE transport is available at `http://localhost:5173/sse` and the streamable HTTP endpoint is `http://localhost:5173/mcp`.

## Codex loop

The intended preview loop is: Codex triggers `dev/playwright/screenshot.mjs`, Playwright captures the page, and the resulting PNG is fed back into the model for review. Keep URLs on the `/beans/` base path to match the deployed site structure.

## Codex skill

This repo includes a Codex skill in `.codex/skills/playwright-preview`. To make it available to Codex, add it under your `$CODEX_HOME/skills` (for example via a symlink) so the skill can be discovered.
