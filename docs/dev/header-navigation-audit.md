# Header Navigation Audit

This audit captures the current Beans header and home navigation implementation before the responsive command-menu redesign tracked in `beans-zpt`.

## Relevant implementation paths

- `src/layouts/BaseLayout.astro`
  - Owns the sticky top header markup.
  - Renders the `$ bean` home link, the current command link, and the always-visible theme toggle button.
  - Updates the current command text client-side via the `IntersectionObserver` that watches `[data-cli-log]` entries.
- `src/styles/global.css`
  - Defines the header layout in `.cli-float`, `.cli-command-group`, and `.theme-toggle`.
  - Defines the home-page section link row in `.home-nav`.
  - Does not include a header/navigation-specific responsive breakpoint. The only page-level breakpoint in this area is the `@media (max-width: 900px)` rule for `.bean-grid`.
- `src/pages/index.astro`
  - Hardcodes the home-page section links in `<nav class="home-nav">`.
  - Uses inline separator spans (`·`) between links, which participate in line wrapping as separate flex items.

## Observed failure modes

Preview routes used for this audit:

- `/beans/`
- `/beans/log/2026-03-10-bean1/`

Observed viewport behavior:

- `1024px` wide on `/beans/`
  - The home navigation already wraps to a second line.
  - This is the first obvious sign that the current command-list presentation does not scale with the number of sections.
- `720px` wide on `/beans/`
  - The section links spread across multiple rows.
  - Separator dots end up stranded at the end of lines because they are separate flex children.
  - The result reads like accidental text wrapping rather than an intentional responsive navigation pattern.
- `480px` wide on `/beans/`
  - The home navigation expands to three rows.
  - Discoverability is still present, but the header plus section list consumes a disproportionate amount of vertical space before the main content starts.
- `360px` wide on `/beans/`
  - The hero prompt pill breaks into two lines.
  - Stream entry titles also wrap aggressively, which increases the cost of leaving top-level navigation as a plain wrapped text list.
- `360px` wide on `/beans/log/2026-03-10-bean1/`
  - The sticky header command row wraps inside the current command text, leaving `$ bean` on one line and the rest of the command on another.
  - This is caused by `.cli-command-group { flex-wrap: wrap; }` without any truncation, collapse, or alternate mobile presentation.
  - The theme toggle still occupies dedicated horizontal space in the header at the same time the command text is wrapping.

## Layout and behavior constraints

- The sticky header is shared by every page through `BaseLayout`, but the home-page section nav only exists in `src/pages/index.astro`.
  - A global command menu will need either shared navigation data or a dedicated component instead of the current one-off home-page link list.
- The current theme switch is not menu-aware.
  - `BaseLayout.astro` binds click behavior directly to `[data-theme-toggle]`.
  - Moving theme switching into a menu means the toggle either needs a new container/state model or a new button location that preserves the existing script hook.
- The current header has no mobile-specific breakpoint logic.
  - `.cli-float` always uses a single row with `justify-content: space-between`.
  - `.cli-command-group` relies on wrapping instead of switching to a condensed interaction model.
- The current command label is live-updated from page content.
  - The `IntersectionObserver` writes text and href into `[data-cli-link]`.
  - Any redesign that keeps a visible current-command element must preserve that target or replace it with an equivalent hook.
- The requested `🫘>` menu trigger does not exist in the header today.
  - The only bean emoji in the header is the theme-toggle button icon.
  - Reusing that area for navigation will require rethinking the theme control, not just restyling the existing button.
- All route construction should continue to use `withBase(...)`.
  - The audit routes and future menu links need the `/beans/` base prefix.

## Why the current layout becomes clunky

The current approach treats navigation as inline text that can wrap indefinitely, both in the sticky header and on the home page. That works while the command strings are short and the section count is small, but it degrades as soon as width tightens:

- header command text wraps instead of collapsing into a menu trigger
- home-page section links become a loose paragraph of commands instead of a navigational unit
- the exposed theme button competes with navigation for scarce header width

In short, the current implementation has no real responsive navigation state. It only has wrapping.

## Handoff for follow-on tasks

- `beans-zpt.2` should propose a single navigation model that works globally, not just a prettier `home-nav` wrap.
- `beans-zpt.3` will likely need to:
  - extract shared navigation data
  - introduce a dedicated header/menu component
  - move theme switching inside that menu while preserving the existing theme persistence behavior
