/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Visual regression tests. Run from the repository root after `npm run build`:
 *
 *     npm run test:visual            # compare with the baseline
 *     npm run test:visual -- -u      # update the baseline
 *
 * Screenshots differ between operating systems (font rendering), so each
 * platform has its own baseline under __screenshots__/<platform>/.
 */

import {defineConfig} from '@playwright/test';

const PORT = 8771;

export default defineConfig({
  testDir: '.',
  testMatch: 'specs/*.spec.ts',
  snapshotPathTemplate: '{testDir}/__screenshots__/{platform}/{arg}{ext}',
  globalSetup: './global-setup.ts',
  outputDir: '../../.cache/visual/results',
  reporter: [['list'], ['html', {open: 'never', outputFolder: '../../.cache/visual/report'}]],
  fullyParallel: true,
  forbidOnly: Boolean(process.env['CI']),
  use: {
    baseURL: `http://localhost:${PORT}`,
    browserName: 'chromium',
    viewport: {width: 1280, height: 720},
    deviceScaleFactor: 1,
    launchOptions: {
      // Deterministic rendering: no LCD text or hinting, fixed color profile,
      // software raster, and all compositor work done before each frame.
      args: [
        '--disable-lcd-text',
        '--font-render-hinting=none',
        '--force-color-profile=srgb',
        '--disable-gpu',
        '--disable-partial-raster',
        '--disable-threaded-animation',
        '--run-all-compositor-stages-before-draw',
      ],
    },
  },
  expect: {
    // Exact match: any changed pixel fails.
    toHaveScreenshot: {
      animations: 'disabled',
      caret: 'hide',
      scale: 'css',
      threshold: 0,
      maxDiffPixels: 0,
    },
  },
  webServer: {
    command: `node node_modules/@web/dev-server/dist/bin.js --node-resolve --port ${PORT}`,
    cwd: '../..',
    url: `http://localhost:${PORT}/tests/visual/index.html`,
    reuseExistingServer: !process.env['CI'],
  },
});
