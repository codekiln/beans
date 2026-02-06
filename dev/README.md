## Starting the dev server
- `npm run dev-local` will start `astro dev --host 0.0.0.0 --port 4322`
- forward the 4322 port when the dialog pops up. Open it in a new tab for full preview.
- To view in Github Codespaces, enter command palette and search for `Simple Browser: Show`
- open up the **same** address as the external preview (for example, https://<codespace-id>-<hash>-4322.app.github.dev/beans/) in the simple browser

## Codex previews (Playwright)
- See `docs/dev/playwright-preview.md` for Playwright install + screenshot instructions.
- The Playwright flow uses container-local `http://localhost:<port>` and supports full-page captures.

## Git worktrees in Codespaces
- Worktrees should live under `/workspaces/worktrees` so they persist and stay inside the Codespaces workspace.
- Use the helper script to add/list/prune/remove worktrees:
  - `dev/worktree add feat/my-branch`
  - `dev/worktree list`
  - `dev/worktree prune`
  - `dev/worktree remove /workspaces/worktrees/feat/my-branch`
- Each worktree needs its own `npm install` before running the dev server.

## Devcontainer expectations for worktrees
- Worktrees are separate checkout roots, so each one must run `nvm install && nvm use` once (the devcontainer post-create only runs for the main workspace).
- Keep worktrees under `/workspaces/worktrees` so they share the same Codespaces environment and can reuse forwarded ports.
- When opening a worktree in VS Code (Remote - Codespaces), use `File > Open Folder...` and select the worktree path.
