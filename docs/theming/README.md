<!-- catalog-only-start --><!-- ---
name: Material Theming
title: Theming
order: 1
-----><!-- catalog-only-end -->

# Theming

<!-- [TOC] -->

[Material Design theming](https://m3.material.io/foundations/customization)<!-- {.external} -->
adapts the components to a brand with colors, typefaces and shapes, while
keeping their behavior.

## Tokens

Theming uses
[design tokens](https://m3.material.io/foundations/design-tokens/overview)<!-- {.external} -->, named values such as colors and sizes that the components
read.

Each component token maps to a system token, which has a concrete reference
value.

![A diagram of a FAB whose container color goes from a component token to a
system token to a reference token](images/token-types.webp "Component, system and reference tokens.")

On the web, design tokens are
[CSS custom properties](https://developer.mozilla.org/en-US/docs/Web/CSS/--*)<!-- {.external} -->
and can be scoped with CSS selectors.

```css
.square-buttons {
  /* Changes all <petal-filled-button> instances matching the selector */
  --md-filled-button-container-shape: 0px;
}
```

### Reference

Reference tokens hold concrete values, such as a hex color, pixel size, or font
family name.

#### Typeface

[`--md-ref-typeface` tokens](typography.md#typeface) can be used to change font
families and weights across all system and component tokens.

```css
:root {
  --md-ref-typeface-brand: 'Open Sans';
  --md-ref-typeface-plain: 'Open Sans';
}
```

#### Palette

Palette tones (`--md-ref-palette-*`) are not custom properties. System colors
fall back to the tone's value directly; set `--md-sys-color-*` tokens instead.

### System

System tokens define decisions and roles that give the design system its
character, from color and typography, to elevation and shape.

#### Color

[`--md-sys-color` tokens](color.md#tokens) define dynamic color roles that map
to components. See the [color guide](color.md) for more details.

```css
:root {
  --md-sys-color-primary: red;
  --md-sys-color-secondary: blue;
}
```

#### Typography

[`--md-sys-typescale` tokens](typography.md#typescale) define typescale roles
that map to components. See the [typography guide](typography.md) for more
details.

```css
:root {
  --md-sys-typescale-body-medium-size: 1rem;
  --md-sys-typescale-body-medium-line-height: 1.5rem;
}
```

#### Shape

[`--md-sys-shape` tokens](shape.md#tokens) define corner shapes used in
components. See the [shape guide](shape.md) for more details.

```css
:root {
  --md-sys-shape-corner-small: 4px;
  --md-sys-shape-corner-medium: 6px;
  --md-sys-shape-corner-large: 8px;
}
```

#### Motion

`tokens/css/sys.css` defines the motion tokens: durations, easings, and springs
as `--md-sys-motion-spring-<fast|default|slow>-<spatial|effects>` (a CSS
`linear()` easing) with a matching `-duration`. The Expressive features use the
springs, for example for shape morphing.

```css
:root {
  /* Slower, softer spatial spring for every component that uses it. */
  --md-sys-motion-spring-fast-spatial: var(--md-sys-motion-spring-default-spatial);
  --md-sys-motion-spring-fast-spatial-duration: var(--md-sys-motion-spring-default-spatial-duration);
}
```

Load `tokens/css/motion-expressive.css` to switch to the expressive motion
scheme. See [Material 3 Expressive features](../expressive.md#motion).

### Component

Component tokens are design attributes assigned to elements. They can be system
tokens or concrete values.

```css
:root {
  --md-filled-button-container-shape: 0px;
}

petal-filled-button.error {
  --md-filled-button-container-color: var(--md-sys-color-error);
  --md-filled-button-label-text-color: var(--md-sys-color-on-error);
}
```

Refer to each [components' documentation](../components/) for available tokens.

> Note: unlike `--md-ref-*` and `--md-sys-*` tokens, which are prefixed with
> `ref` and `sys`, component tokens are *not* prefixed with `comp`.

The springs' `-damping` and `-stiffness` properties (Compose's `dampingRatio`
and `stiffness`) are read by components that simulate a spring, such as the
button group's press, and by the theme transition below.

### Theme transition

`transitionTheme()` changes the theme with a circle that grows from the
control the user pressed until it covers the page, revealing the new theme. It
uses the View Transitions API and the page's slow spatial spring, so it
bounces with the expressive scheme. Without View Transitions, or with
`prefers-reduced-motion`, the theme just changes.

```js
import {transitionTheme} from 'petal-elements/theme/theme-transition.js';

toggle.addEventListener('click', (event) => {
  transitionTheme(() => {
    document.documentElement.style.colorScheme = isDark() ? 'light' : 'dark';
  }, event);
});
```

The first argument changes the theme; the second is where the circle starts:
a pointer event (keyboard clicks start from the center of their target), an
element, or `{x, y}` in viewport coordinates. It returns a promise that
resolves when the transition has finished. Other view transitions on the
page are not affected.
