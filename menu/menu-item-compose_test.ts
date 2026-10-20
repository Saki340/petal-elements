/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

// Menu items after Jetpack Compose Material 3 (MenuDefaults, SegmentedMenuTokens
// at androidx commit df73c24).

import {html} from 'lit';

import {Environment} from '../testing/environment.js';

import '../icon/icon.js';
import './menu-item.js';

describe('petal-menu-item after Compose', () => {
  const env = new Environment();

  it('has 20px leading and trailing icons (ItemLeadingIconSize, ItemTrailingIconSize)', async () => {
    const root = env.render(html`
      <petal-menu-item>
        <petal-icon slot="start">info</petal-icon>
        <div slot="headline">About</div>
        <petal-icon slot="end">open_in_new</petal-icon>
      </petal-menu-item>
    `);
    await env.waitForStability();
    for (const icon of root.querySelectorAll('petal-icon')) {
      expect(getComputedStyle(icon).getPropertyValue('--md-icon-size').trim())
        .withContext(icon.slot)
        .toBe('20px');
    }
  });
});
