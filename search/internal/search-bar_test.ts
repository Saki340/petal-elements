/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import '../search-bar.js';

import {html} from 'lit';

import {Environment} from '../../testing/environment.js';
import {SearchBar} from './search-bar.js';

describe('<petal-search-bar>', () => {
  // The animations run in 1ms, so `expand()` and `collapse()` resolve at once.
  const env = new Environment().withoutWebAnimations();

  async function setupTest(attributes = '') {
    const root = env.render(html`
      <form>
        <petal-search-bar placeholder="Search apps">
          <img slot="trailing" alt="" />
          <button class="result">One</button>
          <button class="result">Two</button>
        </petal-search-bar>
      </form>
    `);
    const bar = root.querySelector('petal-search-bar') as SearchBar;
    for (const attribute of attributes.split(' ').filter(Boolean)) {
      const [name, value = ''] = attribute.split('=');
      bar.setAttribute(name, value);
    }
    await env.waitForStability();
    return bar;
  }

  const part = (bar: SearchBar, selector: string) =>
    bar.shadowRoot!.querySelector<HTMLElement>(selector)!;
  const input = (bar: SearchBar) => part(bar, 'input') as HTMLInputElement;
  const key = (bar: SearchBar, name: string) =>
    input(bar).dispatchEvent(
      new KeyboardEvent('keydown', {key: name, bubbles: true, composed: true, cancelable: true}),
    );

  describe('collapsed bar', () => {
    it('is 56px high (SearchBarTokens.ContainerHeight)', async () => {
      const bar = await setupTest();
      expect(bar.getBoundingClientRect().height).toBe(56);
      expect(part(bar, '.container').getBoundingClientRect().height).toBe(56);
    });

    it('is between 360px and 720px wide (SearchBarMinWidth, SearchBarMaxWidth)', async () => {
      const bar = await setupTest();
      const style = getComputedStyle(bar);
      expect(style.maxWidth).toBe('720px');
      bar.style.width = '100px';
      expect(bar.getBoundingClientRect().width).toBe(360);
      bar.style.width = '2000px';
      expect(bar.getBoundingClientRect().width).toBe(720);
    });

    it('is surface container high (SearchBarTokens.ContainerColor)', async () => {
      const bar = await setupTest();
      expect(getComputedStyle(part(bar, '.container')).backgroundColor).toBe('rgb(236, 230, 240)');
    });

    it('has the shape of SearchBarTokens.ContainerShape', async () => {
      const bar = await setupTest();
      bar.style.setProperty('--md-sys-shape-corner-full', '28px');
      expect(getComputedStyle(part(bar, '.container')).borderTopLeftRadius).toBe('28px');
    });

    it('has no elevation (SearchBarDefaults.TonalElevation is Level0)', async () => {
      const bar = await setupTest();
      expect(getComputedStyle(part(bar, '.container')).boxShadow).toBe('none');
    });

    it('puts icons 16px from the edge and the text 52px (SearchBarIconOffsetX)', async () => {
      const bar = await setupTest();
      const bounds = bar.getBoundingClientRect();
      const icon = part(bar, '.leading .icon').getBoundingClientRect();
      expect(icon.left - bounds.left).toBe(16);
      expect(icon.width).toBe(24);
      const field = input(bar);
      const text =
        field.getBoundingClientRect().left + parseFloat(getComputedStyle(field).paddingLeft);
      expect(text - bounds.left).toBe(52);
    });

    it('uses body large for the text (SearchBarTokens.InputTextFont)', async () => {
      const bar = await setupTest();
      const style = getComputedStyle(input(bar));
      expect(style.fontSize).toBe('16px');
      expect(style.lineHeight).toBe('24px');
      expect(style.letterSpacing).toBe('0.5px');
    });

    it('has an input forwarding the search attributes', async () => {
      const bar = await setupTest('name=q');
      const el = input(bar);
      expect(el.type).toBe('search');
      expect(el.placeholder).toBe('Search apps');
      expect(el.getAttribute('autocomplete')).toBe('off');
      expect(el.getAttribute('enterkeyhint')).toBe('search');
      expect(el.getAttribute('name')).toBe('q');
      expect(el.getAttribute('aria-label')).toBe('Search apps');
    });

    it('takes the accessible name from aria-label', async () => {
      const bar = await setupTest('aria-label=Find');
      expect(input(bar).getAttribute('aria-label')).toBe('Find');
    });
  });

  describe('accessibility', () => {
    it('is a collapsed combobox that controls the results region', async () => {
      const bar = await setupTest();
      const el = input(bar);
      expect(el.getAttribute('role')).toBe('combobox');
      expect(el.getAttribute('aria-expanded')).toBe('false');
      const results = bar.shadowRoot!.getElementById(el.getAttribute('aria-controls')!)!;
      expect(results.getAttribute('role')).toBe('region');
      expect(results.getAttribute('aria-label')).toBe('Search suggestions');
      expect(results.hasAttribute('inert')).toBeTrue();
    });

    it('updates aria-expanded and makes the results reachable', async () => {
      const bar = await setupTest();
      await bar.expand();
      await env.waitForStability();
      expect(input(bar).getAttribute('aria-expanded')).toBe('true');
      expect(part(bar, '.content').hasAttribute('inert')).toBeFalse();
    });

    it('labels the back and clear buttons', async () => {
      const bar = await setupTest('value=cats');
      bar.value = 'cats';
      await bar.expand();
      await env.waitForStability();
      expect(part(bar, '.back').getAttribute('aria-label')).toBe('Back');
      expect(part(bar, '.clear').getAttribute('aria-label')).toBe('Clear');
    });
  });

  describe('expanding', () => {
    it('opens on click', async () => {
      const bar = await setupTest();
      const openSpy = jasmine.createSpy('open');
      bar.addEventListener('open', openSpy);

      part(bar, '.container').click();
      await env.waitForStability();

      expect(bar.expanded).toBeTrue();
      expect(bar.hasAttribute('expanded')).toBeTrue();
      expect(openSpy).toHaveBeenCalledTimes(1);
    });

    it('does not open on a click in slotted content', async () => {
      const bar = await setupTest();
      bar.querySelector<HTMLElement>('img')!.click();
      await env.waitForStability();
      expect(bar.expanded).toBeFalse();
    });

    it('opens when typing', async () => {
      const bar = await setupTest();
      const inputSpy = jasmine.createSpy('input');
      bar.addEventListener('input', inputSpy);

      const el = input(bar);
      el.value = 'cat';
      el.dispatchEvent(new InputEvent('input', {bubbles: true, composed: true}));
      await env.waitForStability();

      expect(bar.value).toBe('cat');
      expect(bar.expanded).toBeTrue();
      expect(inputSpy).toHaveBeenCalledTimes(1);
    });

    it('opens with the down arrow', async () => {
      const bar = await setupTest();
      key(bar, 'ArrowDown');
      await env.waitForStability();
      expect(bar.expanded).toBeTrue();
    });

    it('does not open when disabled', async () => {
      const bar = await setupTest('disabled');
      part(bar, '.container').click();
      await bar.expand();
      expect(bar.expanded).toBeFalse();
      expect(input(bar).disabled).toBeTrue();
    });

    it('focuses the input', async () => {
      const bar = await setupTest();
      await bar.expand();
      await env.waitForStability();
      expect(bar.shadowRoot!.activeElement).toBe(input(bar));
    });

    it('opens from the expanded attribute', async () => {
      const bar = await setupTest('expanded');
      expect(part(bar, '.container').classList.contains('shown')).toBeTrue();
    });
  });

  describe('full screen view', () => {
    it('covers the window with the full screen shape (SearchViewTokens)', async () => {
      const bar = await setupTest();
      await bar.expand();
      await env.waitForStability();

      const container = part(bar, '.container');
      const style = getComputedStyle(container);
      expect(style.position).toBe('fixed');
      const rect = container.getBoundingClientRect();
      expect(rect.top).toBe(0);
      expect(rect.left).toBe(0);
      expect(rect.width).toBe(document.documentElement.clientWidth);
      expect(rect.height).toBe(document.documentElement.clientHeight);
      expect(style.borderTopLeftRadius).toBe('0px');
      expect(style.backgroundColor).toBe('rgb(236, 230, 240)');
    });

    it('keeps the bar\'s space in the page', async () => {
      const bar = await setupTest();
      await bar.expand();
      expect(bar.getBoundingClientRect().height).toBe(56);
    });

    it('pads the input field 8px above and below (SearchBarVerticalPadding)', async () => {
      const bar = await setupTest();
      await bar.expand();
      await env.waitForStability();
      const header = part(bar, '.header').getBoundingClientRect();
      expect(header.top).toBe(8);
      expect(header.height).toBe(56);
      // 72px for the header (SearchViewTokens.FullScreenHeaderContainerHeight).
      expect(part(bar, '.content').getBoundingClientRect().top).toBe(72);
    });

    it('has a 1px outline divider (DividerTokens.Thickness)', async () => {
      const bar = await setupTest();
      await bar.expand();
      await env.waitForStability();
      const divider = part(bar, '.divider');
      expect(divider.getBoundingClientRect().height).toBe(1);
      expect(getComputedStyle(divider).backgroundColor).toBe('rgb(121, 116, 126)');
    });

    it('shows the results', async () => {
      const bar = await setupTest();
      await bar.expand();
      await env.waitForStability();
      expect(bar.querySelector('.result')!.getBoundingClientRect().height).toBeGreaterThan(0);
    });

    it('replaces the leading icon with a back button that collapses', async () => {
      const bar = await setupTest();
      await bar.expand();
      await env.waitForStability();
      expect(bar.shadowRoot!.querySelector('.leading slot')).toBeNull();

      part(bar, '.back').click();
      await env.waitForStability();
      await bar.collapse();
      expect(bar.expanded).toBeFalse();
    });
  });

  describe('docked view', () => {
    async function setupDocked() {
      const bar = await setupTest('layout=docked');
      bar.style.width = '400px';
      await bar.expand();
      await env.waitForStability();
      return bar;
    }

    it('grows from the bar with its width and the docked shape', async () => {
      const bar = await setupDocked();
      const container = part(bar, '.container');
      const style = getComputedStyle(container);
      expect(style.position).toBe('absolute');
      expect(container.getBoundingClientRect().width).toBe(400);
      expect(container.getBoundingClientRect().top).toBe(bar.getBoundingClientRect().top);
      expect(style.borderTopLeftRadius).toBe('28px');
    });

    it('is at least 240px and at most 2/3 of the window high', async () => {
      const bar = await setupDocked();
      const style = getComputedStyle(part(bar, '.container'));
      expect(style.minHeight).toBe(`${Math.min(240, (innerHeight * 2) / 3)}px`);
      expect(parseFloat(style.maxHeight)).toBeCloseTo((innerHeight * 2) / 3, 0);
      const height = part(bar, '.container').getBoundingClientRect().height;
      expect(height).toBeGreaterThanOrEqual(parseFloat(style.minHeight));
    });

    it('keeps the input field 56px high at the top, without padding', async () => {
      const bar = await setupDocked();
      const header = part(bar, '.header').getBoundingClientRect();
      expect(header.top).toBe(bar.getBoundingClientRect().top);
      expect(header.height).toBe(56);
    });

    it('closes on a press outside', async () => {
      const bar = await setupDocked();
      document.body.dispatchEvent(new PointerEvent('pointerdown', {bubbles: true, composed: true}));
      await env.waitForStability();
      expect(bar.expanded).toBeFalse();
    });

    it('stays open on a press inside', async () => {
      const bar = await setupDocked();
      bar.querySelector('.result')!.dispatchEvent(
        new PointerEvent('pointerdown', {bubbles: true, composed: true}),
      );
      await env.waitForStability();
      expect(bar.expanded).toBeTrue();
    });
  });

  describe('collapsing', () => {
    it('closes with Escape, back to the bar', async () => {
      const bar = await setupTest();
      const closeSpy = jasmine.createSpy('close');
      bar.addEventListener('close', closeSpy);
      await bar.expand();
      await env.waitForStability();

      const escape = new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        composed: true,
        cancelable: true,
      });
      input(bar).dispatchEvent(escape);
      await env.waitForStability();
      await bar.collapse();
      await env.waitForStability();

      expect(escape.defaultPrevented).toBeTrue();
      expect(bar.expanded).toBeFalse();
      expect(closeSpy).toHaveBeenCalledTimes(1);
      const container = part(bar, '.container');
      expect(container.classList.contains('shown')).toBeFalse();
      expect(getComputedStyle(container).position).toBe('absolute');
      expect(container.getBoundingClientRect().height).toBe(56);
    });

    it('closes with Escape from the results', async () => {
      const bar = await setupTest();
      await bar.expand();
      bar.querySelector('.result')!.dispatchEvent(
        new KeyboardEvent('keydown', {key: 'Escape', bubbles: true, composed: true}),
      );
      await env.waitForStability();
      expect(bar.expanded).toBeFalse();
    });

    it('returns focus to the input', async () => {
      const bar = await setupTest();
      await bar.expand();
      await env.waitForStability();
      part(bar, '.back').focus();
      await bar.collapse();
      await env.waitForStability();
      expect(bar.shadowRoot!.activeElement).toBe(input(bar));
    });

    it('can be opened again', async () => {
      const bar = await setupTest();
      await bar.expand();
      await bar.collapse();
      await bar.expand();
      await env.waitForStability();
      expect(bar.expanded).toBeTrue();
      expect(getComputedStyle(part(bar, '.container')).position).toBe('fixed');
    });

    it('is in the top layer, over the page and not inside a transformed ancestor', async () => {
      const bar = await setupTest();
      const form = bar.closest('form')!;
      form.style.transform = 'translateZ(0)';
      form.style.width = '200px';
      await bar.expand();
      await env.waitForStability();
      const container = part(bar, '.container');
      expect(container.matches(':popover-open')).toBeTrue();
      expect(container.getBoundingClientRect().width).toBe(window.innerWidth);
      await bar.collapse();
      await env.waitForStability();
      expect(container.hasAttribute('popover')).toBeFalse();
    });

    it('keeps a docked view out of the top layer', async () => {
      const bar = await setupTest('layout=docked');
      await bar.expand();
      await env.waitForStability();
      expect(part(bar, '.container').hasAttribute('popover')).toBeFalse();
    });
  });

  describe('input', () => {
    it('fires search on Enter', async () => {
      const bar = await setupTest();
      const searchSpy = jasmine.createSpy('search');
      bar.addEventListener('search', searchSpy);
      bar.value = 'cats';

      key(bar, 'Enter');

      expect(searchSpy).toHaveBeenCalledTimes(1);
      expect(bar.value).toBe('cats');
    });

    it('redispatches change', async () => {
      const bar = await setupTest();
      const changeSpy = jasmine.createSpy('change');
      bar.addEventListener('change', changeSpy);
      input(bar).dispatchEvent(new Event('change', {bubbles: true}));
      expect(changeSpy).toHaveBeenCalledTimes(1);
    });

    it('shows the value', async () => {
      const bar = await setupTest();
      bar.value = 'dogs';
      await env.waitForStability();
      expect(input(bar).value).toBe('dogs');
    });

    it('clears with the clear button', async () => {
      const bar = await setupTest();
      bar.value = 'dogs';
      await bar.expand();
      await env.waitForStability();
      const inputSpy = jasmine.createSpy('input');
      bar.addEventListener('input', inputSpy);

      part(bar, '.clear').click();
      await env.waitForStability();

      expect(bar.value).toBe('');
      expect(inputSpy).toHaveBeenCalledTimes(1);
      expect(part(bar, '.clear')).toBeNull();
      expect(bar.shadowRoot!.activeElement).toBe(input(bar));
    });

    it('moves focus to the first result with the down arrow', async () => {
      const bar = await setupTest();
      await bar.expand();
      await env.waitForStability();
      input(bar).focus();

      key(bar, 'ArrowDown');

      expect(document.activeElement).toBe(bar.querySelector('.result'));
    });
  });

  describe('form', () => {
    it('submits its value under its name', async () => {
      const bar = await setupTest('name=q');
      bar.value = 'cats';
      await env.waitForStability();
      const form = bar.closest('form')!;
      expect(new FormData(form).get('q')).toBe('cats');
    });

    it('resets with the form', async () => {
      const bar = await setupTest('name=q');
      bar.value = 'cats';
      await env.waitForStability();
      bar.closest('form')!.reset();
      await env.waitForStability();
      expect(bar.value).toBe('');
    });
  });
});
