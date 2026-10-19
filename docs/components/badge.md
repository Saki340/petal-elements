<!-- catalog-only-start --><!-- ---
name: Badge
dirname: badge
-----><!-- catalog-only-end -->

<catalog-component-header>
<catalog-component-header-title slot="title">

# Badge

<!-- no-catalog-start -->

<!-- [TOC] -->

<!-- external-only-start -->
**This documentation is fully rendered on the
[petal-elements catalog](https://petal.anontokyo.vip/catalog/components/badge/).**
<!-- external-only-end -->

<!-- no-catalog-end -->

[Badges](https://m3.material.io/components/badges)<!-- {.external} -->
show notifications, counts or status on navigation items and icons.

</catalog-component-header-title>

<img
    class="hero"
    alt="Icon buttons with a dot badge and a badge with the count 3, and a navigation bar with badges on two items."
    title="Badges"
    src="images/badge/hero.webp">

</catalog-component-header>

*   [Design article](https://m3.material.io/components/badges) <!-- {.external} -->
*   [API Documentation](#api)
*   [Source code](https://github.com/Saki340/petal-elements/tree/main/badge)
    <!-- {.external} -->

This follows Jetpack Compose Material 3 (`Badge`, `BadgedBox`,
`BadgeTokens`).

## Usage

Without `value`, a badge is a small dot that says there is something new. With
a short `value`, such as a count, it is a pill around the value. Format large
counts yourself, for example as `999+`.

<!-- no-catalog-start -->

![A dot badge and badges with the values 3 and 999+](images/badge/usage.webp)

<!-- no-catalog-end -->
<!-- catalog-include "figures/badge/usage.html" -->

```html
<petal-badge></petal-badge>
<petal-badge value="3"></petal-badge>
<petal-badge value="999+"></petal-badge>
```

### On an icon

Put the badge in the `badge` slot of an icon button or a navigation bar or
rail item. It sits at the end of the icon's top edge, as `BadgedBox` places
it.

<!-- no-catalog-start -->

![Icon buttons with a dot badge and a badge with the count 3](images/badge/usage-icon-button.webp)

<!-- no-catalog-end -->
<!-- catalog-include "figures/badge/usage-icon-button.html" -->

```html
<petal-icon-button aria-label="Notifications, new">
  <petal-icon>notifications</petal-icon>
  <petal-badge slot="badge"></petal-badge>
</petal-icon-button>
<petal-icon-button aria-label="Mail, 3 unread">
  <petal-icon>mail</petal-icon>
  <petal-badge slot="badge" value="3"></petal-badge>
</petal-icon-button>
```

<!-- no-catalog-start -->

![A navigation bar with badges on Inbox and Chat](images/badge/usage-navigation.webp)

<!-- no-catalog-end -->
<!-- catalog-include "figures/badge/usage-navigation.html" -->

```html
<petal-navigation-bar>
  <petal-navigation-bar-item selected aria-label="Inbox, 12 unread">
    <petal-icon slot="icon">inbox</petal-icon>
    <petal-badge slot="badge" value="12"></petal-badge>
    Inbox
  </petal-navigation-bar-item>
  <petal-navigation-bar-item aria-label="Chat, new messages">
    <petal-icon slot="icon">chat</petal-icon>
    <petal-badge slot="badge"></petal-badge>
    Chat
  </petal-navigation-bar-item>
</petal-navigation-bar>
```

On your own element, give the element a position (for example
`position: relative`) and the badge `slot="badge"`.

```html
<span style="position: relative; display: inline-flex">
  <petal-icon>shopping_cart</petal-icon>
  <petal-badge slot="badge" value="2"></petal-badge>
</span>
```

## Accessibility

A dot has no text. Say what the badge means in the label of the element it is
on, for example `aria-label="Mail, 3 unread"`.

## Compose behavior

*   A dot is 6dp and fully rounded; with a value the badge is 16dp high, at
    least 16dp wide, with 4dp on the sides, the LabelSmall type, on-error on
    error.
*   On an icon (`slot="badge"`), a dot is 6dp from the end of the icon and its
    bottom 6dp below the top; a badge with a value is 12dp from the end and its
    bottom 14dp below the top (`BadgedBox`).

## Theming

Badges support [Material theming](../theming/README.md) and can be customized
in terms of color, typography and shape.

### Tokens

Token                                    | Default value
---------------------------------------- | -----------------------------------
`--md-badge-color`                       | `--md-sys-color-error`
`--md-badge-size`                        | `6px`
`--md-badge-shape`                       | `--md-sys-shape-corner-full`
`--md-badge-large-color`                 | `--md-sys-color-error`
`--md-badge-large-label-text-color`      | `--md-sys-color-on-error`
`--md-badge-large-label-text-font`       | `--md-sys-typescale-label-small-font`
`--md-badge-large-size`                  | `16px`
`--md-badge-large-shape`                 | `--md-sys-shape-corner-full`

### Example

```html
<style>
  :root {
    --md-badge-color: var(--md-sys-color-tertiary);
    --md-badge-large-color: var(--md-sys-color-tertiary);
    --md-badge-large-label-text-color: var(--md-sys-color-on-tertiary);
  }
</style>

<petal-badge value="5"></petal-badge>
```

<!-- auto-generated API docs start -->

## API


### PetalBadge <code>&lt;petal-badge&gt;</code>

#### Properties

<!-- mdformat off(autogenerated might break rendering in catalog) -->

| Property | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `value` | `value` | `string` | `''` | The text of the badge, for example a count. Without it the badge is a small dot. |

<!-- mdformat on(autogenerated might break rendering in catalog) -->

<!-- auto-generated API docs end -->
