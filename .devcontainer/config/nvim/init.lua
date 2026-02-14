-- Beans devcontainer Neovim defaults.
vim.cmd("syntax on")
vim.cmd("filetype plugin indent on")

vim.o.number = true
vim.o.relativenumber = true
vim.o.mouse = "a"
vim.o.termguicolors = true

-- Keep editing defaults aligned with the repository style.
vim.o.tabstop = 2
vim.o.shiftwidth = 2
vim.o.softtabstop = 2
vim.o.expandtab = true
vim.o.smartindent = true
vim.o.wrap = false
