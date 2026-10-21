<!-- catalog-only-start --><!-- ---
name: Motion
title: Motion
order: 5
-----><!-- catalog-only-end -->

# Motion

<!-- [TOC] -->

Components move on springs, like Jetpack Compose Material 3. This page lists
the springs, what each component animates, how to use the same springs in
your own CSS and script, page-level transitions, mouse hover, and reduced
motion.

Components animate by themselves. Do not add your own transitions or
animations to them; style your own elements with the springs below instead.

## Motion schemes

A motion scheme is a set of six springs. Compose has two:

*   **Expressive** (`MotionScheme.expressive()`, the default, as in Compose's
    `MaterialExpressiveTheme`). Spatial springs overshoot a little.
*   **Standard** (`MotionScheme.standard()`). Calmer, with almost no
    overshoot.

`tokens/css/sys.css` uses the expressive scheme. Load
`tokens/css/motion-standard.css` after it for the standard scheme on the whole
page:

```html
<link rel="stylesheet" href="node_modules/petal-elements/tokens/css/sys.css">
<link rel="stylesheet" href="node_modules/petal-elements/tokens/css/motion-standard.css">
```

To use it for part of a page only, copy its rule into a class and put the class
on that part. `motion-expressive.css` switches back.

## Springs

| Spring | Use | Expressive (damping / stiffness) | Standard |
| --- | --- | --- | --- |
| `fast-spatial` | Small things that move or change shape: buttons, switches, chips | 0.6 / 800 | 0.9 / 1400 |
| `default-spatial` | Medium movements: menus, sheets, drawers, indicators | 0.8 / 380 | 0.9 / 700 |
| `slow-spatial` | Large movements: full-screen views, long distances | 0.8 / 200 | 0.9 / 300 |
| `fast-effects` | Quick color and opacity changes | 1 / 3800 | 1 / 3800 |
| `default-effects` | Color and opacity changes | 1 / 1600 | 1 / 1600 |
| `slow-effects` | Slow fades | 1 / 800 | 1 / 800 |

*Spatial* springs are for position, size and shape; *effects* springs for
color and opacity, which should not overshoot (their damping is 1).

Each spring is a set of CSS custom properties, which follow the page's scheme:

| Property | Value |
| --- | --- |
| `--md-sys-motion-spring-<name>` | The spring as a `linear()` easing, from 0 to 1 |
| `--md-sys-motion-spring-<name>-duration` | How long the spring takes to settle, for example `359ms` |
| `--md-sys-motion-spring-<name>-damping` | Damping ratio, for script |
| `--md-sys-motion-spring-<name>-stiffness` | Stiffness, for script |

The fixed `--md-sys-motion-expressive-spring-*` and
`--md-sys-motion-standard-spring-*` properties hold each scheme's values.

### In CSS

Use the easing and its duration together in a transition:

```css
.panel {
  transition:
    translate var(--md-sys-motion-spring-default-spatial-duration)
      var(--md-sys-motion-spring-default-spatial),
    opacity var(--md-sys-motion-spring-default-effects-duration)
      var(--md-sys-motion-spring-default-effects);
}

.panel.hidden {
  translate: 0 100%;
  opacity: 0;
}
```

A CSS transition restarts from the current value when it is interrupted, but
not with the current speed, as a real spring would. For most hover, toggle and
open-close changes this is not noticeable.

### In script

For the Web Animations API, read the same properties:

```js
const style = getComputedStyle(document.documentElement);
element.animate(
  [{transform: 'scale(0.8)', opacity: 0}, {transform: 'none', opacity: 1}],
  {
    duration: parseFloat(style.getPropertyValue('--md-sys-motion-spring-default-spatial-duration')),
    easing: style.getPropertyValue('--md-sys-motion-spring-default-spatial'),
  },
);
```

`-damping` and `-stiffness` give the spring's physics, for animations that
follow a drag or must keep their speed when the target changes.

### Older easing tokens

`--md-sys-motion-easing-*` (`standard`, `emphasized`, ...) and
`--md-sys-motion-duration-*` (`short1` to `extra-long4`) are the Material 3
easing curves and durations. Components no longer use them; prefer the
springs.

## What the components animate

All of these follow the page's motion scheme, and turn off with reduced
motion (see below).

| Component | Motion |
| --- | --- |
| Buttons (`size`) | Corners morph to the pressed shape on the default effects spring (no bounce, as Compose's `Button`); toggle buttons on fast spatial. See [Expressive](expressive.md). |
| Button group | The pressed button widens by 15% and the others make room, on fast spatial. |
| Icon button (`size`) | Corners morph to the pressed shape on default effects. |
| FAB | An extended FAB collapses to its icon (`expanded`) on fast spatial; the label fades on fast effects. |
| FAB menu | The button morphs into a close button; items come in one after another. |
| Floating toolbar | Expands and collapses on fast spatial. |
| Split button | The trailing button morphs while checked; its chevron turns. |
| Switch, checkbox, radio | The thumb moves and resizes on fast spatial; the check mark draws on default spatial; the radio dot grows on fast spatial. |
| Chips | A selected filter chip's check mark grows in on fast spatial. |
| Text field, select | The label floats on fast spatial; indicator and outline colors on fast effects. |
| Menu, select menu | Scales in from 80% from the anchor's corner and fades (default spatial and default effects); closes the same way back. |
| Dialog | Scales in from 80% and fades in; closes on fast effects. |
| Bottom sheet | Opens and settles on default spatial; dragged, it keeps the drag's speed. |
| Navigation drawer | Opens on default spatial, closes on fast effects. |
| Navigation bar, rail | The selection indicator grows from its center on default spatial; an expanding rail widens on default spatial. |
| Tabs | The indicator moves and resizes on default spatial. |
| Top app bar | Medium and large bars collapse as the page scrolls (the title follows the scroll); the container color changes when content scrolls under the bar. |
| Bottom app bar | `hide-on-scroll` slides it away; it settles on fast spatial. |
| Search | The view opens on slow spatial and closes on default spatial. |
| Carousel | Items grow and shrink as they scroll, following the scroll. |
| Date picker | Months slide (default spring for the arrows, default effects for a swipe); the year grid unfolds over the calendar on default effects. |
| Time picker | A tap moves the dial's handle on default spatial; the hour and minute faces cross-fade on default effects. |
| Loading indicator | Shapes morph into each other every 650ms while turning. |
| Progress | Wavy indicators move their wave; with `animate-value`, a new value is reached on slow spatial instead of jumping. |
| Pull to refresh | The flower opens with the pull, spins while refreshing, and folds and slides away when done. |
| Ripple | A circle grows from the pointer on press. |
| Lists, menus with groups | Item corners grow on hover, focus and selection on fast spatial. |

Endless animations (loading indicators, wavy progress) draw only while they
are in the viewport, and pick up again when they scroll back into view.

Each component's page describes its motion in detail under *Compose behavior*
or *Motion*. Methods that open and close (`show()`, `close()`) return promises
that resolve after the animation, and `quick` skips the animation where a
component has it.

## Mouse hover

With a mouse or trackpad, components preview their press: they go 30% of the
way toward their pressed look while hovered, on the fast spatial spring, and
back on the default spatial one. This is a petal-elements addition (Compose
has no hover shapes). It needs no setup.

*   Sized buttons and icon buttons: corners toward the pressed shape.
*   Button groups: the hovered button widens a little and connected inner
    corners tighten.
*   Switches: the thumb grows toward its pressed size.
*   Clickable cards: lift 3px, with a light that follows the pointer.
*   Icon buttons: the icon moves by its name (`arrow_forward` forward,
    `settings` turns, `favorite` grows); `icon-motion` chooses or turns it off.
*   FAB with `follow-pointer`: moves up to 4px toward a near pointer.

Touch screens (`(hover: none)` or a coarse pointer) keep Compose's look.

## Page transitions

### Theme switch

`transitionTheme(apply, origin)` from `theme/theme-transition.js` changes the
theme with a circle that grows from the pressed control, using the View
Transitions API.

```js
import {transitionTheme} from 'petal-elements/theme/theme-transition.js';

toggle.addEventListener('click', (event) => {
  transitionTheme(() => {
    const dark = document.documentElement.style.colorScheme !== 'dark';
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
  }, event);
});
```

`apply` makes the change; `origin` is the click event, an element, or
`{x, y}`. It returns a promise that resolves when the transition ends. Without
View Transitions support, or with reduced motion, it applies the change at
once. See [Theming](theming/README.md#theme-transition).

### Your own page transitions

For changes between views of a single-page app, use the View Transitions API
with the springs:

```js
function go(render) {
  if (!document.startViewTransition || matchMedia('(prefers-reduced-motion: reduce)').matches) {
    render();
    return;
  }
  document.startViewTransition(render);
}
```

```css
::view-transition-group(*) {
  animation-duration: var(--md-sys-motion-spring-default-spatial-duration);
  animation-timing-function: var(--md-sys-motion-spring-default-spatial);
}

::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: var(--md-sys-motion-spring-default-effects-duration);
}
```

Give shared elements (a card and the detail page's header) the same
`view-transition-name` so that one grows into the other.

## Reduced motion

When the system asks for reduced motion
(`prefers-reduced-motion: reduce`), components change at once: no shape
morphs, slides, scales, ripples, waves or hover movement. Colors still
change, and hover still changes shapes, without movement.

Do the same in your own styles:

```css
@media (prefers-reduced-motion: reduce) {
  .panel {
    transition-duration: 0s;
  }
}
```

Check for it in script before starting an animation, as above with
`matchMedia('(prefers-reduced-motion: reduce)')`.
