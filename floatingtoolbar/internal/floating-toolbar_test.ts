/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import '../../fab/fab.js';
import '../floating-toolbar.js';

import {html} from 'lit';

import {Environment} from '../../testing/environment.js';
import {FloatingToolbar} from './floating-toolbar.js';

describe('<petal-floating-toolbar>', () => {
  const env = new Environment();

  async function setupTest(attributes = '', withFab = false) {
    const root = env.render(html`
      <petal-floating-toolbar aria-label="Edit">
        <button slot="leading" id="lead" style="width: 48px; height: 48px">L</button>
        <button id="a" style="width: 48px; height: 48px">A</button>
        <button id="b" style="width: 48px; height: 48px">B</button>
        <button slot="trailing" id="trail" style="width: 48px; height: 48px">T</button>
        ${withFab ? html`<petal-fab slot="fab" id="fab" aria-label="Add"></petal-fab>` : ''}
      </petal-floating-toolbar>
    `);
    const toolbar = root.querySelector('petal-floating-toolbar') as FloatingToolbar;
    for (const attribute of attributes.split(' ').filter(Boolean)) {
      const [name, value = ''] = attribute.split('=');
      toolbar.setAttribute(name, value);
    }
    await env.waitForStability();
    return toolbar;
  }

  const part = (toolbar: FloatingToolbar, selector: string) =>
    toolbar.shadowRoot!.querySelector<HTMLElement>(selector)!;
  const size = (element: Element) => {
    const rect = element.getBoundingClientRect();
    return {width: rect.width, height: rect.height};
  };

  /** Runs the spring until it settles. */
  async function settle(toolbar: FloatingToolbar) {
    for (let i = 0; i < 300; i++) {
      jasmine.clock().tick(20);
      await toolbar.updateComplete;
    }
  }

  describe('without a FAB', () => {
    it('is 64px high (FloatingToolbarTokens.ContainerHeight)', async () => {
      const toolbar = await setupTest('expanded');
      expect(size(toolbar).height).toBe(64);
    });

    it('wraps the content with 8px of padding, with all slots shown', async () => {
      const toolbar = await setupTest('expanded');
      // 4 buttons of 48px + 8px of padding on both sides.
      expect(size(toolbar).width).toBe(4 * 48 + 16);
    });

    it('is a pill (CornerFull)', async () => {
      const toolbar = await setupTest('expanded');
      expect(getComputedStyle(part(toolbar, '.toolbar-box')).borderTopLeftRadius).toBe('9999px');
    });

    it('shows only the default slot when collapsed', async () => {
      const toolbar = await setupTest();
      expect(size(toolbar).width).toBe(2 * 48 + 16);
      expect(part(toolbar, '.leading').hasAttribute('inert')).toBeTrue();
      expect(part(toolbar, '.trailing').hasAttribute('inert')).toBeTrue();
    });

    it('expands and collapses with the expanded attribute', async () => {
      const toolbar = await setupTest();
      toolbar.expanded = true;
      await settle(toolbar);
      expect(size(toolbar).width).toBe(4 * 48 + 16);
      toolbar.expanded = false;
      await settle(toolbar);
      expect(size(toolbar).width).toBe(2 * 48 + 16);
    });

    it('jumps with reduced motion', async () => {
      spyOn(window, 'matchMedia').and.returnValue({matches: true} as MediaQueryList);
      const toolbar = await setupTest();
      toolbar.expanded = true;
      await toolbar.updateComplete;
      expect(size(toolbar).width).toBe(4 * 48 + 16);
    });

    it('is vertical and 64px wide', async () => {
      const toolbar = await setupTest('expanded orientation=vertical');
      expect(size(toolbar).width).toBe(64);
      expect(size(toolbar).height).toBe(4 * 48 + 16);
      expect(part(toolbar, '[role=toolbar]').getAttribute('aria-orientation')).toBe('vertical');
    });
  });

  describe('with a FAB', () => {
    it('shows the 56px FAB and the toolbar when expanded', async () => {
      const toolbar = await setupTest('expanded', true);
      const fab = toolbar.querySelector('#fab')!;
      expect(size(fab)).toEqual({width: 56, height: 56});
      // The toolbar has the default items only (2 buttons) and 8px padding.
      expect(size(part(toolbar, '.toolbar-box')).width).toBe(2 * 48 + 16);
      expect(size(part(toolbar, '.toolbar-box')).height).toBe(64);
      // toolbar + 8px gap + 56px FAB, 80px high.
      expect(size(toolbar)).toEqual({width: 2 * 48 + 16 + 8 + 56, height: 80});
    });

    it('collapses into an 80px FAB and keeps its size', async () => {
      const toolbar = await setupTest('expanded', true);
      toolbar.expanded = false;
      await settle(toolbar);
      expect(size(toolbar.querySelector('#fab')!)).toEqual({width: 80, height: 80});
      expect(size(part(toolbar, '.toolbar-box')).width).toBe(0);
      expect(size(toolbar)).toEqual({width: 2 * 48 + 16 + 8 + 56, height: 80});
      expect(part(toolbar, '.toolbar').hasAttribute('inert')).toBeTrue();
    });

    it('puts the FAB at the start', async () => {
      const toolbar = await setupTest('expanded fab-position=start', true);
      const fab = toolbar.querySelector('#fab')!.getBoundingClientRect();
      const host = toolbar.getBoundingClientRect();
      expect(fab.left).toBe(host.left);
    });

    it('stacks vertically with the FAB at the bottom', async () => {
      const toolbar = await setupTest('expanded orientation=vertical', true);
      const fab = toolbar.querySelector('#fab')!.getBoundingClientRect();
      const host = toolbar.getBoundingClientRect();
      expect(host.width).toBe(80);
      expect(host.height).toBe(2 * 48 + 16 + 8 + 56);
      expect(fab.bottom).toBe(host.bottom);
      expect(size(part(toolbar, '.toolbar-box')).width).toBe(64);
    });
  });

  describe('colors', () => {
    it('standard uses surface-container, vibrant primary-container', async () => {
      const standard = await setupTest('expanded');
      const standardColor = getComputedStyle(part(standard, '.surface')).backgroundColor;
      const vibrant = await setupTest('expanded colors=vibrant');
      const vibrantColor = getComputedStyle(part(vibrant, '.surface')).backgroundColor;
      expect(standardColor).not.toBe(vibrantColor);
    });
  });

  describe('accessibility', () => {
    it('is a labelled toolbar', async () => {
      const toolbar = await setupTest('expanded');
      const bar = part(toolbar, '[role=toolbar]');
      expect(bar.getAttribute('aria-label')).toBe('Edit');
      expect(bar.getAttribute('aria-orientation')).toBe('horizontal');
    });

    it('moves focus with the arrow keys, Home and End', async () => {
      const toolbar = await setupTest('expanded');
      const key = (name: string) =>
        toolbar
          .querySelector<HTMLElement>(':focus')!
          .dispatchEvent(new KeyboardEvent('keydown', {key: name, bubbles: true, composed: true}));
      toolbar.querySelector<HTMLElement>('#a')!.focus();
      key('ArrowRight');
      expect(document.activeElement!.id).toBe('b');
      key('ArrowRight');
      expect(document.activeElement!.id).toBe('trail');
      key('Home');
      expect(document.activeElement!.id).toBe('lead');
      key('End');
      expect(document.activeElement!.id).toBe('trail');
      key('ArrowDown');
      expect(document.activeElement!.id).toBe('trail');
    });
  });
});
