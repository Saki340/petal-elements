<!-- catalog-only-start --><!-- ---
name: Ripple
dirname: ripple
ssrOnly: true
-----><!-- catalog-only-end -->

<catalog-component-header image-align="start">
<catalog-component-header-title slot="title">

# Ripple

<!-- no-catalog-start -->

<!-- [TOC] -->

<!-- external-only-start -->
**This documentation is fully rendered on the
[petal-elements catalog](https://petal.anontokyo.vip/catalog/components/ripple/)<!-- {.external} -->**
<!-- external-only-end -->

<!-- no-catalog-end -->

Ripples are
[state layers](https://m3.material.io/foundations/interaction/states/state-layers)<!-- {.external} -->
used to communicate the status of a component or interactive element.

A state layer is a semi-transparent covering on an element that indicates its
state. A layer can be applied to an entire element or in a circular shape.

</catalog-component-header-title>

<img
    alt="A container that shows a ripple when pressed."
    title="A ripple"
    src="images/ripple/hero.webp">

</catalog-component-header>

*   [Design article](https://m3.material.io/foundations/interaction/states/state-layers)
    <!-- {.external} -->
*   [API Documentation](#api)
*   [Source code](https://github.com/Saki340/petal-elements/tree/main/ripple)
    <!-- {.external} -->

<!-- catalog-only-start -->

<!--

## Interactive Demo

{% playgroundexample dirname=dirname %}

-->

<!-- catalog-only-end -->

## Usage

Ripples display on hover and press pointer interactions. They may be attached to
a control in one of three ways.

<!-- no-catalog-start -->

![A container that displays a bounded ripple on interaction.](images/ripple/usage.webp "A bounded ripple.")

<!-- no-catalog-end -->
<!-- catalog-include "figures/ripple/usage.html" -->

1.  Attached to the parent element

    ```html
    <style>
      .container {
        position: relative;
      }
    </style>
    <button class="container">
      <petal-ripple></petal-ripple>
    </button>
    ```

1.  Attached to a referenced element

    ```html
    <style>
      .container {
        position: relative;
      }
    </style>
    <div class="container">
      <petal-ripple for="control"></petal-ripple>
      <input id="control">
    </div>
    ```

1.  Attached imperatively

    ```html
    <style>
      .container {
        position: relative;
      }
    </style>
    <div class="container">
      <petal-ripple id="ripple"></petal-ripple>
      <button id="ripple-control"></button>
    </div>
    <script>
      const ripple = document.querySelector('#ripple');
      const control = document.querySelector('#ripple-control');
      ripple.attach(control);
    </script>
    ```

> Note: ripples must be placed within a `position: relative` container.

### Unbounded

To create an unbounded circular ripple centered on an element, use the following styles.

```css
.container {
  display: flex;
  place-content: center;
  place-items: center;
  position: relative;
}

petal-ripple.unbounded {
  border-radius: 50%;
  inset: unset;
  height: var(--state-layer-size);
  width: var(--state-layer-size);
}
```

<!-- no-catalog-start -->

![A circular container with an inner circle that displays an unbounded ripple around it on interaction.](images/ripple/usage-unbounded.webp "An unbounded ripple.")

<!-- no-catalog-end -->
<!-- catalog-include "figures/ripple/usage-unbounded.html" -->

```html
<style>
  .container {
    border-radius: 50%;
    height: 32px;
    width: 32px;

    /* Needed for unbounded ripple */
    display: flex;
    place-content: center;
    place-items: center;
    position: relative;
  }

  petal-ripple.unbounded {
    /* Needed for unbounded ripple */
    border-radius: 50%;
    inset: unset;
    height: 64px;
    width: 64px;
  }
</style>
<button class="container">
  <petal-ripple class="unbounded"></petal-ripple>
</button>
```

## Accessibility

Ripples are visual components and do not have assistive technology requirements.

## Theming

Ripples support [Material theming](../theming/README.md) and can be customized
in terms of color.

### Tokens

Token                    | Default value
------------------------ | ------------------------
`--md-ripple-hover-color` | `--md-sys-color-on-surface`
`--md-ripple-pressed-color` | `--md-sys-color-on-surface`

*   [All tokens](https://github.com/Saki340/petal-elements/blob/main/tokens/_md-comp-ripple.scss)
    <!-- {.external} -->

### Example

<!-- no-catalog-start -->

![Image of a ripple with a different theme applied](images/ripple/theming.webp "Ripple theming example.")

<!-- no-catalog-end -->
<!-- catalog-include "figures/ripple/theming.html" -->

```html
<style>
:root {
  --md-sys-color-primary: #006A6A;
  --md-ripple-hover-color: var(--md-sys-color-primary);
  --md-ripple-pressed-color: var(--md-sys-color-primary);
}

.container {
  position: relative;
}
</style>
<button class="container">
  <petal-ripple></petal-ripple>
</button>
```

<!-- auto-generated API docs start -->

## API


### PetalRipple <code>&lt;petal-ripple&gt;</code>

#### Properties

<!-- mdformat off(autogenerated might break rendering in catalog) -->

| Property | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `disabled` | `disabled` | `boolean` | `false` | Disables the ripple. |
| `htmlFor` |  | `string` | `undefined` |  |
| `control` |  | `HTMLElement` | `undefined` |  |

<!-- mdformat on(autogenerated might break rendering in catalog) -->

#### Methods

<!-- mdformat off(autogenerated might break rendering in catalog) -->

| Method | Parameters | Returns | Description |
| --- | --- | --- | --- |
| `attach` | `control` | `void` |  |
| `detach` | _None_ | `void` |  |

<!-- mdformat on(autogenerated might break rendering in catalog) -->

<!-- auto-generated API docs end -->
