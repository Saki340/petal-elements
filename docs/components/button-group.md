<!-- catalog-only-start --><!-- ---
name: Button group
dirname: button-group
-----><!-- catalog-only-end -->

<catalog-component-header>
<catalog-component-header-title slot="title">

# Button group

<!-- no-catalog-start -->

<!-- [TOC] -->

<!-- external-only-start -->
**This documentation is fully rendered on the
[petal-elements catalog](https://petal.anontokyo.vip/catalog/components/button-group/).**
<!-- external-only-end -->

<!-- no-catalog-end -->

[Button groups](https://m3.material.io/components/button-groups)<!-- {.external} -->
arrange related buttons in a row. A Material 3 Expressive component.

</catalog-component-header-title>

<img
    class="hero"
    alt="A standard and a connected button group."
    src="images/buttongroup/hero.webp">

</catalog-component-header>

*   [Design article](https://m3.material.io/components/button-groups) <!-- {.external} -->
*   [API Documentation](#api)
*   [Source code](https://github.com/Saki340/petal-elements/tree/main/buttongroup)
    <!-- {.external} -->

## Usage

Put buttons in a `<petal-button-group>`. In a standard group the buttons are
spaced apart. In standard and connected groups, a pressed button widens by
15% of its width and the other buttons make room, while the group keeps its
width. Like Compose, the press runs on a spring (it bounces with the
expressive motion scheme) and a quick tap still widens three quarters of the
way before it springs back.

<!-- no-catalog-start -->

![A standard button group with three filled tonal buttons](images/buttongroup/usage.webp)

<!-- no-catalog-end -->
<!-- catalog-include "figures/buttongroup/usage.html" -->

```html
<petal-button-group>
  <petal-filled-tonal-button>Day</petal-filled-tonal-button>
  <petal-filled-tonal-button>Week</petal-filled-tonal-button>
  <petal-filled-tonal-button>Month</petal-filled-tonal-button>
</petal-button-group>
```

### Connected

`connected` places the buttons 2px apart with small inner corners. The inner
corners get smaller while a button is pressed, and a selected toggle button is
fully round. With `single-select`, selecting a toggle button deselects the
others, and clicking the selected one keeps it selected.

<!-- no-catalog-start -->

![A connected, single-select button group; the second button is
selected](images/buttongroup/usage-connected.webp)

<!-- no-catalog-end -->
<!-- catalog-include "figures/buttongroup/usage-connected.html" -->

```html
<petal-button-group connected single-select>
  <petal-filled-tonal-button toggle>Day</petal-filled-tonal-button>
  <petal-filled-tonal-button toggle selected>Week</petal-filled-tonal-button>
  <petal-filled-tonal-button toggle>Month</petal-filled-tonal-button>
</petal-button-group>
```

### Sizes

`size` (`xsmall` to `xlarge`, default `small`) sets the spacing and corners of
the group. Buttons without their own `size` get the group's size.

<!-- no-catalog-start -->

![Connected button groups in the sizes extra small, small and
medium](images/buttongroup/usage-sizes.webp)

<!-- no-catalog-end -->
<!-- catalog-include "figures/buttongroup/usage-sizes.html" -->

```html
<div style="display: grid; gap: 16px; justify-items: center">
  <petal-button-group connected size="xsmall">
    <petal-outlined-button>One</petal-outlined-button>
    <petal-outlined-button>Two</petal-outlined-button>
    <petal-outlined-button>Three</petal-outlined-button>
  </petal-button-group>
  <petal-button-group connected size="small">
    <petal-outlined-button>One</petal-outlined-button>
    <petal-outlined-button>Two</petal-outlined-button>
    <petal-outlined-button>Three</petal-outlined-button>
  </petal-button-group>
  <petal-button-group connected size="medium">
    <petal-outlined-button>One</petal-outlined-button>
    <petal-outlined-button>Two</petal-outlined-button>
    <petal-outlined-button>Three</petal-outlined-button>
  </petal-button-group>
</div>
```

### Mouse hover

With a mouse or trackpad, the hovered button goes 30% of the way to its
press: it widens by 30% of the pressed share, its neighbors make room, and in
connected groups its inner corners go 30% of the way to the pressed ones. It
widens on the fast spatial spring and goes back on the default spatial one.
This is a petal-elements addition; touch screens and reduced motion keep
Compose's behavior.

## Accessibility

The group has `role="group"`. Give it an accessible name with `aria-label` or
`aria-labelledby` when the buttons' purpose is not clear on its own.

```html
<petal-button-group aria-label="Calendar view" connected single-select>
  <petal-filled-tonal-button toggle selected>Day</petal-filled-tonal-button>
  <petal-filled-tonal-button toggle>Week</petal-filled-tonal-button>
</petal-button-group>
```

Toggle buttons set `aria-pressed`.

In a `single-select` group, the keyboard works like a radio group: only the
selected button (or the first one) is in the tab order, and the arrow keys,
Home and End move to another button and select it. Disabled buttons are
skipped.

## Theming

A button group has no tokens of its own; its spacing and corners come from
`md.comp.button-group.*` in the Material Design tokens v34. Theme the buttons
inside it as usual. See
[Material 3 Expressive features](../expressive.md#button-group) for the values.

<!-- auto-generated API docs start -->

## API


### PetalButtonGroup <code>&lt;petal-button-group&gt;</code>

#### Properties

<!-- mdformat off(autogenerated might break rendering in catalog) -->

| Property | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `size` | `size` | `ButtonSize` | `'small'` | Size of the group and of buttons that have no size of their own. |
| `connected` | `connected` | `boolean` | `false` | Connected layout: buttons 2px apart with small inner corners. |
| `singleSelect` | `single-select` | `boolean` | `false` | Only one toggle button can be selected. Selecting one deselects the others; clicking the selected one keeps it selected. Like a radio group, only the selected button is in the tab order, and arrow keys (and Home, End) move the selection. |

<!-- mdformat on(autogenerated might break rendering in catalog) -->

#### Slots

<!-- mdformat off(autogenerated might break rendering in catalog) -->

| Slot | Description |
| --- | --- |
| _default_ | The buttons: `petal-*-button` elements, toggle buttons for selection. |

<!-- mdformat on(autogenerated might break rendering in catalog) -->

<!-- auto-generated API docs end -->
