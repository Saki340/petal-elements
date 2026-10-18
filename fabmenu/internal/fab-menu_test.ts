/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import '../fab-menu.js';
import '../fab-menu-item.js';
import '../toggle-fab.js';

import {html} from 'lit';

import {Environment} from '../../testing/environment.js';
import {createTokenTests} from '../../testing/tokens.js';
import {PetalFabMenu} from '../fab-menu.js';
import {PetalFabMenuItem} from '../fab-menu-item.js';
import {PetalToggleFab} from '../toggle-fab.js';

describe('<petal-fab-menu>', () => {
  const env = new Environment();

  async function setupTest(attributes = '') {
    const root = env.render(html`
      <div id="outside">outside</div>
      <petal-fab-menu>
        <petal-fab-menu-item id="one">One</petal-fab-menu-item>
        <petal-fab-menu-item id="two">Two</petal-fab-menu-item>
        <petal-fab-menu-item id="three">Three</petal-fab-menu-item>
        <petal-toggle-fab slot="button" aria-label="Menu"></petal-toggle-fab>
      </petal-fab-menu>
    `);
    const menu = root.querySelector('petal-fab-menu') as PetalFabMenu;
    for (const attribute of attributes.split(' ').filter(Boolean)) {
      menu.setAttribute(attribute, '');
    }
    await env.waitForStability();
    const items = Array.from(menu.querySelectorAll('petal-fab-menu-item')) as PetalFabMenuItem[];
    const toggle = menu.querySelector('petal-toggle-fab') as PetalToggleFab;
    // Runs the animation to its end.
    const finish = async () => {
      await menu.updateComplete;
      for (let i = 0; i < 100; i++) (menu as any).advance(16);
      await menu.updateComplete;
    };
    return {menu, items, toggle, finish};
  }

  const itemButton = (item: Element) =>
    item.shadowRoot!.querySelector('button') as HTMLButtonElement;

  describe('.styles', () => {
    createTokenTests(PetalFabMenu.styles);
    createTokenTests(PetalFabMenuItem.styles);
    createTokenTests(PetalToggleFab.styles);
  });

  describe('closed', () => {
    it('has the room of the button and no items', async () => {
      const {menu, toggle, items} = await setupTest();
      const rect = menu.getBoundingClientRect();
      // The button (56px) with 16px below it.
      expect(rect.height).toBe(56 + 16);
      // 16px padding on both sides.
      expect(rect.width).toBe(56 + 32);
      expect(menu.shadowRoot!.querySelector('.items')!.hasAttribute('inert')).toBeTrue();
      expect(getComputedStyle(menu.shadowRoot!.querySelector('.items')!).display).toBe('none');
      expect(toggle.checked).toBeFalse();
      expect(items[0].style.opacity).toBe('0');
    });

    it('marks the button as a popup that is not expanded', async () => {
      const {toggle} = await setupTest();
      expect(toggle.popup).toBeTrue();
      const button = toggle.shadowRoot!.querySelector('button')!;
      expect(button.getAttribute('aria-expanded')).toBe('false');
      expect(button.hasAttribute('aria-pressed')).toBeFalse();
    });
  });

  describe('open', () => {
    it('shows the items 56px high, 4px apart, 8px above the button', async () => {
      const {menu, items, toggle, finish} = await setupTest();
      menu.expanded = true;
      await finish();
      expect(toggle.checked).toBeTrue();
      const buttons = items.map((item) => item.getBoundingClientRect());
      for (const rect of buttons) expect(rect.height).toBe(56);
      expect(buttons[1].top - buttons[0].bottom).toBe(4);
      expect(buttons[2].top - buttons[1].bottom).toBe(4);
      expect(toggle.getBoundingClientRect().top - buttons[2].bottom).toBe(8);
      for (const item of items) {
        expect(item.style.opacity).toBe('');
        expect(itemButton(item).style.width).toBe('');
      }
    });

    it('shows the item next to the button first', async () => {
      const {menu, items, finish} = await setupTest();
      menu.expanded = true;
      await menu.updateComplete;
      // The stagger's rounded value is the number of visible items.
      (menu as any).stagger.value = 1;
      (menu as any).stagger.velocity = 0;
      (menu as any).stagger.target = (menu as any).stagger.value;
      (menu as any).advance(16);
      expect(items.map((item) => item.isVisible)).toEqual([false, false, true]);
      (menu as any).stagger.value = 2;
      (menu as any).stagger.velocity = 0;
      (menu as any).stagger.target = (menu as any).stagger.value;
      (menu as any).advance(16);
      expect(items.map((item) => item.isVisible)).toEqual([false, true, true]);
      (menu as any).stagger.target = 3;
      await finish();
      expect(items.map((item) => item.isVisible)).toEqual([true, true, true]);
    });

    it('grows an item from no width and no opacity', async () => {
      const {menu, items} = await setupTest();
      menu.expanded = true;
      await menu.updateComplete;
      (menu as any).stagger.value = 1;
      (menu as any).stagger.velocity = 0;
      (menu as any).stagger.target = (menu as any).stagger.value;
      (menu as any).advance(16);
      const last = items[2];
      expect(last.isAnimating).toBeTrue();
      expect(Number(last.style.opacity)).toBeGreaterThan(0);
      expect(Number(last.style.opacity)).toBeLessThan(1);
      expect(itemButton(last).style.width).not.toBe('');
      // The ones that are not there yet cannot be pressed.
      expect(items[0].style.pointerEvents).toBe('none');
    });

    it('fires open and close', async () => {
      const {menu} = await setupTest();
      const events: string[] = [];
      menu.addEventListener('open', () => events.push('open'));
      menu.addEventListener('close', () => events.push('close'));
      menu.expanded = true;
      await menu.updateComplete;
      menu.expanded = false;
      await menu.updateComplete;
      expect(events).toEqual(['open', 'close']);
    });

    it('opens when the button is clicked', async () => {
      const {menu, toggle} = await setupTest();
      toggle.shadowRoot!.querySelector('button')!.click();
      await menu.updateComplete;
      expect(menu.expanded).toBeTrue();
      expect(toggle.checked).toBeTrue();
    });

    it('focuses the first item when opened with the keyboard', async () => {
      const {menu, items, toggle} = await setupTest();
      // `click()` has a detail of 0, like Enter or Space.
      toggle.shadowRoot!.querySelector('button')!.click();
      await menu.updateComplete;
      await menu.updateComplete;
      expect(document.activeElement).toBe(items[0]);
    });

    it('can start open', async () => {
      const {items, toggle} = await setupTest('expanded');
      expect(items.every((item) => item.isVisible)).toBeTrue();
      expect(toggle.checked).toBeTrue();
    });
  });

  describe('close', () => {
    it('hides the items from the top and then takes no room', async () => {
      const {menu, items, finish} = await setupTest('expanded');
      menu.expanded = false;
      await menu.updateComplete;
      (menu as any).stagger.value = 2;
      (menu as any).stagger.velocity = 0;
      (menu as any).stagger.target = (menu as any).stagger.value;
      (menu as any).advance(16);
      // The top item is on its way out, the others are not.
      expect(items[0].isAnimating).toBeTrue();
      expect(items[1].isAnimating).toBeFalse();
      expect(items[2].isAnimating).toBeFalse();
      (menu as any).stagger.target = 0;
      await finish();
      expect(items.some((item) => item.isVisible)).toBeFalse();
      expect(menu.getBoundingClientRect().height).toBe(56 + 16);
    });

    it('closes with Escape and focuses the button', async () => {
      const {menu, items, toggle, finish} = await setupTest();
      menu.expanded = true;
      await finish();
      items[1].focus();
      items[1].dispatchEvent(
        new KeyboardEvent('keydown', {key: 'Escape', bubbles: true, composed: true}),
      );
      await menu.updateComplete;
      expect(menu.expanded).toBeFalse();
      expect(document.activeElement).toBe(toggle);
    });

    it('closes when something outside is pressed, not inside', async () => {
      const {menu, items, finish} = await setupTest();
      menu.expanded = true;
      await finish();
      items[0].dispatchEvent(new PointerEvent('pointerdown', {bubbles: true, composed: true}));
      expect(menu.expanded).toBeTrue();
      document.querySelector('#outside')!.dispatchEvent(
        new PointerEvent('pointerdown', {bubbles: true, composed: true}),
      );
      expect(menu.expanded).toBeFalse();
    });

    it('closes when the button is clicked again', async () => {
      const {menu, toggle, finish} = await setupTest();
      menu.expanded = true;
      await finish();
      toggle.shadowRoot!.querySelector('button')!.click();
      await menu.updateComplete;
      expect(menu.expanded).toBeFalse();
    });
  });

  describe('keyboard', () => {
    function key(target: Element, name: string, init: KeyboardEventInit = {}) {
      const event = new KeyboardEvent('keydown', {
        key: name,
        bubbles: true,
        composed: true,
        cancelable: true,
        ...init,
      });
      target.dispatchEvent(event);
      return event;
    }

    it('moves from the button to the first item with Tab and the down arrow', async () => {
      const {menu, items, toggle, finish} = await setupTest();
      menu.expanded = true;
      await finish();
      toggle.focus();
      expect(key(toggle, 'Tab').defaultPrevented).toBeTrue();
      expect(document.activeElement).toBe(items[0]);
      toggle.focus();
      key(toggle, 'ArrowDown');
      expect(document.activeElement).toBe(items[0]);
    });

    it('leaves Shift+Tab on the button alone', async () => {
      const {menu, toggle, finish} = await setupTest();
      menu.expanded = true;
      await finish();
      expect(key(toggle, 'Tab', {shiftKey: true}).defaultPrevented).toBeFalse();
    });

    it('moves between the items with the arrows, and from the last to the button', async () => {
      const {menu, items, toggle, finish} = await setupTest();
      menu.expanded = true;
      await finish();
      items[0].focus();
      key(items[0], 'ArrowDown');
      expect(document.activeElement).toBe(items[1]);
      key(items[1], 'ArrowUp');
      expect(document.activeElement).toBe(items[0]);
      items[2].focus();
      key(items[2], 'ArrowDown');
      expect(document.activeElement).toBe(toggle);
    });
  });

  describe('alignment', () => {
    it('aligns to the end by default and hands the alignment to the items', async () => {
      const {menu, items} = await setupTest('expanded');
      expect(getComputedStyle(menu).alignItems).toBe('flex-end');
      expect(items[0].horizontalAlignment).toBe('end');
    });

    it('aligns to the start', async () => {
      const {menu, items} = await setupTest('expanded');
      menu.horizontalAlignment = 'start';
      await menu.updateComplete;
      expect(getComputedStyle(menu).alignItems).toBe('flex-start');
      expect(items[0].horizontalAlignment).toBe('start');
    });
  });
});
