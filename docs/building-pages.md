<!-- catalog-only-start --><!-- ---
name: Building pages
title: Building pages
order: 3
-----><!-- catalog-only-end -->

# Building pages

<!-- [TOC] -->

How to put the components together into a complete page: the page setup,
layouts for phones, tablets and desktops, common screens, and the rules that
keep a page correct. It is written for people and for coding assistants; each
component's own page has its full API.

## Page setup

Every page needs the tokens, a font, the icon font, a color scheme and the
components it uses.

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>My app</title>

  <!-- Fonts: Roboto for text, Material Symbols for petal-icon. -->
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,400,0..1,0&display=block">

  <!-- Colors, type, shapes and motion, once per page. -->
  <link rel="stylesheet" href="/node_modules/petal-elements/tokens/css/sys.css">

  <style>
    :root {
      color-scheme: light dark; /* follow the system; or `light` / `dark` */
      --md-ref-typeface-brand: Roboto; /* titles */
      --md-ref-typeface-plain: Roboto; /* text */
    }

    body {
      margin: 0;
      background: var(--md-sys-color-surface);
      color: var(--md-sys-color-on-surface);
      font: var(--md-sys-typescale-body-large);
    }
  </style>

  <script type="module">
    import 'petal-elements/button/filled-button.js';
    import 'petal-elements/icon/icon.js';
  </script>
</head>
<body>
  <petal-filled-button>Start</petal-filled-button>
</body>
</html>
```

*   **Tokens.** `sys.css` defines every `--md-sys-*` and `--md-ref-*`
    property. Colors use `light-dark()`, so `color-scheme` on `:root` chooses
    light or dark.
*   **Imports.** Import one module per component you use
    (`petal-elements/<folder>/<name>.js`; see the list in
    [llms.txt](https://github.com/Saki340/petal-elements/blob/main/llms.txt)),
    or `petal-elements/all.js` for everything. With a bundler (Vite, esbuild,
    webpack) bare imports work as they are. Without one, map them with an
    import map:

    ```html
    <script type="importmap">
      {"imports": {"petal-elements/": "https://esm.run/petal-elements/", "lit": "https://esm.run/lit", "lit/": "https://esm.run/lit/"}}
    </script>
    ```

*   **Icons.** `<petal-icon>search</petal-icon>` shows the Material Symbols
    icon named `search`; the names are on
    [fonts.google.com/icons](https://fonts.google.com/icons). An `<svg>` works
    in its place.
*   **Type.** Use the type scale for your own text: `font:
    var(--md-sys-typescale-<role>)`, where `<role>` is `display-`,
    `headline-`, `title-`, `body-` or `label-` and `large`, `medium` or
    `small`. `--md-sys-typescale-emphasized-<role>` is the bolder Expressive
    variant. Or adopt the classes from
    `petal-elements/typography/md-typescale-styles.js` (`class="md-typescale-title-large"`).
*   **Before the components load**, custom elements are unstyled. Hide them
    until they are defined to avoid a flash:

    ```css
    :not(:defined) { visibility: hidden; }
    ```

## Colors and surfaces

Use the color roles, not fixed colors, so the page follows light and dark and
any theme:

| Part of the page | Background | Text and icons |
| --- | --- | --- |
| Page | `--md-sys-color-surface` | `--md-sys-color-on-surface` |
| Secondary text | | `--md-sys-color-on-surface-variant` |
| Panels and sections on the page | `--md-sys-color-surface-container-low` (or `-container`, `-container-high`, `-container-highest` for more emphasis) | `--md-sys-color-on-surface` |
| Prominent areas | `--md-sys-color-primary-container`, `-secondary-container`, `-tertiary-container` | the matching `--md-sys-color-on-*-container` |
| Dividers and outlines | `--md-sys-color-outline-variant` (decorative), `--md-sys-color-outline` (important) | |
| Errors | `--md-sys-color-error`, `-error-container` | `--md-sys-color-on-error`, `-on-error-container` |

Shapes: `--md-sys-shape-corner-extra-small` (4px) to `-extra-large` (28px) and
`-full`. Shadows: put a `<petal-elevation>` inside a `position: relative`
element and set `--md-elevation-level` (0 to 5); prefer cards, which have it
built in.

**Theme from one color.** Generate the roles from a source color with
[`@material/material-color-utilities`](https://www.npmjs.com/package/@material/material-color-utilities)
and set them on `:root`:

```js
import {argbFromHex, hexFromArgb, Hct, MaterialDynamicColors, SchemeTonalSpot} from '@material/material-color-utilities';

function applyTheme(hex) {
  const source = Hct.fromInt(argbFromHex(hex));
  const light = new SchemeTonalSpot(source, false, 0);
  const dark = new SchemeTonalSpot(source, true, 0);
  const roles = {
    'primary': MaterialDynamicColors.primary,
    'on-primary': MaterialDynamicColors.onPrimary,
    'primary-container': MaterialDynamicColors.primaryContainer,
    'on-primary-container': MaterialDynamicColors.onPrimaryContainer,
    'surface': MaterialDynamicColors.surface,
    'on-surface': MaterialDynamicColors.onSurface,
    // ... every role you use: secondary, tertiary, error, surface-container-*,
    // on-surface-variant, outline, outline-variant, inverse-*.
  };
  for (const [role, color] of Object.entries(roles)) {
    document.documentElement.style.setProperty(
      `--md-sys-color-${role}`,
      `light-dark(${hexFromArgb(color.getArgb(light))}, ${hexFromArgb(color.getArgb(dark))})`,
    );
  }
}
```

See [Color](theming/color.md), [Typography](theming/typography.md),
[Shape](theming/shape.md) and [Theming](theming/README.md).

## Layout and navigation

Choose the layout from the window width, with Compose's window size classes
(`WindowWidthSizeClass`):

| Width | Class | Navigation | Margins |
| --- | --- | --- | --- |
| under 600px | compact (phones) | `petal-navigation-bar` at the bottom, or a modal `petal-navigation-drawer` for many destinations | 16px |
| 600 to 839px | medium (tablets, folded) | `petal-navigation-rail` | 24px |
| 840px and wider | expanded (desktops) | `petal-navigation-rail` (`expanded`), or a `type="standard"` `petal-navigation-drawer` | 24px |

Use three to five destinations in a navigation bar; more go in a drawer.

### App shell

A page with a top app bar, a navigation bar on phones and a rail on wider
windows:

```html
<div class="shell">
  <petal-navigation-rail class="rail" aria-label="Main">
    <petal-navigation-rail-item selected><petal-icon slot="icon">home</petal-icon>Home</petal-navigation-rail-item>
    <petal-navigation-rail-item><petal-icon slot="icon">search</petal-icon>Search</petal-navigation-rail-item>
    <petal-navigation-rail-item><petal-icon slot="icon">person</petal-icon>Profile</petal-navigation-rail-item>
  </petal-navigation-rail>

  <div class="main">
    <petal-top-app-bar headline="Home" heading-level="1">
      <petal-icon-button slot="actions" aria-label="Notifications"><petal-icon>notifications</petal-icon></petal-icon-button>
    </petal-top-app-bar>
    <main class="content">...</main>
  </div>

  <petal-navigation-bar class="bar" aria-label="Main">
    <petal-navigation-bar-item selected><petal-icon slot="icon">home</petal-icon>Home</petal-navigation-bar-item>
    <petal-navigation-bar-item><petal-icon slot="icon">search</petal-icon>Search</petal-navigation-bar-item>
    <petal-navigation-bar-item><petal-icon slot="icon">person</petal-icon>Profile</petal-navigation-bar-item>
  </petal-navigation-bar>
</div>

<style>
  .shell { display: flex; min-height: 100vh; }
  .rail { position: sticky; top: 0; height: 100vh; flex: none; }
  .main { flex: 1; min-width: 0; }
  .content { padding: 0 24px 24px; max-width: 1040px; }
  .bar { position: fixed; inset: auto 0 0; z-index: 1; }

  @media (width < 600px) {
    .rail { display: none; }
    .content { padding: 0 16px calc(64px + 16px); } /* room for the 64px bar */
  }
  @media (width >= 600px) {
    .bar { display: none; }
  }
</style>

<script type="module">
  // Keep the bar and the rail on the same destination.
  const rail = document.querySelector('.rail');
  const bar = document.querySelector('.bar');
  const show = (index) => { /* render the page for this destination */ };
  for (const nav of [rail, bar]) {
    nav.addEventListener('change', () => {
      const index = nav.selectedIndex;
      rail.selectedIndex = index;
      bar.selectedIndex = index;
      show(index);
    });
  }
  // Expand the rail on wide windows.
  const wide = matchMedia('(width >= 840px)');
  const fit = () => (rail.expanded = wide.matches);
  wide.addEventListener('change', fit);
  fit();
</script>
```

*   The navigation items fire `change` on their container; read
    `selectedIndex`. Setting `selectedIndex` changes the selection without an
    event. Items with `href` are links instead.
*   `petal-top-app-bar` sticks to the top of the page. When an inner element
    scrolls instead of the page, give it an id and set `scroll-target` on the
    bar. `size="medium"` and `"large"` bars have a big title that collapses
    as the page scrolls. Put it inside the scrolling column, as above.
*   Put the navigation bar at the bottom with `position: fixed` and leave room
    for it under the content (the bar is 64px high, plus the safe area on
    phones).
*   On phones, a `petal-navigation-drawer` (modal) opened from a menu button
    in the top app bar's `navigation` slot is the alternative to the bar.

### Floating action button

Place the page's main action in a `petal-fab` at the bottom end, 16px from the
edges (Compose's `Scaffold`), above the navigation bar on phones:

```css
.fab {
  position: fixed;
  inset-inline-end: 16px;
  inset-block-end: 16px;
}
@media (width < 600px) {
  .fab { inset-block-end: calc(64px + 16px); }
}
```

On a rail, the FAB can go in the rail's `header` slot instead. For several
related actions use a `petal-fab-menu`.

### Content

*   Group related content in cards (`petal-filled-card`,
    `petal-elevated-card`, `petal-outlined-card`) or on surface-container
    panels; cards add no padding, so give their content 16px.
*   Lay out cards in a grid that adapts:
    `grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px`.
*   Lists of rows (settings, messages, files) are `petal-list` with
    `petal-list-item`; put `petal-divider` between groups.
*   Keep text lines readable: a column of text at most about 70 characters
    wide.

## Common screens

### Settings

```html
<petal-list aria-label="Settings">
  <petal-list-item>
    <petal-icon slot="start">wifi</petal-icon>
    <div slot="headline">Wi-Fi</div>
    <div slot="supporting-text">Home network</div>
    <petal-switch slot="end" selected aria-label="Wi-Fi"></petal-switch>
  </petal-list-item>
  <petal-list-item type="button" id="language">
    <petal-icon slot="start">language</petal-icon>
    <div slot="headline">Language</div>
    <div slot="supporting-text">English</div>
  </petal-list-item>
  <petal-divider></petal-divider>
  <petal-list-item type="link" href="/about">
    <div slot="headline">About</div>
  </petal-list-item>
</petal-list>
```

### Form

Text fields, selects, checkboxes, radios, switches, sliders and the date and
time pickers are form-associated: put them in a `<form>` with `name`s and
read `new FormData(form)`, as with native inputs. Buttons submit by default.

```html
<form id="signup">
  <petal-outlined-text-field name="name" label="Full name" required autocomplete="name"></petal-outlined-text-field>
  <petal-outlined-text-field name="email" label="Email" type="email" required autocomplete="email"></petal-outlined-text-field>
  <petal-outlined-select name="plan" label="Plan" required>
    <petal-select-option value="free"><div slot="headline">Free</div></petal-select-option>
    <petal-select-option value="pro"><div slot="headline">Pro</div></petal-select-option>
  </petal-outlined-select>
  <label><petal-checkbox name="terms" required></petal-checkbox> I accept the terms</label>
  <div class="actions">
    <petal-text-button type="reset">Clear</petal-text-button>
    <petal-filled-button>Create account</petal-filled-button>
  </div>
</form>
<petal-snackbar id="done">Account created</petal-snackbar>

<style>
  #signup { display: grid; gap: 16px; max-width: 400px; }
  .actions { display: flex; justify-content: flex-end; gap: 8px; }
</style>

<script type="module">
  const form = document.querySelector('#signup');
  form.addEventListener('submit', async (event) => {
    event.preventDefault(); // the browser has already checked required fields
    const data = Object.fromEntries(new FormData(form));
    await fetch('/api/signup', {method: 'POST', body: JSON.stringify(data)});
    document.querySelector('#done').show();
  });
</script>
```

*   Invalid fields show their message after the user submits, or after
    `reportValidity()`. For a server-side error, set `error` and
    `error-text` on the field (and clear them when it changes).
*   Text fields are at least 280px wide, as in Compose; let them fill a
    column with `width: 100%` instead of fixing smaller widths.
*   For a date, use a read-only text field with a calendar icon button that
    opens `petal-date-picker-dialog` (see [Date picker](components/date-picker.md#dialog));
    for a time, `petal-time-picker-dialog`.

### Confirmation and choices

*   Ask for a decision with `petal-dialog`: a `headline`, `content` and
    buttons in `actions`, with `returnValue` telling which one closed it.
    Use `type="alert"` for destructive actions.
*   Confirm a finished action with `petal-snackbar`, with an `action` such as
    Undo; `show()` resolves with `action` when it is pressed.
*   Offer actions on phones with `petal-bottom-sheet` (a list of actions in
    the sheet), and on wider windows with a `petal-menu` anchored to the
    button.

```js
const dialog = document.querySelector('#delete-dialog');
deleteButton.addEventListener('click', () => dialog.show());
dialog.addEventListener('close', async () => {
  if (dialog.returnValue !== 'delete') return;
  removeItem();
  const snackbar = document.querySelector('#deleted');
  if ((await snackbar.show()) === 'action') restoreItem();
});
```

### Search

Use `petal-search-bar` in the top area: on phones its view opens full screen,
on wider windows `layout="docked"` drops it below the bar. Put suggestions or
results (a `petal-list`) inside it and update them on `input`; see
[Search](components/search.md).

### Lists and details

On wide windows show the list and the selected item's details side by side
(two columns); on phones open the details as a new view with a back button in
the top app bar's `navigation` slot. A carousel (`petal-carousel`) shows a
row of images or featured items.

### Loading and progress

*   While loading a whole region, show `petal-loading-indicator` (the
    Expressive indicator) in its place.
*   For a task with known progress, `petal-linear-progress` (`value` from 0
    to 1, `wavy` for the Expressive look); `indeterminate` when unknown.
*   Content that refreshes on a pull goes in `petal-pull-to-refresh`.

## Wiring up events

| Component | Event | Read |
| --- | --- | --- |
| Buttons, icon buttons, FAB, cards with `clickable` | `click` | |
| Toggle buttons and icon buttons (`toggle`) | `change` | `selected` |
| Button group with `single-select` | `change` on the button | the button's `selected` |
| Segmented button set | `segmented-button-set-selection` | `event.detail.index`, `selected` |
| Text field | `input` (each change), `change` (committed) | `value` |
| Select | `change` | `value`, `selectedIndex` |
| Checkbox, switch | `change` | `checked` / `selected` |
| Radio | `change` | `value` of the checked radio |
| Slider | `input` (while dragging), `change` (released) | `value`, `valueStart`, `valueEnd` |
| Date and time picker (inline) | `change` | `value` (`2026-10-21`, `14:30`) |
| Date and time picker dialogs | `change` (on OK only) | `value` |
| Filter chip | `click` | `selected` |
| Input chip | `remove` (cancelable) | |
| Tabs | `change` | `activeTabIndex` |
| Navigation bar, rail, drawer | `change` (cancelable) | `selectedIndex`, `selectedItem` |
| Menu items | `click` on the item; the menu fires `close-menu` | |
| Dialog, sheet, drawer, menu | `open`, `opened`, `close`, `closed` (`opening`, `closing` for menus) | dialog `returnValue` |
| Snackbar | the promise from `show()` | `action`, `timeout`, `dismiss` |
| Search bar | `input` (typing), `search` (Enter); `open` and `close` of the view | `value` |
| Pull to refresh | `refresh` | set `refreshing = false` when done |

Set properties from script (`field.value = 'x'`, `dialog.show()`), and
attributes in HTML. Boolean attributes are on when present
(`<petal-switch selected>`).

## Frameworks

The components are standard custom elements, so they work in any framework.

*   **React 19** passes properties and events to custom elements:
    `<petal-switch selected={on} onchange={(e) => setOn(e.target.selected)} />`.
    With React 18 or older, set properties and add listeners through a `ref`.
*   **Vue**: tell the compiler the tags are custom elements:
    `compilerOptions: {isCustomElement: (tag) => tag.startsWith('petal-')}`
    (in `vite.config` for `@vitejs/plugin-vue`). Use `:value` / `.prop`
    bindings and `@change`.
*   **Angular**: add `CUSTOM_ELEMENTS_SCHEMA` to the component or module.
*   **Svelte, Lit, Astro, plain HTML**: no setup.
*   **TypeScript**: each module declares its tags in `HTMLElementTagNameMap`,
    so `document.querySelector('petal-dialog')` is typed. Types are in the
    `.d.ts` next to each `.js`.
*   **Server rendering**: the components can be rendered with Lit SSR
    (`@lit-labs/ssr`); they read the browser (window size, media queries) only
    after they are connected.

## Rules that keep a page correct

*   Read a component's page before using it; use only the attributes, slots
    and events it lists. Slot names are exact (`slot="headline"`, not
    `slot="title"`).
*   Name every icon-only control with `aria-label`; give fields a `label`.
*   Use `type="button"` on buttons inside a form that should not submit it.
*   Style components through their `--md-*` custom properties (listed under
    *Theming* on each page) and `::part()` where offered; do not reach into
    their shadow DOM, and do not add transitions or animations to them (see
    [Motion](motion.md)).
*   Do not set `role` or `aria-*` to change a component's role; they move to
    the inner element (see [Using in an existing site](migrating.md)).
*   Dialogs, menus with `positioning="popover"` and the select menu are in
    the top layer: `z-index` does not change their order.
*   Test in light and dark (`color-scheme`), at phone and desktop widths, with
    the keyboard, and with reduced motion.
