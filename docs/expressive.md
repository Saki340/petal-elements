# Material 3 Expressive features

Additions on top of the components inherited from material-web. Values come from the
Material Design web tokens v34 (see [tokens.md](tokens.md)); behavior follows
Jetpack Compose Material 3. Where Compose's `*Defaults` deliberately override a
token, the components follow Compose, and this page lists each case.

All additions are opt-in: without the new attributes, components look and
behave as before.

## Buttons: sizes, shapes, toggle

Applies to `petal-filled-button`, `petal-filled-tonal-button`,
`petal-outlined-button`, `petal-elevated-button` and `petal-text-button`
(no toggle for text buttons).

```html
<petal-filled-button size="medium">Save</petal-filled-button>
<petal-filled-button size="small" shape="square">Save</petal-filled-button>
<petal-filled-tonal-button size="small" toggle selected>Bold</petal-filled-tonal-button>
```

| Attribute | Values | Effect |
|---|---|---|
| `size` | `xsmall`, `small`, `medium`, `large`, `xlarge` | Height 32 / 40 / 56 / 96 / 136px, with the padding, icon size, label typescale, icon spacing and shapes of that size (`md.comp.button.<size>`). The shape morphs while pressed. |
| `shape` | `round` (default), `square` | Container shape of a sized button. |
| `toggle` | boolean | Toggles `selected` on click, sets `aria-pressed`, fires `input` and `change`. Colors from `md.comp.button.{filled,tonal,outlined,elevated}.{unselected,selected}`. A selected round button becomes square-cornered and a selected square one round. |
| `selected` | boolean | Selected state of a toggle button. |

Like the icon button, the toggle happens after other click listeners run;
calling `preventDefault()` on the click keeps the state.

Shape morph: a fully rounded corner is `height / 2` (not 9999px), so the
radius animates smoothly. The outline follows the animated shape; the focus
ring takes the new shape at once.

### Motion

Shape changes use the springs as `linear()` easings
(`--md-sys-motion-spring-*`, see [tokens.md](tokens.md)). These are the
standard motion scheme by default; load `tokens/css/motion-expressive.css`
(after `sys.css`) for the expressive scheme, like Compose's
`MotionScheme.expressive()`.

### Deviations from the tokens

| Token value | Used | Source |
|---|---|---|
| Pressed shape of a plain button morphs with `md.sys.motion.spring.fast.spatial` | default effects spring (no bounce) | `Button.kt`: "MotionSchemeKeyTokens.DefaultEffects is intentional here to prevent any bounce" |
| Small pressed shape `corner.small` (8px) | 6px | `ButtonDefaults` / `ToggleButtonDefaults` pressed shape for the small size |
| xsmall icon-label space 8px | 4px | `ButtonDefaults.ExtraSmallIconSpacing` |
| Outlined selected toggle: no tokens for outline | no outline (also disabled) | `OutlinedToggleButton`: no border when checked |

Toggle buttons morph with the fast spatial spring (`ToggleButton.kt`).

## Button group

```html
<petal-button-group>
  <petal-filled-tonal-button>One</petal-filled-tonal-button>
  <petal-filled-tonal-button>Two</petal-filled-tonal-button>
</petal-button-group>
<petal-button-group connected single-select size="medium">…</petal-button-group>
```

| Attribute | Effect |
|---|---|
| `size` (default `small`) | Spacing and corners from `md.comp.button-group.{standard,connected}.<size>`; buttons without a `size` get this one. |
| `connected` | Buttons 2px apart; outer corners full, inner corners `inner-corner.corner-size`, smaller while pressed, fully rounded when selected (pressed wins), as in Compose's `ButtonGroupDefaults.connected*ButtonShapes`. |
| `single-select` | Selecting a toggle button deselects the others; clicking the selected one keeps it selected. |

Standard groups: a pressed button widens by `pressed.item.width.multiplier`
(15%) of its width and its neighbors give way, at most their leading padding;
a middle button takes half from each side (Compose's `ButtonGroup` layout).
The group's total width does not change. On the web the space moves through
the buttons' inline padding, so labels are never cut off. The change animates
with the fast spatial spring. `prefers-reduced-motion` turns the animations
off, here and for sized buttons.

## Filled FAB

```html
<petal-fab variant="filled-primary" aria-label="Edit">…</petal-fab>
<petal-fab variant="filled-tertiary" label="Compose">…</petal-fab>
```

`variant` takes `filled-primary`, `filled-secondary` and `filled-tertiary`
besides the container variants (`primary`, ... keep their
`primary-container`-based colors). Container, icon and state layer come from
`md.comp.fab.{primary,secondary,tertiary}` (for example container `primary`,
icon and state layer `on-primary`), the label from
`md.comp.extended-fab.{primary,secondary,tertiary}`. Only the non-deprecated
`focused.*` / `hovered.*` tokens are used; the deprecated `focus.*` / `hover.*`
ones still point at the container colors. Sizes, shape and elevation are the
same as for the other variants.

Compose has no solid FAB tokens: `FloatingActionButton` takes any
`containerColor` with `contentColorFor()` (`primary` gives `onPrimary`), which
matches these tokens.
