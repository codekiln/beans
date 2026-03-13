# Dependabot

Beans uses Dependabot to keep the CI-facing dependencies current without opening a flood of small PRs.

## What it updates

- `npm` packages from the repo root `package.json`
- GitHub Actions used by workflows under `.github/workflows/`

## Cadence

- Weekly on Monday morning
- `npm` checks first at `06:00`, then GitHub Actions at `06:30`
- PR volume is capped with `open-pull-requests-limit`

The current grouping stays fairly broad but still reviewable:

- `npm` updates are grouped into `astro`, `production-dependencies`, and `development-tooling`
- GitHub Actions updates are grouped into a single `github-actions` PR

Dependabot also adds repo-native labels and commit prefixes so update PRs are easy to scan in history and triage queues.

## CI behavior

The Pages workflow now builds on `pull_request` as well as pushes to `main`. That means Dependabot PRs run the same install and build steps as any other PR, while the actual Pages deploy step remains limited to pushes on `main`.

## Tuning

The main knobs live in `.github/dependabot.yml`:

- adjust `schedule` if weekly is too slow or too noisy
- adjust `open-pull-requests-limit` if update backlogs build up
- adjust `groups` if you want fewer broad PRs or more targeted review batches
- adjust `labels` and `commit-message.prefix` if update PRs should follow a different triage or commit style
