/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

// Text fields after Jetpack Compose Material 3 (TextField.kt,
// OutlinedTextField.kt, TextFieldDefaults.kt and TextFieldImpl.kt).

// import 'jasmine'; (google3-only)

import '../filled-text-field.js';
import '../outlined-text-field.js';
import '../../icon/icon.js';

import {html} from 'lit';

import {Environment} from '../../testing/environment.js';
import {FAST_SPATIAL, springEasing} from '../../internal/motion/spring.js';
import {TextField} from './text-field.js';

describe('text fields, after Compose', () => {
  const env = new Environment();

  async function setup(variant: 'filled' | 'outlined', props = '') {
    const template =
      variant === 'filled'
        ? html`<petal-filled-text-field
            label="Label"
          ></petal-filled-text-field>`
        : html`<petal-outlined-text-field
            label="Label"
          ></petal-outlined-text-field>`;
    const root = env.render(template);
    const host = root.firstElementChild as TextField;
    for (const pair of props.split(' ').filter(Boolean)) {
      const [name, value = ''] = pair.split('=');
      host.setAttribute(name, value);
    }
    await env.waitForStability();
    const field = host.renderRoot.querySelector('.field') as HTMLElement;
    const fieldRoot = field.shadowRoot!;
    return {
      host,
      field,
      fieldRoot,
      input: host.renderRoot.querySelector('input')!,
    };
  }

  /** Waits for the CSS transitions and animations of the field to finish. */
  async function settle(fieldRoot: ShadowRoot) {
    await Promise.all(fieldRoot.getAnimations().map((a) => a.finished));
  }

  function css(element: Element, property: string, pseudo?: string) {
    return getComputedStyle(element, pseudo).getPropertyValue(property);
  }

  function rect(element: Element) {
    return element.getBoundingClientRect();
  }

  describe('size and layout (TextFieldDefaults)', () => {
    it('has a minimum width of 280px and height of 56px', async () => {
      for (const variant of ['filled', 'outlined'] as const) {
        const {host} = await setup(variant);
        expect(rect(host).width).withContext(variant).toBe(280);
        expect(rect(host).height).withContext(variant).toBe(56);
      }
    });

    it('lays out the filled label 8px from the top, floating', async () => {
      const {host, fieldRoot} = await setup('filled', 'value=Text');
      const label = fieldRoot.querySelector('.label.floating')!;
      expect(rect(label).top - rect(host).top).toBe(8);
      expect(rect(label).height).toBe(16);
      expect(rect(host.renderRoot.querySelector('input')!).top - rect(host).top)
        .withContext('input below the label')
        .toBe(24);
    });

    it('centers the resting label vertically', async () => {
      for (const variant of ['filled', 'outlined'] as const) {
        const {host, fieldRoot} = await setup(variant);
        const label = fieldRoot.querySelector('.label.resting')!;
        expect(rect(label).top - rect(host).top)
          .withContext(variant)
          .toBe(16);
        expect(rect(label).height).withContext(variant).toBe(24);
      }
    });

    it('centers the floating outlined label on the outline', async () => {
      const {host, fieldRoot} = await setup('outlined', 'value=Text');
      const label = fieldRoot.querySelector('.label.floating')!;
      expect(rect(label).top - rect(host).top).toBe(-8);
      expect(rect(label).left - rect(host).left).toBe(16);
    });

    it('cuts the outline 4px beyond the floating label', async () => {
      const {fieldRoot} = await setup('outlined', 'value=Text');
      const label = fieldRoot.querySelector('.label.floating')!;
      const notch = fieldRoot.querySelector('.outline-notch')!;
      expect(rect(notch).width).toBeCloseTo(rect(label).width + 8, 1);
    });

    it('places a leading icon 12px from the edge and text at 52px', async () => {
      const template = html`<petal-filled-text-field label="Label"
        ><petal-icon slot="leading-icon"
          >search</petal-icon
        ></petal-filled-text-field
      >`;
      const root = env.render(template);
      await env.waitForStability();
      const host = root.firstElementChild as TextField;
      const icon = host.querySelector('petal-icon')!;
      const input = host.renderRoot.querySelector('input')!;
      expect(rect(icon).left - rect(host).left).toBe(12);
      expect(rect(input).left - rect(host).left).toBe(52);
    });

    it('has 4px of padding above the supporting text', async () => {
      const {fieldRoot} = await setup('filled', 'supporting-text=Hint');
      const text = fieldRoot.querySelector('.supporting-text')!;
      expect(css(text, 'padding-top')).toBe('4px');
      expect(css(text, 'padding-left')).toBe('16px');
    });
  });

  describe('typography (body large and body small tracking)', () => {
    it('uses the letter spacing of the type scales', async () => {
      for (const variant of ['filled', 'outlined'] as const) {
        const {fieldRoot, input} = await setup(
          variant,
          'value=Text supporting-text=Hint',
        );
        expect(css(input, 'letter-spacing')).withContext(variant).toBe('0.5px');
        expect(
          css(fieldRoot.querySelector('.label.resting')!, 'letter-spacing'),
        )
          .withContext(variant)
          .toBe('0.5px');
        expect(
          css(fieldRoot.querySelector('.label.floating')!, 'letter-spacing'),
        )
          .withContext(variant)
          .toBe('0.4px');
        expect(
          css(fieldRoot.querySelector('.supporting-text')!, 'letter-spacing'),
        )
          .withContext(variant)
          .toBe('0.4px');
      }
    });
  });

  describe('filled indicator (TextFieldDefaults.indicatorLine)', () => {
    it('is 1px, and 2px in the primary color when focused', async () => {
      const {fieldRoot, input} = await setup('filled');
      const indicator = fieldRoot.querySelector('.active-indicator')!;
      expect(css(indicator, 'height')).toBe('1px');
      expect(css(indicator, 'background-color')).toBe('rgb(73, 69, 79)');

      input.focus();
      await env.waitForStability();
      await settle(fieldRoot);
      expect(css(indicator, 'height')).toBe('2px');
      expect(css(indicator, 'background-color')).toBe('rgb(103, 80, 164)');
    });

    it('animates its thickness on the fast spatial spring and its color on the fast effects spring', async () => {
      const {fieldRoot} = await setup('filled');
      const indicator = fieldRoot.querySelector('.active-indicator')!;
      const properties = css(indicator, 'transition-property').split(', ');
      const durations = css(indicator, 'transition-duration').split(', ');
      const easings = css(indicator, 'transition-timing-function');
      expect(properties).toEqual(['height', 'background-color']);
      expect(durations).toEqual(['0.359s', '0.149s']);
      expect(easings).toContain('linear(');
    });

    it('is 2px in the error color when focused with an error', async () => {
      const {fieldRoot, input} = await setup('filled', 'error');
      const indicator = fieldRoot.querySelector('.active-indicator')!;
      expect(css(indicator, 'background-color')).toBe('rgb(179, 38, 30)');
      input.focus();
      await env.waitForStability();
      await settle(fieldRoot);
      expect(css(indicator, 'height')).toBe('2px');
      expect(css(indicator, 'background-color')).toBe('rgb(179, 38, 30)');
    });

    it('is on-surface at 38% when disabled', async () => {
      const {fieldRoot} = await setup('filled', 'disabled');
      const indicator = fieldRoot.querySelector('.active-indicator')!;
      expect(css(indicator, 'height')).toBe('1px');
      expect(css(indicator, 'background-color')).toBe('rgb(29, 27, 32)');
      expect(css(indicator, 'opacity')).toBe('0.38');
    });

    it('is still themed by the focus indicator height token', async () => {
      const {host, fieldRoot, input} = await setup('filled');
      host.style.setProperty(
        '--md-filled-text-field-focus-active-indicator-height',
        '4px',
      );
      input.focus();
      await env.waitForStability();
      await settle(fieldRoot);
      expect(css(fieldRoot.querySelector('.active-indicator')!, 'height')).toBe(
        '4px',
      );
    });
  });

  describe('outline (OutlinedTextFieldDefaults)', () => {
    it('is 1px, and 2px in the primary color when focused', async () => {
      const {fieldRoot, input} = await setup('outlined');
      const start = fieldRoot.querySelector('.outline-start')!;
      expect(css(start, 'border-top-width', '::before')).toBe('1px');
      expect(css(start, 'border-top-color', '::before')).toBe(
        'rgb(121, 116, 126)',
      );
      expect(css(start, 'border-top-width', '::after')).toBe('2px');
      expect(css(start, 'opacity', '::after')).toBe('0');

      input.focus();
      await env.waitForStability();
      await settle(fieldRoot);
      expect(css(start, 'opacity', '::after')).toBe('1');
      expect(css(start, 'border-top-color', '::after')).toBe(
        'rgb(103, 80, 164)',
      );
    });

    it('fades the focused outline on the fast spatial spring', async () => {
      const {fieldRoot} = await setup('outlined');
      const start = fieldRoot.querySelector('.outline-start')!;
      expect(css(start, 'transition-property', '::after')).toBe('opacity');
      expect(css(start, 'transition-duration', '::after')).toBe('0.359s');
      expect(css(start, 'transition-timing-function', '::after')).toContain(
        'linear(',
      );
    });

    it('animates the outline color on the fast effects spring', async () => {
      const {fieldRoot} = await setup('outlined');
      const outline = fieldRoot.querySelector('.outline')!;
      expect(css(outline, 'transition-duration')).toBe('0.149s, 0.149s');
    });

    it('cuts the outline over the label as the label floats', async () => {
      const {fieldRoot} = await setup('outlined');
      const panel = fieldRoot.querySelector('.outline-panel-inactive')!;
      expect(css(panel, 'transform', '::before')).toBe('none');
      // Shrinks toward the end, so the cut grows from the start edge.
      const [originX] = css(panel, 'transform-origin', '::before').split(' ');
      expect(parseFloat(originX)).toBeCloseTo(
        panel.getBoundingClientRect().width,
        0,
      );
      expect(css(panel, 'transition-duration', '::before')).toBe('0.359s');

      const {fieldRoot: populated} = await setup('outlined', 'value=Text');
      await settle(populated);
      const cut = populated.querySelector('.outline-panel-inactive')!;
      expect(css(cut, 'transform', '::before')).toBe('matrix(0, 0, 0, 1, 0, 0)');
    });

    it('is on-surface at 12% when disabled', async () => {
      const {fieldRoot} = await setup('outlined', 'disabled');
      const start = fieldRoot.querySelector('.outline-start')!;
      expect(css(start, 'border-top-color', '::before')).toBe(
        'rgb(29, 27, 32)',
      );
      expect(css(start, 'opacity')).toBe('0.12');
    });
  });

  describe('colors (TextFieldDefaults.colors)', () => {
    it('draws the disabled filled container as the container color', async () => {
      const {fieldRoot} = await setup('filled', 'disabled');
      const background = fieldRoot.querySelector('.background')!;
      expect(css(background, 'background-color')).toBe('rgb(230, 224, 233)');
      expect(css(background, 'opacity')).toBe('1');
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
          expect(value('--_hover-outline-color')).toBe(
            value('--_outline-color'),
          );
          expect(value('--_hover-outline-width')).toBe(
            value('--_outline-width'),
          );
        }
      }
    });

    it('can still be themed with the hover tokens', async () => {
      const {host, field} = await setup('filled');
      host.style.setProperty(
        '--md-filled-text-field-hover-state-layer-opacity',
        '0.08',
      );
      expect(
        getComputedStyle(field)
          .getPropertyValue('--_hover-state-layer-opacity')
          .trim(),
      ).toBe('0.08');
    });

    it('colors the label with the state: on-surface-variant, primary when focused, error', async () => {
      const {fieldRoot, input} = await setup('filled');
      const label = fieldRoot.querySelector('.label.resting')!;
      expect(css(label, 'color')).toBe('rgb(73, 69, 79)');
      input.focus();
      await env.waitForStability();
      await settle(fieldRoot);
      expect(css(fieldRoot.querySelector('.label.floating')!, 'color')).toBe(
        'rgb(103, 80, 164)',
      );
    });
  });

  describe('motion (TextFieldImpl)', () => {
    it('animates the label on the fast spatial spring', async () => {
      const {fieldRoot, input} = await setup('filled');
      const label = fieldRoot.querySelector('.label.floating') as HTMLElement;
      spyOn(label, 'animate').and.callThrough();
      input.focus();
      await env.waitForStability();

      const {easing, duration} = springEasing(FAST_SPATIAL);
      expect(label.animate).toHaveBeenCalledTimes(1);
      const options = (label.animate as jasmine.Spy).calls.mostRecent().args[1];
      expect(options.duration).toBe(duration);
      expect(options.easing).toBe(easing);
      expect(easing).toContain('linear(');
    });

    it('animates the label on the spring of the page', async () => {
      const {host, fieldRoot, input} = await setup('filled');
      host.style.setProperty(
        '--md-sys-motion-spring-fast-spatial-damping',
        '1',
      );
      host.style.setProperty(
        '--md-sys-motion-spring-fast-spatial-stiffness',
        '1400',
      );
      const label = fieldRoot.querySelector('.label.floating') as HTMLElement;
      spyOn(label, 'animate').and.callThrough();
      input.focus();
      await env.waitForStability();

      const options = (label.animate as jasmine.Spy).calls.mostRecent().args[1];
      expect(options.duration).toBe(
        springEasing({dampingRatio: 1, stiffness: 1400}).duration,
      );
    });

    it('fades the label color on the fast effects spring', async () => {
      const {fieldRoot} = await setup('filled');
      const label = fieldRoot.querySelector('.label.resting')!;
      expect(css(label, 'transition-property')).toBe('color');
      expect(css(label, 'transition-duration')).toBe('0.149s');
      expect(css(label, 'transition-timing-function')).toContain('linear(');
    });

    it('does not animate the label with reduced motion', async () => {
      const {fieldRoot, input} = await setup('filled');
      const label = fieldRoot.querySelector('.label.floating') as HTMLElement;
      const matchMedia = window.matchMedia.bind(window);
      spyOn(window, 'matchMedia').and.callFake((query: string) =>
        query === '(prefers-reduced-motion: reduce)'
          ? ({matches: true} as MediaQueryList)
          : matchMedia(query),
      );
      spyOn(label, 'animate').and.callThrough();
      input.focus();
      await env.waitForStability();

      expect(label.animate).not.toHaveBeenCalled();
      expect(
        fieldRoot.querySelector('.label.resting')?.classList.contains('hidden'),
      ).toBeTrue();
    });
  });

  it('keeps a date field 56px high (Chrome makes date inputs taller)', async () => {
    for (const variant of ['filled', 'outlined'] as const) {
      const {host} = await setup(variant, 'type=date');
      expect(host.getBoundingClientRect().height).withContext(variant).toBe(56);
    }
  });
});

