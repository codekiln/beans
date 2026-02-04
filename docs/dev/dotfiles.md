# Dotfiles and devcontainer configuration

## Best practices for devcontainer dotfiles

- Prefer a dedicated dotfiles repo and keep the repo small, focused, and
  tool-agnostic (shell, editor, tmux, git). Avoid app-specific secrets or
  machine-unique files. Keep secrets in a password manager or Codespaces
  secrets instead.
- Keep devcontainer bootstrapping deterministic: install dependencies and apply
  dotfiles in the container lifecycle (``postCreateCommand``) or the
  ``dotfiles`` setting in ``devcontainer.json``. Make it easy to re-run.
- Use conditional config to keep local vs. devcontainer behavior separate
  (e.g., check ``$CODESPACES`` or ``$DEVCONTAINER`` env vars before enabling
  auto-attach, prompts, or heavier plugins).
- Prefer symlink-based tools (``stow``) or single-binary tools (``yadm``,
  ``chezmoi``) to minimize dependencies in the devcontainer.
- Avoid overwriting repo-owned config. Put developer-specific config under
  ``~/.config`` or ``~/dotfiles`` and only add small, explicit snippets to
  ``~/.bashrc`` or ``~/.zshrc``.

## Lightweight dotfiles frameworks

- ``yadm``: a bare Git repo wrapper. Very lightweight, no templating by
  default, and minimal runtime overhead. Good for simple setups.
- ``chezmoi``: single-binary, supports templates and per-host conditionals.
  Slightly heavier but still straightforward, great when devcontainer-specific
  config needs to differ from local machines.
- ``stow``: classic symlink manager; pair with a standard Git repo. Very small
  footprint, but no templating. Best for stable, shared config.
- ``rcm``/``homeshick``: lightweight alternatives, but less common.

## Devcontainer-specific options

The devcontainer spec supports a ``dotfiles`` section that pulls a Git repo and
runs an install script automatically. This keeps the devcontainer config
self-contained and makes it easy to replicate the environment in Codespaces.
If we prefer a lighter approach, use ``postCreateCommand`` to clone and run a
simple setup script instead.

## Nix and similar tools

Nix can provide fully reproducible environments, but it increases complexity
and can be overkill for a small project. If we need strict reproducibility
across devcontainer and local environments, Nix (or ``devbox``) is worth
considering, but it is usually heavier than a dotfiles repo plus a small set of
scripts.

## Tmux example (current)

This repo already installs tmux via a devcontainer feature and configures it
with ``.devcontainer/setup-tmux.sh`` and ``docs/dev/tmux.md``. That script adds
minimal ``.bashrc``/``.zshrc`` snippets to auto-attach in Codespaces. Keep that
approach and layer user overrides in a dotfiles repo (for instance, allow a
``~/.tmux.local.conf`` or ``~/.tmux.conf.local`` file).

## Proposal: dotfiles in devcontainer

### Recommended approach

1. **Create a dedicated dotfiles repo** (e.g., ``beans-dotfiles``). Keep it
   small and modular (``tmux``, ``shell``, ``nvim`` directories).
2. **Use ``chezmoi`` or ``yadm``** as the primary manager.
   - ``yadm`` is the lightest option for a minimal config.
   - ``chezmoi`` is still light and enables templating for devcontainer vs
     local conditionals.
3. **Wire it into ``devcontainer.json``** using the ``dotfiles`` option or
   a ``postCreateCommand`` that installs ``chezmoi``/``yadm`` and applies the
   dotfiles repo.
4. **Keep the repo-generated config separate from project config** by using
   ``~/.config`` or ``~/dotfiles`` as the base.

### Suggested dotfiles layout

```
~/.config
  nvim/
  tmux/
  zsh/
```

## Proposed Neovim configuration

We can treat Neovim as the primary Vim-compatible editor and avoid duplicating
``.vimrc``. The following is a minimal, modern plugin set for TypeScript and
Python:

- Plugin manager: ``lazy.nvim`` (lightweight, fast startup).
- LSP:
  - ``nvim-lspconfig``
  - ``mason.nvim`` + ``mason-lspconfig.nvim`` for easy server installs
- Completion:
  - ``nvim-cmp`` + ``cmp-nvim-lsp`` + ``LuaSnip``
- Syntax:
  - ``nvim-treesitter``
- Formatting:
  - ``conform.nvim`` (or ``null-ls`` if we want more extensive linting)

### TypeScript support

- Install ``typescript-language-server`` and ``typescript`` via Mason.
- Configure LSP to use project ``tsconfig.json`` and format on save (optional).

### Python support

- Install ``pyright`` via Mason.
- Optional: use ``ruff`` for linting/formatting with ``conform.nvim``.

## Proposed Zsh configuration

- Keep ``.zshrc`` minimal and load plugins with a lightweight manager like
  ``zinit`` or ``antidote``.
- Recommended plugins: syntax highlighting, autosuggestions, and ``fzf``
  integration.
- Keep prompt fast; ``starship`` is a good option if we want a shared prompt
  across shells.

## Next steps

1. Decide between ``yadm`` (lightest) and ``chezmoi`` (templating).
2. Create a dotfiles repo with tmux, zsh, and Neovim config.
3. Add the devcontainer ``dotfiles`` or ``postCreateCommand`` hook.
4. Document the workflow in ``docs/dev`` and keep the current tmux docs as the
   baseline example.
