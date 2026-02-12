# Codex defaults in Codespaces

This repo keeps Codex defaults repo-local via `.codex/config.toml`.

## Codespaces behavior

- `.codex/config.toml` defines a `codespaces` profile with `approval_policy = "on-failure"`.
- `.devcontainer/setup-codex.sh` appends a `codex()` shell function to `~/.bashrc` and `~/.zshrc`.
- The function only applies the profile when GitHub Codespaces env vars are present:
  - `CODESPACES`
  - `CODESPACE_NAME`
- The function also checks that the current repo contains `.codex/config.toml` with `[profiles.codespaces]`, so behavior stays repo-local.

## Effective command in Codespaces

When inside this repo in Codespaces, running `codex ...` is equivalent to:

```bash
codex --profile codespaces ...
```
