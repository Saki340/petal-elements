# petal-elements

English | [简体中文](README.zh-CN.md)

Community-maintained web components for Material 3 Expressive.

> **petal-elements is not an official Google project and is not affiliated
> with Google.** It is an independent, community-maintained modified version of
> [material-components/material-web](https://github.com/material-components/material-web).

## Status

Version 0.2.0 moves every component to Jetpack Compose's values and adds many
components; see the [roadmap](docs/roadmap.md) and the
[changelog](CHANGELOG.md). APIs may change before 1.0.

Website: [petal.anontokyo.vip](https://petal.anontokyo.vip/). Documentation and
live examples: the [catalog](https://petal.anontokyo.vip/catalog/) and
[docs/](docs/intro.md).

## Quick start

```sh
npm install petal-elements
```

```html
<link rel="stylesheet" href="node_modules/petal-elements/tokens/css/sys.css">
<script type="module">
  import 'petal-elements/button/filled-button.js';
  import 'petal-elements/buttongroup/button-group.js';
</script>

<petal-filled-button>Save</petal-filled-button>

<!-- Material 3 Expressive, opt-in -->
<petal-button-group connected single-select size="medium">
  <petal-filled-tonal-button toggle selected>Day</petal-filled-tonal-button>
  <petal-filled-tonal-button toggle>Week</petal-filled-tonal-button>
</petal-button-group>
```

See [Quick start](docs/quick-start.md) for bundling and theming.

## What's in 0.1

- All Material Web components, renamed to `petal-*`.
- Token values from the Material Design web tokens v34 for the core components
  (buttons, icon buttons, FAB, checkbox, radio, switch, text fields, chips,
  progress, tabs); see [Token update v0.192 → v34](docs/token-update-v34.md).
- Generated token stylesheets in `tokens/css/`: system tokens with light and
  dark colors, contrast variants, and the expressive motion scheme.
- Material 3 Expressive, opt-in: button sizes `xsmall`–`xlarge`, round and
  square shapes, toggle buttons, shape morphing with spring motion, button
  groups, solid FABs. See [Material 3 Expressive features](docs/expressive.md).

## Background

Google's Material Web project
[is in maintenance mode](https://github.com/material-components/material-web/discussions/5642).
In that discussion, its maintainer
[wrote](https://github.com/material-components/material-web/discussions/5642#discussioncomment-13724284):
"Forks and different directions are always welcome in open source!"

petal-elements continues from the Material Web codebase, with its full git
history, and works towards Material 3 Expressive:

- Components are built on Material Web's foundations: ripple, focus ring,
  state layers, form association through `ElementInternals`, and accessibility.
- Sizes, colors, shapes and motion come from the Jetpack Compose Material 3
  source at a pinned commit, with the Material Design web tokens (v34) as the
  fallback. Values are taken from source, never estimated by eye. See
  [docs/tokens.md](docs/tokens.md).
- Missing Expressive specs and components (shape morphing, spring motion,
  button groups, …) are added step by step and checked with visual regression
  tests.
- We follow upstream and merge its fixes. Upstream's experimental `labs/gb`
  and `labs/aria` components are not included: petal's own components cover
  them.

## Differences from Material Web

| | Material Web | petal-elements |
|---|---|---|
| Package | `@material/web` | `petal-elements` |
| Tags | `<md-filled-button>` | `<petal-filled-button>` |
| Classes | `MdFilledButton` | `PetalFilledButton` |
| CSS custom properties | `--md-sys-*`, `--md-filled-button-*` | unchanged, to ease migration |

## Development

Requires Node.js 22 or later. Works on Linux, macOS and Windows.

```sh
npm ci
npm run build
npx playwright install chromium
npm test
npm run check:licenses   # licenses of all dependencies
npm run check:rebrand    # no md-* tags left after an upstream merge
npm run check:tokens     # generated tokens up to date
npm run test:visual      # pixel-exact screenshots (Playwright)
npm run docs:images      # render the images in docs/components
npm run build:catalog    # the documentation site, in catalog/_prod
```

See [Design tokens](docs/tokens.md) and [Visual testing](docs/visual-testing.md)
for the token pipeline and the screenshot tests.

### Merging upstream

```sh
git fetch upstream
git merge upstream/main
node scripts/rebrand.js   # rename new md-* tags; safe to run again
```

## License

Apache License 2.0. See [LICENSE](LICENSE) and [NOTICE](NOTICE) for
attribution and the list of modifications. Details on file headers,
third-party assets and dependency checks are in
[docs/licensing.md](docs/licensing.md).
