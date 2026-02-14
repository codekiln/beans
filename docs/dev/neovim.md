# Neovim

The devcontainer installs Neovim via a devcontainer feature and applies
repository-friendly defaults from `.devcontainer/config/nvim/init.lua`.

## What gets configured

- Terminal editor defaults in shell startup files:
  - `EDITOR=nvim`
  - `VISUAL=nvim`
- Global Git editor:
  - `git config --global core.editor nvim`
- Shared Neovim config symlink:
  - `~/.config/nvim/init.lua -> /workspaces/beans/.devcontainer/config/nvim/init.lua`

## Defaults in this repo

The shared `init.lua` enables syntax highlighting, filetype-aware indentation,
line numbers, and 2-space indentation to match project conventions.
