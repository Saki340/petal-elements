<!-- catalog-only-start --><!-- ---
name: Lists
dirname: list
-----><!-- catalog-only-end -->

<catalog-component-header image-align="start">
<catalog-component-header-title slot="title">

# Lists

<!-- no-catalog-start -->

<!-- [TOC] -->

<!-- external-only-start -->
**This documentation is fully rendered on the
[petal-elements catalog](https://saki340.github.io/petal-elements/components/list/)**
<!-- external-only-end -->

<!-- no-catalog-end -->

[Lists](https://m3.material.io/components/lists)<!-- {.external} -->
show items of text and images in a vertical column.

</catalog-component-header-title>

<img
    class="hero"
    alt="Three items in a list. The first item says Apple as its headline. The second one says Banana in its headline as well as Banana is a yellow fruit as its sub header. The third list item says Cucumber in its headline and Cucumbers are long green fruits that are just as long as this multi-line description as its sub header which is on two lines."
    src="images/list/hero.webp">

</catalog-component-header>

*   [Design article](https://m3.material.io/components/lists) <!-- {.external} -->
*   [API Documentation](#api)
*   [Source code](https://github.com/Saki340/petal-elements/tree/main/list)
    <!-- {.external} -->

<!-- catalog-only-start -->

<!--

## Interactive Demo

{% playgroundexample dirname=dirname, previewHeight=600, editorHeight=600 %}

-->

<!-- catalog-only-end -->

## Usage

`<petal-list>` is a container composed of `<petal-list-item>`s of different types.

<!-- no-catalog-start -->

![Three items in a list. The first item says Apple as its headline. The second
one says Banana in its headline as well as Banana is a yellow fruit as its sub
header. The third list item says Cucumber in its headline and Cucumbers are long
green fruits that are just as long as this multi-line description as its sub
header which is on two lines.](images/list/usage.webp)

<!-- no-catalog-end -->
<!-- catalog-include "figures/list/usage.html" -->

```html
<petal-list style="max-width: 300px;">
  <petal-list-item>
    Fruits
  </petal-list-item>
  <petal-divider></petal-divider>
  <petal-list-item>
    Apple
</petal-list-item>
  <petal-list-item>
    Banana
  </petal-list-item>
  <petal-list-item>
    <div slot="headline">Cucumber</div>
    <div slot="supporting-text">Cucumbers are long green fruits that are just as long as this multi-line description</div>
  </petal-list-item>
  <petal-list-item
      type="link"
      href="https://google.com/search?q=buy+kiwis&tbm=shop"
      target="_blank">
    <div slot="headline">Shop for Kiwis</div>
    <div slot="supporting-text">This will link you out in a new tab</div>
    <petal-icon slot="end">open_in_new</petal-icon>
  </petal-list-item>
</petal-list>
```

## Icon Items

Icons can be slotted into list-items' `start` or `end` slot.

<!-- no-catalog-start -->

![A list with three items and dividers separating each item. Each item has a
flower icon and the text Rose, Tulip or Daisy.](images/list/usage-icon.webp)

<!-- no-catalog-end -->
<!-- catalog-include "figures/list/usage-icon.html" -->

```html
<petal-list style="max-width: 300px">
  <petal-list-item>
    Rose
    <petal-icon slot="start">local_florist</petal-icon>
  </petal-list-item>
  <petal-divider></petal-divider>
  <petal-list-item>
    Tulip
    <petal-icon slot="start">filter_vintage</petal-icon>
  </petal-list-item>
  <petal-divider></petal-divider>
  <petal-list-item>
    Daisy
    <petal-icon slot="start">spa</petal-icon>
  </petal-list-item>
</petal-list>
```

## Image Items

Images should be slotted into list-items' `start` slot.

<!-- no-catalog-start -->

![A list with three image items with the texts Rose, Tulip and
Daisy.](images/list/usage-image.webp)

<!-- no-catalog-end -->
<!-- catalog-include "figures/list/usage-image.html" -->

```html
<petal-list style="max-width: 300px;">
  <petal-list-item>
    Rose
    <img slot="start" style="width: 56px" src="rose.jpg">
  </petal-list-item>
  <petal-divider></petal-divider>
  <petal-list-item>
    Tulip
    <img slot="start" style="width: 56px" src="tulip.jpg">
  </petal-list-item>
  <petal-divider></petal-divider>
  <petal-list-item>
    Daisy
    <img slot="start" style="width: 56px" src="daisy.jpg">
  </petal-list-item>
</petal-list>
```

## Accessibility

List can have its `role` and `tabindex` set via the `role` and `tabindex`
attributes, and list items can have their `role` and `tabindex` set via the
`type` and `tabindex` attributes respectively.

> NOTE: List item has a limited set of `type`s that can be set on it. This is to
> ensure that your list remains accessible with all other properties and options
> presented to it. See the `ListItemType` TypeScript type exported by list item
> for the current accepted values.

By default these values are set to
[`role="list"`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/list_role)<!-- {.external} -->
and `tabindex="-1"` for list, and
[`role="listitem"`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/listitem_role)<!-- {.external} -->
and `tabindex="0"` for list items.

## Theming

List and List Item supports
[Material theming](https://github.com/Saki340/petal-elements/blob/main/docs/theming/README.md)<!-- {.external} -->
and can be customized in terms of color, typography, and shape.

### List & List Item

Token                                           | Default value
----------------------------------------------- | -------------
`--md-list-container-color`                     | `--md-sys-color-surface`
`--md-list-item-container-shape`                | `--md-sys-shape-corner-none`
`--md-list-item-label-text-color`               | `--md-sys-color-on-surface`
`--md-list-item-supporting-text-color`          | `--md-sys-color-on-surface-variant`
`--md-list-item-trailing-supporting-text-color` | `--md-sys-color-on-surface-variant`
`--md-list-item-label-text-font`                | `--md-sys-typescale-label-large-font`
`--md-list-item-supporting-text-font`           | `--md-sys-typescale-body-medium-font`
`--md-list-item-trailing-supporting-text-font`  | `--md-sys-typescale-label-small-font`

*   [All List tokens](https://github.com/Saki340/petal-elements/blob/main/tokens/_md-comp-list.scss)
    <!-- {.external} -->
*   [All List Item tokens](https://github.com/Saki340/petal-elements/blob/main/tokens/_md-comp-list-item.scss)
    <!-- {.external} -->

### List & List Item Example

<!-- no-catalog-start -->

![Image of a list and list items of foods with their inventory stock number with
a different theme applied](images/list/theming-list.webp)

<!-- no-catalog-end -->
<!-- catalog-include "figures/list/theming-list.html" -->

```html
<style>
  :root {
    --md-list-container-color: #f4fbfa;
    --md-list-item-label-text-color: #161d1d;
    --md-list-item-supporting-text-color: #3f4948;
    --md-list-item-trailing-supporting-text-color: #3f4948;
    --md-list-item-label-text-font: system-ui;
    --md-list-item-supporting-text-font: system-ui;
    --md-list-item-trailing-supporting-text-font: system-ui;
  }
  [slot="trailing-supporting-text"] {
    width: 30px;
    text-align: end;
  }
</style>
<petal-list>
  <petal-list-item type="button">
    <div slot="headline">Apple</div>
    <div slot="supporting-text">In stock</div>
    <div slot="trailing-supporting-text">+100</div>
  </petal-list-item>
  <petal-list-item type="button">
    <div slot="headline">Banana</div>
    <div slot="supporting-text">In stock</div>
    <div slot="trailing-supporting-text">56</div>
  </petal-list-item>
  <petal-list-item type="button">
    <div slot="headline">Cucumber</div>
    <div slot="supporting-text">Low stock</div>
    <div slot="trailing-supporting-text">5</div>
  </petal-list-item>
</petal-list>
```

### Icon List Item

Token                                | Default value
------------------------------------ | -----------------------------------
`--md-list-item-leading-icon-color`  | `--md-sys-color-on-surface-variant`
`--md-list-item-trailing-icon-color` | `--md-sys-color-on-surface-variant`
`--md-list-item-leading-icon-size`   | `18px`
`--md-list-item-trailing-icon-size`  | `24px`

*   [All List Item tokens](https://github.com/Saki340/petal-elements/blob/main/tokens/_md-comp-list-item.scss)
    <!-- {.external} -->

### Icon List Item Example

<!-- no-catalog-start -->

![Image of a list and icon list items of food names with a different theme
applied](images/list/theming-icon.webp)

<!-- no-catalog-end -->
<!-- catalog-include "figures/list/theming-icon.html" -->

```html
<style>
  :root {
    background-color: #f4fbfa;
    --md-list-container-color: #f4fbfa;
    --md-list-item-label-text-color: #161d1d;
    --md-list-item-leading-icon-color: #006a6a;
    --md-list-item-trailing-icon-color: #006a6a;
    --md-list-item-leading-icon-size: 20px;
    --md-list-item-trailing-icon-size: 20px;
  }
  petal-list-item.unhealthy {
    --md-list-item-trailing-icon-color: #ba1a1a;
  }
</style>
<petal-list>
  <petal-list-item>
    <div slot="headline">Eggs</div>
    <petal-icon slot="start">egg</petal-icon>
    <petal-icon slot="end">recommend</petal-icon>
  </petal-list-item>
  <petal-list-item class="unhealthy">
    <div slot="headline">Ice Cream</div>
    <petal-icon slot="start">icecream</petal-icon>
    <petal-icon slot="end">dangerous</petal-icon>
  </petal-list-item>
  <petal-list-item>
    <div slot="headline">Orange</div>
    <petal-icon slot="start">nutrition</petal-icon>
    <petal-icon slot="end">recommend</petal-icon>
  </petal-list-item>
</petal-list>
```

### Avatar List Item

Token                                       | Default value
------------------------------------------- | -------------
`--md-list-item-leading-avatar-label-color` | `--md-sys-color-on-primary-container`
`--md-list-item-leading-avatar-label-font`  | `--md-sys-typescale-title-medium-font`
`--md-list-item-leading-avatar-color`       | `--md-sys-color-primary-container`
`--md-list-item-leading-avatar-size`        | `40px`
`--md-list-item-leading-avatar-shape`       | `--md-sys-shape-corner-full`

*   [All List Item tokens](https://github.com/Saki340/petal-elements/blob/main/tokens/_md-comp-list-item.scss)
    <!-- {.external} -->

### Image List Item

Token                                 | Default value
------------------------------------- | -------------
`--md-list-item-leading-image-height` | `56px`
`--md-list-item-leading-image-width`  | `56px`
`--md-list-item-leading-image-shape`  | `--md-sys-shape-corner-none`

*   [All List Item tokens](https://github.com/Saki340/petal-elements/blob/main/tokens/_md-comp-list-item.scss)
    <!-- {.external} -->

### Image List Item Example

<!-- no-catalog-start -->

![Image of a list and image list items of flowers with a different theme applied](images/list/theming-image.webp)

<!-- no-catalog-end -->
<!-- catalog-include "figures/list/theming-image.html" -->

```html
<style>
  :root {
    background-color: #f4fbfa;
    --md-list-container-color: #f4fbfa;
    --md-list-item-label-text-color: #161d1d;
    --md-list-item-leading-image-height: 50px;
    --md-list-item-leading-image-width: 100px;
    --md-list-item-leading-image-shape: 25px;
  }
  img {
    width: 40px;
  }
</style>
<petal-list>
  <petal-list-item headline="Rose">
    <img slot="start" src="rose-wide.jpg">
  </petal-list-item>
  <petal-list-item headline="Tulip">
    <img slot="start" src="tulip-wide.jpg">
  </petal-list-item>
  <petal-list-item headline="Daisy">
    <img slot="start" src="daisy-wide.jpg">
  </petal-list-item>
</petal-list>
```

<!-- auto-generated API docs start -->

## API


### PetalList <code>&lt;petal-list&gt;</code>

#### Properties

<!-- mdformat off(autogenerated might break rendering in catalog) -->

| Property | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `items` |  | `ListItem[]` | `undefined` |  |

<!-- mdformat on(autogenerated might break rendering in catalog) -->

#### Methods

<!-- mdformat off(autogenerated might break rendering in catalog) -->

| Method | Parameters | Returns | Description |
| --- | --- | --- | --- |
| `activateNextItem` | _None_ | `ListItem` | Activates the next item in the list. If at the end of the list, the first item will be activated. |
| `activatePreviousItem` | _None_ | `ListItem` | Activates the previous item in the list. If at the start of the list, the last item will be activated. |

<!-- mdformat on(autogenerated might break rendering in catalog) -->

### PetalListItem <code>&lt;petal-list-item&gt;</code>

#### Properties

<!-- mdformat off(autogenerated might break rendering in catalog) -->

| Property | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `disabled` | `disabled` | `boolean` | `false` | Disables the item and makes it non-selectable and non-interactive. |
| `type` | `type` | `ListItemType` | `'text'` | Sets the behavior of the list item, defaults to "text". Change to "link" or "button" for interactive items. |
| `href` | `href` | `string` | `''` | Sets the underlying `HTMLAnchorElement`'s `href` resource attribute. |
| `target` | `target` | `"" \| "_blank" \| "_parent" \| "_self" \| "_top"` | `''` | Sets the underlying `HTMLAnchorElement`'s `target` attribute when `href` is set. |
| `rel` | `rel` | `string` | `''` | Sets the underlying `HTMLAnchorElement`'s `rel` attribute when `href` is set. |
| `referrerPolicy` | `referrerpolicy` | `string` | `''` | Sets the underlying `HTMLAnchorElement`'s `referrerpolicy` attribute when `href` is set. |

<!-- mdformat on(autogenerated might break rendering in catalog) -->

#### Methods

<!-- mdformat off(autogenerated might break rendering in catalog) -->

| Method | Parameters | Returns | Description |
| --- | --- | --- | --- |
| `click` | _None_ | `void` |  |

<!-- mdformat on(autogenerated might break rendering in catalog) -->

#### Events

<!-- mdformat off(autogenerated might break rendering in catalog) -->

| Event | Type | [Bubbles](https://developer.mozilla.org/en-US/docs/Web/API/Event/bubbles) | [Composed](https://developer.mozilla.org/en-US/docs/Web/API/Event/composed) | Description |
| --- | --- | --- | --- | --- |
| `request-activation` | `Event` | Yes | Yes | Requests the list to set `tabindex=0` on the item and focus it. Used internally for list keyboard navigation; most applications do not need to listen for this event. It is exposed for authors building their own list-item replacements or wrapping items in a custom controller. |

<!-- mdformat on(autogenerated might break rendering in catalog) -->

<!-- auto-generated API docs end -->
