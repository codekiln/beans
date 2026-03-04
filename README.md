# beans
A coffee log.

Live site: https://codekiln.github.io/beans/

## Automation

- Dependabot is configured in [`.github/dependabot.yml`](.github/dependabot.yml) to check npm dependencies and GitHub Actions weekly with grouped updates and PR caps to reduce noise.
- PR validation lives in [`.github/workflows/ci.yml`](.github/workflows/ci.yml) and runs the same install, build, and bean rendering checks for regular PRs and Dependabot PRs.
- To tune update cadence or grouping, edit [`.github/dependabot.yml`](.github/dependabot.yml). To change what every PR must pass, edit [`.github/workflows/ci.yml`](.github/workflows/ci.yml).

## Rendering conventions

- Bean attributes are optional by design.
- If an attribute value is missing (for example, `time`), do not render its label, value, or placeholder text.
