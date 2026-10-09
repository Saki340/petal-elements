<!-- catalog-only-start --><!-- ---
name: Support
title: Support
order: 4
-----><!-- catalog-only-end -->

# Support

<!-- [TOC] -->

## Browsers

petal-elements supports the latest two major versions of browsers at the time
of each release.

Browser | Version
------- | -------
Chrome  | 123 +
Edge    | 123 +
Firefox | 120 +
Safari* | 17.5 +

These are the versions with CSS `light-dark()`, which `tokens/css/sys.css`
uses for dark mode. The components themselves also run in older browsers
(Chrome 120, Safari 16.4); there, spring animations that use CSS `linear()`
are skipped.

*\* previous versions of Safari may be supported with an
[`ElementInternals` polyfill](https://www.npmjs.com/package/element-internals-polyfill).*

## FAQ

*If you have a question that isn't listed here, consider asking it so we can
include it!*

### How do I change the color of a button?

Many components have multiple tokens for a color, including "hover", "focus",
and "pressed" states.

Use `--md-sys-color-*` tokens to change the key color that the component uses.

```css
/* Buttons use the `primary` key color */
petal-filled-button.spooky {
  --md-sys-color-primary: black;
  --md-sys-color-on-primary: yellow;
}

petal-filled-button.error {
  --md-sys-color-primary: var(--md-sys-color-error);
  --md-sys-color-on-primary: var(--md-sys-color-on-error);
}
```

### Why does my color change on hover/focus/pressed?

Many colors have multiple tokens, including "hover", "focus", and "pressed"
states.

Rather than setting all of them, or use the `--md-sys-color-*` token that the
component maps to (see the previous question).

### How do I turn on dark mode?

With `tokens/css/sys.css` loaded, set `color-scheme`. The colors use
`light-dark()`, so they follow it.

```css
:root {
  color-scheme: light dark; /* follow the system setting */
}

.always-dark {
  color-scheme: dark;
}
```

Without `sys.css`, it's up to the app to apply dark theme tokens. For example,
using Sass:

```scss
@use 'petal-elements/color/color';

:root {
  @media (prefers-color-scheme: dark) {
    @include color.dark-theme;
  }
}
```

See
[How do I use `--md-sys-*` custom properties in my styles?](#how-do-i-use-md-sys-custom-properties-in-my-styles)
for more info on how to generate a set of dark theme tokens.

### How do I use `--md-sys-*` custom properties in my styles?

-   Use Sass APIs.

    ```scss
    @use 'petal-elements/color/color';
    @use 'petal-elements/color/typography';

    :root {
      @include color.light-theme;
      @include typography.theme;

      @media (prefers-color-scheme: dark) {
        @include color.dark-theme;
      }
    }
    ```

-   Use the
    [Material theme builder Figma plugin](https://www.figma.com/community/plugin/1034969338659738588/Material-Theme-Builder)<!-- {.external} -->
    to generate a color scheme.

-   Use the
    [`material-color-utilities` library](https://www.npmjs.com/package/@material/material-color-utilities)<!-- {.external} -->
    to generate color schemes at runtime.

### How do I customize a `<petal-*>` element that is inside another component?

Use [CSS `::part()`s](https://developer.mozilla.org/en-US/docs/Web/CSS/::part)
to access sub-components. The part name is the sub-component's tag name without
the "petal-" prefix.

```css
petal-checkbox::part(focus-ring) {
  width: 32px;
  height: 32px;
}
```
