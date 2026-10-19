<!-- catalog-only-start --><!-- ---
name: Using in an existing site
title: Using in an existing site
order: 12
-----><!-- catalog-only-end -->

# Using petal-elements in an existing site

<!-- [TOC] -->

This guide is for moving a site that has its own hand-written Material 3
components (or another UI kit) to petal-elements, one component at a time. It
is written to be read by people and by coding assistants. The package ships
with it: `node_modules/petal-elements/docs/migrating.md`.

## Where to look things up

| What | Where |
| --- | --- |
| Component list and import paths | `node_modules/petal-elements/llms.txt` |
| Properties, events, slots, tokens of one component | `node_modules/petal-elements/docs/components/<name>.md` |
| Exact types | `node_modules/petal-elements/custom-elements.json`, or the `.d.ts` next to each `.js` |
| What changed between versions | `node_modules/petal-elements/CHANGELOG.md` |

Read the component's doc before writing markup. Do not guess attribute names:
they follow the docs, which follow Jetpack Compose where a Compose component
exists.

## Steps

1. **Install** `npm install petal-elements`, or copy a packed build into the
   site (for example `public/vendor/petal-elements/`) and map the bare
   specifier with an import map.
2. **Load tokens once** in the page head, before any component renders:

   ```html
   <link rel="stylesheet" href="/node_modules/petal-elements/tokens/css/sys.css">
   <style>:root { color-scheme: light dark; }</style>
   ```

   The springs are expressive (they overshoot a little); add
   `motion-standard.css` after it for calmer ones.
3. **Set fonts and the theme**, see below.
4. **Replace one kind of component at a time** (all buttons, then all
   dialogs, ...). Import only what the page uses:
   `import 'petal-elements/button/filled-button.js'`.
5. **Compare before and after** in light and dark mode. Where petal looks
   different from what the site had, decide whether petal is right (usually
   it is: it follows Compose) before restyling.
6. **Report defects and missing features** to the petal-elements repository
   instead of patching around them in the site.

## Theme and fonts

- Colors, shapes, type and motion are CSS custom properties named
  `--md-sys-*`, `--md-ref-*` and `--md-<component>-*`. A site that already uses
  these names mostly keeps its theme.
- Components do not inherit the page font. Set
  `--md-ref-typeface-brand` (titles) and `--md-ref-typeface-plain` (body and
  labels) on `:root`.
- Icons use the Material Symbols font (`--md-icon-font`); load the font
  yourself. `<petal-icon>` text is the ligature name, for example
  `<petal-icon>search</petal-icon>`.

## Mapping from common hand-written parts

| Site has | Use |
| --- | --- |
| Primary, secondary, tonal, outlined, text buttons | `petal-filled-button`, `petal-filled-tonal-button`, `petal-outlined-button`, `petal-text-button`, `petal-elevated-button`; `size` and `shape` for Expressive sizes, `toggle` for toggle buttons |
| Segmented or connected buttons | `petal-button-group` |
| Split button (action plus dropdown arrow) | `petal-split-button` with a `petal-menu` |
| Icon buttons | `petal-icon-button` and the filled, tonal, outlined variants; `size` (`xsmall` to `xlarge`), `width`, `shape` |
| Floating action button | `petal-fab` (`size`, `variant`, `label` for extended, `expanded` to shrink to the icon), `petal-branded-fab` |
| FAB that opens a speed-dial | `petal-fab-menu` with `petal-fab-menu-item` and `petal-toggle-fab` |
| Floating action bar | `petal-floating-toolbar` (horizontal or vertical) |
| Modal | `petal-dialog` |
| Toast or snackbar | `petal-snackbar` (`show()` returns a promise) |
| Bottom sheet or action sheet | `petal-bottom-sheet` (`show()` and `close()` return promises) |
| Hover hint | `petal-tooltip` with `for="<anchor id>"` |
| Dropdown or context menu | `petal-menu` with `petal-menu-item`, `petal-sub-menu`, `petal-menu-group` |
| Sticky header | `petal-top-app-bar` (`size`, `headline`, collapses on scroll) |
| Bottom navigation | `petal-navigation-bar` with `petal-navigation-bar-item` |
| Side navigation | `petal-navigation-rail` with `petal-navigation-rail-item` (collapsed or expanded), or `petal-navigation-drawer` (`type`: `modal`, `dismissible`, `standard`) with `petal-navigation-drawer-item` |
| Search box with suggestions | `petal-search-bar` (full-screen or docked view) |
| Theme switch with a circular reveal | `transitionTheme()` from `theme/theme-transition.js` |
| Pull-to-refresh | `petal-pull-to-refresh` |
| Spinner | `petal-loading-indicator` (Expressive) or `petal-circular-progress` |
| Progress bar | `petal-linear-progress` (`wavy` for the Expressive style) |
| Cards | `petal-filled-card`, `petal-elevated-card`, `petal-outlined-card` |
| Lists and settings rows | `petal-list` and `petal-list-item` (`segmented` for Expressive) |
| Inputs | `petal-filled-text-field`, `petal-outlined-text-field`, `petal-filled-select`, `petal-outlined-select` |
| Checkbox, radio, switch, slider | `petal-checkbox`, `petal-radio`, `petal-switch`, `petal-slider` |
| Tabs | `petal-tabs` with `petal-primary-tab` or `petal-secondary-tab` |
| Chips | `petal-assist-chip`, `petal-filter-chip`, `petal-input-chip`, `petal-suggestion-chip` in a `petal-chip-set` |

## Things that surprise people

- **Form controls are form-associated.** Text fields, checkboxes, radios,
  switches, sliders and selects take part in `<form>` and `FormData`; use
  `name` and `value` as on native inputs.
- **`role` and `aria-*` attributes move at runtime** to `data-role` and
  `data-aria-*` on the host. Selectors like `[aria-label="..."]` stop
  matching; see `migrations/v2/README.md`.
- **The `hidden` attribute works** on every component.
- **Icons are not filled by inheritance.** `font-variation-settings` on a
  parent no longer reaches `petal-icon`. Use the `filled` attribute, or set
  `--md-icon-fill: 1` on a parent.
- **Menus** open anchored: give the menu an `anchor` (an element id) and call
  `show()` or set `open`. Radio and checkbox items
  (`type="menuitemradio"` / `"menuitemcheckbox"`) keep `checked` themselves and
  fire `change`.
- **Dialog scrim is in the top layer.** Nothing on the page can sit above an
  open dialog; z-index does not apply.
- **Top app bar** headings: set `heading-level="1"` when it is the page title.
  Use `scroll-target="<id>"` when an inner element scrolls, nothing when the
  page does.
- **Pull-to-refresh** needs a height when it is the scroller; with
  `scroll-target="page"` it follows the page scroll. Set `refreshing` back to
  `false` yourself when the work is done.
- **Press ripple** is a circle that grows from the pointer (and starts at
  once on touch), not a fill of the whole element. Each press adds a ripple,
  and the earlier one keeps spreading and fades out. With the system's
  reduce-motion setting on, the press ripple is not shown (hover and focus
  state layers stay). Remove hand-written ripple code when you migrate.
- **Button groups:** pressing a button widens it and squeezes its neighbours,
  in both standard and connected groups. Do not add your own press animation.
- **Menus** scale in from 80% and fade, from the corner next to the anchor,
  not by growing in height. Remove custom open animations.
- **Motion is the expressive spring scheme by default**
  (`--md-sys-motion-spring-*`), as in Compose's `MaterialExpressiveTheme`.
  For the calmer standard springs, load `tokens/css/motion-standard.css`
  after `sys.css`. Components follow `prefers-reduced-motion`, so do not
  add your own motion for them.
- **Theme switching:** to change light and dark with a circle growing from the
  pressed control, call `transitionTheme(apply, event)` from
  `petal-elements/theme/theme-transition.js`. `apply` changes the theme (for
  example sets `document.documentElement.style.colorScheme`); `event` is the
  click, an element, or `{x, y}`. It uses the View Transitions API and just
  applies the change without it or with reduced motion. It returns a promise
  that resolves when it ends. Replace a site's own `startViewTransition` code
  with it instead of stacking both.
- **Dialog** opens by scaling up from 80% and fading, with 16px under the
  headline and stacked buttons when they do not fit. Remove custom open and
  close animations.
- **FAB** sizes follow Compose: `small`, `baseline` (the default, 56px),
  `medium`, `large`; the default `variant` is `primary`. With `label` it is an
  extended FAB.
- **Text fields and selects** follow Compose: at least 280px wide, a 2px
  focused indicator, no hover state. The select menu is as wide as the field
  (`no-clamp-menu-width` for the old behavior) and its options are 48px high.
  Set an explicit `width` or `min-width` if a layout depended on narrower
  fields.
- **Checkbox, radio and switch** follow Compose sizes and spring animations;
  per-state color tokens still work, but hover, focus and press no longer
  recolor the outline or thumb.
- **List items** follow Compose's `ListItem`: use the `selected` property, and
  `three-line` for overline plus two lines of text. Item corners are 4px and
  grow on hover, focus and selection, so do not add your own corner radius.
- **Menus with groups:** groups keep their own shapes when reopened; use
  `no-inactive-shape` to turn off the smaller shape after hover. With
  `single-radio` on the menu, all radio items across groups form one set.
- **Labs navigation is gone.** The old `labs/navigationbar`,
  `labs/navigationtab` and `labs/navigationdrawer` were removed; use
  `petal-navigation-bar`, `-rail` and `-drawer`.
- **Tooltips** show on focus only when the anchor shows a focus ring
  (`:focus-visible`), not after a pointer choice.
- **Text fields** forward `enterkeyhint`, `spellcheck` and `autocapitalize`;
  use `no-counter` to hide the character counter.

## Prompts that work well for coding assistants

> Migrate the buttons in `src/components/` to petal-elements. Read
> `node_modules/petal-elements/llms.txt` and `docs/migrating.md` first, then
> the doc for each component you use. Keep the markup structure; change one
> component kind per commit. List anything petal cannot do instead of working
> around it.

> petal-elements is in `D:\Project\petal-elements`. Pack it into
> `public/vendor/` and use `<petal-...>` for X and Y on the settings page.
> Collect every defect or missing feature as a list for me; do not patch the
> vendor copy.
