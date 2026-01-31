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

# `<prefix> : source-file ~/.tmux.conf` reloads tmux config without restarting tmux.
