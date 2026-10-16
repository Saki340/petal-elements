/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import './navigation-rail.js';
import './navigation-rail-item.js';

import {html} from 'lit';

import {Environment} from '../testing/environment.js';

import {PetalNavigationRail} from './navigation-rail.js';
import {PetalNavigationRailItem} from './navigation-rail-item.js';

describe('<petal-navigation-rail>', () => {
  const env = new Environment();

  const icon = html`<svg slot="icon" viewBox="0 0 24 24"><path d="M4 4h16v16H4z" /></svg>`;

  function defaultTemplate(expanded = false) {
    return html`
      <petal-navigation-rail ?expanded=${expanded}>
        <button slot="header" style="width: 56px; height: 56px">Menu</button>
        <petal-navigation-rail-item selected>${icon}Home</petal-navigation-rail-item>
        <petal-navigation-rail-item>${icon}Search</petal-navigation-rail-item>
        <petal-navigation-rail-item disabled>${icon}Saved</petal-navigation-rail-item>
        <petal-navigation-rail-item>${icon}Profile settings</petal-navigation-rail-item>
      </petal-navigation-rail>
    `;
  }

  async function setupTest(template = defaultTemplate()) {
    const root = env.render(template);
    const rail = root.querySelector('petal-navigation-rail') as PetalNavigationRail;
    const items = Array.from(root.querySelectorAll('petal-navigation-rail-item')) as PetalNavigationRailItem[];
    await settle(rail);
    return {root, rail, items};
  }

  /** Every animation running in an element and its shadow tree. */
  function animationsOf(element: Element) {
    const all = [element, ...Array.from(element.shadowRoot?.querySelectorAll('*') ?? [])];
    return all.flatMap((e) => e.getAnimations());
  }

  /** Renders, then lets the spring transitions of the rail and its items end. */
  async function settle(rail: PetalNavigationRail) {
    await env.waitForStability();
    for (const element of [rail, ...rail.items]) {
      await (element as PetalNavigationRail).updateComplete;
      for (const animation of animationsOf(element)) animation.finish();
    }
    await env.waitForStability();
  }

  function part(item: PetalNavigationRailItem, selector: string) {
    return item.shadowRoot!.querySelector(selector) as HTMLElement;
  }

  function rect(element: Element) {
    const {left, top, width, height} = element.getBoundingClientRect();
    return {left, top, width, height};
  }

  function press(element: Element, key: string) {
    element.dispatchEvent(new KeyboardEvent('keydown', {key, bubbles: true, composed: true, cancelable: true}));
  }

  describe('semantics', () => {
    it('is a vertical tablist of tabs', async () => {
      const {rail, items} = await setupTest();
      const internals = (rail as unknown as {internals: ElementInternals}).internals;
      expect(internals.role).toBe('tablist');
      expect(internals.ariaOrientation).toBe('vertical');
      const itemInternals = (item: PetalNavigationRailItem) =>
        (item as unknown as {internals: ElementInternals}).internals;
      expect(items.map((item) => itemInternals(item).role)).toEqual(['tab', 'tab', 'tab', 'tab']);
      expect(items.map((item) => itemInternals(item).ariaSelected)).toEqual(['true', 'false', 'false', 'false']);
    });

    it('puts only the selected item in the tab order', async () => {
      const {items} = await setupTest();
      expect(items.map((item) => item.tabIndex)).toEqual([0, -1, -1, -1]);
    });
  });

  describe('collapsed (NavigationRailCollapsedTokens)', () => {
    it('is 96dp wide with the surface color and square corners', async () => {
      const {rail} = await setupTest();
      const style = getComputedStyle(rail);
      expect(rail.getBoundingClientRect().width).toBe(96);
      // md.sys.color.surface, light.
      expect(style.backgroundColor).toBe('rgb(254, 247, 255)');
      expect(style.borderTopLeftRadius).toBe('0px');
    });

    it('starts the content 44dp from the top, with the header 40dp above the items', async () => {
      const {rail, items} = await setupTest();
      const header = rail.querySelector('button')!;
      expect(header.getBoundingClientRect().top - rail.getBoundingClientRect().top).toBe(44);
      expect(items[0].getBoundingClientRect().top - header.getBoundingClientRect().bottom).toBe(40);
    });

    it('lays out the items 96dp by 64dp, 4dp apart', async () => {
      const {items} = await setupTest();
      expect(rect(items[0]).width).toBe(96);
      expect(rect(items[0]).height).toBe(64);
      expect(items[1].getBoundingClientRect().top - items[0].getBoundingClientRect().bottom).toBe(4);
    });

    it('puts a 56dp by 32dp indicator 20dp from the item start, with the label below', async () => {
      const {items} = await setupTest();
      const item = rect(items[0]);
      const area = rect(part(items[0], '.indicator-area'));
      expect(area.width).toBe(56);
      expect(area.height).toBe(32);
      expect(area.left - item.left).toBe(20);
      expect(area.top - item.top).toBe(0);
      const label = part(items[0], '.label');
      const text = getComputedStyle(label);
      expect(text.fontSize).toBe('12px');
      expect(text.lineHeight).toBe('16px');
      expect(text.opacity).toBe('1');
      // 4dp below the indicator.
      expect(label.getBoundingClientRect().top - (area.top + area.height)).toBe(4);
      // Centered under the indicator in the 96dp item.
      const center = label.getBoundingClientRect().left + label.getBoundingClientRect().width / 2;
      expect(center - item.left).toBeCloseTo(48, 0);
    });

    it('colors the indicator, icon and label as the Compose rail colors', async () => {
      const {items} = await setupTest();
      const indicator = part(items[0], '.indicator');
      expect(rect(indicator).width).toBe(56);
      expect(getComputedStyle(indicator).backgroundColor).toBe('rgb(232, 222, 248)');
      expect(getComputedStyle(part(items[0], '.icon')).color).toBe('rgb(29, 25, 43)');
      expect(getComputedStyle(part(items[0], '.label')).color).toBe('rgb(98, 91, 113)');
      expect(getComputedStyle(part(items[1], '.icon')).color).toBe('rgb(73, 69, 79)');
      expect(rect(part(items[1], '.indicator')).width).toBe(0);
    });
  });

  describe('expanded (NavigationRailExpandedTokens)', () => {
    it('is as wide as the widest item, at least 220dp and at most 360dp', async () => {
      const {rail, items} = await setupTest(defaultTemplate(true));
      // The widest item plus 20dp is below 220dp here.
      const widest = Math.max(...items.map((item) => item.startWidth));
      expect(widest + 20).toBeLessThan(220);
      expect(rail.getBoundingClientRect().width).toBe(220);
    });

    it('grows with a long label up to 360dp', async () => {
      const long = 'A label that is long enough to need a wide rail for sure';
      const {rail, items} = await setupTest(html`
        <petal-navigation-rail expanded>
          <petal-navigation-rail-item selected>${icon}${long}</petal-navigation-rail-item>
          <petal-navigation-rail-item>${icon}Short</petal-navigation-rail-item>
        </petal-navigation-rail>
      `);
      expect(items[0].startWidth).toBeGreaterThan(340);
      expect(rail.getBoundingClientRect().width).toBe(360);
      const mid = 'A medium label here';
      rail.querySelector('petal-navigation-rail-item')!.textContent = mid;
      await settle(rail);
      await settle(rail);
      const expected = (rail.items[0] as PetalNavigationRailItem).startWidth + 20;
      expect(rail.getBoundingClientRect().width).toBeCloseTo(Math.min(360, Math.max(220, expected)), 0);
    });

    it('puts the icon before a 14px label in a 56dp high indicator, items touching', async () => {
      const {rail, items} = await setupTest(defaultTemplate(true));
      expect(rail.expanded).toBeTrue();
      const item = rect(items[0]);
      const area = rect(part(items[0], '.indicator-area'));
      expect(area.height).toBe(56);
      expect(area.left - item.left).toBe(20);
      const label = part(items[0], '.label');
      const text = getComputedStyle(label);
      expect(text.fontSize).toBe('14px');
      expect(text.lineHeight).toBe('20px');
      expect(text.opacity).toBe('1');
      const icon = rect(part(items[0], '.icon'));
      // 16dp padding in the indicator, then the icon, 8dp, the label, 16dp.
      expect(icon.left - area.left).toBeCloseTo(16, 0);
      expect(label.getBoundingClientRect().left - (icon.left + icon.width)).toBeCloseTo(8, 0);
      expect(area.width).toBeCloseTo(16 + 24 + 8 + label.getBoundingClientRect().width + 16, 0);
      // Items are 56dp high with no space between them.
      expect(item.height).toBe(56);
      expect(rect(items[1]).top - (item.top + item.height)).toBe(0);
      // The icon is centered vertically.
      expect(icon.top - item.top).toBe(16);
    });

    it('gives the selected label the icon color', async () => {
      const {items} = await setupTest(defaultTemplate(true));
      expect(getComputedStyle(part(items[0], '.label')).color).toBe('rgb(29, 25, 43)');
    });
  });

  describe('motion', () => {
    it('animates the width and the item layout when expanded changes', async () => {
      const {rail, items} = await setupTest();
      rail.expanded = true;
      await env.waitForStability();
      await items[0].updateComplete;
      expect(animationsOf(rail).length).toBeGreaterThan(0);
      expect(animationsOf(items[0]).length).toBeGreaterThan(0);
      await settle(rail);
      expect(rail.getBoundingClientRect().width).toBe(220);
      expect(rect(items[0]).height).toBe(56);
      rail.expanded = false;
      await settle(rail);
      expect(rail.getBoundingClientRect().width).toBe(96);
      expect(rect(items[0]).height).toBe(64);
    });

    it('fades the label out and in around the middle of the move', async () => {
      const {rail, items} = await setupTest();
      rail.expanded = true;
      await env.waitForStability();
      await items[0].updateComplete;
      const transition = animationsOf(items[0]).find(
        (animation) => (animation as CSSTransition).transitionProperty === '--petal-navigation-position',
      )!;
      expect(transition).toBeDefined();
      const alphaAt = (progress: number) => {
        // Seek the spring's easing: set the transition's time, read the label.
        const duration = Number(transition.effect!.getComputedTiming().duration);
        transition.pause();
        transition.currentTime = duration * progress;
        return parseFloat(getComputedStyle(part(items[0], '.label')).opacity);
      };
      const start = alphaAt(0);
      const end = alphaAt(1);
      const middle = alphaAt(0.19);
      expect(start).toBe(1);
      expect(end).toBe(1);
      // 4 * (p - 0.5)^2 is 0 at p = 0.5, which the spring passes at ~19% of its time.
      expect(middle).toBeLessThan(0.5);
    });
  });

  describe('without a label', () => {
    it('is a 56dp circle around the icon, centered in a 96dp item', async () => {
      const {items} = await setupTest(html`
        <petal-navigation-rail>
          <petal-navigation-rail-item selected aria-label="Home">${icon}</petal-navigation-rail-item>
          <petal-navigation-rail-item aria-label="Search">${icon}</petal-navigation-rail-item>
        </petal-navigation-rail>
      `);
      const item = rect(items[0]);
      const area = rect(part(items[0], '.indicator-area'));
      expect(item.width).toBe(96);
      expect(area.width).toBe(56);
      expect(area.height).toBe(56);
      expect(area.left - item.left).toBe(20);
      expect(rect(part(items[0], '.indicator')).width).toBe(56);
    });
  });

  describe('header', () => {
    it('has no space for a header that is not there', async () => {
      const {items} = await setupTest(html`
        <petal-navigation-rail>
          <petal-navigation-rail-item selected>${icon}Home</petal-navigation-rail-item>
        </petal-navigation-rail>
      `);
      const rail = items[0].parentElement!;
      expect(items[0].getBoundingClientRect().top - rail.getBoundingClientRect().top).toBe(44);
    });
  });

  describe('selection and keyboard', () => {
    it('selects the clicked item and fires change', async () => {
      const {rail, items} = await setupTest();
      let changes = 0;
      rail.addEventListener('change', () => changes++);
      items[3].click();
      await env.waitForStability();
      expect(rail.selectedIndex).toBe(3);
      expect(items.map((item) => item.selected)).toEqual([false, false, false, true]);
      expect(changes).toBe(1);
    });

    it('moves the focus with up and down, skipping disabled items', async () => {
      const {items} = await setupTest();
      items[0].focus();
      press(items[0], 'ArrowDown');
      expect(document.activeElement).toBe(items[1]);
      press(items[1], 'ArrowDown');
      expect(document.activeElement).toBe(items[3]);
      press(items[3], 'ArrowDown');
      expect(document.activeElement).toBe(items[0]);
      press(items[0], 'ArrowUp');
      expect(document.activeElement).toBe(items[3]);
      press(items[3], 'Home');
      expect(document.activeElement).toBe(items[0]);
      // The horizontal arrows do not move the focus.
      press(items[0], 'ArrowRight');
      expect(document.activeElement).toBe(items[0]);
    });

    it('selects the focused item with Enter', async () => {
      const {rail, items} = await setupTest();
      items[1].focus();
      press(items[1], 'Enter');
      await env.waitForStability();
      expect(rail.selectedIndex).toBe(1);
    });

    it('lets a link item follow its href', async () => {
      const {items} = await setupTest(html`
        <petal-navigation-rail>
          <petal-navigation-rail-item selected href="#a">${icon}A</petal-navigation-rail-item>
          <petal-navigation-rail-item href="#b" target="_blank">${icon}B</petal-navigation-rail-item>
        </petal-navigation-rail>
      `);
      const link = part(items[1], 'a.item') as HTMLAnchorElement;
      expect(link.getAttribute('href')).toBe('#b');
      expect(link.target).toBe('_blank');
    });
  });

  describe('icon position', () => {
    it('follows the rail, unless the item sets it', async () => {
      const {rail, items} = await setupTest(html`
        <petal-navigation-rail expanded>
          <petal-navigation-rail-item selected>${icon}One</petal-navigation-rail-item>
          <petal-navigation-rail-item icon-position="top">${icon}Two</petal-navigation-rail-item>
        </petal-navigation-rail>
      `);
      expect(rect(part(items[0], '.indicator-area')).height).toBe(56);
      expect(rect(part(items[1], '.indicator-area')).height).toBe(32);
      rail.expanded = false;
      await settle(rail);
      expect(rect(part(items[0], '.indicator-area')).height).toBe(32);
    });
  });
});
