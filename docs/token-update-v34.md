<!-- catalog-only-start --><!-- ---
name: Token update v34
title: Token update v34
order: 11
-----><!-- catalog-only-end -->

# Token update: v0.192 → v34

The core components now take their token values from the Material Design web
tokens v34 instead of v0.192. This page lists what changes for users coming
from Material Web.

## Scope

| Moved to v34 | Components |
|---|---|
| System and reference tokens (`md.sys.*`, `md.ref.*`) | all components |
| Component tokens | button, icon button, FAB (incl. branded), checkbox, radio, switch, text field (and the shared field, so select's field too), chips, linear and circular progress, tabs |

The other components (dialog, list, menu, select menu, slider, cards, labs)
still use their v0.192 component tokens, with the new system tokens.

How: `npm run tokens` generates `tokens/versions/v34/`, Sass modules with the
same functions and keys as `tokens/versions/v0_192/` but v34 values
([scripts/tokens/sass.ts](../scripts/tokens/sass.ts)). The token wrappers in
`tokens/*.scss` for the components above point to them. CSS custom property
names do not change. Coverage: [tokens/reports/compat-v34.md](../tokens/reports/compat-v34.md).

## What looks different

Every change in the compiled CSS of the components above (167 declarations)
falls in one of these groups; the screenshots changed only where these apply.

| Change | Where | Count |
|---|---|---|
| `on-*-container` colors use tone 30 instead of 10 in the light scheme (e.g. `--md-sys-color-on-primary-container` #21005d → #4f378b) | filled tonal button and icon button, FAB icons and labels, selected filter and input chips, text field error hover, … | 94 |
| Focus and pressed state layer opacity 0.12 → 0.1 | pressed state of every interactive component | 29 |
| Chip outline uses `outline-variant` instead of `outline` | assist, filter, input, suggestion chips | 4 |
| Switch selected icon uses `primary` instead of `on-primary-container` | switch with icons | 4 |
| Color written as `#ffffff` instead of `#fff` (same color) | — | 36 |

Dark scheme: only the state layer opacity and the chip outline change.

## Deliberate deviations from the v34 data

Two deprecated v34 token sets were partly repurposed upstream. Using them as
they are would change the meaning of existing variants and leave
inconsistent colors, so the generator reads the newer sets instead
(`PREFERRED` in scripts/tokens/sass.ts):

- **FAB `primary`, `secondary`, `tertiary`** (and the extended FAB): v34's
  `md.comp.fab.primary` now has a primary container with an on-primary icon,
  but its hover and focus icon colors are still on-primary-container. The
  tonal colors these variants have always had are in
  `md.comp.fab.primary-container` (etc.), which is consistent, so the
  variants keep their tonal look. Filled FABs will be a new variant.
- **Standard icon button**: v34's `md.comp.icon-button` became the base of the
  new size-based icon buttons, where "selected" is a filled primary container;
  a selected standard icon button would get a white icon. Its values now come
  from `md.comp.icon-button.standard`.

## Differences from Jetpack Compose

v34 is the primary source. Where Compose differs (see
[tokens/reports/web-vs-compose.md](../tokens/reports/web-vs-compose.md)), v34
wins, e.g. the switch selected icon color (`primary` on the web,
`on-primary-container` in Compose).
