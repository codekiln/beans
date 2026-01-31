#!/usr/bin/env bash
set -euo pipefail

if command -v nvm >/dev/null 2>&1; then
  # Align Node version with .nvmrc.
  nvm install
  nvm use
fi

if [ -f package.json ]; then
  # Install project dependencies.
  npm install
fi

if ! command -v bd >/dev/null 2>&1; then
  # Install Beads CLI for repo issue tracking.
  curl -fsSL https://raw.githubusercontent.com/steveyegge/beads/main/scripts/install.sh | bash
fi

if [ ! -d "$HOME/.tmux" ]; then
  # Install Oh My Tmux config repo once.
  git clone --depth 1 https://github.com/gpakosz/.tmux "$HOME/.tmux"
fi

if [ ! -e "$HOME/.tmux.conf" ]; then
  # Wire up the shared tmux config.
  ln -s "$HOME/.tmux/.tmux.conf" "$HOME/.tmux.conf"
fi

if [ ! -e "$HOME/.tmux.conf.local" ]; then
  # Seed local overrides.
  cp "$HOME/.tmux/.tmux.conf.local" "$HOME/.tmux.conf.local"
fi
