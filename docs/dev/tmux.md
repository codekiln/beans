# tmux

The configuration in `.devcontainer/setup-tmux.sh` draws from 
[gpakosz/.tmux: Oh my tmux! My self-contained, pretty & versatile tmux configuration made with 💛🩷💙🖤❤️🤍](https://github.com/gpakosz/.tmux) 
for sensible defaults.

In particular, 
- `<prefix>` is `Ctrl+a` and `Ctrl+b` (both work)
- `<prefix> r` reloads the config

## Codespaces auto-attach

When the devcontainer is created, the setup script adds a small snippet to
`~/.bashrc` and `~/.zshrc` that auto-attaches to a `main` tmux session in
interactive GitHub Codespaces terminals. If no session exists, it creates one.
 
