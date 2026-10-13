<!-- catalog-only-start --><!-- ---
name: Quick Start
title: Quick Start
order: 2
-----><!-- catalog-only-end -->

# Quick start

<!-- [TOC] -->

## CDN

For fast prototyping, we recommend using [esm.run](https://esm.run/)<!-- {.external} -->,
a CDN that allows you to use `petal-elements` without installing and building
from NPM.

```html
<head>
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/petal-elements/tokens/css/sys.css" rel="stylesheet">
  <script type="importmap">
    {
      "imports": {
        "petal-elements/": "https://esm.run/petal-elements/"
      }
    }
  </script>
  <script type="module">
    import 'petal-elements/all.js';
    import {styles as typescaleStyles} from 'petal-elements/typography/md-typescale-styles.js';

    document.adoptedStyleSheets.push(typescaleStyles.styleSheet);
  </script>
</head>
<body>
  <h1 class="md-typescale-display-medium">Hello petal-elements!</h1>
  <form>
    <p class="md-typescale-body-medium">Check out these controls in a form!</p>
    <petal-checkbox></petal-checkbox>
    <div>
      <petal-radio name="group"></petal-radio>
      <petal-radio name="group"></petal-radio>
      <petal-radio name="group"></petal-radio>
    </div>
    <petal-outlined-text-field label="Favorite color" value="Purple"></petal-outlined-text-field>
    <petal-outlined-button type="reset">Reset</petal-outlined-button>
  </form>
  <style>
    form {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;
    }
  </style>
</body>
```

For production, follow the [install](#install) and [build](#building) steps
below.

## Install

Install petal-elements with
[npm](https://nodejs.org)<!-- {.external} -->.

```shell
npm install petal-elements
```

## Import

Import element definitions from
`petal-elements/<component>/<component-variant>.js`.

```js
// index.js
import 'petal-elements/button/filled-button.js';
import 'petal-elements/button/outlined-button.js';
import 'petal-elements/checkbox/checkbox.js';
```

## Tokens

Load `tokens/css/sys.css` for the full set of system tokens: colors for light
and dark mode, typography, shapes, elevation and motion. The components work
without it (they fall back to the light baseline values), but dark mode and
most theming need it.

```html
<link rel="stylesheet" href="node_modules/petal-elements/tokens/css/sys.css">
<style>
  :root {
    color-scheme: light dark; /* follow the system setting */
  }
</style>
```

Other stylesheets in `tokens/css/`:

-   `sys-medium-contrast.css`, `sys-high-contrast.css`: colors with more
    contrast. They contain only colors; load one after `sys.css`.
-   `motion-expressive.css`: switches the motion springs to the expressive
    scheme (more bounce). Load it after `sys.css`.

Each file is also available as a Lit `CSSResult`
(`tokens/css/sys.cssresult.js` exports `styles`).

### Fonts

Components do not inherit the page's font: their text uses the typescale
tokens, which fall back to Roboto. To use your own font, set the two typefaces
([typography](theming/typography.md)):

```css
:root {
  --md-ref-typeface-brand: 'Noto Sans SC', system-ui, sans-serif; /* headlines, titles */
  --md-ref-typeface-plain: 'Noto Sans SC', system-ui, sans-serif; /* body, labels */
}
```

Icons use the Material Symbols font (`--md-icon-font`); see
[icons](components/icon.md).

## Usage

Use the `<component-name>` tag in HTML markup. Refer to the
[component docs](components/) for more guidance on using each component.

[Playground](https://lit.dev/playground/#gist=37d28012c5ec6de30809bdf4a6e26cb6)<!-- {.external} -->

```html
<script type="module" src="./index.js"></script>

<label>
  Remember me
  <petal-checkbox checked></petal-checkbox>
</label>

<petal-outlined-button>Back</petal-outlined-button>
<petal-filled-button>Next</petal-filled-button>
```

## Building

petal-elements uses bare module specifiers that must be resolved with
tools until [import maps](https://github.com/WICG/import-maps)<!-- {.external} --> are
adopted.

We recommend following
[lit.dev's modern build for production](https://lit.dev/docs/tools/production/#modern-only-build)<!-- {.external} -->
for a more in-depth build guide.

### Rollup quick start

For a quick start, we recommend using [Rollup](https://rollupjs.org/)<!-- {.external} -->
to resolve bare module specifiers into a bundled file.

Install Rollup and a plugin to resolve bare module specifiers.

```shell
npm install rollup @rollup/plugin-node-resolve
```

Create a bundle from an entrypoint `index.js` file and use it in a `<script>`
`"src"` attribute.

```shell
npx rollup -p @rollup/plugin-node-resolve index.js -o bundle.js
```

```html
<script src="./bundle.js"></script>
```
