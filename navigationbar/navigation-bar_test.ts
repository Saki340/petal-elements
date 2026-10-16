/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import './navigation-bar.js';
import './navigation-bar-item.js';
import '../icon/icon.js';

import {html} from 'lit';

import {Environment} from '../testing/environment.js';

import {PetalNavigationBar} from './navigation-bar.js';
import {PetalNavigationBarItem} from './navigation-bar-item.js';

describe('<petal-navigation-bar>', () => {
  const env = new Environment();

  async function setupTest(template = defaultTemplate()) {
    const root = env.render(template);
    const bar = root.querySelector('petal-navigation-bar') as PetalNavigationBar;
    const items = Array.from(root.querySelectorAll('petal-navigation-bar-item')) as PetalNavigationBarItem[];
    await env.waitForStability();
    await finishAnimations(bar);
    return {bar, items};
  }

  function defaultTemplate() {
    return html`
      <petal-navigation-bar>
        <petal-navigation-bar-item selected>
          <svg slot="icon" viewBox="0 0 24 24"><path d="M4 4h16v16H4z" /></svg>
          Home
        </petal-navigation-bar-item>
        <petal-navigation-bar-item>
          <svg slot="icon" viewBox="0 0 24 24"><path d="M4 4h16v16H4z" /></svg>
          Search
        </petal-navigation-bar-item>
        <petal-navigation-bar-item disabled>
          <svg slot="icon" viewBox="0 0 24 24"><path d="M4 4h16v16H4z" /></svg>
          Saved
        </petal-navigation-bar-item>
        <petal-navigation-bar-item>
          <svg slot="icon" viewBox="0 0 24 24"><path d="M4 4h16v16H4z" /></svg>
          Profile
        </petal-navigation-bar-item>
      </petal-navigation-bar>
    `;
  }

  /** Every animation running in an element and its shadow tree. */
  function animationsOf(element: Element) {
    const all = [element, ...Array.from(element.shadowRoot?.querySelectorAll('*') ?? [])];
    return all.flatMap((e) => e.getAnimations());
  }

  /** Lets the spring transitions of the bar and its items reach their end. */
  async function finishAnimations(bar: PetalNavigationBar) {
    for (const element of [bar, ...bar.items]) {
      await (element as PetalNavigationBar).updateComplete;
      for (const animation of animationsOf(element)) animation.finish();
    }
  }

  function part(item: PetalNavigationBarItem, selector: string) {
    return item.shadowRoot!.querySelector(selector) as HTMLElement;
  }

  function size(element: Element) {
    const {width, height} = element.getBoundingClientRect();
    return [Math.round(width * 100) / 100, Math.round(height * 100) / 100];
  }

  function press(element: Element, key: string) {
    element.dispatchEvent(new KeyboardEvent('keydown', {key, bubbles: true, composed: true, cancelable: true}));
  }

  describe('semantics', () => {
    it('is a tablist of tabs, like Compose selectableGroup and Role.Tab', async () => {
      const {bar, items} = await setupTest();
      const internals = (bar as unknown as {internals: ElementInternals}).internals;
      expect(internals.role).toBe('tablist');
      expect(internals.ariaOrientation).toBe('horizontal');
      const roles = items.map((item) => (item as unknown as {internals: ElementInternals}).internals.role);
      expect(roles).toEqual(['tab', 'tab', 'tab', 'tab']);
      const selected = items.map((item) => (item as unknown as {internals: ElementInternals}).internals.ariaSelected);
      expect(selected).toEqual(['true', 'false', 'false', 'false']);
      const disabled = (items[2] as unknown as {internals: ElementInternals}).internals.ariaDisabled;
      expect(disabled).toBe('true');
    });

    it('puts only the selected item in the tab order', async () => {
      const {items} = await setupTest();
      expect(items.map((item) => item.tabIndex)).toEqual([0, -1, -1, -1]);
    });

    it('falls back to the first enabled item when none is selected', async () => {
      const {items} = await setupTest(html`
        <petal-navigation-bar>
          <petal-navigation-bar-item disabled>A</petal-navigation-bar-item>
          <petal-navigation-bar-item>B</petal-navigation-bar-item>
          <petal-navigation-bar-item>C</petal-navigation-bar-item>
        </petal-navigation-bar>
      `);
      expect(items.map((item) => item.tabIndex)).toEqual([-1, 0, -1]);
    });
  });

  describe('Compose values', () => {
    it('is 64dp high with the surface container color', async () => {
      const {bar} = await setupTest();
      const style = getComputedStyle(bar);
      expect(bar.getBoundingClientRect().height).toBe(64);
      // md.sys.color.surface-container, light (ColorLightTokens).
      expect(style.backgroundColor).toBe('rgb(243, 237, 247)');
      expect(style.borderTopLeftRadius).toBe('0px');
    });

    it('shares its width equally between the items', async () => {
      const {bar, items} = await setupTest();
      const width = bar.getBoundingClientRect().width;
      for (const item of items) {
        expect(item.getBoundingClientRect().width).toBeCloseTo(width / items.length, 1);
      }
    });

    it('has a 56dp by 32dp indicator around the icon, 6dp from the top, and a 4dp gap to the label', async () => {
      const {items} = await setupTest();
      const area = part(items[0], '.indicator-area');
      expect(size(area)).toEqual([56, 32]);
      const item = part(items[0], '.item');
      const top = item.getBoundingClientRect().top;
      const itemContent = area.getBoundingClientRect().top;
      // The bar is 64dp high; the content is centered: (64 - (6 + 32 + 4 + 16 + 6)) / 2 = 0.
      expect(itemContent - top).toBe(6);
      const label = part(items[0], '.label');
      expect(label.getBoundingClientRect().top - area.getBoundingClientRect().bottom).toBe(4);
      const text = getComputedStyle(label);
      // md.sys.typescale.label-medium
      expect(text.fontSize).toBe('12px');
      expect(text.lineHeight).toBe('16px');
    });

    it('shows the indicator only when selected, in secondary container', async () => {
      const {items} = await setupTest();
      const selected = part(items[0], '.indicator');
      const unselected = part(items[1], '.indicator');
      expect(size(selected)).toEqual([56, 32]);
      expect(getComputedStyle(selected).backgroundColor).toBe('rgb(232, 222, 248)');
      expect(getComputedStyle(selected).opacity).toBe('1');
      expect(unselected.getBoundingClientRect().width).toBe(0);
      expect(getComputedStyle(unselected).opacity).toBe('0');
      // The indicator is a pill.
      expect(parseFloat(getComputedStyle(selected).borderTopLeftRadius)).toBeGreaterThanOrEqual(16);
    });

    it('colors the icon and label by state', async () => {
      const {items} = await setupTest();
      // Selected: on-secondary-container icon, secondary label; unselected:
      // on-surface-variant (NavigationBarTokens).
      expect(getComputedStyle(part(items[0], '.icon')).color).toBe('rgb(29, 25, 43)');
      expect(getComputedStyle(part(items[0], '.label')).color).toBe('rgb(98, 91, 113)');
      expect(getComputedStyle(part(items[1], '.icon')).color).toBe('rgb(73, 69, 79)');
      expect(getComputedStyle(part(items[1], '.label')).color).toBe('rgb(73, 69, 79)');
      // Disabled: the unselected color at 38%.
      expect(getComputedStyle(part(items[2], '.label')).color).toContain('0.38');
    });

    it('wraps icon and label in a 40dp indicator with the icon at the start', async () => {
      const {items} = await setupTest(html`
        <petal-navigation-bar>
          <petal-navigation-bar-item selected icon-position="start">
            <svg slot="icon" viewBox="0 0 24 24"><path d="M4 4h16v16H4z" /></svg>
            Home
          </petal-navigation-bar-item>
          <petal-navigation-bar-item icon-position="start">
            <svg slot="icon" viewBox="0 0 24 24"><path d="M4 4h16v16H4z" /></svg>
            Search
          </petal-navigation-bar-item>
        </petal-navigation-bar>
      `);
      const area = part(items[0], '.indicator-area');
      const label = part(items[0], '.label');
      const icon = part(items[0], '.icon');
      const [width, height] = size(area);
      expect(height).toBe(40);
      // 16dp + icon 24dp + 4dp + label + 16dp
      expect(width).toBeCloseTo(16 + 24 + 4 + label.getBoundingClientRect().width + 16, 0);
      expect(label.getBoundingClientRect().left - icon.getBoundingClientRect().right).toBeCloseTo(4, 1);
      // The label has the icon's color when selected.
      expect(getComputedStyle(label).color).toBe('rgb(29, 25, 43)');
    });
  });

  describe('selection', () => {
    it('selects the clicked item and fires change', async () => {
      const {bar, items} = await setupTest();
      let changes = 0;
      bar.addEventListener('change', () => changes++);
      items[1].click();
      await env.waitForStability();
      expect(items.map((item) => item.selected)).toEqual([false, true, false, false]);
      expect(bar.selectedIndex).toBe(1);
      expect(bar.selectedItem).toBe(items[1]);
      expect(changes).toBe(1);
      expect(items.map((item) => item.tabIndex)).toEqual([-1, 0, -1, -1]);
    });

    it('does not fire change for the selected or a disabled item', async () => {
      const {bar, items} = await setupTest();
      let changes = 0;
      bar.addEventListener('change', () => changes++);
      items[0].click();
      items[2].click();
      await env.waitForStability();
      expect(changes).toBe(0);
      expect(bar.selectedIndex).toBe(0);
    });

    it('keeps the previous item when change is canceled', async () => {
      const {bar, items} = await setupTest();
      bar.addEventListener('change', (event) => event.preventDefault());
      items[1].click();
      await env.waitForStability();
      expect(bar.selectedIndex).toBe(0);
      expect(items[0].selected).toBeTrue();
      expect(items[1].selected).toBeFalse();
    });

    it('keeps one item selected when another is selected from outside', async () => {
      const {bar, items} = await setupTest();
      items[3].selected = true;
      await env.waitForStability();
      expect(items.map((item) => item.selected)).toEqual([false, false, false, true]);
      expect(bar.selectedIndex).toBe(3);
    });

    it('selects by index without a change event', async () => {
      const {bar, items} = await setupTest();
      let changes = 0;
      bar.addEventListener('change', () => changes++);
      bar.selectedIndex = 3;
      await env.waitForStability();
      expect(items[3].selected).toBeTrue();
      expect(items[0].selected).toBeFalse();
      expect(changes).toBe(0);
    });

    it('grows the indicator when an item is selected', async () => {
      const {bar, items} = await setupTest();
      items[1].click();
      await env.waitForStability();
      // The transition runs with the default spatial spring.
      const running = animationsOf(items[1]);
      expect(running.length).toBeGreaterThan(0);
      await finishAnimations(bar);
      expect(size(part(items[1], '.indicator'))).toEqual([56, 32]);
      expect(part(items[0], '.indicator').getBoundingClientRect().width).toBe(0);
    });
  });

  describe('keyboard', () => {
    it('moves the focus with the arrow keys, skipping disabled items and wrapping', async () => {
      const {items} = await setupTest();
      items[0].focus();
      press(items[0], 'ArrowRight');
      expect(document.activeElement).toBe(items[1]);
      press(items[1], 'ArrowRight');
      expect(document.activeElement).toBe(items[3]);
      press(items[3], 'ArrowRight');
      expect(document.activeElement).toBe(items[0]);
      press(items[0], 'ArrowLeft');
      expect(document.activeElement).toBe(items[3]);
      press(items[3], 'Home');
      expect(document.activeElement).toBe(items[0]);
      press(items[0], 'End');
      expect(document.activeElement).toBe(items[3]);
    });

    it('does not select when the focus moves', async () => {
      const {bar, items} = await setupTest();
      items[0].focus();
      press(items[0], 'ArrowRight');
      await env.waitForStability();
      expect(bar.selectedIndex).toBe(0);
    });

    it('selects the focused item with Enter and Space', async () => {
      const {bar, items} = await setupTest();
      items[1].focus();
      press(items[1], 'Enter');
      await env.waitForStability();
      expect(bar.selectedIndex).toBe(1);
      items[3].focus();
      press(items[3], ' ');
      await env.waitForStability();
      expect(bar.selectedIndex).toBe(3);
    });

    it('reverses the arrow keys in right-to-left', async () => {
      const {bar, items} = await setupTest();
      bar.dir = 'rtl';
      items[0].focus();
      press(items[0], 'ArrowLeft');
      expect(document.activeElement).toBe(items[1]);
    });
  });

  describe('links', () => {
    it('renders a link for an item with href', async () => {
      const {items} = await setupTest(html`
        <petal-navigation-bar>
          <petal-navigation-bar-item href="#one" selected>One</petal-navigation-bar-item>
          <petal-navigation-bar-item href="#two" target="_blank">Two</petal-navigation-bar-item>
          <petal-navigation-bar-item>Three</petal-navigation-bar-item>
        </petal-navigation-bar>
      `);
      const link = part(items[1], 'a.item') as HTMLAnchorElement;
      expect(link.getAttribute('href')).toBe('#two');
      expect(link.target).toBe('_blank');
      expect(link.tabIndex).toBe(-1);
      expect(part(items[2], 'a.item')).toBeNull();
    });

    it('follows the link with Enter', async () => {
      const {items} = await setupTest(html`
        <petal-navigation-bar>
          <petal-navigation-bar-item href="#one" selected>One</petal-navigation-bar-item>
          <petal-navigation-bar-item href="#two">Two</petal-navigation-bar-item>
        </petal-navigation-bar>
      `);
      const clicked: Element[] = [];
      const listener = (event: Event) => {
        event.preventDefault();
        clicked.push(event.composedPath()[0] as Element);
      };
      document.addEventListener('click', listener);
      items[1].focus();
      press(items[1], 'Enter');
      document.removeEventListener('click', listener);
      expect(clicked.length).toBe(1);
      expect(clicked[0].tagName).toBe('A');
    });
  });

  describe('icons and labels', () => {
    it('shows the selected icon instead of the icon when selected', async () => {
      const {items} = await setupTest(html`
        <petal-navigation-bar>
          <petal-navigation-bar-item selected>
            <span slot="icon" id="outlined">o</span>
            <span slot="selected-icon" id="filled">f</span>
            One
          </petal-navigation-bar-item>
          <petal-navigation-bar-item>
            <span slot="icon">o</span>
            <span slot="selected-icon">f</span>
            Two
          </petal-navigation-bar-item>
        </petal-navigation-bar>
      `);
      const slot = (item: PetalNavigationBarItem, name: string) =>
        getComputedStyle(part(item, `slot[name="${name}"]`)).display;
      expect(slot(items[0], 'icon')).toBe('none');
      expect(slot(items[0], 'selected-icon')).not.toBe('none');
      expect(slot(items[1], 'icon')).not.toBe('none');
      expect(slot(items[1], 'selected-icon')).toBe('none');
    });

    it('fills a Material Symbol when selected', async () => {
      const {items} = await setupTest();
      expect(getComputedStyle(part(items[0], '.item')).getPropertyValue('--md-icon-fill')).toBe('1');
      expect(getComputedStyle(part(items[1], '.item')).getPropertyValue('--md-icon-fill')).toBe('0');
    });

    it('shows only the icon, in the same indicator, without a label', async () => {
      const {items} = await setupTest(html`
        <petal-navigation-bar>
          <petal-navigation-bar-item selected aria-label="Home">
            <svg slot="icon" viewBox="0 0 24 24"><path d="M4 4h16v16H4z" /></svg>
          </petal-navigation-bar-item>
          <petal-navigation-bar-item aria-label="Search">
            <svg slot="icon" viewBox="0 0 24 24"><path d="M4 4h16v16H4z" /></svg>
          </petal-navigation-bar-item>
        </petal-navigation-bar>
      `);
      expect(size(part(items[0], '.indicator-area'))).toEqual([56, 32]);
      expect(getComputedStyle(part(items[0], '.label')).display).toBe('none');
    });
  });

  describe('arrangement', () => {
    it('groups the items in the middle with centered', async () => {
      const {bar} = await setupTest();
      bar.arrangement = 'centered';
      await env.waitForStability();
      const bounds = bar.shadowRoot!.querySelector('.bar')!;
      // 4 items: (100 - 10 * (4 + 3)) / 2 = 15% on each side.
      expect(parseFloat(getComputedStyle(bounds).paddingLeft)).toBeCloseTo(
        bar.getBoundingClientRect().width * 0.15,
        0,
      );
    });
  });
});
