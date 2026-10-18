/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import '../../menu.js';
import '../../menu-group.js';
import '../../menu-item.js';

import {html} from 'lit';

import {Environment} from '../../../testing/environment.js';
import {Menu} from '../menu.js';
import {MenuItemEl} from '../menuitem/menu-item.js';

import {MenuGroup} from './menu-group.js';

describe('<petal-menu-group>', () => {
  const env = new Environment();

  async function setupTest() {
    const root = env.render(html`
      <petal-menu>
        <petal-menu-group>
          <petal-menu-item type="menuitemradio" checked>
            <div slot="headline">Small</div>
          </petal-menu-item>
          <petal-menu-item type="menuitemradio">
            <div slot="headline">Medium</div>
          </petal-menu-item>
          <petal-menu-item type="menuitemradio">
            <div slot="headline">Large</div>
          </petal-menu-item>
        </petal-menu-group>
        <petal-menu-group>
          <petal-menu-item><div slot="headline">Settings</div></petal-menu-item>
        </petal-menu-group>
      </petal-menu>
    `);
    const menu = root.querySelector('petal-menu') as Menu;
    const groups = Array.from(root.querySelectorAll('petal-menu-group')) as MenuGroup[];
    const items = Array.from(root.querySelectorAll('petal-menu-item')) as MenuItemEl[];
    await env.waitForStability();
    return {menu, groups, items};
  }

  const radii = (element: Element) => {
    const style = getComputedStyle(element);
    return [
      style.borderTopLeftRadius,
      style.borderTopRightRadius,
      style.borderBottomRightRadius,
      style.borderBottomLeftRadius,
    ];
  };

  it('makes the items inside groups the menu items', async () => {
    const {menu, items} = await setupTest();
    expect(menu.items).toEqual(items);
  });

  it('is a group with its own surface, and the menu surface is transparent', async () => {
    const {menu, groups} = await setupTest();
    expect(groups[0].getAttribute('role')).toBe('group');
    // Compose's surface-container-low.
    expect(getComputedStyle(groups[0]).backgroundColor).toBe('rgb(247, 242, 250)');
    const surface = menu.shadowRoot!.querySelector('.items')!;
    expect(getComputedStyle(surface).backgroundColor).toBe('rgba(0, 0, 0, 0)');
  });

  it('shapes groups by their position, 2px apart', async () => {
    const {groups} = await setupTest();
    expect(radii(groups[0])).toEqual(['16px', '16px', '8px', '8px']);
    expect(radii(groups[1])).toEqual(['8px', '8px', '16px', '16px']);
    expect(getComputedStyle(groups[1]).marginTop).toBe('2px');
    // SegmentedMenuTokens.GroupPadding.
    expect(getComputedStyle(groups[0]).paddingTop).toBe('4px');
  });

  it('shapes items by their position, and checked items at 12px', async () => {
    const {groups, items} = await setupTest();
    expect(radii(items[0])).toEqual(['12px', '12px', '12px', '12px']);
    expect(radii(items[1])).toEqual(['4px', '4px', '4px', '4px']);
    // Next to the 8px corners where the groups meet: the same 8px.
    expect(radii(items[2])).toEqual(['4px', '4px', '8px', '8px']);
    // A lone item in the last group: 8px where the groups meet, concentric
    // with the menu's 16px corners at the bottom.
    expect(radii(items[3])).toEqual(['8px', '8px', '12px', '12px']);
    // 4px in on every side: the group's padding and the item's margins.
    const lastGroup = getComputedStyle(groups[1]);
    const lone = getComputedStyle(items[3]);
    expect([
      lastGroup.paddingTop,
      lone.marginTop,
      lone.marginLeft,
      lone.marginRight,
      lone.marginBottom,
      lastGroup.paddingBottom,
    ]).toEqual(['4px', '0px', '4px', '4px', '0px', '4px']);
    expect(getComputedStyle(items[1]).marginLeft).toBe('4px');
    const item = items[1].shadowRoot!.querySelector('petal-item')!;
    expect(getComputedStyle(item).minHeight).toBe('44px');
  });

  it('shows checked items in tertiary-container with aria-checked', async () => {
    const {items} = await setupTest();
    const root = (item: MenuItemEl) => item.shadowRoot!.querySelector('.list-item')!;
    expect(root(items[0]).getAttribute('role')).toBe('menuitemradio');
    expect(root(items[0]).getAttribute('aria-checked')).toBe('true');
    expect(root(items[1]).getAttribute('aria-checked')).toBe('false');
    expect(root(items[3]).getAttribute('role')).toBe('menuitem');
    expect(root(items[3]).hasAttribute('aria-checked')).toBeFalse();
    // Compose's tertiary-container.
    expect(getComputedStyle(root(items[0])).backgroundColor).toBe('rgb(255, 216, 228)');
    expect(getComputedStyle(root(items[1])).backgroundColor).toBe('rgba(0, 0, 0, 0)');
  });

  it('leaves hidden items and groups out of the first and last', async () => {
    const root = env.render(html`
      <petal-menu>
        <petal-menu-group>
          <petal-menu-item><div slot="headline">Keyboard</div></petal-menu-item>
          <petal-menu-item><div slot="headline">Install</div></petal-menu-item>
        </petal-menu-group>
        <petal-menu-group>
          <petal-menu-item><div slot="headline">Data</div></petal-menu-item>
          <petal-menu-item hidden><div slot="headline">GitHub</div></petal-menu-item>
        </petal-menu-group>
        <petal-menu-group hidden>
          <petal-menu-item><div slot="headline">Hidden</div></petal-menu-item>
        </petal-menu-group>
      </petal-menu>
    `);
    await env.waitForStability();
    const groups = Array.from(root.querySelectorAll('petal-menu-group'));
    const items = Array.from(root.querySelectorAll('petal-menu-item'));
    groups.forEach((group) => (group.style.transition = 'none'));
    // The second group is the last shown one.
    expect(radii(groups[1])).toEqual(['8px', '8px', '16px', '16px']);
    // Its only shown item follows its corners.
    expect(radii(items[2])).toEqual(['8px', '8px', '12px', '12px']);
    // Hiding the first group makes the second one first.
    groups[0].hidden = true;
    expect(radii(groups[1])).toEqual(['16px', '16px', '16px', '16px']);
    expect(radii(items[2])).toEqual(['12px', '12px', '12px', '12px']);
    expect(getComputedStyle(groups[1]).marginTop).toBe('0px');
  });

  it('takes the inactive shape after a mouse hovers and leaves', async () => {
    const {groups} = await setupTest();
    groups[0].dispatchEvent(new PointerEvent('pointerenter', {pointerType: 'touch'}));
    groups[0].dispatchEvent(new PointerEvent('pointerleave', {pointerType: 'touch'}));
    expect(groups[0].hasAttribute('inactive')).toBeFalse();

    groups[0].dispatchEvent(new PointerEvent('pointerenter', {pointerType: 'mouse'}));
    expect(groups[0].hasAttribute('inactive')).toBeFalse();
    groups[0].dispatchEvent(new PointerEvent('pointerleave', {pointerType: 'mouse'}));
    expect(groups[0].hasAttribute('inactive')).toBeTrue();
    groups[0].style.transition = 'none';
    expect(radii(groups[0])).toEqual(['8px', '8px', '8px', '8px']);
  });

  it('opens again with the groups in their own shapes', async () => {
    const {menu, groups} = await setupTest();
    for (const group of groups) {
      group.dispatchEvent(new PointerEvent('pointerenter', {pointerType: 'mouse'}));
      group.dispatchEvent(new PointerEvent('pointerleave', {pointerType: 'mouse'}));
    }
    expect(groups.map((group) => group.hasAttribute('inactive'))).toEqual([true, true]);
    menu.quick = true;
    menu.show();
    await env.waitForStability();
    expect(groups.some((group) => group.hasAttribute('inactive'))).toBeFalse();
    // The outer corners are large again (Compose's leading and trailing
    // group shapes).
    expect(radii(groups[0])).toEqual(['16px', '16px', '8px', '8px']);
    expect(radii(groups[1])).toEqual(['8px', '8px', '16px', '16px']);
    menu.close();
  });

  it('keeps its shape with no-inactive-shape, on the group or the menu', async () => {
    const {menu, groups} = await setupTest();
    groups[0].noInactiveShape = true;
    menu.setAttribute('no-inactive-shape', '');
    for (const group of groups) {
      group.dispatchEvent(new PointerEvent('pointerenter', {pointerType: 'mouse'}));
      group.dispatchEvent(new PointerEvent('pointerleave', {pointerType: 'mouse'}));
    }
    expect(groups.map((group) => group.hasAttribute('inactive'))).toEqual([false, false]);
  });

  it('checks radio items on click or Enter, unchecking the others', async () => {
    const {items} = await setupTest();
    const change = jasmine.createSpy('change');
    items[0].parentElement!.addEventListener('change', change);
    const root = (item: MenuItemEl) => item.shadowRoot!.querySelector<HTMLElement>('.list-item')!;

    root(items[2]).click();
    expect(items.slice(0, 3).map((item) => item.checked)).toEqual([false, false, true]);
    expect(change).toHaveBeenCalledTimes(1);

    root(items[1]).dispatchEvent(
      new KeyboardEvent('keydown', {code: 'Enter', key: 'Enter', bubbles: true, cancelable: true}),
    );
    expect(items.slice(0, 3).map((item) => item.checked)).toEqual([false, true, false]);
    expect(change).toHaveBeenCalledTimes(2);

    // Choosing the checked radio item again changes nothing.
    root(items[1]).click();
    expect(change).toHaveBeenCalledTimes(2);
    // Not a radio item.
    root(items[3]).click();
    expect(items[3].checked).toBeFalse();
  });

  it('toggles checkbox items', async () => {
    const root = env.render(html`
      <petal-menu-item type="menuitemcheckbox" keep-open>
        <div slot="headline">Bold</div>
      </petal-menu-item>
    `);
    const item = root.querySelector('petal-menu-item') as MenuItemEl;
    await env.waitForStability();
    const listItem = item.shadowRoot!.querySelector<HTMLElement>('.list-item')!;
    listItem.click();
    expect(item.checked).toBeTrue();
    listItem.dispatchEvent(
      new KeyboardEvent('keydown', {code: 'Space', key: ' ', bubbles: true, cancelable: true}),
    );
    expect(item.checked).toBeFalse();
  });
});
