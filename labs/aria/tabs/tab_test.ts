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
import {hasState} from '../../behaviors/custom-state-set.js';
import {internals} from '../../behaviors/element-internals.js';

describe('petal-aria-tab', () => {
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
    it('sets element role to "tab"', async () => {
      const {tabs} = await setupTest();

      expect(tabs[0][internals].role).toBe('tab');
    });

    it('links associated tabpanel element via tabpanel ID attribute', async () => {
      const {tabs, panels} = await setupTest();

      expect(tabs[0].tabpanelElement).toBe(panels[0]);
      expect(tabs[0].tabpanel).toBe('panelone');
    });
  });

  describe('Selection state and properties', () => {
    it('updates aria-selected and custom state when selected is toggled', async () => {
      const {tabs} = await setupTest();

      tabs[0].selected = false;
      await env.waitForStability();

      expect(tabs[0][internals].ariaSelected).toBe('false');
      expect(tabs[0][hasState]('selected')).toBeFalse();
    });

    it('updates tabpanel link when tabpanelElement is set', async () => {
      const {tabs, panels} = await setupTest();

      tabs[0].tabpanelElement = panels[1];
      await env.waitForStability();

      expect(tabs[0].tabpanelElement).toBe(panels[1]);
      expect(tabs[0].tabpanel).toBe('paneltwo');
    });

    it('does not trigger click on keydown if default is prevented', async () => {
      const {tabs} = await setupTest();
      const clickSpy = jasmine.createSpy('click');
      tabs[0].addEventListener('click', clickSpy);

      tabs[0].addEventListener(
        'keydown',
        (event) => {
          event.preventDefault();
        },
        {once: true},
      );

      tabs[0].dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Enter',
          bubbles: true,
          cancelable: true,
        }),
      );
      await env.waitForStability();

      expect(clickSpy).not.toHaveBeenCalled();
    });
  });
});
