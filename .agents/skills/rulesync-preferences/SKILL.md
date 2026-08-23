---
name: rulesync-preferences
description: >-
  Use when adding, changing, or reorganizing AI guidance in this repository.
  Prefer Rulesync skills over commands, subagents, or hooks for reusable
  workflows, and always edit Rulesync sources before generating tool-specific AI
  config files.
---
# Rulesync preferences

This repository treats Rulesync as the AI configuration system of record.

## Preferences

1. Prefer Rulesync skills for reusable AI workflows and agent guidance.
2. Prefer Rulesync skills over commands or hooks for reusable workflows that should be loaded in-context.
3. Prefer Rulesync subagents when the work is better handled by a delegated specialist with its own context window.
4. Prefer creating or editing Rulesync source files over editing generated AI config files directly.

## Workflow

1. Decide whether the request is durable AI guidance rather than a one-off code change.
2. If it is a reusable workflow, implement it as a skill under `.rulesync/skills/<skill-name>/SKILL.md`.
3. Edit `.rulesync/` sources only.
4. Run `npx rulesync generate`.
5. Review generated outputs such as `AGENTS.md`, `.codex/*`, `.cursor/*`, `.claude/*`, and `.github/*`, but do not patch them directly for durable changes.

## Decision rule

- Choose a skill first when the guidance should help future agents converge on intent across repeated tasks and should be loaded directly in the active agent context.
- Choose a subagent when the work should be delegated to a specialist that can operate with its own prompt and context window.
- Avoid commands for durable reusable workflows in this repository.
- Use a rule only when the guidance must always apply ambiently across the repo rather than as a task-specific workflow.
