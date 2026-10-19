/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

// Checks petal-badge against Jetpack Compose Material 3 (Badge.kt and
// BadgeTokens at androidx commit df73c24).

import {html} from 'lit';

import {Environment} from '../testing/environment.js';
import {createTokenTests} from '../testing/tokens.js';

import '../icon/icon.js';
import '../iconbutton/icon-button.js';
import '../navigationbar/navigation-bar.js';
import '../navigationbar/navigation-bar-item.js';
import '../navigationrail/navigation-rail.js';
import '../navigationrail/navigation-rail-item.js';
import './badge.js';

import {PetalBadge} from './badge.js';

// Fallbacks of the light scheme (no theme on the test page).
const ERROR = 'rgb(179, 38, 30)';
const ON_ERROR = 'rgb(255, 255, 255)';

describe('<petal-badge>', () => {
  const env = new Environment();

  describe('.styles', () => {
    createTokenTests(PetalBadge.styles);
  });

  function box(badge: PetalBadge) {
    return badge.renderRoot.querySelector('.badge')!.getBoundingClientRect();
  }

  it('is a 6px error dot without a value', async () => {
    const root = env.render(html`<petal-badge></petal-badge>`);
    await env.waitForStability();
    const badge = root.querySelector('petal-badge')!;
    const rect = box(badge);
    expect([rect.width, rect.height]).toEqual([6, 6]);
    const style = getComputedStyle(badge.renderRoot.querySelector('.badge')!);
    expect(style.backgroundColor).toBe(ERROR);
  });

  it('is a 16px pill with 4px padding and LabelSmall with a value', async () => {
    const root = env.render(html`
      <petal-badge value="3"></petal-badge>
      <petal-badge value="999+"></petal-badge>
    `);
    await env.waitForStability();
    const [one, many] = root.querySelectorAll('petal-badge');
    expect([box(one).width, box(one).height]).toEqual([16, 16]);
    expect(box(many).height).toBe(16);
    expect(box(many).width).toBeGreaterThan(16);
    const style = getComputedStyle(many.renderRoot.querySelector('.badge')!);
    expect(style.paddingInlineStart).toBe('4px');
    expect(style.color).toBe(ON_ERROR);
    expect(style.fontSize).toBe('11px');
    expect(style.lineHeight).toBe('16px');
  });

  it('reflects the value so that the placement can tell a dot from a count', async () => {
    const root = env.render(html`<petal-badge></petal-badge>`);
    await env.waitForStability();
    const badge = root.querySelector('petal-badge')!;
    badge.value = '7';
    await env.waitForStability();
    expect(badge.getAttribute('value')).toBe('7');
  });

  describe('placement (BadgedBox)', () => {
    /** The badge's position relative to the icon it is on. */
    function placement(anchor: Element) {
      const icon = anchor.querySelector('petal-icon')!.getBoundingClientRect();
      const rect = box(anchor.querySelector('petal-badge')!);
      return [rect.left - icon.left, rect.top - icon.top];
    }

    it('puts a dot 6px from the end of the icon, its bottom 6px below the top', async () => {
      const root = env.render(html`
        <petal-icon-button aria-label="Notifications">
          <petal-icon>notifications</petal-icon>
          <petal-badge slot="badge"></petal-badge>
        </petal-icon-button>
      `);
      await env.waitForStability();
      expect(placement(root.querySelector('petal-icon-button')!)).toEqual([18, 0]);
    });

    it('puts a count 12px from the end, its bottom 14px below the top', async () => {
      const root = env.render(html`
        <petal-icon-button aria-label="Mail">
          <petal-icon>mail</petal-icon>
          <petal-badge slot="badge" value="3"></petal-badge>
        </petal-icon-button>
        <petal-navigation-bar style="width: 360px">
          <petal-navigation-bar-item selected>
            <petal-icon slot="icon">inbox</petal-icon>
            <petal-badge slot="badge" value="12"></petal-badge>
            Inbox
          </petal-navigation-bar-item>
        </petal-navigation-bar>
        <petal-navigation-rail>
          <petal-navigation-rail-item selected>
            <petal-icon slot="icon">inbox</petal-icon>
            <petal-badge slot="badge" value="5"></petal-badge>
            Inbox
          </petal-navigation-rail-item>
        </petal-navigation-rail>
      `);
      await env.waitForStability();
      for (const selector of [
        'petal-icon-button',
        'petal-navigation-bar-item',
        'petal-navigation-rail-item',
      ]) {
        expect(placement(root.querySelector(selector)!))
          .withContext(selector)
          .toEqual([12, -2]);
      }
    });

    it('keeps the icons of a navigation item at the icon size', async () => {
      const root = env.render(html`
        <petal-navigation-bar style="width: 360px">
          <petal-navigation-bar-item>
            <petal-icon slot="icon">inbox</petal-icon>
            <petal-badge slot="badge" value="12"></petal-badge>
            Inbox
          </petal-navigation-bar-item>
        </petal-navigation-bar>
      `);
      await env.waitForStability();
      const icon = root.querySelector('petal-icon')!.getBoundingClientRect();
      expect([icon.width, icon.height]).toEqual([24, 24]);
      expect(box(root.querySelector('petal-badge')!).height).toBe(16);
    });
  });
});
