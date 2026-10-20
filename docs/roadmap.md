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

## Next

Roughly in this order:

*   Move the remaining components (dialog, list, menu, select, slider, ...) to
    the v34 token values.
*   More Expressive components and features, checked against Compose:
    split button, toolbar, loading indicator, FAB menu, the new FAB sizes,
    shape morphing for icon buttons.
*   Components that are missing, for example navigation bar and rail, top app
    bar, snackbar, card, badge, tooltip, search, date and time pickers.
*   Comparing the renderings with Jetpack Compose Material 3 screenshots.
