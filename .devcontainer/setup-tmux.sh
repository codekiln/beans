#!/usr/bin/env bash
set -euo pipefail

## [gpakosz/.tmux: Oh my tmux! My self-contained, pretty & versatile tmux configuration made with 💛🩷💙🖤❤️🤍](https://github.com/gpakosz/.tmux)

if [ ! -d "$HOME/.tmux" ]; then
  # Install Oh My Tmux config repo once.
  git clone --depth 1 https://github.com/gpakosz/.tmux "$HOME/.tmux"
fi

if [ ! -e "$HOME/.tmux.conf" ]; then
  # Wire up the shared tmux config.
  ln -s "$HOME/.tmux/.tmux.conf" "$HOME/.tmux.conf"
fi

# Symlink repository-managed tmux overrides, if present.
if [ -f "/workspaces/beans/.devcontainer/config/.tmux.conf.local" ]; then
  ln -sfn "/workspaces/beans/.devcontainer/config/.tmux.conf.local" "$HOME/.tmux.conf.local"
fi

auto_attach_marker="beans tmux auto-attach"
auto_attach_block='
# beans tmux auto-attach (codespaces)
if [ -n "${CODESPACES:-}" ] && [ -n "$PS1" ] && command -v tmux >/dev/null 2>&1; then
  if [ -z "${TMUX:-}" ]; then
    tmux attach -t main || tmux new -s main
  fi
fi
'

ensure_tmux_auto_attach() {
  local rc_file="$1"

  if [ ! -f "$rc_file" ]; then
    touch "$rc_file"
  fi

  if ! grep -q "$auto_attach_marker" "$rc_file"; then
    printf "%s\n" "$auto_attach_block" >> "$rc_file"
  fi
}

ensure_tmux_auto_attach "$HOME/.bashrc"
ensure_tmux_auto_attach "$HOME/.zshrc"

# `<prefix> : source-file ~/.tmux.conf` reloads tmux config without restarting tmux.
