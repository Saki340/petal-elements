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
});
