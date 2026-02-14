#!/usr/bin/env bash
set -euo pipefail

editor_marker="beans editor defaults"
editor_block='
# beans editor defaults
export EDITOR="nvim"
export VISUAL="nvim"
'

ensure_editor_defaults() {
  local rc_file="$1"

  if [ ! -f "$rc_file" ]; then
    touch "$rc_file"
  fi

  if ! grep -q "$editor_marker" "$rc_file"; then
    printf "%s\n" "$editor_block" >> "$rc_file"
  fi
}

ensure_editor_defaults "$HOME/.bashrc"
ensure_editor_defaults "$HOME/.zshrc"

mkdir -p "$HOME/.config/nvim"
repo_root="$(git rev-parse --show-toplevel 2>/dev/null || true)"

if [ -z "$repo_root" ]; then
  repo_root="/workspaces/beans"
fi

ln -sfn "$repo_root/.devcontainer/config/nvim/init.lua" "$HOME/.config/nvim/init.lua"

# Keep Git editing flows aligned with the terminal editor.
git config --global core.editor "nvim"
