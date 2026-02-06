# Playwright preview learnings

- Use container-local browser via Playwright MCP; Codex cannot see forwarded or host browser UIs.
- MCP endpoint is `http://localhost:5173/mcp` and `npx -y @playwright/mcp@latest` avoids interactive prompts.
- CLI flag is `--viewport-size` (not `--viewport`).
