# Contributing

Thanks for your interest in petal-elements! This file describes how to get
involved.

## Code of conduct

Please follow our [code of conduct](CODE_OF_CONDUCT.md).

## Issues and discussions

- [Open an issue](https://github.com/Saki340/petal-elements/issues/new/choose)
  for bugs or feature requests.
- [Start a discussion](https://github.com/Saki340/petal-elements/discussions)
  for questions and proposals.
- If a bug also exists in Google's Material Web and is not caused by our
  changes, consider reporting it
  [upstream](https://github.com/material-components/material-web/issues) too.

## Pull requests

- Open an issue or discussion first for anything bigger than a small fix.
- Keep changes small and focused.
- Commit messages and PR titles follow
  [Conventional Commits](https://www.conventionalcommits.org/), for example
  `fix(button): ...`. The description may be in English or Chinese.
- Before pushing, run:

  ```sh
  npm run build
  npm test
  npm run check:licenses
  npm run check:rebrand
  npm run build:catalog
  ```

  The catalog renders the components on the server (Lit SSR), where
  constructors, property setters, `willUpdate()` and `render()` run without a
  DOM: no `matchMedia`, `requestAnimationFrame` or reading children there
  (check `isServer` from `lit`).

- For changes that affect how components look, also run
  `npm run test:visual` and explain every screenshot change in the PR (see
  [docs/visual-testing.md](docs/visual-testing.md)).
- Design token values must come from source (the Material Design web tokens
  in `tokens/versions/`, or Jetpack Compose Material 3), not from screenshots or
  memory. Mention the source in the PR.
- Do not copy text or images from m3.material.io.
- Elements must not set their own reactive properties (or call
  `requestUpdate()`) from `updated()`, `firstUpdated()` or a controller's
  `hostUpdated()`: Lit renders them again at once and warns
  ("change-in-update"). Work out values before rendering (`willUpdate()`),
  or keep values that change during animations out of reactive properties.
  Tests fail on this warning: `testing/environment.ts` checks after every
  test, and `testing/update-cycle_test.ts` renders and changes every element
  that `all.ts` exports.

## Licensing of contributions

There is no CLA. By contributing, you agree that your contribution is licensed
under the [Apache License 2.0](LICENSE), the license of this project. Follow the
file header rules in [docs/licensing.md](docs/licensing.md): keep existing
headers, add the "Modified for petal-elements" line when changing an upstream
file, and use an Apache-2.0 SPDX header with your own copyright line in new
files.
