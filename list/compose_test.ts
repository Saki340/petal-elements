/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

// Checks petal-list-item against Jetpack Compose Material 3 (ListItem.kt,
// ListItemDefaults.kt and ListTokens at androidx commit df73c24).

import './list.js';
import './list-item.js';

import {html} from 'lit';

import {Environment} from '../testing/environment.js';

import type {PetalListItem} from './list-item.js';

// Fallbacks of the light scheme (no theme on the test page).
const ON_SURFACE = 'rgb(29, 27, 32)';
const ON_SURFACE_VARIANT = 'rgb(73, 69, 79)';
const SECONDARY_CONTAINER = 'rgb(232, 222, 248)';
const ON_SECONDARY_CONTAINER = 'rgb(74, 68, 88)';

describe('petal-list-item after Compose', () => {
  const env = new Environment();

  async function setup(template: unknown) {
    const root = env.render(
      html`<div style="width: 360px">${template}</div>` as never,
    );
    await env.waitForStability();
    const item = root.querySelector('petal-list-item') as PetalListItem;
    // The number of text lines is measured when the slots change and when the
    // item resizes, which is after the next frame.
    await item.updateComplete;
    await new Promise<void>((resolve) => {
      const observer = new ResizeObserver(() => {
        observer.disconnect();
        resolve();
      });
      observer.observe(item);
    });
    await env.waitForStability();
    const inner = (selector: string) =>
      item.renderRoot.querySelector(selector) as HTMLElement;
    const css = (element: Element, property: string) =>
      getComputedStyle(element).getPropertyValue(property);
    return {item, inner, css, root};
  }

  /** The rule of the stylesheet whose selector contains all the given parts. */
  function rule(item: PetalListItem, ...parts: string[]) {
    const sheet = (item.constructor as typeof PetalListItem).styles;
    for (const style of [sheet].flat()) {
      const cssRules = (style as unknown as CSSStyleSheet).cssRules ??
        (style as unknown as {styleSheet: CSSStyleSheet}).styleSheet.cssRules;
      for (const r of Array.from(cssRules)) {
        const selector = (r as CSSStyleRule).selectorText ?? '';
        if (parts.every((p) => selector.includes(p))) {
          return r as CSSStyleRule;
        }
      }
    }
    throw new Error(`No rule with ${parts.join(', ')}`);
  }

  describe('layout (ListItemLayout, ListTokens)', () => {
    it('one line is 56px high, with 16px at the sides and 10px above and below', async () => {
      const {item, inner, css} = await setup(
        html`<petal-list-item>Headline</petal-list-item>`,
      );
      expect(item.getBoundingClientRect().height).toBe(56);
      const content = inner('petal-item');
      expect(css(content, 'padding-top')).toBe('10px');
      expect(css(content, 'padding-bottom')).toBe('10px');
      expect(css(content, 'padding-left')).toBe('16px');
      expect(css(content, 'padding-right')).toBe('16px');
    });

    it('two lines (supporting text) are 72px high', async () => {
      const {item} = await setup(html`<petal-list-item>
        <div slot="headline">Headline</div>
        <div slot="supporting-text">Supporting</div>
      </petal-list-item>`);
      expect(item.getBoundingClientRect().height).toBe(72);
      expect(item.threeLine).toBeFalse();
    });

    it('two lines (overline) are 72px high', async () => {
      const {item} = await setup(html`<petal-list-item>
        <div slot="overline">Overline</div>
        <div slot="headline">Headline</div>
      </petal-list-item>`);
      expect(item.getBoundingClientRect().height).toBe(72);
      expect(item.threeLine).toBeFalse();
    });

    it('overline and supporting text make three lines: 88px, aligned to the top', async () => {
      const {item, inner, css} = await setup(html`<petal-list-item>
        <div slot="overline">Overline</div>
        <div slot="headline">Headline</div>
        <div slot="supporting-text">Supporting</div>
        <div slot="start" style="width: 40px; height: 40px">A</div>
      </petal-list-item>`);
      expect(item.threeLine).toBeTrue();
      expect(item.hasAttribute('three-line')).toBeTrue();
      expect(item.getBoundingClientRect().height).toBe(88);
      const content = inner('petal-item');
      expect(css(content, 'align-items')).toBe('flex-start');
      // The leading content starts at the padding.
      const start = item.querySelector('[slot=start]')!.getBoundingClientRect();
      expect(start.top - item.getBoundingClientRect().top).toBe(10);
    });

    it('supporting text on two lines makes three lines', async () => {
      const {item} = await setup(html`<petal-list-item style="width: 200px">
        <div slot="headline">Headline</div>
        <div slot="supporting-text">
          Supporting text that is long enough to wrap onto a second line.
        </div>
      </petal-list-item>`);
      expect(item.threeLine).toBeTrue();
      expect(item.getBoundingClientRect().height).toBeGreaterThanOrEqual(88);
    });

    it('centers the content of one and two lines', async () => {
      const {inner, css} = await setup(html`<petal-list-item>
        <div slot="headline">Headline</div>
        <div slot="supporting-text">Supporting</div>
      </petal-list-item>`);
      expect(css(inner('petal-item'), 'align-items')).toBe('center');
    });

    it('puts the leading content 12px before the text, the trailing content 12px after', async () => {
      const {item} = await setup(html`<petal-list-item>
        <div slot="start" style="width: 24px; height: 24px"></div>
        <div slot="headline" style="width: 100px">Headline</div>
        <div slot="end" style="width: 24px; height: 24px"></div>
      </petal-list-item>`);
      const left = item.getBoundingClientRect().left;
      const start = item.querySelector('[slot=start]')!.getBoundingClientRect();
      const text = item.querySelector('[slot=headline]')!.getBoundingClientRect();
      const end = item.querySelector('[slot=end]')!.getBoundingClientRect();
      expect(start.left - left).toBe(16);
      expect(text.left - start.right).toBe(12);
      expect(end.left - text.right).toBeGreaterThanOrEqual(12);
      expect(item.getBoundingClientRect().right - end.right).toBe(16);
    });
  });

  describe('typography (ListTokens)', () => {
    it('headline: body large, 16/24 at weight 400 and 0.5px tracking', async () => {
      const {inner, css} = await setup(
        html`<petal-list-item>Headline</petal-list-item>`,
      );
      const content = inner('petal-item');
      expect(css(content, 'font-size')).toBe('16px');
      expect(css(content, 'line-height')).toBe('24px');
      expect(css(content, 'font-weight')).toBe('400');
      expect(css(content, 'letter-spacing')).toBe('0.5px');
      expect(css(content, 'color')).toBe(ON_SURFACE);
    });

    it('supporting text: body medium, 14/20 at 0.25px (the web body medium tracking), on-surface-variant', async () => {
      const {item, css} = await setup(html`<petal-list-item>
        <div slot="headline">Headline</div>
        <div slot="supporting-text">Supporting</div>
      </petal-list-item>`);
      const supporting = item.querySelector('[slot=supporting-text]')!;
      expect(css(supporting, 'font-size')).toBe('14px');
      expect(css(supporting, 'line-height')).toBe('20px');
      expect(css(supporting, 'letter-spacing')).toBe('0.25px');
      expect(css(supporting, 'color')).toBe(ON_SURFACE_VARIANT);
    });

    it('overline: label small, 11/16 at weight 500 and 0.5px, on-surface-variant', async () => {
      const {item, css} = await setup(html`<petal-list-item>
        <div slot="overline">Overline</div>
        <div slot="headline">Headline</div>
      </petal-list-item>`);
      const overline = item.querySelector('[slot=overline]')!;
      expect(css(overline, 'font-size')).toBe('11px');
      expect(css(overline, 'line-height')).toBe('16px');
      expect(css(overline, 'font-weight')).toBe('500');
      expect(css(overline, 'letter-spacing')).toBe('0.5px');
      expect(css(overline, 'color')).toBe(ON_SURFACE_VARIANT);
    });

    it('trailing text: label small, 11/16 at 0.5px, on-surface-variant', async () => {
      const {item, css} = await setup(html`<petal-list-item>
        <div slot="headline">Headline</div>
        <div slot="trailing-supporting-text">100+</div>
      </petal-list-item>`);
      const trailing = item.querySelector('[slot=trailing-supporting-text]')!;
      expect(css(trailing, 'font-size')).toBe('11px');
      expect(css(trailing, 'line-height')).toBe('16px');
      expect(css(trailing, 'letter-spacing')).toBe('0.5px');
      expect(css(trailing, 'color')).toBe(ON_SURFACE_VARIANT);
    });

    it('leading and trailing icons are on-surface-variant', async () => {
      const {item, css} = await setup(html`<petal-list-item>
        <div slot="start">S</div>
        <div slot="headline">Headline</div>
        <div slot="end">E</div>
      </petal-list-item>`);
      expect(css(item.querySelector('[slot=start]')!, 'color')).toBe(
        ON_SURFACE_VARIANT,
      );
      expect(css(item.querySelector('[slot=end]')!, 'color')).toBe(
        ON_SURFACE_VARIANT,
      );
    });
  });

  describe('disabled (ListItemColors.disabled*)', () => {
    it('fades the texts and icons to 38% of on-surface, not the container', async () => {
      const {item, inner, css} = await setup(html`<petal-list-item
        type="button"
        disabled>
        <div slot="start">S</div>
        <div slot="overline">Overline</div>
        <div slot="headline">Headline</div>
        <div slot="supporting-text">Supporting</div>
      </petal-list-item>`);
      expect(css(inner('.list-item'), 'opacity')).toBe('1');
      // 29, 27, 32 at 38%.
      const faded = (element: Element) => css(element, 'color');
      for (const color of [
        faded(inner('petal-item')),
        faded(item.querySelector('[slot=start]')!),
        faded(item.querySelector('[slot=overline]')!),
        faded(item.querySelector('[slot=supporting-text]')!),
      ]) {
        expect(color).toContain('0.38');
        expect(color).not.toBe(ON_SURFACE_VARIANT);
      }
      // Compose shows no state layer on a disabled item.
      expect(item.renderRoot.querySelector('petal-ripple')!.hasAttribute('disabled')).toBeTrue();
    });
  });

  describe('selected (ListItemColors.selected*)', () => {
    it('uses the secondary container and its on-colors', async () => {
      const {item, inner, css} = await setup(html`<petal-list-item
        type="button"
        selected>
        <div slot="start">S</div>
        <div slot="headline">Headline</div>
        <div slot="supporting-text">Supporting</div>
        <div slot="trailing-supporting-text">1</div>
      </petal-list-item>`);
      item.style.transition = 'none';
      expect(css(item, 'background-color')).toBe(SECONDARY_CONTAINER);
      expect(css(inner('petal-item'), 'color')).toBe(ON_SECONDARY_CONTAINER);
      for (const slot of ['start', 'supporting-text', 'trailing-supporting-text']) {
        expect(css(item.querySelector(`[slot=${slot}]`)!, 'color'))
          .withContext(slot)
          .toBe(ON_SECONDARY_CONTAINER);
      }
      expect(item.renderRoot.querySelector('#item')!.getAttribute('aria-selected')).toBe('true');
    });

    it('is not drawn selected when disabled (disabledContainerColor)', async () => {
      const {item, css} = await setup(html`<petal-list-item
        type="button"
        selected
        disabled>
        Headline
      </petal-list-item>`);
      item.style.transition = 'none';
      expect(css(item, 'background-color')).toBe('rgba(0, 0, 0, 0)');
    });
  });

  describe('shapes (ListItemDefaults.shapes)', () => {
    const radius = (element: Element) =>
      getComputedStyle(element).borderTopLeftRadius;

    it('is 4px, 16px when selected', async () => {
      const {item} = await setup(
        html`<petal-list-item type="button">One</petal-list-item>`,
      );
      item.style.transition = 'none';
      expect(radius(item)).toBe('4px');
      item.selected = true;
      await item.updateComplete;
      expect(radius(item)).toBe('16px');
    });

    it('is 16px when focused', async () => {
      const {item} = await setup(
        html`<petal-list-item type="button">One</petal-list-item>`,
      );
      item.style.transition = 'none';
      item.focus();
      await item.updateComplete;
      expect(item.matches(':focus-within')).toBeTrue();
      expect(radius(item)).toBe('16px');
    });

    it('does not change shape when it is not interactive', async () => {
      const {item} = await setup(
        html`<petal-list-item>One</petal-list-item>`,
      );
      expect(radius(item)).toBe('4px');
    });

    it('is 12px hovered, 16px pressed (selected rule before pressed, after focused)', async () => {
      const {item} = await setup(
        html`<petal-list-item type="button">One</petal-list-item>`,
      );
      const hovered = rule(item, ':hover', ':not([disabled])');
      const focused = rule(item, ':focus-within', ':not([disabled])');
      const selected = rule(item, '[selected][selected][selected]');
      const pressed = rule(item, ':active', ':not([disabled])');
      expect(hovered.style.getPropertyValue('--_shape')).toContain('12px');
      expect(focused.style.getPropertyValue('--_shape')).toContain('16px');
      expect(selected.style.getPropertyValue('--_shape')).toContain('16px');
      expect(pressed.style.getPropertyValue('--_shape')).toContain('16px');
      // The same specificity, so the later one wins.
      const order = [hovered, focused, selected, pressed].map((r) =>
        Array.from(r.parentStyleSheet!.cssRules).indexOf(r),
      );
      expect(order).toEqual([...order].sort((a, b) => a - b));
    });

    it('animates the shape on the fast spatial spring', async () => {
      const {item} = await setup(
        html`<petal-list-item type="button">One</petal-list-item>`,
      );
      const transition = getComputedStyle(item);
      expect(transition.transitionProperty).toContain('border-radius');
      expect(transition.transitionDuration).toContain('0.359s');
      expect(transition.transitionTimingFunction).toContain('linear(');
    });
  });

  describe('state layers', () => {
    it('hover 8% and pressed 10% in the color of the text', async () => {
      const {item, css} = await setup(
        html`<petal-list-item type="button">One</petal-list-item>`,
      );
      const ripple = item.renderRoot.querySelector('petal-ripple') as HTMLElement;
      expect(css(ripple, '--md-ripple-hover-opacity')).toContain('0.08');
      expect(css(ripple, '--md-ripple-pressed-opacity')).toContain('0.1');
      expect(css(ripple, 'color')).toBe(ON_SURFACE);
    });

    it('selected: the state layer takes the on-secondary-container color', async () => {
      const {item, css} = await setup(
        html`<petal-list-item type="button" selected>One</petal-list-item>`,
      );
      const ripple = item.renderRoot.querySelector('petal-ripple') as HTMLElement;
      expect(css(ripple, 'color')).toBe(ON_SECONDARY_CONTAINER);
    });
  });

  describe('public tokens', () => {
    it('--md-list-item-* tokens still change the item', async () => {
      const {item, inner, css} = await setup(html`<petal-list-item
        style="--md-list-item-label-text-color: rgb(1, 2, 3);
               --md-list-item-top-space: 20px;
               --md-list-item-container-shape: 8px;">
        Headline
      </petal-list-item>`);
      item.style.transition = 'none';
      expect(css(inner('petal-item'), 'color')).toBe('rgb(1, 2, 3)');
      expect(css(inner('petal-item'), 'padding-top')).toBe('20px');
      expect(getComputedStyle(item).borderTopLeftRadius).toBe('8px');
    });
  });

  describe('segmented list', () => {
    it('keeps the container of a selected item', async () => {
      const {root} = await setup(html`<petal-list segmented>
        <petal-list-item type="button" selected>One</petal-list-item>
        <petal-list-item type="button">Two</petal-list-item>
      </petal-list>`);
      const items = Array.from(root.querySelectorAll('petal-list-item'));
      for (const item of items) item.style.transition = 'none';
      expect(getComputedStyle(items[0]).backgroundColor).toBe(SECONDARY_CONTAINER);
      expect(getComputedStyle(items[1]).backgroundColor).toBe('rgb(254, 247, 255)');
      // Selected: 16px at all corners.
      expect(getComputedStyle(items[0]).borderBottomRightRadius).toBe('16px');
      expect(getComputedStyle(items[1]).borderTopLeftRadius).toBe('4px');
    });
  });
});
