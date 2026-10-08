# Visual regression tests

Screenshots of the core components, compared pixel by pixel with a committed
baseline. They catch any visual change, so that every change to the
components (new tokens, Expressive features) is visible and explained.

```sh
npm run build
npx playwright install chromium   # once
npm run test:visual               # compare with the baseline
npm run test:visual -- -u         # accept the current rendering as the baseline
```

On failure, the report with expected, actual and diff images is in
`.cache/visual/report` (`npx playwright show-report .cache/visual/report`).

## What is covered

[tests/visual/gallery.ts](../tests/visual/gallery.ts) renders one grid per
component: variants as rows, states as columns (default, hover, focus,
pressed, disabled where they apply). Each grid is captured in the light and
dark color schemes.

| Component | Variants |
|---|---|
| button | filled, outlined, text, elevated, filled tonal; with and without icon |
| icon-button | standard, filled, filled tonal, outlined; plain, toggle off, toggle on |
| fab | surface, primary, secondary, tertiary; small, large, extended, lowered |
| checkbox | unchecked, checked, indeterminate |
| radio | unchecked, checked |
| switch | off, on, with icons, selected icon only |
| text-field | filled and outlined; empty, value, supporting text, error, icons |
| chips | assist (and elevated), filter (selected, removable), input, suggestion |
| progress | linear (value, buffer, indeterminate), circular (value, indeterminate) |
| tabs | primary, primary with icons, secondary |

Hover, focus and pressed are simulated with the component harnesses
(`*/harness.ts`), which rewrite `:hover`, `:focus-visible` and similar
pseudo-classes into classes, so all states show at the same time.

## Colors

`?theme=v0_192` (the default) applies the v0.192 color schemes the components
are built with today; the light values equal the fallbacks compiled into the
components. The baseline therefore records the components as they were before
any token change.

`VISUAL_THEME=sys npm run test:visual` uses the generated
[tokens/css/sys.css](../tokens/css/sys.css) instead, to preview what the new
tokens change.

## Determinism

The comparison is exact (`threshold: 0`, `maxDiffPixels: 0`). To keep it
stable:

- Text uses Roboto from `@fontsource/roboto` (OFL-1.1, a dev dependency only),
  icons are inline SVG; nothing is loaded from the network.
- All animations and transitions are ended before the screenshot: finite ones
  jump to their end, infinite ones (indeterminate progress) are removed. The
  moving indeterminate animations are therefore not covered.
- Chromium runs with software raster, grayscale text antialiasing, no font
  hinting and an sRGB color profile.

## Platforms

Font rendering differs between operating systems, so each platform has its own
baseline in `tests/visual/__screenshots__/<platform>/`:

- `win32`: generated on Windows for local development.
- `linux`: used by CI, which runs the tests in the
  `mcr.microsoft.com/playwright` container. Generate it with the
  **Visual baselines** workflow (Actions → Visual baselines → Run workflow),
  download the artifact, review the images and commit them to
  `tests/visual/__screenshots__/linux/`. Until then the CI job is skipped with
  a notice.

Keep the container tag in the workflows equal to the `@playwright/test`
version in package.json.
