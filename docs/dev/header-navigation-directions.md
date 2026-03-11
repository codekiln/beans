# Header Navigation Directions

This proposal turns Beans navigation into an intentional command surface instead of a header that merely wraps when space runs out. The recommended direction is a single global pattern that works on the home page and detail pages alike, with the `🫘>` prompt acting as the menu trigger and the theme control moving inside that menu.

## Recommended direction: prompt drawer

Treat the top header as a compact shell prompt and let the navigation live inside a drawer anchored to the `🫘>` trigger.

- Keep `$ bean` as the durable home anchor on the left.
- Keep the current route command visible in the header on larger screens, but stop asking it to share space with all navigation links.
- Replace the exposed theme pill with a `🫘>` button that opens the command drawer.
- Put site sections and theme switching in that drawer on every viewport.

This is the strongest direction because it solves the actual problem: the site needs a real navigation state, not better wrapping.

## Desktop behavior

On desktop widths, the header should still feel like a live command line:

- Left: `$ bean` home link.
- Middle: current command label, still updated by the existing observer hook.
- Right: `🫘>` trigger, styled like a small prompt capsule rather than a generic hamburger.

When opened, the drawer should feel like a terminal subcommand list rather than a floating marketing dropdown:

- Open downward from the trigger, right-aligned with the header edge.
- Use a compact panel that reads like a command index, for example:
  - `bean about`
  - `bean equipment`
  - `bean recipes`
  - `bean roasters`
  - `bean coffees`
  - `bean companions`
  - `bean questions`
  - `bean terms`
- Include a final utility row for theme mode, such as `theme: light` / `theme: dark`.
- Visually separate navigation commands from utilities with a thin rule or spacing break so theme switching feels like a shell setting, not another page.

Desktop should not expose the full site map inline by default. The menu is the site map.

## Mobile behavior

Mobile should become more condensed, not merely narrower.

- Keep the sticky header to one durable row.
- Show `$ bean` on the left and the `🫘>` trigger on the right.
- Remove the always-visible current command text from the closed mobile header if it causes wrapping pressure.
- Move current-page context into the open drawer as the first non-interactive line, for example `current: bean log 2026-03-10 bean1`.

The mobile drawer should take over more space than desktop:

- Open as a sheet dropping from the header rather than a tiny popover.
- Fill most of the width with comfortable tap targets.
- Preserve the command-list voice so it still reads like a Beans shell, not an app tray.
- Place theme switching inside the same sheet, near the bottom, as a dedicated settings row.

This keeps the header calm while still making the whole site discoverable in one tap.

## Menu interaction

The trigger should behave like a prompt, not a generic icon button.

- Closed label: `🫘>`
- Open label: keep the bean prompt visible and change only the trailing glyph or accessible label if needed.
- Button copy should announce intent through `aria-label`, for example `Open command menu`.
- Opening the drawer should trap focus until dismissed.
- `Escape`, outside click, and route change should all close the drawer.
- The active route should be visibly marked inside the menu, ideally by echoing the current command rather than relying only on color.

The menu should also replace the home-page-only section list. That keeps navigation behavior global and prevents the homepage from becoming the only place where sections are discoverable.

## Theme switch placement

The light/dark control belongs inside the command drawer, not in the exposed header chrome.

- Keep the same persistence model already used by `localStorage`.
- Render the control as a command-like toggle row instead of the current standalone bean button.
- Prefer explicit state labels over an ambiguous icon-only toggle.
- Suggested copy:
  - `theme: light`
  - `theme: dark`

If the implementation later adds `auto`, it can live in the same utility cluster without changing the broader navigation model.

## Why this fits Beans

This direction keeps the CLI-inspired voice intact because the menu is still written as commands and settings, not as generic app chrome. It also gives the `🫘>` motif a real job: it becomes the affordance that reveals the command space. That is more memorable than using a hamburger while sprinkling the prompt motif elsewhere as decoration.

## Directions considered but not recommended

### Inline wrap with better separators

This would improve the current home-page link row, but it would still leave the site without a true collapsed navigation state. It solves typography, not interaction.

### Always-visible desktop nav plus separate mobile menu

This is common, but it would make Beans feel more generic and would force the design into two navigation idioms. A single prompt-drawer model is more coherent and easier to carry through the whole site.

## Handoff for implementation

`beans-zpt.3` should implement the prompt drawer by:

- extracting shared navigation data out of `src/pages/index.astro`
- replacing the exposed header theme toggle with the `🫘>` menu trigger
- moving theme switching into the drawer without changing persistence behavior
- keeping route generation on `withBase(...)`
- preserving the live current-command update where it still helps, especially on desktop
