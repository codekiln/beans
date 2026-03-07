---
root: false
targets: ["*"]
description: "Rulesync usage and devcontainer installation"
globs: ["docs/dev/rulesync.md"]
---

# Rulesync in Beans

This repo uses Rulesync to keep AI tool rules and commands consistent across editors and agents. It reads the unified rules and command templates under `.rulesync/` and generates tool-specific files with `npx rulesync generate`.

Rulesync is the AI config system of record for this repository. Treat files under `.rulesync/` as the durable source and treat generated agent/editor configs as outputs.

## Devcontainer install

The devcontainer installs Rulesync globally for easy CLI access in `.devcontainer/postCreate.sh`:

```bash
npm install -g rulesync
```

## Local usage

Rulesync is also listed in `devDependencies`, so you can run it with:

```bash
npx rulesync generate
```

## Source of truth

- Keep durable AI coding guidance changes in `.rulesync/rules/*.md`.
- Generated files like `AGENTS.md`, `.codex/memories/*`, `.cursor/commands/*`, and `.claude/*` should be treated as derived output from Rulesync.

## Update workflow

1. Edit `.rulesync/rules/*.md` to change durable AI coding guidance.
2. Run `npx rulesync generate`.
3. Review the generated diffs in `AGENTS.md`, `.codex/memories/*`, `.cursor/*`, `.claude/*`, and other Rulesync-managed outputs.
4. If generated output looks wrong, fix the Rulesync source files and regenerate instead of patching generated files directly.
