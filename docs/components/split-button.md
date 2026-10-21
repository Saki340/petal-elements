<!-- catalog-only-start --><!-- ---
name: Split button
dirname: splitbutton
-----><!-- catalog-only-end -->

<catalog-component-header>
<catalog-component-header-title slot="title">

# Split button

<!-- no-catalog-start -->

<!-- [TOC] -->

<!-- external-only-start -->
**This documentation is fully rendered on the
[petal-elements catalog](https://petal.anontokyo.vip/catalog/components/split-button/).**
<!-- external-only-end -->

<!-- no-catalog-end -->

[Split buttons](https://m3.material.io/components/split-button)<!-- {.external} -->
open a menu of actions related to the main action.

</catalog-component-header-title>

<img
    class="hero"
    alt="A filled split button with the label Save and a down arrow."
    title="A split button"
    src="images/splitbutton/hero.webp">

</catalog-component-header>

*   [Design article](https://m3.material.io/components/split-button) <!-- {.external} -->
*   [API Documentation](#api)
*   [Source code](https://github.com/Saki340/petal-elements/tree/main/splitbutton)
    <!-- {.external} -->

The values and the motion follow Jetpack Compose Material 3
(`SplitButtonLayout`, `SplitButtonDefaults`, `SplitButtonXSmallTokens` to
`SplitButtonXLargeTokens`).

## Usage

`<petal-split-button>` has a leading button for the main action and a trailing
button that toggles a menu. The label is the default slot and an optional icon
is the `icon` slot. A `click` on the split button is a click on the leading
button; the trailing button does not fire `click`.

<!-- no-catalog-start -->

![A filled split button](images/splitbutton/hero.webp)

<!-- no-catalog-end -->
<!-- catalog-include "figures/splitbutton/hero.html" -->

```html
<petal-split-button>
  Save
  <petal-icon slot="icon">save</petal-icon>
</petal-split-button>
<script type="module">
  import 'petal-elements/splitbutton/split-button.js';
  import 'petal-elements/icon/icon.js';
</script>
```

### Variants and sizes

`variant` is `filled` (the default), `tonal`, `elevated` or `outlined`. Each
half is the petal button of that variant, so its colors, elevation and outline
are the button's. `size` is `xsmall`, `small` (the default), `medium`, `large`
or `xlarge`, with the heights of `SplitButtonDefaults`: 32, 40, 56, 96 and
136px.

### Attaching a menu

The trailing button toggles `checked`, fires `input` and `change`, and sets
`aria-expanded` and `aria-haspopup="menu"`. Anchor a `<petal-menu>` to the
split button, open it on `change`, and uncheck the button when the menu closes:

```html
<petal-split-button id="split" variant="tonal" trailing-label="Save options">
  Save
</petal-split-button>
<petal-menu id="menu" anchor="split" anchor-corner="end-end" menu-corner="start-end">
  <petal-menu-item><div slot="headline">Save as...</div></petal-menu-item>
  <petal-menu-item><div slot="headline">Save a copy</div></petal-menu-item>
</petal-menu>
<script type="module">
  import 'petal-elements/splitbutton/split-button.js';
  import 'petal-elements/menu/menu.js';
  import 'petal-elements/menu/menu-item.js';

  const split = document.querySelector('#split');
  const menu = document.querySelector('#menu');
  split.addEventListener('change', () => {
    menu.open = split.checked;
  });
  menu.addEventListener('closed', () => {
    split.checked = false;
  });
  split.addEventListener('click', () => {
    // The main action.
  });
</script>
```

The menu does not close when the split button is clicked, because the split
button is its anchor. `focusTrailing()` moves the focus to the trailing
button, for example when the menu closes.

A trailing button that does something else than open a menu can be made
`uncheckable`: its icon does not turn, it has no `aria-expanded`, and it fires
`trailing-click` instead of `change`.

### Shape and motion

The outer corners are fully round. The inner corners (the end of the leading
button and the start of the trailing one) are 4, 4, 4, 8 and 12px for
`xsmall` to `xlarge`, and become 8, 12, 12, 20 and 20px while that button is
pressed. Checking the trailing button makes it a circle (all four corners
half the height), unless it is pressed. The corners morph on the default
effects spring of the page's [motion scheme](../theming/README.md). The
trailing content moves 0.11 of the difference between its start and end
corners toward the smaller corners, as Compose's `horizontalCenterOptically`.

While checked, the trailing button also shows its content color at 10% over its
container, and its icon turns 180 degrees on a spring with damping ratio 1 and
stiffness 1500 (Compose's default `spring()`, which `animateFloatAsState` uses
in its samples). With reduced motion the icon does not animate.

## Accessibility

The trailing button only shows an icon, so it needs an accessible name:
`trailing-label` (default `More options`). If the leading button has no text,
set `aria-label` on the split button. Compose's samples also give the
trailing button a tooltip; add a `<petal-tooltip>` if your design needs one.

Replace the arrow with an `<svg slot="trailing-icon">` or an icon element in
the `trailing-icon` slot. It is sized by the size's trailing icon size and
turns when checked.

## Theming

Split buttons support [Material theming](../theming/README.md). The colors are
the colors of the button variant (`--md-filled-button-*`,
`--md-filled-tonal-button-*`, `--md-elevated-button-*`,
`--md-outlined-button-*`). The sizes and the shapes use
`--md-split-button-<size>-*` custom properties, where `<size>` is `xsmall`,
`small`, `medium`, `large` or `xlarge`:

Token                                                    | Default value (small)
-------------------------------------------------------- | ---------------------
`--md-split-button-small-container-height`               | `40px`
`--md-split-button-small-between-space`                  | `2px`
`--md-split-button-small-inner-corner-size`              | `--md-sys-shape-corner-value-extra-small`
`--md-split-button-small-inner-pressed-corner-size`      | `--md-sys-shape-corner-value-medium`
`--md-split-button-small-leading-button-leading-space`   | `16px`
`--md-split-button-small-leading-button-trailing-space`  | `12px`
`--md-split-button-small-trailing-button-leading-space`  | `13px`
`--md-split-button-small-trailing-button-trailing-space` | `13px`
`--md-split-button-small-trailing-icon-size`             | `22px`

*   [Split button tokens](https://github.com/Saki340/petal-elements/blob/main/tokens/versions/compose/values/_md-comp-split-button-small.scss)
    <!-- {.external} -->

<!-- auto-generated API docs start -->

## API


### PetalSplitButton <code>&lt;petal-split-button&gt;</code>

#### Properties

<!-- mdformat off(autogenerated might break rendering in catalog) -->

| Property | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `variant` | `variant` | `SplitButtonVariant` | `'filled'` | `filled` (default), `tonal`, `elevated` or `outlined`. |
| `size` | `size` | `SplitButtonSize` | `'small'` | `xsmall`, `small` (default), `medium`, `large` or `xlarge`. |
| `disabled` | `disabled` | `boolean` | `false` | Whether both buttons are disabled. |
| `checked` | `checked` | `boolean` | `false` | Whether the trailing button is checked, which is when its menu is open. Its shape becomes a circle and its icon turns upside down. |
| `uncheckable` | `uncheckable` | `boolean` | `false` | Makes the trailing button a plain button: it cannot be checked, its icon does not turn and it fires `trailing-click` instead of `change`. |
| `trailingLabel` | `trailing-label` | `string` | `'More options'` | Accessible name of the trailing button, which only shows an icon. |

<!-- mdformat on(autogenerated might break rendering in catalog) -->

#### Methods

<!-- mdformat off(autogenerated might break rendering in catalog) -->

| Method | Parameters | Returns | Description |
| --- | --- | --- | --- |
| `focusTrailing` | `options` | `void` | Focuses the trailing button. |

<!-- mdformat on(autogenerated might break rendering in catalog) -->

#### Events

<!-- mdformat off(autogenerated might break rendering in catalog) -->

| Event | Type | [Bubbles](https://developer.mozilla.org/en-US/docs/Web/API/Event/bubbles) | [Composed](https://developer.mozilla.org/en-US/docs/Web/API/Event/composed) | Description |
| --- | --- | --- | --- | --- |
| `input` | `InputEvent` | Yes | Yes | Dispatched when the trailing button toggles |
| `change` | `Event` | Yes | No | Dispatched when the trailing button toggles |
| `trailing-click` | `Event` | Yes | Yes | Dispatched when an `uncheckable` trailing button is clicked |

<!-- mdformat on(autogenerated might break rendering in catalog) -->

#### Slots

<!-- mdformat off(autogenerated might break rendering in catalog) -->

| Slot | Description |
| --- | --- |
| _default_ | The label of the leading button. |
| `icon` | An icon in the leading button, before the label. |
| `trailing-icon` | Replaces the chevron of the trailing button. |

<!-- mdformat on(autogenerated might break rendering in catalog) -->

<!-- auto-generated API docs end -->
