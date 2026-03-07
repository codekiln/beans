# Rulesync in Beans

This repo uses [Rulesync](https://github.com/dyoshikawa/rulesync) to keep AI tool rules and commands consistent across editors and agents. Rulesync reads the unified rules and command templates under `.rulesync/` and generates tool-specific files with `npx rulesync generate`.

Rulesync is the AI config system of record for this repository. Durable AI coding guidance belongs in `.rulesync/rules/`, not in generated outputs such as `AGENTS.md`, `.codex/memories/*`, `.cursor/*`, or `.claude/*`.

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

## Update workflow

1. Edit the durable rule files in `.rulesync/rules/`.
2. Run `npx rulesync generate`.
3. Review the generated diffs.
4. If a generated file needs different behavior, change the Rulesync source and regenerate instead of editing the generated file directly.
