/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import {expect, test} from '@playwright/test';

/** Galleries in tests/visual/gallery.ts. */
const COMPONENTS = [
  'button',
  'icon-button',
  'fab',
  'checkbox',
  'radio',
  'switch',
  'text-field',
  'chips',
  'progress',
  'tabs',
];

/** `v0_192` (default) or `sys`; see tests/visual/index.html. */
const THEME = process.env['VISUAL_THEME'] ?? 'v0_192';

for (const component of COMPONENTS) {
  for (const scheme of ['light', 'dark']) {
    test(`${component} ${scheme}`, async ({page}) => {
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.goto(
        `/tests/visual/index.html?component=${component}&scheme=${scheme}&theme=${THEME}`,
      );
      await page.waitForSelector('body[data-ready], body[data-error]');
      expect(errors).toEqual([]);
      await expect(page.locator('#gallery')).toHaveScreenshot(`${component}-${scheme}.png`);
    });
  }
}
