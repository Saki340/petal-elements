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

  describe('checked-icon (checkedLeadingIcon)', () => {
    async function setup() {
      const root = env.render(html`
        <petal-menu-item type="menuitemradio" checked>
          <petal-icon slot="checked-icon">check</petal-icon>
          <div slot="headline">Device language</div>
        </petal-menu-item>
        <petal-menu-item type="menuitemradio">
          <petal-icon slot="checked-icon">check</petal-icon>
          <div slot="headline">English</div>
        </petal-menu-item>
        <petal-menu-item type="menuitemradio">
          <petal-icon slot="start">language</petal-icon>
          <petal-icon slot="checked-icon">check</petal-icon>
          <div slot="headline">日本語</div>
        </petal-menu-item>
      `);
      await env.waitForStability();
      return [...root.querySelectorAll('petal-menu-item')] as HTMLElement[];
    }

    const checkedIcon = (item: HTMLElement) =>
      item.shadowRoot!.querySelector('.checked-icon') as HTMLElement;

    it('shows the checked icon on the checked item only', async () => {
      const [checked, unchecked] = await setup();
      expect(getComputedStyle(checkedIcon(checked)).width).toBe('20px');
      expect(getComputedStyle(checkedIcon(unchecked)).width).toBe('0px');
      expect(getComputedStyle(checkedIcon(unchecked)).opacity).toBe('0');
    });

    it('grows on the fast spatial spring and fades on the fast effects spring', async () => {
      const [checked] = await setup();
      const style = getComputedStyle(checkedIcon(checked));
      expect(style.transitionProperty).toBe('width, opacity');
      expect(style.transitionDuration).toBe('0.359s, 0.149s');
    });

    it('takes the place of the start icon while checked', async () => {
      const [, , withIcon] = await setup();
      expect(getComputedStyle(checkedIcon(withIcon)).display).toBe('none');
      (withIcon as HTMLElement & {checked: boolean}).checked = true;
      await env.waitForStability();
      expect(getComputedStyle(checkedIcon(withIcon)).display).toBe('flex');
      const start = withIcon.shadowRoot!.querySelector('slot[name="start"]')!;
      expect(getComputedStyle(start).display).toBe('none');
    });
  });
});

