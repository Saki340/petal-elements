# Licensing

petal-elements is licensed under the Apache License 2.0, like the projects it
builds on. This page records how we handle attribution and third-party
material.

## Upstream sources

| Source | License | Copyright | Used for |
|---|---|---|---|
| [material-components/material-web](https://github.com/material-components/material-web) | Apache-2.0 | Google LLC | The whole code base, including the Material Design web tokens in `tokens/versions/` |
| [androidx/androidx](https://github.com/androidx/androidx) (Jetpack Compose Material 3 `tokens/*Tokens.kt`, pinned commit in `tokens/sources.json`) | Apache-2.0 | The Android Open Source Project | `tokens/dtcg/compose/` (cross-check) and the expressive springs in `tokens/css/sys.css`; see [tokens.md](tokens.md) |

Sources added later (for example
[material-color-utilities](https://github.com/material-foundation/material-color-utilities))
are added to this table and to [NOTICE](../NOTICE) in the same change that
first brings their material into the repository.

## File headers

- Files from upstream keep their original `@license` / SPDX header.
- Upstream files we change get one extra line under the SPDX line
  (Apache-2.0 section 4(b)):

  ```
  Modified for petal-elements; modifications Copyright <year> Saki. See NOTICE.
  ```

  `scripts/rebrand.ts` adds it automatically to the files it changes. Add it by
  hand when editing other upstream files. Files without comments (JSON,
  images) are covered by NOTICE and the git history.
- New files use:

  ```
  Copyright <year> Saki
  SPDX-License-Identifier: Apache-2.0
  ```

- Generated files must say where they come from: source repository, pinned
  commit, that they are generated, and the original copyright and license
  notice of the source. The token scripts do this: CSS files in a comment
  header, DTCG JSON files in the root `$description` and
  `$extensions["dev.petal-elements"]`.

## Names and content

- Package, tag and brand names do not contain `material` or `md-`. CSS custom
  properties keep the `--md-*` names so existing themes keep working.
- We do not copy text or images from m3.material.io. Values come from the token
  sources above.

## Dependencies

`npm run check:licenses` reads every installed package (after `npm ci`) and
fails on licenses outside the allowlist in `scripts/check-licenses.ts`.
Runtime dependencies must be permissive (MIT, ISC, BSD, Apache-2.0, 0BSD,
W3C). A few more licenses are allowed for build and test tools only. CI runs
this check.

## Third-party asset audit (2026-10-08)

Audit of fonts and images in `docs/` and `catalog/` at the start of the
project.

| Asset | Finding | Action |
|---|---|---|
| `catalog/site/fonts/google-sans/regular.woff2`, `mono.woff2` | Google Sans and Google Sans Mono. No license file in the repository, and we could not confirm an open font license for these files. | Removed, with their `@font-face` rules. The catalog falls back to Roboto / system fonts. |
| `docs/images/what-is-material.webp` | Sample app screenshot with photos of people. Source unknown. | Removed. |
| `docs/theming/images/theming.webp` | Collage with Google product logos and stock photos. Source unknown. | Removed. |
| `docs/theming/images/color-scheme-light.webp`, `color-scheme-dark.webp`, `token-types.webp` | Diagrams in Material Design site style. Source not recorded. | Kept for now; to be replaced with our own diagrams when the docs are rewritten. |
| `docs/images/material-web.gif` | Animation of upstream components. | Kept; not used by our README. |
| `docs/components/images/**` (112 files) | Screenshots of the upstream components, added by upstream contributors. | Kept; to be regenerated from our own components. |
| `catalog/site/images/favicon.svg` | Upstream catalog icon. | Kept; to be replaced with our own icon. |
| Web fonts loaded from fonts.googleapis.com (Roboto, Open Sans, Google Sans, Material Symbols) in demos and the catalog | Loaded at runtime, not redistributed. | No action. We do not bundle fonts. |

The removed files still exist in the upstream git history, which this
repository keeps in full.
