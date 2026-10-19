/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

// Checks petal-filled-select and petal-outlined-select against Jetpack
// Compose Material 3's exposed dropdown menu (ExposedDropdownMenu.kt,
// ExposedDropdownMenuDefaults, TextFieldDefaults at androidx commit df73c24).

import './filled-select.js';
import './outlined-select.js';
import './select-option.js';

import {html} from 'lit';

import {Environment} from '../testing/environment.js';

import {getMenuMaxHeight, Select} from './internal/select.js';

const ON_SURFACE_VARIANT = 'rgb(73, 69, 79)';
const PRIMARY = 'rgb(103, 80, 164)';

describe('selects after Compose', () => {
  const env = new Environment();

  async function setup(variant: 'filled' | 'outlined', attributes = '') {
    const options = html`
      <petal-select-option value="a" selected>
        <div slot="headline">Apple</div>
      </petal-select-option>
      <petal-select-option value="b">
        <div slot="headline">A very long banana that does not fit in the field at all</div>
      </petal-select-option>
      <petal-select-option value="c">
        <div slot="headline">Cherry</div>
        <div slot="supporting-text">Supporting</div>
      </petal-select-option>
    `;
    const flags = new Set(attributes.split(' ').filter(Boolean));
    const template =
      variant === 'filled'
        ? html`<petal-filled-select
            label="Fruit"
            ?disabled=${flags.has('disabled')}
            ?no-clamp-menu-width=${flags.has('no-clamp')}
            >${options}</petal-filled-select
          >`
        : html`<petal-outlined-select
            label="Fruit"
            ?disabled=${flags.has('disabled')}
            ?no-clamp-menu-width=${flags.has('no-clamp')}
            >${options}</petal-outlined-select
          >`;
    const root = env.render(template);
    await env.waitForStability();
    const host = root.firstElementChild as Select;
    await host.updateComplete;
    const field = host.renderRoot.querySelector('.field') as HTMLElement;
    const menu = host.renderRoot.querySelector('petal-menu')!;
    return {host, field, fieldRoot: field.shadowRoot!, menu};
  }

  function css(element: Element, property: string, pseudo?: string) {
    return getComputedStyle(element, pseudo).getPropertyValue(property);
  }

  async function settle(fieldRoot: ShadowRoot) {
    await Promise.all(fieldRoot.getAnimations().map((a) => a.finished));
  }

  describe('trailing icon (ExposedDropdownMenuDefaults.TrailingIcon)', () => {
    it('is the arrow drop down icon, turned by 180 degrees while expanded', async () => {
      for (const variant of ['filled', 'outlined'] as const) {
        const {host} = await setup(variant);
        const arrow = host.renderRoot.querySelector('.icon.trailing .arrow')!;
        expect(host.renderRoot.querySelectorAll('.icon.trailing polygon').length)
          .withContext(variant)
          .toBe(1);
        expect(css(arrow, 'transform')).withContext(variant).toBe('none');

        host.showPicker();
        await env.waitForStability();
        // rotate(180deg) is the matrix (-1, 0, 0, -1).
        expect(css(arrow, 'transform')).withContext(variant).toMatch(/^matrix\(-1, (-?0), (-?0), -1/);

        (host as unknown as {open: boolean}).open = false;
        await env.waitForStability();
        expect(css(arrow, 'transform')).withContext(variant).toBe('none');
      }
    });

    it('does not animate the rotation (Modifier.rotate)', async () => {
      const {host} = await setup('filled');
      const arrow = host.renderRoot.querySelector('.icon.trailing .arrow')!;
      expect(css(arrow, 'transition-property')).toBe('all');
      expect(css(arrow, 'transition-duration')).toBe('0s');
    });

    it('is on-surface-variant, 24px wide', async () => {
      const {host} = await setup('filled');
      const icon = host.renderRoot.querySelector('.icon.trailing') as HTMLElement;
      expect(icon.getBoundingClientRect().width).toBe(24);
    });
  });

  describe('field (TextFieldDefaults, ExposedDropdownMenuBox)', () => {
    it('is a text field: 280px wide at least, 56px high', async () => {
      for (const variant of ['filled', 'outlined'] as const) {
        const {host} = await setup(variant);
        const rect = host.getBoundingClientRect();
        expect(rect.width).withContext(variant).toBeGreaterThanOrEqual(280);
        expect(rect.height).withContext(variant).toBe(56);
      }
    });

    it('draws the filled indicator 1px, and 2px in the primary color when focused', async () => {
      const {host, field, fieldRoot} = await setup('filled');
      const indicator = fieldRoot.querySelector('.active-indicator')!;
      expect(css(indicator, 'height')).toBe('1px');
      expect(css(indicator, 'background-color')).toBe(ON_SURFACE_VARIANT);

      field.focus();
      await env.waitForStability();
      await settle(fieldRoot);
      expect(host.matches(':focus-within')).toBeTrue();
      expect(css(indicator, 'height')).toBe('2px');
      expect(css(indicator, 'background-color')).toBe(PRIMARY);
    });

    it('draws the outline 1px, and 2px in the primary color when focused', async () => {
      const {field, fieldRoot} = await setup('outlined');
      const start = fieldRoot.querySelector('.outline-start')!;
      expect(css(start, 'border-top-width', '::before')).toBe('1px');
      expect(css(start, 'border-top-width', '::after')).toBe('2px');
      expect(css(start, 'opacity', '::after')).toBe('0');

      field.focus();
      await env.waitForStability();
      await settle(fieldRoot);
      expect(css(start, 'opacity', '::after')).toBe('1');
      expect(css(start, 'border-top-color', '::after')).toBe(PRIMARY);
    });

    it('has the text styles of a text field: body large input, 0.5px tracking', async () => {
      for (const variant of ['filled', 'outlined'] as const) {
        const {fieldRoot, host} = await setup(variant);
        const input = host.renderRoot.querySelector('#label')!;
        expect(css(input, 'font-size')).withContext(variant).toBe('16px');
        expect(css(input, 'line-height')).withContext(variant).toBe('24px');
        expect(css(input, 'letter-spacing')).withContext(variant).toBe('0.5px');
        // The floating label is body small.
        expect(css(fieldRoot.querySelector('.label.floating')!, 'letter-spacing'))
          .withContext(variant)
          .toBe('0.4px');
      }
    });

    it('has no hover state', async () => {
      for (const variant of ['filled', 'outlined'] as const) {
        const {field} = await setup(variant);
        const style = getComputedStyle(field);
        const value = (name: string) => style.getPropertyValue(name).trim();
        expect(value('--_hover-label-text-color'))
          .withContext(variant)
          .toBe(value('--_label-text-color'));
        if (variant === 'filled') {
          expect(value('--_hover-state-layer-opacity')).toBe('0');
          expect(value('--_hover-active-indicator-color')).toBe(
            value('--_active-indicator-color'),
          );
        } else {
          expect(value('--_hover-outline-color')).toBe(value('--_outline-color'));
          expect(value('--_hover-outline-width')).toBe(value('--_outline-width'));
        }
      }
    });

    it('keeps the select public tokens', async () => {
      const {host, field, fieldRoot} = await setup('filled');
      host.style.setProperty(
        '--md-filled-select-text-field-focus-active-indicator-height',
        '4px',
      );
      field.focus();
      await env.waitForStability();
      await settle(fieldRoot);
      expect(css(fieldRoot.querySelector('.active-indicator')!, 'height')).toBe('4px');
    });
  });

  describe('menu (ExposedDropdownMenu)', () => {
    it('is as wide as the select (matchAnchorWidth)', async () => {
      for (const variant of ['filled', 'outlined'] as const) {
        const {host, menu} = await setup(variant);
        host.showPicker();
        await env.waitForStability();
        const width = host.getBoundingClientRect().width;
        expect(css(menu, 'min-width')).withContext(variant).toBe(`${width}px`);
        expect(css(menu, 'max-width')).withContext(variant).toBe(`${width}px`);
        const surface = menu.renderRoot.querySelector('.menu') as HTMLElement;
        expect(surface.offsetWidth)
          .withContext(variant)
          .toBe(width);
      }
    });

    it('can be wider than the select with no-clamp-menu-width', async () => {
      const {host, menu} = await setup('filled', 'no-clamp');
      host.showPicker();
      await env.waitForStability();
      const width = host.getBoundingClientRect().width;
      expect(css(menu, 'min-width')).toBe(`${width}px`);
      expect(css(menu, 'max-width')).not.toBe(`${width}px`);
    });

    it('starts at the bottom of the field, with no gap', async () => {
      const {host, field, menu} = await setup('filled');
      host.showPicker();
      await env.waitForStability();
      const surface = menu.renderRoot.querySelector('.menu') as HTMLElement;
      expect(surface.getBoundingClientRect().top).toBe(
        field.getBoundingClientRect().bottom,
      );
    });

    it('limits the height as Compose: the larger of the space above and below, less 48px', async () => {
      // calculateMaxHeight in ExposedDropdownMenu.kt.
      expect(getMenuMaxHeight({top: 100, bottom: 156}, 800)).toBe(800 - 48 - 156);
      expect(getMenuMaxHeight({top: 600, bottom: 656}, 800)).toBe(600 - 48);
      // The anchor is out of the window: all of it, less the margins.
      expect(getMenuMaxHeight({top: 900, bottom: 956}, 800)).toBe(800 - 96);
      expect(getMenuMaxHeight({top: -100, bottom: -44}, 800)).toBe(800 - 96);
      // No room.
      expect(getMenuMaxHeight({top: 20, bottom: 70}, 100)).toBe(0);
    });

    it('sets that height on the menu when it opens', async () => {
      const {host, menu} = await setup('filled');
      host.showPicker();
      await env.waitForStability();
      const rect = host.getBoundingClientRect();
      const expected = getMenuMaxHeight(rect, window.innerHeight);
      expect((menu as HTMLElement).style.maxHeight).toBe(`${expected}px`);
    });
  });

  describe('options (DropdownMenuItem with ExposedDropdownMenuDefaults.ItemContentPadding)', () => {
    it('are 48px high with 16px of padding at the sides', async () => {
      const {host} = await setup('filled');
      host.showPicker();
      await env.waitForStability();
      const options = Array.from(host.querySelectorAll('petal-select-option'));
      expect(options[0].offsetHeight).toBe(48);
      const item = options[0].renderRoot.querySelector('petal-item') as HTMLElement;
      expect(css(item, 'padding-left')).toBe('16px');
      expect(css(item, 'padding-right')).toBe('16px');
      // Label large, as DropdownMenuItem's text.
      expect(css(item, 'font-size')).toBe('14px');
      expect(css(item, 'font-weight')).toBe('500');
    });
  });
});
