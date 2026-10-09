<!-- catalog-only-start --><!-- ---
name: Floating action button (FAB)
dirname: fab
-----><!-- catalog-only-end -->

<catalog-component-header>
<catalog-component-header-title slot="title">

# Floating action buttons (FAB)

<!-- no-catalog-start -->

<!-- [TOC] -->

<!-- external-only-start -->
**This documentation is fully rendered on the
[petal-elements catalog](https://petal.anontokyo.vip/catalog/components/fab/).**
<!-- external-only-end -->

<!-- no-catalog-end -->

[FAB](https://m3.material.io/components/floating-action-button)<!-- {.external} -->
is a button for the main action of a screen. It floats above the content so the
action is always in reach.

[Extended FABs](https://m3.material.io/components/extended-fab)<!-- {.external} -->
add a text label to a FAB, which makes them wider and easier to hit.

</catalog-component-header-title>

<img
    class="hero"
    alt="The 3 sizes of FAB"
    title="There are three sizes of floating action buttons: FAB, small FAB, and large FAB"
    src="images/fab/hero.webp">

</catalog-component-header>

*   Design articles
    *   [FAB](https://m3.material.io/components/floating-action-button)
        <!-- {.external} -->
    *   [Extended FAB](https://m3.material.io/components/extended-fab)
        <!-- {.external} -->
*   API Documentation (*coming soon*)
*   [Source code](https://github.com/Saki340/petal-elements/tree/main/fab)
    <!-- {.external} -->

<!-- catalog-only-start -->

<!--

## Interactive Demo

{% playgroundexample dirname=dirname %}

-->

<!-- catalog-only-end -->

## Types

<!-- no-catalog-start -->

![The 3 sizes of FAB](images/fab/fabs.webp "There are three sizes of floating action buttons: FAB, small FAB, and large FAB")

<!-- no-catalog-end -->
<!-- catalog-include "figures/fab/fabs.html" -->

1.  [FAB](#fab)
2.  [Small FAB](#sizes)
3.  [Large FAB](#sizes)

### Extended FAB

<!-- no-catalog-start -->

![2 examples of extended FABs](images/fab/extended-fabs.webp "There are two types of extended FABs with and without icon")

<!-- no-catalog-end -->
<!-- catalog-include "figures/fab/extended-fabs.html" -->

*   [Extended FAB with both icon and label text](#extended)
*   [API Documentation](#api)
*   [Extended FAB without icon](#without-icon)

## Usage

FABs should have an icon, such as a font `petal-icon`, an `svg`, or an `img`.

<!-- no-catalog-start -->

![A standard surface fab](images/fab/usage-fab.webp)

<!-- no-catalog-end -->
<!-- catalog-include "figures/fab/usage-fab.html" -->

```html
<petal-fab aria-label="Edit">
  <petal-icon slot="icon">edit</petal-icon>
</petal-fab>
```

### Lowered

FABs can be set to a lower elevation with the `lowered` attribute.

<!-- no-catalog-start -->

![A standard fab with an edit icon and lowered in elevation](images/fab/usage-lowered.webp)

<!-- no-catalog-end -->
<!-- catalog-include "figures/fab/usage-lowered.html" -->

```html
<petal-fab lowered aria-label="Edit">
  <petal-icon slot="icon">edit</petal-icon>
</petal-fab>
```

## Accessibility

Icon-only FABs must include an `aria-label` that describes its action. Otherwise
if `aria-label` is not provided, the FAB will default to announcing its visible
contents.

```html
<petal-fab aria-label="Edit">
  <petal-icon slot="icon">edit</petal-icon>
</petal-fab>
```

Extended FABs use their `label` for accessibility. Add an `aria-label` for
additional context if needed. By supplying the `label` attribute, the extended
FAB will make sure that the icon is not announced.

```html
<petal-fab label="Edit" aria-label="Edit Comment">
  <petal-icon slot="icon">edit</petal-icon>
</petal-fab>
```

## FAB

FABs should display a clear and understandable icon.

<!-- no-catalog-start -->

![A standard surface fab](images/fab/usage-fab.webp)

<!-- no-catalog-end -->
<!-- catalog-include "figures/fab/usage-fab.html" -->

```html
<petal-fab aria-label="Edit">
  <petal-icon slot="icon">edit</petal-icon>
</petal-fab>
```

### Extended

FABs may be extended with a label for additional emphasis. Extended FABs can
omit their icon.

<!-- no-catalog-start -->

![An extended FAB with an edit icon and the visible text edit](images/fab/usage-extended.webp)

<!-- no-catalog-end -->
<!-- catalog-include "figures/fab/usage-extended.html" -->

```html
<petal-fab label="Edit">
  <petal-icon slot="icon">edit</petal-icon>
</petal-fab>
```

#### Without icon

Extended FABs are the only FABs that can be used without an icon.

<!-- no-catalog-start -->

![An extended FAB with a visible label saying reroute](images/fab/usage-without-icon.webp)

<!-- no-catalog-end -->
<!-- catalog-include "figures/fab/usage-without-icon.html" -->

```html
<petal-fab label="Reroute"></petal-fab>
```

### Colors

FAB colors may be changed with the `variant` attribute. It can be set to
"surface" (default), "primary", "secondary", or "tertiary". These use the
container colors (for example `primary-container`). For the solid colors, use
"filled-primary", "filled-secondary", or "filled-tertiary" (see
[Material 3 Expressive features](../expressive.md#filled-fab)).

<!-- no-catalog-start -->

![Three fabs with edit icons next to each other but the first is primary
colored, second is secondary, and the last is tertiary
colored.](images/fab/usage-color.webp)

<!-- no-catalog-end -->
<!-- catalog-include "figures/fab/usage-color.html" -->

```html
<petal-fab variant="primary" aria-label="Edit">
  <petal-icon slot="icon">edit</petal-icon>
</petal-fab>
<petal-fab variant="secondary" aria-label="Edit">
  <petal-icon slot="icon">edit</petal-icon>
</petal-fab>
<petal-fab variant="tertiary" aria-label="Edit">
  <petal-icon slot="icon">edit</petal-icon>
</petal-fab>
```

### Sizes

FABs may be small, medium (default), or large by setting the `size` attribute.
Small FABs can optionally further reduce their touch target.

<!-- no-catalog-start -->

![Four surface fabs side by side with edit icons of visual size size small,
small, medium, and large](images/fab/usage-sizes.webp)

<!-- no-catalog-end -->
<!-- catalog-include "figures/fab/usage-sizes.html" -->

```html
<petal-fab size="small" touch-target="none" aria-label="Edit">
  <petal-icon slot="icon">edit</petal-icon>
</petal-fab>
<petal-fab size="small" aria-label="Edit">
  <petal-icon slot="icon">edit</petal-icon>
</petal-fab>
<petal-fab aria-label="Edit">
  <petal-icon slot="icon">edit</petal-icon>
</petal-fab>
<petal-fab size="large" aria-label="Edit">
  <petal-icon slot="icon">edit</petal-icon>
</petal-fab>
```

## Branded FAB

<!-- no-catalog-start -->

<!-- no-catalog-end -->

Branded FABs use a brightly colored logo for their icon. Unlike [FAB](#fab),
branded FABs do not have color variants.

<!-- no-catalog-start -->

![A branded FAB with a flower logo.](images/fab/usage-branded.webp)

<!-- no-catalog-end -->
<!-- catalog-include "figures/fab/usage-branded.html" -->

```html
<petal-branded-fab size="small" aria-label="Add">
  <svg slot="icon" viewBox="0 0 36 36">
    <ellipse cx="18" cy="10" rx="5" ry="8" fill="#F48FB1"></ellipse>
    <ellipse cx="26" cy="18" rx="8" ry="5" fill="#EC407A"></ellipse>
    <ellipse cx="18" cy="26" rx="5" ry="8" fill="#F06292"></ellipse>
    <ellipse cx="10" cy="18" rx="8" ry="5" fill="#F8BBD0"></ellipse>
    <circle cx="18" cy="18" r="4" fill="#FFD54F"></circle>
  </svg>
</petal-branded-fab>
```

### Extended

Branded FABs may be extended with a label for additional emphasis. Unlike
[FAB](#fab), branded FABs should always display their logo icon.

<!-- no-catalog-start -->

![An extended branded fab with a flower logo and the visible text
Add](images/fab/usage-branded-extended.webp)

<!-- no-catalog-end -->
<!-- catalog-include "figures/fab/usage-branded-extended.html" -->

```html
<petal-branded-fab label="Add">
  <svg slot="icon" viewBox="0 0 36 36">
    <ellipse cx="18" cy="10" rx="5" ry="8" fill="#F48FB1"></ellipse>
    <ellipse cx="26" cy="18" rx="8" ry="5" fill="#EC407A"></ellipse>
    <ellipse cx="18" cy="26" rx="5" ry="8" fill="#F06292"></ellipse>
    <ellipse cx="10" cy="18" rx="8" ry="5" fill="#F8BBD0"></ellipse>
    <circle cx="18" cy="18" r="4" fill="#FFD54F"></circle>
  </svg>
</petal-branded-fab>
```

### Sizes

Branded FABs may be medium (default) or large by setting the `size` attribute.

<!-- no-catalog-start -->

![Two branded FABs next to each other with a flower logo. A medium
sized one and a large one.](images/fab/usage-branded-sizes.webp)

<!-- no-catalog-end -->
<!-- catalog-include "figures/fab/usage-branded-sizes.html" -->

```html
<petal-branded-fab aria-label="Add">
  <svg slot="icon" viewBox="0 0 36 36">
    <ellipse cx="18" cy="10" rx="5" ry="8" fill="#F48FB1"></ellipse>
    <ellipse cx="26" cy="18" rx="8" ry="5" fill="#EC407A"></ellipse>
    <ellipse cx="18" cy="26" rx="5" ry="8" fill="#F06292"></ellipse>
    <ellipse cx="10" cy="18" rx="8" ry="5" fill="#F8BBD0"></ellipse>
    <circle cx="18" cy="18" r="4" fill="#FFD54F"></circle>
  </svg>
</petal-branded-fab>
<petal-branded-fab size="large" aria-label="Add">
  <svg slot="icon" viewBox="0 0 36 36">
    <ellipse cx="18" cy="10" rx="5" ry="8" fill="#F48FB1"></ellipse>
    <ellipse cx="26" cy="18" rx="8" ry="5" fill="#EC407A"></ellipse>
    <ellipse cx="18" cy="26" rx="5" ry="8" fill="#F06292"></ellipse>
    <ellipse cx="10" cy="18" rx="8" ry="5" fill="#F8BBD0"></ellipse>
    <circle cx="18" cy="18" r="4" fill="#FFD54F"></circle>
  </svg>
</petal-branded-fab>
```

## Theming

FAB supports [Material theming](../theming/README.md) and can be customized in
terms of color, typography, and shape.

### FAB tokens

Token                              | Default value
---------------------------------- | ---------------------------------------
`--md-fab-container-color`         | `--md-sys-color-surface-container-high`
`--md-fab-lowered-container-color` | `--md-sys-color-surface-container-low`
`--md-fab-container-shape`         | `--md-sys-shape-corner-large`
`--md-fab-icon-color`              | `--md-sys-color-primary`
`--md-fab-icon-size`               | `24px`

*   [All tokens](https://github.com/Saki340/petal-elements/blob/main/tokens/_md-comp-fab.scss)
    <!-- {.external} -->

### FAB example

<!-- no-catalog-start -->

![Image of a fab with a different theme applied](images/fab/theming-fab.webp)

<!-- no-catalog-end -->
<!-- catalog-include "figures/fab/theming-fab.html" -->

```html
<style>
  :root {
    --md-sys-color-surface-container-high: #e3e9e9;
    --md-sys-color-primary: #006a6a;
    --md-fab-container-shape: 0px;
    --md-fab-icon-size: 36px;
    background-color: #f4fbfa;
  }
</style>
<petal-fab aria-label="Edit">
  <petal-icon slot="icon">edit</petal-icon>
</petal-fab>
```

#### Sizes tokens

Token                            | Default value
-------------------------------- | -------------
`--md-fab-small-container-shape` | `--md-sys-shape-corner-medium`
`--md-fab-small-icon-size`       | `24px`
`--md-fab-large-container-shape` | `--md-sys-shape-corner-extra-large`
`--md-fab-large-icon-size`       | `36px`

#### Extended FAB tokens

Token                      | Default value
-------------------------- | -------------------------------------
`--md-fab-label-text-font` | `--md-sys-typescale-label-large-font`

#### Extended FAB example

<!-- no-catalog-start -->

![Image of an extended FAB with a different theme applied](images/fab/theming-extended.webp)

<!-- no-catalog-end -->
<!-- catalog-include "figures/fab/theming-extended.html" -->

```html
<style>
  :root {
    --md-sys-color-surface-container-high: #e3e9e9;
    --md-sys-color-on-surface: #161d1d;
    --md-sys-color-primary: #006a6a;
    --md-fab-container-shape: 0px;
    --md-fab-icon-size: 36px;
    background-color: #f4fbfa;
  }
</style>
<petal-fab label="Edit">
  <petal-icon slot="icon">edit</petal-icon>
</petal-fab>
```

### Branded FAB tokens

Token                              | Default value
---------------------------------- | ---------------------------------------
`--md-fab-branded-container-color` | `--md-sys-color-surface-container-high`
`--md-fab-branded-container-shape` | `--md-sys-shape-corner-large`
`--md-fab-branded-icon-size`       | `36px`
`--md-fab-branded-label-text-font` | `--md-sys-typescale-label-large-font`

*   [All tokens](https://github.com/Saki340/petal-elements/blob/main/tokens/_md-comp-fab-branded.scss)
    <!-- {.external} -->

### Branded FAB example

<!-- no-catalog-start -->

![Image of two branded fabs, one regular, one extended with the visible label
Add with a different theme applied](images/fab/theming-branded.webp)

<!-- no-catalog-end -->
<!-- catalog-include "figures/fab/theming-branded.html" -->

```html
<style>
  :root {
    --md-sys-color-surface-container-high: #e3e9e9;
    --md-sys-color-on-surface: #161d1d;
    --md-fab-branded-icon-size: 48px;
    --md-fab-branded-container-shape: 0px;
    background-color: #f4fbfa;
  }
</style>
<petal-branded-fab size="small" aria-label="Add">
  <svg slot="icon" viewBox="0 0 36 36">
    <ellipse cx="18" cy="10" rx="5" ry="8" fill="#F48FB1"></ellipse>
    <ellipse cx="26" cy="18" rx="8" ry="5" fill="#EC407A"></ellipse>
    <ellipse cx="18" cy="26" rx="5" ry="8" fill="#F06292"></ellipse>
    <ellipse cx="10" cy="18" rx="8" ry="5" fill="#F8BBD0"></ellipse>
    <circle cx="18" cy="18" r="4" fill="#FFD54F"></circle>
  </svg>
</petal-branded-fab>
<petal-branded-fab size="small" label="Add">
  <svg slot="icon" viewBox="0 0 36 36">
    <ellipse cx="18" cy="10" rx="5" ry="8" fill="#F48FB1"></ellipse>
    <ellipse cx="26" cy="18" rx="8" ry="5" fill="#EC407A"></ellipse>
    <ellipse cx="18" cy="26" rx="5" ry="8" fill="#F06292"></ellipse>
    <ellipse cx="10" cy="18" rx="8" ry="5" fill="#F8BBD0"></ellipse>
    <circle cx="18" cy="18" r="4" fill="#FFD54F"></circle>
  </svg>
</petal-branded-fab>
```

<!-- auto-generated API docs start -->

## API


### PetalFab <code>&lt;petal-fab&gt;</code>

#### Properties

<!-- mdformat off(autogenerated might break rendering in catalog) -->

| Property | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `variant` | `variant` | `FabVariant` | `'surface'` | The FAB color variant to render. |
| `size` | `size` | `FabSize` | `'medium'` | The size of the FAB.<br>NOTE: Branded FABs cannot be sized to `small`, and Extended FABs do not have different sizes. |
| `label` | `label` | `string` | `''` | The text to display on the FAB. |
| `lowered` | `lowered` | `boolean` | `false` | Lowers the FAB's elevation. |

<!-- mdformat on(autogenerated might break rendering in catalog) -->

### PetalBrandedFab <code>&lt;petal-branded-fab&gt;</code>

#### Properties

<!-- mdformat off(autogenerated might break rendering in catalog) -->

| Property | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `variant` | `variant` | `FabVariant` | `'surface'` | The FAB color variant to render. |
| `size` | `size` | `FabSize` | `'medium'` | The size of the FAB.<br>NOTE: Branded FABs cannot be sized to `small`, and Extended FABs do not have different sizes. |
| `label` | `label` | `string` | `''` | The text to display on the FAB. |
| `lowered` | `lowered` | `boolean` | `false` | Lowers the FAB's elevation. |

<!-- mdformat on(autogenerated might break rendering in catalog) -->

#### Methods

<!-- mdformat off(autogenerated might break rendering in catalog) -->

| Method | Parameters | Returns | Description |
| --- | --- | --- | --- |
| `getRenderClasses` | _None_ | `{ primary: boolean; secondary: boolean; tertiary: boolean; small: boolean; 'filled-primary': boolean; 'filled-secondary': boolean; 'filled-tertiary': boolean; lowered: boolean; large: boolean; extended: boolean; }` |  |

<!-- mdformat on(autogenerated might break rendering in catalog) -->

<!-- auto-generated API docs end -->
