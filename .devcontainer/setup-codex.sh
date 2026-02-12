#!/usr/bin/env bash
set -euo pipefail

auto_profile_marker="beans codex codespaces profile"
auto_profile_block='
# beans codex codespaces profile
if [ -n "${CODESPACES:-}" ] || [ -n "${CODESPACE_NAME:-}" ]; then
  codex() {
    local repo_root
    repo_root="$(git rev-parse --show-toplevel 2>/dev/null || true)"

    if [ -n "$repo_root" ] && [ -f "$repo_root/.codex/config.toml" ] && grep -q "^\[profiles\\.codespaces\]" "$repo_root/.codex/config.toml"; then
      command codex --profile codespaces "$@"
      return
    fi

    command codex "$@"
  }
fi
'

ensure_codex_codespaces_profile() {
  local rc_file="$1"

  if [ ! -f "$rc_file" ]; then
    touch "$rc_file"
  fi

  if ! grep -q "$auto_profile_marker" "$rc_file"; then
    printf "%s\n" "$auto_profile_block" >> "$rc_file"
  fi
}

ensure_codex_codespaces_profile "$HOME/.bashrc"
ensure_codex_codespaces_profile "$HOME/.zshrc"
