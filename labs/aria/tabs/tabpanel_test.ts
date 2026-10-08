/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

// import 'jasmine'; (google3-only)

import './md-aria-tab.js';
import './md-aria-tablist.js';
import './md-aria-tabpanel.js';

import {html} from 'lit';
import {Environment} from '../../../testing/environment.js';
import {internals} from '../../behaviors/element-internals.js';

describe('petal-aria-tabpanel', () => {
  const env = new Environment();

  async function setupTest(
    template = html`
      <petal-aria-tablist>
        <petal-aria-tab id="tabone" tabpanel="panelone">Tab one</petal-aria-tab>
        <petal-aria-tab id="tabtwo" tabpanel="paneltwo">Tab two</petal-aria-tab>
      </petal-aria-tablist>
      <petal-aria-tabpanel id="panelone" tab="tabone">
        Panel Content 1
      </petal-aria-tabpanel>
      <petal-aria-tabpanel id="paneltwo" tab="tabtwo">
        Panel Content 2
      </petal-aria-tabpanel>
    `,
  ) {
    const root = env.render(template);
    await env.waitForStability();
    const tabs = Array.from(root.querySelectorAll('petal-aria-tab'));
    const panels = Array.from(root.querySelectorAll('petal-aria-tabpanel'));
    return {root, tabs, panels};
  }

  describe('ARIA roles and internals', () => {
    it('sets element role to "tabpanel"', async () => {
      const {panels} = await setupTest();

      expect(panels[0][internals].role).toBe('tabpanel');
    });

    it('links associated tab element via tab ID attribute', async () => {
      const {tabs, panels} = await setupTest();

      expect(panels[0].tabElement).toBe(tabs[0]);
      expect(panels[0].tab).toBe('tabone');
    });

    it('configures tabIndex to 0 by default', async () => {
      const {panels} = await setupTest();

      expect(panels[0].tabIndex).toBe(0);
      expect(panels[0].getAttribute('tabindex')).toBe('0');
    });
  });

  describe('Properties and tab linking', () => {
    it('updates associated tab link when tabElement property is modified', async () => {
      const {tabs, panels} = await setupTest();

      panels[0].tabElement = tabs[1];
      await env.waitForStability();

      expect(panels[0].tabElement).toBe(tabs[1]);
      expect(panels[0].tab).toBe('tabtwo');
    });

    it('updates associated tab element when tab property is modified', async () => {
      const {tabs, panels} = await setupTest();

      panels[0].tab = 'tabtwo';
      await env.waitForStability();

      expect(panels[0].tabElement).toBe(tabs[1]);
    });

    it('returns null for tabElement when unlinked', async () => {
      const {panels} = await setupTest(
        html`<petal-aria-tabpanel id="panel"></petal-aria-tabpanel>`,
      );

      expect(panels[0].tab).toBe('');
      expect(panels[0].tabElement).toBeNull();
    });

    it('clears tab link when tabElement is set to null', async () => {
      const {panels} = await setupTest();

      panels[0].tabElement = null;
      await env.waitForStability();

      expect(panels[0].tab).toBe('');
    });
  });
});
