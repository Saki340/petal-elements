<!-- catalog-only-start --><!-- ---
name: Shape
title: Shape
order: 4
-----><!-- catalog-only-end -->

# Shape

<!-- [TOC] -->

[Shape](https://m3.material.io/styles/shape)<!-- {.external} -->
draws attention, shows state and expresses a brand.

## Shape

Corners use a
[range of shape scales](https://m3.material.io/styles/shape/shape-scale-tokens#b85fe884-325c-45e6-b7fb-e753c6e03c82)<!-- {.external} -->
for their roundness, from square to fully round.

> Note: "cut" corners are not supported.

### Tokens

Shape corners can be set using
[CSS custom properties](https://developer.mozilla.org/en-US/docs/Web/CSS/--*)<!-- {.external} -->.
Tokens follow the naming convention `--md-sys-shape-<token>`.

Shape  | Token
------ | -----------------------------------
Corner | `--md-sys-shape-corner-none`
&nbsp; | `--md-sys-shape-corner-extra-small`
&nbsp; | `--md-sys-shape-corner-small`
&nbsp; | `--md-sys-shape-corner-medium`
&nbsp; | `--md-sys-shape-corner-large`
&nbsp; | `--md-sys-shape-corner-extra-large`
&nbsp; | `--md-sys-shape-corner-full`

*   [All tokens](https://github.com/Saki340/petal-elements/blob/main/tokens/_md-sys-shape.scss)
    <!-- {.external} -->

```css
:root {
  --md-sys-shape-corner-small: 4px;
  --md-sys-shape-corner-medium: 6px;
  --md-sys-shape-corner-large: 8px;
}
```
