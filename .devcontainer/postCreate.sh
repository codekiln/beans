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

  # Install Playwright + Chromium for Codex previews.
  if [ -x node_modules/.bin/playwright ]; then
    node_modules/.bin/playwright install --with-deps chromium
  fi
fi

# Install rulesync globally for easy CLI access.
npm install -g rulesync

# Tmux setup: run only this step with .devcontainer/setup-tmux.sh
.devcontainer/setup-tmux.sh

# Codex setup: use Codespaces profile in this repo without affecting local runs.
.devcontainer/setup-codex.sh
