# petal-elements

English | [简体中文](README.zh-CN.md)

Community-maintained web components for Material 3 Expressive.

> **petal-elements is not an official Google project and is not affiliated
> with Google.** It is an independent, community-maintained modified version of
> [material-components/material-web](https://github.com/material-components/material-web).

## Status

Early development. Nothing has been published to npm yet, and APIs may change.

## Background

Google's Material Web project
[is in maintenance mode](https://github.com/material-components/material-web/discussions/5642).
In that discussion, its maintainer
[wrote](https://github.com/material-components/material-web/discussions/5642#discussioncomment-13724284):
"Forks and different directions are always welcome in open source!"

petal-elements continues from the Material Web codebase, with its full git
history, and works towards Material 3 Expressive:

- Components are built on Material Web's foundations: ripple, focus ring,
  state layers, form association through `ElementInternals`, and accessibility.
- Design token values come from the Material Design web tokens (v34) that ship
  in the Material Web repository, cross-checked against the Jetpack Compose
  Material 3 sources. Values are taken from source, never estimated by eye.
- Missing Expressive specs and components (shape morphing, spring motion,
  button groups, …) are added step by step and checked with visual regression
  tests.
- We follow upstream and merge its fixes, including its Expressive work in
  `labs/`.

## Differences from Material Web

| | Material Web | petal-elements |
|---|---|---|
| Package | `@material/web` | `petal-elements` |
| Tags | `<md-filled-button>` | `<petal-filled-button>` |
| Classes | `MdFilledButton` | `PetalFilledButton` |
| CSS custom properties | `--md-sys-*`, `--md-filled-button-*` | unchanged, to ease migration |

## Development

Requires Node.js 22 or later. Works on Linux, macOS and Windows.

```sh
npm ci
npm run build
npx playwright install chromium
npm test
npm run check:licenses   # licenses of all dependencies
npm run check:rebrand    # no md-* tags left after an upstream merge
```

### Merging upstream

```sh
git fetch upstream
git merge upstream/main
node scripts/rebrand.js   # rename new md-* tags; safe to run again
```

## License

Apache License 2.0. See [LICENSE](LICENSE) and [NOTICE](NOTICE) for
attribution and the list of modifications. Details on file headers,
third-party assets and dependency checks are in
[docs/licensing.md](docs/licensing.md).
