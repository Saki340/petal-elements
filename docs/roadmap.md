<!-- catalog-only-start --><!-- ---
name: Roadmap
title: Roadmap
order: 4
-----><!-- catalog-only-end -->

# Roadmap

<!-- [TOC] -->

This page lists what petal-elements has done and what it plans to do. Plans
can change; open a discussion on
[GitHub](https://github.com/Saki340/petal-elements)<!-- {.external} --> if you
need something that is not here.

## Done

### 0.1

*   Fork of material-web (2026-10) with `petal-` tags and the `petal-elements`
    package. CSS custom properties keep their `--md-` names.
*   Token pipeline: Material Design web tokens v34 → W3C design token (DTCG)
    files → CSS (`tokens/css/`), checked against Jetpack Compose Material 3.
    See [Design tokens](tokens.md).
*   Core components on the v34 token values: buttons, icon buttons, FAB,
    checkbox, radio, switch, text fields, chips, progress indicators and tabs.
    See [Token update v0.192 → v34](token-update-v34.md).
*   Material 3 Expressive, opt-in: button sizes (`xsmall` to `xlarge`), round
    and square shapes, toggle buttons, shape morphing with spring motion, the
    expressive motion scheme, button groups and solid FABs. See
    [Material 3 Expressive features](expressive.md).
*   Pixel-exact visual regression tests (Playwright) and doc images rendered
    from the components.

### 0.2 (next release)

*   Every component follows Jetpack Compose Material 3: sizes, colors, shapes
    and motion are read from the Compose source (pinned commit), not from the
    web token tables. This changes many components; see the
    [changelog](https://github.com/Saki340/petal-elements/blob/main/CHANGELOG.md)<!-- {.external} -->
    and [Using in an existing site](migrating.md).
*   New components: navigation bar, rail and drawer, top app bar, bottom
    sheet, search bar, snackbar, tooltip, badge, split button, floating
    toolbar, FAB menu, loading indicator, pull to refresh, grouped menus and
    segmented lists.
*   Out of labs: cards, segmented buttons, and the form behaviors and
    `petal-item` the components build on. Upstream's experimental `labs/gb`
    and `labs/aria` are removed.
*   Motion: the expressive spring scheme by default, shape morphing on
    springs, a press ripple from the pointer, a circular theme transition
    (`transitionTheme()`), wavy progress indicators and `animate-value`.

## Next

Roughly in this order:

*   Missing components, after Compose: carousel, date ranges for the date
    picker, and the Expressive time picker styles.
*   Expressive details for the mouse: hover states that hint at the press,
    for desktop pages.
*   Public springs: the spring motion the components use, for your own
    animations.
*   Shapes: the Material 3 Expressive shape set and morphing between shapes.
*   Page transitions with the View Transitions API, in the same motion as the
    components.
