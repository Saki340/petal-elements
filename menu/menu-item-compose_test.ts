/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

// Menu items after Jetpack Compose Material 3 (Menu.kt, MenuDefaults,
// ListTokens, SegmentedMenuTokens at androidx commit df73c24).

import {html} from 'lit';

import {Environment} from '../testing/environment.js';

import '../icon/icon.js';
import './menu-group.js';
import './menu-item.js';

describe('petal-menu-item after Compose', () => {
  const env = new Environment();

  const iconSizes = (root: Element) =>
    [...root.querySelectorAll('petal-icon')].map((icon) =>
      getComputedStyle(icon).getPropertyValue('--md-icon-size').trim(),
    );

  function parts(item: Element) {
    const content = item.shadowRoot!.querySelector('petal-item')!;
    const label = item.querySelector('[slot="headline"]')!;
    return {item, content, label};
  }

  describe('plain DropdownMenuItem', () => {
    async function setup() {
      const root = env.render(html`
        <petal-menu-item>
          <petal-icon slot="start">info</petal-icon>
          <div slot="headline">About</div>
          <petal-icon slot="end">open_in_new</petal-icon>
        </petal-menu-item>
      `);
      await env.waitForStability();
      return root;
    }

    it('has 24px icons (ListTokens.ItemLeadingIconSize, ItemTrailingIconSize)', async () => {
      expect(iconSizes(await setup())).toEqual(['24px', '24px']);
    });

    it('is 48px high with 12px at the sides (MenuListItemContainerHeight, DropdownMenuItemHorizontalPadding)', async () => {
      const {item, content} = parts((await setup()).querySelector('petal-menu-item')!);
      expect(item.getBoundingClientRect().height).toBe(48);
      const style = getComputedStyle(content);
      expect(style.paddingInlineStart).toBe('12px');
      expect(style.paddingInlineEnd).toBe('12px');
      expect(style.paddingTop).toBe('0px');
      expect(style.paddingBottom).toBe('0px');
    });

    it('has 12px between the icons and the label', async () => {
      const root = await setup();
      const [start, end] = root.querySelectorAll('petal-icon');
      const label = root.querySelector('[slot="headline"]')!;
      const labelBox = label.getBoundingClientRect();
      expect(labelBox.left - start.getBoundingClientRect().right).toBe(12);
      expect(end.getBoundingClientRect().left - labelBox.right).toBeGreaterThanOrEqual(12);
    });

    it('uses the label large text style', async () => {
      const {label} = parts((await setup()).querySelector('petal-menu-item')!);
      const style = getComputedStyle(label);
      expect(style.fontSize).toBe('14px');
      expect(style.lineHeight).toBe('20px');
      expect(style.fontWeight).toBe('500');
    });
  });

  describe('selectable item in a petal-menu-group', () => {
    async function setup() {
      const root = env.render(html`
        <petal-menu-group>
          <petal-menu-item>
            <petal-icon slot="start">info</petal-icon>
            <div slot="headline">About</div>
            <petal-icon slot="end">open_in_new</petal-icon>
          </petal-menu-item>
        </petal-menu-group>
      `);
      await env.waitForStability();
      return root;
    }

    it('has 20px icons (SegmentedMenuTokens.ItemLeadingIconSize, ItemTrailingIconSize)', async () => {
      expect(iconSizes(await setup())).toEqual(['20px', '20px']);
    });

    it('is 44px high with 8px between the icon and the label', async () => {
      const root = await setup();
      const {item, label} = parts(root.querySelector('petal-menu-item')!);
      expect(item.getBoundingClientRect().height).toBe(44);
      const start = root.querySelector('petal-icon')!;
      expect(label.getBoundingClientRect().left - start.getBoundingClientRect().right).toBe(8);
    });
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
      expect(getComputedStyle(checkedIcon(checked)).width).toBe('24px');
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

