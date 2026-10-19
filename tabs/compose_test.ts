/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

// Checks petal-tabs against Jetpack Compose Material 3 (Tab.kt, TabRow.kt,
// PrimaryNavigationTabTokens and SecondaryNavigationTabTokens at androidx
// commit df73c24).

import {html} from 'lit';

import {DEFAULT_SPATIAL, springEasing} from '../internal/motion/spring.js';
import {Environment} from '../testing/environment.js';

import './primary-tab.js';
import './secondary-tab.js';
import './tabs.js';

import type {PetalPrimaryTab} from './primary-tab.js';
import type {PetalTabs} from './tabs.js';

// Fallbacks of the light scheme (no theme on the test page).
const PRIMARY = 'rgb(103, 80, 164)';
const ON_SURFACE = 'rgb(29, 27, 32)';
const OUTLINE_VARIANT = 'rgb(202, 196, 208)';

function css(element: Element, property: string) {
  return getComputedStyle(element).getPropertyValue(property);
}

describe('petal-tabs after Compose', () => {
  const env = new Environment();

  async function setup(template: ReturnType<typeof html>) {
    const root = env.render(template);
    await env.waitForStability();
    const tabs = root.querySelector('petal-tabs') as PetalTabs;
    const tab = (index: number) => tabs.tabs[index] as PetalPrimaryTab;
    const part = (index: number, selector: string) =>
      tab(index).renderRoot.querySelector(selector) as HTMLElement;
    return {tabs, tab, part};
  }

  const primaryRow = html`
    <petal-tabs style="width: 360px">
      <petal-primary-tab>Video</petal-primary-tab>
      <petal-primary-tab>Photos</petal-primary-tab>
      <petal-primary-tab>Audio</petal-primary-tab>
    </petal-tabs>
  `;

  const secondaryRow = html`
    <petal-tabs style="width: 360px">
      <petal-secondary-tab>Birds</petal-secondary-tab>
      <petal-secondary-tab>Cats</petal-secondary-tab>
      <petal-secondary-tab>Dogs</petal-secondary-tab>
    </petal-tabs>
  `;

  describe('primary tabs (PrimaryTabRow)', () => {
    it('a row of labels is 48dp high; the tabs share the width equally', async () => {
      const {tabs, tab} = await setup(primaryRow);
      expect(tabs.getBoundingClientRect().height).toBe(48);
      const widths = [0, 1, 2].map((i) => tab(i).getBoundingClientRect().width);
      expect(widths).toEqual([120, 120, 120]);
      expect(tab(0).getBoundingClientRect().height).toBe(48);
    });

    it('pads the label 16dp at both sides (HorizontalTextPadding)', async () => {
      const {tab} = await setup(primaryRow);
      expect(css(tab(0), 'padding-left')).toBe('16px');
      expect(css(tab(0), 'padding-right')).toBe('16px');
    });

    it('labels use title small, centered', async () => {
      const {tab} = await setup(primaryRow);
      const style = getComputedStyle(tab(0));
      expect(style.fontSize).toBe('14px');
      expect(style.lineHeight).toBe('20px');
      expect(style.fontWeight).toBe('500');
      expect(style.letterSpacing).toBe('0.1px');
    });

    it('draws a 3dp indicator in Primary, rounded with 3dp', async () => {
      const {part} = await setup(primaryRow);
      const style = getComputedStyle(part(0, '.indicator'));
      expect(style.height).toBe('3px');
      expect(style.backgroundColor).toBe(PRIMARY);
      expect(style.borderTopLeftRadius).toBe('3px');
      expect(style.borderBottomRightRadius).toBe('3px');
    });

    it('the indicator is as wide as the label (contentWidth) and sits at the bottom', async () => {
      const {tab, part} = await setup(primaryRow);
      const content = part(0, '.content').getBoundingClientRect();
      const indicator = part(0, '.indicator').getBoundingClientRect();
      expect(indicator.width).toBe(content.width);
      expect(indicator.width).toBeLessThan(
        tab(0).getBoundingClientRect().width - 32 + 1,
      );
      expect(indicator.bottom).toBe(tab(0).getBoundingClientRect().bottom);
      // Centered in the tab.
      const tabRect = tab(0).getBoundingClientRect();
      expect(indicator.left - tabRect.left).toBeCloseTo(
        tabRect.right - indicator.right,
        0,
      );
    });

    it('the indicator is at least 24dp wide', async () => {
      const {part} = await setup(html`
        <petal-tabs style="width: 360px">
          <petal-primary-tab>I</petal-primary-tab>
          <petal-primary-tab>Audio</petal-primary-tab>
        </petal-tabs>
      `);
      expect(part(0, '.indicator').getBoundingClientRect().width).toBe(24);
    });

    it('draws the divider (outline variant, 1dp) over the bottom of the row', async () => {
      const {tabs} = await setup(primaryRow);
      const divider = tabs.renderRoot.querySelector('petal-divider')!;
      const rect = divider.getBoundingClientRect();
      expect(rect.height).toBe(1);
      expect(rect.bottom).toBe(tabs.getBoundingClientRect().bottom);
      expect(getComputedStyle(divider).color).toBe(OUTLINE_VARIANT);
    });

    it('tabs have the content color Primary, selected or not', async () => {
      const {tabs, tab} = await setup(primaryRow);
      expect(tabs.activeTabIndex).toBe(0);
      expect(css(tab(0), 'color')).toBe(PRIMARY);
      // unselectedContentColor = selectedContentColor.
      expect(css(tab(1), 'color')).toBe(PRIMARY);
    });

    it('the inactive color can still be set with the token', async () => {
      const {tab} = await setup(html`
        <petal-tabs style="width: 360px">
          <petal-primary-tab>A</petal-primary-tab>
          <petal-primary-tab
            style="--md-primary-tab-label-text-color: rgb(1, 2, 3)"
            >B</petal-primary-tab
          >
        </petal-tabs>
      `);
      expect(css(tab(1), 'color')).toBe('rgb(1, 2, 3)');
    });

    it('does not change the content color on hover, focus or press (only the ripple)', async () => {
      const {tab} = await setup(primaryRow);
      const style = getComputedStyle(tab(1));
      for (const property of [
        '--_hover-label-text-color',
        '--_focus-label-text-color',
        '--_pressed-label-text-color',
        '--_active-hover-label-text-color',
        '--_active-focus-label-text-color',
        '--_active-pressed-label-text-color',
        '--_hover-icon-color',
        '--_focus-icon-color',
        '--_pressed-icon-color',
      ]) {
        expect(style.getPropertyValue(property).trim())
          .withContext(property)
          .toBe('#6750a4');
      }
    });

    it('the ripple is tinted with the selected content color', async () => {
      const {tab} = await setup(primaryRow);
      const style = getComputedStyle(tab(1));
      for (const state of ['hover', 'pressed', 'active-hover', 'active-pressed']) {
        expect(style.getPropertyValue(`--_${state}-state-layer-color`).trim())
          .withContext(state)
          .toBe('#6750a4');
      }
    });

    it('a tab with an icon above its label is 72dp high (LargeTabHeight)', async () => {
      const {tabs, tab} = await setup(html`
        <petal-tabs style="width: 360px">
          <petal-primary-tab>
            <span slot="icon" style="width: 24px; height: 24px"></span>
            Video
          </petal-primary-tab>
          <petal-primary-tab>Photos</petal-primary-tab>
        </petal-tabs>
      `);
      expect(tab(0).getBoundingClientRect().height).toBe(72);
      // The row takes the tallest tab; the other tab fills it.
      expect(tabs.getBoundingClientRect().height).toBe(72);
      expect(tab(1).getBoundingClientRect().height).toBe(72);
    });

    it('puts the icon 11dp from the top of a 72dp tab, 24dp, above the label', async () => {
      const {tab} = await setup(html`
        <petal-tabs style="width: 360px">
          <petal-primary-tab>
            <span slot="icon" style="width: 24px; height: 24px"></span>
            Video
          </petal-primary-tab>
        </petal-tabs>
      `);
      const icon = tab(0).querySelector('[slot=icon]')!.getBoundingClientRect();
      const top = tab(0).getBoundingClientRect().top;
      expect(icon.top - top).toBe(11);
      expect(css(tab(0).querySelector('[slot=icon]')!, 'width')).toBe('24px');
    });

    it('an icon next to the label (LeadingIconTab) is 48dp high with 8dp between', async () => {
      const {tab} = await setup(html`
        <petal-tabs style="width: 360px">
          <petal-primary-tab inline-icon>
            <span slot="icon" style="width: 24px; height: 24px"></span>
            Video
          </petal-primary-tab>
        </petal-tabs>
      `);
      expect(tab(0).getBoundingClientRect().height).toBe(48);
      expect(css(tab(0).renderRoot.querySelector('.content')!, 'column-gap')).toBe(
        '8px',
      );
    });

    it('an icon alone is 48dp high', async () => {
      const {tab} = await setup(html`
        <petal-tabs style="width: 360px">
          <petal-primary-tab>
            <span slot="icon" style="width: 24px; height: 24px"></span>
          </petal-primary-tab>
        </petal-tabs>
      `);
      expect(tab(0).getBoundingClientRect().height).toBe(48);
    });
  });

  describe('secondary tabs (SecondaryTabRow)', () => {
    it('is 48dp high', async () => {
      const {tabs} = await setup(secondaryRow);
      expect(tabs.getBoundingClientRect().height).toBe(48);
    });

    it('draws a 3dp indicator in Primary over the whole tab, not rounded', async () => {
      const {tab, part} = await setup(secondaryRow);
      const indicator = part(0, '.indicator');
      const style = getComputedStyle(indicator);
      expect(style.height).toBe('3px');
      expect(style.backgroundColor).toBe(PRIMARY);
      expect(style.borderTopLeftRadius).toBe('0px');
      const rect = indicator.getBoundingClientRect();
      expect(rect.width).toBe(tab(0).getBoundingClientRect().width);
      expect(rect.bottom).toBe(tab(0).getBoundingClientRect().bottom);
    });

    it('tabs have the content color OnSurface, selected or not', async () => {
      const {tab} = await setup(secondaryRow);
      expect(css(tab(0), 'color')).toBe(ON_SURFACE);
      expect(css(tab(1), 'color')).toBe(ON_SURFACE);
    });
  });

  describe('scrollable rows (ScrollableTabRow)', () => {
    const scrollable = html`
      <petal-tabs scrollable style="width: 360px">
        <petal-primary-tab>A</petal-primary-tab>
        <petal-primary-tab>Photos</petal-primary-tab>
        <petal-primary-tab>Audio of something long</petal-primary-tab>
        <petal-primary-tab>Videos</petal-primary-tab>
        <petal-primary-tab>More</petal-primary-tab>
      </petal-tabs>
    `;

    it('tabs are 90dp wide at least (ScrollableTabRowMinTabWidth)', async () => {
      const {tab} = await setup(scrollable);
      expect(tab(0).getBoundingClientRect().width).toBe(90);
      expect(tab(1).getBoundingClientRect().width).toBe(90);
      expect(tab(2).getBoundingClientRect().width).toBeGreaterThan(90);
    });

    it('starts 52dp from the edge (ScrollableTabRowEdgeStartPadding)', async () => {
      const {tabs, tab} = await setup(scrollable);
      expect(
        tab(0).getBoundingClientRect().left - tabs.getBoundingClientRect().left,
      ).toBe(52);
    });

    it('ends 52dp from the edge', async () => {
      const {tabs, tab} = await setup(scrollable);
      const scroller = tabs.renderRoot.querySelector('.tabs') as HTMLElement;
      const last = tab(4).getBoundingClientRect().right;
      const width = scroller.scrollWidth;
      // The scroll width ends 52dp after the last tab.
      expect(
        width - (last - scroller.getBoundingClientRect().left),
      ).toBeCloseTo(52, 0);
    });

    it('a row that is not scrollable has no edge padding', async () => {
      const {tabs, tab} = await setup(primaryRow);
      expect(
        tab(0).getBoundingClientRect().left - tabs.getBoundingClientRect().left,
      ).toBe(0);
    });

    it('the divider does not scroll with the tabs', async () => {
      const {tabs} = await setup(scrollable);
      const divider = tabs.renderRoot.querySelector('petal-divider')!;
      expect(divider.getBoundingClientRect().width).toBe(360);
    });
  });

  describe('motion', () => {
    it('moves the indicator on the default spatial spring', async () => {
      const {tabs, part} = await setup(primaryRow);
      const indicator = part(1, '.indicator');
      const from = part(0, '.indicator').getBoundingClientRect();
      const to = indicator.getBoundingClientRect();
      spyOn(indicator, 'animate').and.callThrough();
      tabs.activeTabIndex = 1;
      await env.waitForStability();

      const {easing, duration} = springEasing(DEFAULT_SPATIAL);
      expect(indicator.animate).toHaveBeenCalledTimes(1);
      const [keyframes, options] = (indicator.animate as jasmine.Spy).calls
        .mostRecent().args;
      expect(options.easing).toBe(easing);
      expect(options.duration).toBe(duration);
      expect(easing).toContain('linear(');
      // From the previous indicator (offset and width move on the same
      // spring).
      expect(parseFloat(keyframes[0].left)).toBeCloseTo(from.left - to.left, 3);
      expect(parseFloat(keyframes[0].right)).toBeCloseTo(
        to.right - from.right,
        3,
      );
      expect(from.left).toBeLessThan(to.left);
      expect(keyframes[1]).toEqual({left: '0px', right: '0px'});
    });

    it('moves the indicator on the spring of the page', async () => {
      const {tabs, part} = await setup(primaryRow);
      tabs.style.setProperty('--md-sys-motion-spring-default-spatial-damping', '1');
      tabs.style.setProperty(
        '--md-sys-motion-spring-default-spatial-stiffness',
        '1400',
      );
      const indicator = part(2, '.indicator');
      spyOn(indicator, 'animate').and.callThrough();
      tabs.activeTabIndex = 2;
      await env.waitForStability();

      const options = (indicator.animate as jasmine.Spy).calls.mostRecent()
        .args[1];
      expect(options.duration).toBe(
        springEasing({dampingRatio: 1, stiffness: 1400}).duration,
      );
    });

    it('does not move the indicator with reduced motion', async () => {
      const {tabs, part} = await setup(primaryRow);
      const indicator = part(1, '.indicator');
      spyOn(indicator, 'animate').and.callThrough();
      spyOn(window, 'matchMedia').and.returnValue({matches: true} as MediaQueryList);
      tabs.activeTabIndex = 1;
      await env.waitForStability();
      expect(indicator.animate).not.toHaveBeenCalled();
    });

    it('fades the content color in on the default effects spring and out on the fast one', async () => {
      const {tab} = await setup(primaryRow);
      // Selected tab: default effects (230ms); others: fast effects (149ms).
      expect(css(tab(0), 'transition-property')).toBe('color');
      expect(css(tab(0), 'transition-duration')).toBe('0.23s');
      expect(css(tab(1), 'transition-duration')).toBe('0.149s');
      expect(css(tab(1), 'transition-timing-function')).toContain('linear(');
    });

    it('scrolls the selected tab to the center of a scrollable row', async () => {
      const {tabs, tab} = await setup(html`
        <petal-tabs scrollable style="width: 360px">
          <petal-primary-tab>Video</petal-primary-tab>
          <petal-primary-tab>Photos</petal-primary-tab>
          <petal-primary-tab>Audio</petal-primary-tab>
          <petal-primary-tab>Radio</petal-primary-tab>
          <petal-primary-tab>Music</petal-primary-tab>
          <petal-primary-tab>Games</petal-primary-tab>
        </petal-tabs>
      `);
      const scroller = tabs.renderRoot.querySelector('.tabs') as HTMLElement;
      let now = 0;
      spyOn(performance, 'now').and.callFake(() => (now += 16));
      tabs.activeTabIndex = 3;
      await env.waitForStability();
      // The scroll runs on frames.
      jasmine.clock().tick(5000);
      expect(scroller.scrollLeft).toBeGreaterThan(0);
      const row = scroller.getBoundingClientRect();
      const rect = tab(3).getBoundingClientRect();
      expect(
        rect.left + rect.width / 2 - (row.left + row.width / 2),
      ).toBeCloseTo(0, 0);
    });
  });
});
