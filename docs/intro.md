<!-- catalog-only-start --><!-- ---
name: Introduction
title: Introduction
order: 1
-----><!-- catalog-only-end -->

# Introduction

petal-elements is a library of
[web components](https://developer.mozilla.org/en-US/docs/Web/API/Web_components)<!-- {.external} -->
that implement Material 3, including the Material 3 Expressive additions
(button sizes, shape morphing, spring motion, button groups).

It is a community-maintained continuation of
[material-components/material-web](https://github.com/material-components/material-web)<!-- {.external} -->,
which is in maintenance mode. It is not an official Google project and is not
affiliated with Google.

<!-- [TOC] -->

## Material 3

Material 3 is Google's open-source design system. Its guidelines are published
at [m3.material.io](https://m3.material.io)<!-- {.external} -->. This library
follows them for the look and behavior of its components. The values (colors,
sizes, typography, motion) come from the published Material Design tokens, not
from screenshots; see [Design tokens](tokens.md).

## Web components

Web components are custom HTML elements with their own styles and behavior.
They work in plain HTML and with any framework (Lit, React, Vue, Svelte, ...).

Many components in this library can replace browser elements such as `<button>`
and `<input>`, including in forms.

```html
<!-- Browser elements -->
<form>
  <label>
    Email
    <input type="email" name="email" required>
  </label>
  <label>
    Subscribe
    <input type="checkbox" name="subscribe">
  </label>

  <button type="reset">Reset</button>
  <button>Submit</button>
</form>

<!-- petal-elements -->
<form>
  <petal-outlined-text-field label="Email" type="email"
      name="email" required></petal-outlined-text-field>
  <label>
    Subscribe
    <petal-checkbox name="subscribe"></petal-checkbox>
  </label>

  <petal-text-button type="reset">Reset</petal-text-button>
  <petal-outlined-button>Submit</petal-outlined-button>
</form>
```

## Tokens

Design tokens are named design values, such as a color role or a corner size.
In petal-elements they are
[CSS custom properties](https://developer.mozilla.org/en-US/docs/Web/CSS/--*)<!-- {.external} -->
that you can set to style the components. They keep the `--md-` names of
material-web, so existing themes keep working.

```css
:root {
  --md-sys-color-primary: olive;
  --md-sys-color-secondary: tomato;
  --md-ref-typeface-brand: 'Open Sans';
  --md-ref-typeface-plain: system-ui;
}
```

See [Theming](theming/README.md) for details.

## Coming from material-web

-   Tags start with `petal-` instead of `md-` (`<petal-filled-button>`), and
    classes with `Petal` instead of `Md` (`PetalFilledButton`).
-   Imports come from `petal-elements/...` instead of `@material/web/...`. The
    file paths are the same.
-   CSS custom properties keep their `--md-` names.
-   The default token values are from the Material Design tokens v34 instead of
    v0.192. Most components look slightly different; see
    [Token update v0.192 → v34](token-update-v34.md).
-   New, opt-in features: [Material 3 Expressive features](expressive.md).
