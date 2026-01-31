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

# Install rulesync globally for easy CLI access.
npm install -g rulesync

# Tmux setup: run only this step with .devcontainer/setup-tmux.sh
.devcontainer/setup-tmux.sh
