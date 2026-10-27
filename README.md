# petal-elements

English | [简体中文](README.zh-CN.md)

[![npm](https://img.shields.io/npm/v/petal-elements)](https://www.npmjs.com/package/petal-elements)
[![CI](https://github.com/Saki340/petal-elements/actions/workflows/ci.yml/badge.svg)](https://github.com/Saki340/petal-elements/actions/workflows/ci.yml)
[![License](https://img.shields.io/npm/l/petal-elements)](LICENSE)

Material 3 Expressive web components for plain HTML and any framework. They
take their sizes, colors and spring motion from Jetpack Compose, and they are
accessible and work in native forms.

![Cards built from petal-elements: a reservation form with date and time fields, notification switches, account security fields, a savings goal, a carousel of trip ideas, a chat and an inbox](https://raw.githubusercontent.com/Saki340/petal-elements/main/docs/images/readme-examples.webp)

[Website](https://petal.anontokyo.vip/) ·
[Components](https://petal.anontokyo.vip/catalog/components/button/) ·
[Docs](https://petal.anontokyo.vip/catalog/about/intro/)

- **Expressive, from the source.** Button sizes and shapes that morph,
  button groups, wavy progress, carousels, date and time pickers, FAB menus,
  all with values read from the Jetpack Compose Material 3 source, not
  estimated by eye.
- **Motion on springs.** Components move on Compose's spring curves, preview
  their press on mouse hover, and keep still with reduced motion.
- **Standard custom elements.** Plain HTML, React, Vue, Svelte, Angular or a
  static site; form controls take part in `<form>` and `FormData`.
- **Ready for AI assistants.** [`llms.txt`](llms.txt) and
  [`llms-full.txt`](llms-full.txt) describe every component, so coding
  assistants build pages with the real API.

## Example

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/petal-elements/tokens/css/sys.css">
<script type="importmap">
  {"imports": {"petal-elements/": "https://esm.run/petal-elements/"}}
</script>
<script type="module">
  import 'petal-elements/buttongroup/button-group.js';
  import 'petal-elements/button/filled-tonal-button.js';
  import 'petal-elements/switch/switch.js';
</script>

<petal-button-group connected single-select size="medium" aria-label="View">
  <petal-filled-tonal-button toggle selected>Day</petal-filled-tonal-button>
  <petal-filled-tonal-button toggle>Week</petal-filled-tonal-button>
  <petal-filled-tonal-button toggle>Month</petal-filled-tonal-button>
</petal-button-group>

<label>Notifications <petal-switch selected></petal-switch></label>
```

Save it as an HTML file and open it: the buttons widen when pressed and the
selected one changes shape, on Compose's springs.

## Install

```sh
npm install petal-elements
```

Load the tokens once, then import the components you use:

```html
<link rel="stylesheet" href="node_modules/petal-elements/tokens/css/sys.css">
<style>:root { color-scheme: light dark; }</style>
<script type="module">
  import 'petal-elements/button/filled-button.js';
</script>
```

Bare imports work with any bundler (Vite, esbuild, webpack).
`petal-elements/all.js` imports every component. Icons use the
[Material Symbols](https://fonts.google.com/icons) font. See
[Quick start](docs/quick-start.md) and [Building pages](docs/building-pages.md).

## Components

| Kind | Components |
| --- | --- |
| Actions | [Buttons](docs/components/button.md), [icon buttons](docs/components/icon-button.md), [button groups](docs/components/button-group.md), [split buttons](docs/components/split-button.md), [segmented buttons](docs/components/segmented-button.md), [FAB](docs/components/fab.md), [FAB menu](docs/components/fab-menu.md), [floating toolbar](docs/components/floating-toolbar.md), [chips](docs/components/chip.md) |
| Communication | [Badges](docs/components/badge.md), [progress](docs/components/progress.md), [loading indicator](docs/components/loading-indicator.md), [snackbar](docs/components/snackbar.md), [tooltips](docs/components/tooltip.md), [pull to refresh](docs/components/pull-to-refresh.md) |
| Containment | [Cards](docs/components/card.md), [carousel](docs/components/carousel.md), [dialog](docs/components/dialog.md), [bottom sheets](docs/components/bottom-sheet.md), [lists](docs/components/list.md), [divider](docs/components/divider.md), [shapes](docs/components/shape.md) |
| Navigation | [Top app bar](docs/components/top-app-bar.md), [bottom app bar](docs/components/bottom-app-bar.md), [navigation bar](docs/components/navigation-bar.md), [rail](docs/components/navigation-rail.md), [drawer](docs/components/navigation-drawer.md), [tabs](docs/components/tabs.md), [search](docs/components/search.md), [menus](docs/components/menu.md) |
| Selection | [Checkbox](docs/components/checkbox.md), [radio](docs/components/radio.md), [switch](docs/components/switch.md), [slider](docs/components/slider.md), [date picker](docs/components/date-picker.md), [time picker](docs/components/time-picker.md) |
| Text input | [Text fields](docs/components/text-field.md), [select](docs/components/select.md) |

Every component has a live page in the
[catalog](https://petal.anontokyo.vip/catalog/components/button/).

## Documentation

- [Building pages](docs/building-pages.md): page setup, responsive navigation,
  forms, dialogs and other common screens
- [Motion](docs/motion.md): the springs, what each component animates, and
  using them in your own CSS
- [Theming](docs/theming/README.md): colors (including a theme from one
  color), typography and shape
- [Material 3 Expressive features](docs/expressive.md)
- For coding assistants: [`llms.txt`](llms.txt) (an index) and
  [`llms-full.txt`](llms-full.txt) (everything in one file), also at
  [petal.anontokyo.vip/llms.txt](https://petal.anontokyo.vip/llms.txt)

## Coming from Material Web

petal-elements continues Google's
[Material Web](https://github.com/material-components/material-web), which is
[in maintenance mode](https://github.com/material-components/material-web/discussions/5642),
with its full history.

| | Material Web | petal-elements |
| --- | --- | --- |
| Package | `@material/web` | `petal-elements` (same paths) |
| Tags | `<md-filled-button>` | `<petal-filled-button>` |
| Classes | `MdFilledButton` | `PetalFilledButton` |
| CSS custom properties | `--md-*` | unchanged |

See [Using in an existing site](docs/migrating.md) for the steps and what
changed.

## Status

Version 0.3. APIs may change before 1.0; the [changelog](CHANGELOG.md) lists
every change and the [roadmap](docs/roadmap.md) what comes next. Supported
browsers: [Support](docs/support.md).

petal-elements is not an official Google project and is not affiliated with
Google. It is an independent, community-maintained modified version of
Material Web.

## Contributing

Issues, discussions and pull requests are welcome: see
[CONTRIBUTING.md](CONTRIBUTING.md) for setup, tests and the rules for token
values.

## License

[Apache License 2.0](LICENSE). See [NOTICE](NOTICE) for attribution and the
list of modifications, and [docs/licensing.md](docs/licensing.md) for file
headers and third-party assets.
