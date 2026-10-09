<!-- catalog-only-start --><!-- ---
name: Top app bar
dirname: top-app-bar
-----><!-- catalog-only-end -->

<catalog-component-header>
<catalog-component-header-title slot="title">

# Top app bar

<!-- no-catalog-start -->

<!-- [TOC] -->

<!-- external-only-start -->
**This documentation is fully rendered on the
[petal-elements catalog](https://petal.anontokyo.vip/catalog/components/top-app-bar/).**
<!-- external-only-end -->

<!-- no-catalog-end -->

[Top app bars](https://m3.material.io/components/app-bars)<!-- {.external} -->
show the title of a screen with navigation and actions at the top of the page.

</catalog-component-header-title>

<img
    class="hero"
    alt="A small and a medium flexible top app bar with the title Inbox."
    title="Top app bars"
    src="images/appbar/hero.webp">

</catalog-component-header>

*   [Design article](https://m3.material.io/components/app-bars) <!-- {.external} -->
*   [API Documentation](#api)
*   [Source code](https://github.com/Saki340/petal-elements/tree/main/appbar)
    <!-- {.external} -->

The values follow Jetpack Compose Material 3 (`AppBarTokens`,
`AppBarSmallTokens`, `AppBarMediumFlexibleTokens`,
`AppBarLargeFlexibleTokens`, and the layout in `AppBar.kt`).

## Usage

Set the title with `headline`, and put icon buttons in the `navigation` and
`actions` slots. The bar sticks to the top of the page. When content scrolls
under it, a small bar takes the scrolled container color.

<!-- no-catalog-start -->

![A small top app bar with a menu button, the title Inbox and two actions](images/appbar/usage.webp)

<!-- no-catalog-end -->
<!-- catalog-include "figures/appbar/usage.html" -->

```html
<petal-top-app-bar headline="Inbox">
  <petal-icon-button slot="navigation" aria-label="Menu">
    <petal-icon>menu</petal-icon>
  </petal-icon-button>
  <petal-icon-button slot="actions" aria-label="Search">
    <petal-icon>search</petal-icon>
  </petal-icon-button>
</petal-top-app-bar>
```

`subtitle` adds a line below the title.

### Medium and large

`size="medium"` and `size="large"` are Compose's `MediumFlexibleTopAppBar`
and `LargeFlexibleTopAppBar`: a large title below the bar, 112px and 120px tall
(136px and 152px with a subtitle). As the page scrolls, the large title scrolls
away and fades out, the small title fades in, and the container takes the
scrolled color, like Compose's `exitUntilCollapsed` scroll behavior.

<!-- no-catalog-start -->

![Medium flexible top app bars with and without a subtitle](images/appbar/usage-medium.webp)

<!-- no-catalog-end -->
<!-- catalog-include "figures/appbar/usage-medium.html" -->

```html
<petal-top-app-bar size="medium" headline="Inbox" subtitle="12 unread">
  ...
</petal-top-app-bar>
```

<!-- no-catalog-start -->

![A large flexible top app bar with a subtitle](images/appbar/usage-large.webp)

<!-- no-catalog-end -->
<!-- catalog-include "figures/appbar/usage-large.html" -->

### Centered title

`centered` centers the title, as Compose's `titleHorizontalAlignment`.

<!-- no-catalog-start -->

![A medium flexible top app bar with a centered title](images/appbar/usage-centered.webp)

<!-- no-catalog-end -->
<!-- catalog-include "figures/appbar/usage-centered.html" -->

### Scrolling container

By default the bar follows the page scroll. When the content scrolls in an
element instead, give that element an id and set `scroll-target`:

```html
<div id="list" style="overflow: auto; height: 100vh">
  <petal-top-app-bar size="medium" headline="Inbox" scroll-target="list">
  </petal-top-app-bar>
  ...
</div>
```

## Accessibility

Only one title is exposed to assistive technology at a time: the large title
while the bar is mostly expanded, the small one when it is mostly collapsed,
like Compose. Give icon buttons an `aria-label`. If the title is the page's
main heading, also put an `<h1>` in the page; the bar's title is not a heading.

## Theming

Top app bars support [Material theming](../theming/README.md). Every token of
Compose's `AppBarTokens` is a `--md-top-app-bar-*` custom property.

### Tokens

Token                                         | Default value
--------------------------------------------- | -------------
`--md-top-app-bar-container-color`            | `--md-sys-color-surface`
`--md-top-app-bar-on-scroll-container-color`  | `--md-sys-color-surface-container`
`--md-top-app-bar-title-color`                | `--md-sys-color-on-surface`
`--md-top-app-bar-subtitle-color`             | `--md-sys-color-on-surface-variant`
`--md-top-app-bar-leading-icon-color`         | `--md-sys-color-on-surface`
`--md-top-app-bar-trailing-icon-color`        | `--md-sys-color-on-surface-variant`

*   [All tokens](https://github.com/Saki340/petal-elements/blob/main/tokens/versions/compose/values/_md-comp-app-bar.scss)
    <!-- {.external} -->

### Example

<!-- no-catalog-start -->

![A small top app bar with a teal container](images/appbar/theming.webp "Top app bar theming example.")

<!-- no-catalog-end -->
<!-- catalog-include "figures/appbar/theming.html" -->

```html
<style>
  petal-top-app-bar {
    --md-top-app-bar-container-color: #cce8e7;
    --md-top-app-bar-title-color: #002020;
  }
</style>
```

<!-- auto-generated API docs start -->

## API


### PetalTopAppBar <code>&lt;petal-top-app-bar&gt;</code>

#### Properties

<!-- mdformat off(autogenerated might break rendering in catalog) -->

| Property | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `size` | `size` | `TopAppBarSize` | `'small'` | `small`, `medium` or `large`. |
| `headline` | `headline` | `string` | `''` | The title. |
| `subtitle` | `subtitle` | `string` | `''` | An optional subtitle below the title. |
| `centered` | `centered` | `boolean` | `false` | Centers the title (`titleHorizontalAlignment`). |
| `scrollTarget` | `scroll-target` | `string` | `''` | The id of the scrolling element under the bar. Without it, the page scrolls. |
| `collapsedFraction` |  | `number` | `undefined` |  |

<!-- mdformat on(autogenerated might break rendering in catalog) -->

<!-- auto-generated API docs end -->
