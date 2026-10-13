/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

// import 'jasmine'; (google3-only)
import './icon.js';

import {html} from 'lit';

import {Environment} from '../testing/environment.js';
import {createTokenTests} from '../testing/tokens.js';

import {PetalIcon} from './icon.js';

describe('<petal-icon>', () => {
  const env = new Environment();

  describe('.styles', () => {
    createTokenTests(PetalIcon.styles);
  });

  describe('accessiblity', () => {
    it('sets aria-hidden to true by default', async () => {
      const root = env.render(html` <petal-icon>check</petal-icon>`);
      const icon = root.querySelector('petal-icon')!;

      await env.waitForStability();

      expect(icon.getAttribute('aria-hidden')).toBe('true');
    });

    it('sets aria-hidden is removed when initalized as false', async () => {
      const root = env.render(html` <petal-icon aria-hidden="false"
        >check</petal-icon
      >`);
      const icon = root.querySelector('petal-icon')!;

      await env.waitForStability();

      expect(icon.hasAttribute('aria-hidden')).toBe(false);
    });

    it('allows overriding aria-hidden after first render', async () => {
      const root = env.render(html` <petal-icon>check</petal-icon>`);
      const icon = root.querySelector('petal-icon')!;

      await env.waitForStability();

      expect(icon.getAttribute('aria-hidden')).toBe('true');

      icon.removeAttribute('aria-hidden');
      await env.waitForStability();

      expect(icon.hasAttribute('aria-hidden')).toBe(false);
    });

    it('overrides invalid aria-hidden values to true', async () => {
      const root =
        env.render(html` <!-- @ts-ignore:disable-next-line:no-incompatible-type-binding -->
          <petal-icon aria-hidden="foo">check</petal-icon>`);
      const icon = root.querySelector('petal-icon')!;

      await env.waitForStability();

      expect(icon.getAttribute('aria-hidden')).toBe('true');
    });
  });
  describe('fill', () => {
    it('is outlined by default and filled with `filled`', async () => {
      const root = env.render(html`<petal-icon>check</petal-icon>`);
      const icon = root.querySelector('petal-icon')!;
      await env.waitForStability();
      icon.style.transition = 'none';
      const fill = () => getComputedStyle(icon).getPropertyValue('--md-icon-fill').trim();
      expect(fill()).toBe('0');
      expect(getComputedStyle(icon).fontVariationSettings).toBe('"FILL" 0');

      icon.filled = true;
      await env.waitForStability();
      expect(icon.hasAttribute('filled')).toBeTrue();
      expect(fill()).toBe('1');
      expect(getComputedStyle(icon).fontVariationSettings).toBe('"FILL" 1');
    });

    it('takes the fill from a parent', async () => {
      const root = env.render(
        html`<div style="--md-icon-fill: 1"><petal-icon>check</petal-icon></div>`,
      );
      const icon = root.querySelector('petal-icon')!;
      await env.waitForStability();
      expect(getComputedStyle(icon).fontVariationSettings).toBe('"FILL" 1');
    });

    it('animates the fill', async () => {
      const root = env.render(html`<petal-icon>check</petal-icon>`);
      const icon = root.querySelector('petal-icon')!;
      await env.waitForStability();
      // A computed style to transition from.
      getComputedStyle(icon).getPropertyValue('--md-icon-fill');
      icon.filled = true;
      await env.waitForStability();
      const [transition] = icon.getAnimations() as CSSTransition[];
      expect(transition.transitionProperty).toBe('--md-icon-fill');
    });
  });
});
