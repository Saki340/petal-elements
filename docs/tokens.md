# Design tokens

petal-elements generates its design tokens from source, never from screenshots
or memory.

## Sources

Pinned in [tokens/sources.json](../tokens/sources.json).

| Source | Role |
|---|---|
| Material Design web tokens, version 34.0.21, in [material-web](https://github.com/material-components/material-web) (`tokens/versions/latest/sass`) | **Primary.** All published values come from here. |
| [Jetpack Compose Material 3](https://github.com/androidx/androidx) `tokens/*Tokens.kt` | **Cross-check**, and the source of the expressive motion springs, which the web tokens do not have. |
| v0.192 (`tokens/versions/v0_192`) | What the stable components are built with today. Compared to see what changes when they move to the new tokens. |

## Pipeline

```
tokens/versions/latest/sass  ──► tokens/dtcg/web/*.tokens.json ──┐
                                                                 ├─► Style Dictionary ─► tokens/css/*.css
androidx *Tokens.kt (pinned) ──► tokens/dtcg/compose/*.tokens.json ┘   (expressive springs only)

web + compose + v0.192 ──► tokens/reports/*.md
```

```sh
npm run tokens            # regenerate everything
npm run check:tokens      # fail if generated files are out of date, or if a
                          # --md-sys-* property used by a component is missing
npm run tokens:upstream   # list token changes upstream since the pinned commits
```

The scripts are in [scripts/tokens](../scripts/tokens). Output is deterministic:
the same pinned commits produce byte-identical files. Compose sources are
downloaded once into `.cache/compose/<commit>/`.

### DTCG files

`tokens/dtcg/**/*.tokens.json` follow the
[W3C Design Tokens format](https://www.designtokens.org/tr/2025.10/format/)
(2025.10): colors as `{colorSpace, components, alpha, hex}`, dimensions and
durations as `{value, unit}`, references as `{md.sys.color.primary}`. A name
that is both a token and a group uses a `$root` token. Each file's root
`$description` and `$extensions["dev.petal-elements"]` record the source
repository, commit, file, copyright and license.

Compose names: system tokens use the web names (`ColorLightTokens.Primary` →
`md.sys.color.primary`); component tokens are
`md.comp.<object>.<property>` (`ButtonSmallTokens.ContainerHeight` →
`md.comp.button-small.container-height`). dp and sp become px.

Anything the scripts cannot read is an error. Tokens without a value in the
source (spring and motion-path composites) are listed in the reports.

### CSS

- `tokens/css/sys.css`: `--md-ref-typeface-*`, `--md-sys-color-*`,
  `--md-sys-typescale-*`, `--md-sys-shape-*`, `--md-sys-state-*`,
  `--md-sys-elevation-*`, `--md-sys-motion-*`.
- `tokens/css/sys-medium-contrast.css`, `sys-high-contrast.css`: color
  overrides; load after `sys.css`.

Colors use `light-dark()`, so `color-scheme` chooses the scheme:

```css
:root {
  color-scheme: light dark; /* follow the system; or `light` / `dark` */
}
```

References between emitted tokens stay `var()`, so overriding one property
carries through (for example `--md-ref-typeface-plain` changes every
`--md-sys-typescale-*-font`). Each typescale also has a `font` shorthand,
e.g. `--md-sys-typescale-body-large`.

Springs: CSS has no spring timing function, so each spring (stiffness and
damping ratio, unit mass) is sampled into a `linear()` easing plus the time it
takes to settle within 0.1%:

| Properties | Scheme | Source |
|---|---|---|
| `--md-sys-motion-spring-<speed>-<kind>[-duration]` | standard | web tokens |
| `--md-sys-motion-expressive-spring-<speed>-<kind>[-duration]` | expressive | Compose `ExpressiveMotionTokens` |

`<speed>` is `fast`, `default` or `slow`; `<kind>` is `spatial` (position,
size, shape; may overshoot) or `effects` (color, opacity).

## Findings (2026-10-08)

See [web-vs-compose.md](../tokens/reports/web-vs-compose.md) and
[web-vs-v0_192.md](../tokens/reports/web-vs-v0_192.md) for the full lists.

- The web tokens' `md.sys.motion.spring.*` are the **standard** motion scheme
  (Compose `StandardMotionTokens`). The expressive springs exist only in
  Compose; upstream's labs/gb button group hard-codes the expressive fast
  spatial spring.
- Web v34 vs Compose, system tokens: `on-*-container` colors in the light
  scheme are tone 30 on the web and tone 10 in Compose; five typescale letter
  spacings differ (e.g. body-medium 0.25px vs 0.2px); Compose uses the
  platform sans-serif instead of Roboto.
- Web v34 vs v0.192, system tokens: the same `on-*-container` change, and the
  focus and pressed state layer opacity went from 0.12 to 0.1.
- Component tokens differ in places worth checking before changing
  components, e.g. the selected container shapes of the size-based buttons
  (`round` and `square` are swapped between web and Compose).

## Updating

- Compose: the weekly "Upstream tokens" workflow reports changes. Set
  `compose.commit` in tokens/sources.json (and the commit named in
  [NOTICE](../NOTICE)) and run `npm run tokens`.
- Web: merge upstream (`git merge upstream/main`), run
  `node scripts/rebrand.js`, update `web` in tokens/sources.json (commit and
  version), and run `npm run tokens`. The scripts refuse files whose version
  does not match tokens/sources.json.

Review the diff of `tokens/reports/` in the same change.
