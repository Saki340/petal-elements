/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

// Checks petal-radio against Jetpack Compose Material 3 (RadioButton.kt,
// RadioButtonDefaults, RadioButtonTokens at androidx commit df73c24).

import {html} from 'lit';

import {Environment} from '../testing/environment.js';

import './radio.js';

import type {PetalRadio} from './radio.js';

const ON_SURFACE_VARIANT = 'rgb(73, 69, 79)';
const PRIMARY = 'rgb(103, 80, 164)';

describe('petal-radio after Compose', () => {
  const env = new Environment();

  async function setup(template = html`<petal-radio></petal-radio>`) {
    const root = env.render(template);
    await env.waitForStability();
    const radio = root.querySelector('petal-radio') as PetalRadio;
    const part = (selector: string) =>
      radio.renderRoot.querySelector(selector) as SVGElement;
    return {radio, part};
  }

  it('is a 20dp ring with a 2dp stroke and a 5dp dot', async () => {
    const {radio, part} = await setup();
    const rect = radio.getBoundingClientRect();
    expect([rect.width, rect.height]).toEqual([20, 20]);
    // Outer radius 10 = radius 9 + half the stroke.
    expect(part('.ring').getAttribute('r')).toBe('9');
    expect(getComputedStyle(part('.ring')).strokeWidth).toBe('2px');
    // RadioButtonDotSize / 2 - strokeWidth / 2.
    expect(part('.dot').getAttribute('r')).toBe('5');
  });

  it('unchecked: OnSurfaceVariant ring, no dot', async () => {
    const {part} = await setup();
    expect(getComputedStyle(part('.ring')).stroke).toBe(ON_SURFACE_VARIANT);
    expect(getComputedStyle(part('.dot')).transform).toBe(
      'matrix(0, 0, 0, 0, 0, 0)',
    );
  });

  it('checked: Primary ring and dot in one color', async () => {
    const {part} = await setup(html`<petal-radio checked></petal-radio>`);
    expect(getComputedStyle(part('.ring')).stroke).toBe(PRIMARY);
    expect(getComputedStyle(part('.dot')).fill).toBe(PRIMARY);
    expect(getComputedStyle(part('.dot')).transform).toBe(
      'matrix(1, 0, 0, 1, 0, 0)',
    );
  });

  it('does not change its color on focus (only the ripple does)', async () => {
    const {radio, part} = await setup();
    radio.focus();
    expect(getComputedStyle(part('.ring')).stroke).toBe(ON_SURFACE_VARIANT);
  });

  it('disabled: 38% opacity, no color animation', async () => {
    const {part} = await setup(
      html`<petal-radio checked disabled></petal-radio>`,
    );
    const icon = getComputedStyle(part('.icon'));
    expect(icon.opacity).toBe('0.38');
    expect(icon.transitionDuration).toBe('0s');
    expect(getComputedStyle(part('.ring')).stroke).toBe('rgb(29, 27, 32)');
  });

  describe('motion', () => {
    it('animates the color with the default effects spring', async () => {
      const {part} = await setup();
      expect(getComputedStyle(part('.icon')).transitionDuration).toBe('0.23s');
    });

    it('grows the dot with the fast spatial spring, visible from a 1dp radius', async () => {
      const {radio, part} = await setup();
      radio.checked = true;
      await env.waitForStability();
      const animations = part('.dot').getAnimations();
      expect(animations.length).toBe(1);
      const effect = animations[0].effect as KeyframeEffect;
      // Radius 6dp * progress - 1dp (the stroke): shows from 1/6.
      expect(effect.getKeyframes().map((k) => k.offset)).toEqual([
        0,
        1 / 6,
        1,
      ]);
      expect(effect.getKeyframes().map((k) => k['transform'])).toEqual([
        'scale(0)',
        'scale(0)',
        'scale(1)',
      ]);
      // A spring: a linear() easing whose duration is the spring's.
      expect(String(effect.getTiming().easing)).toContain('linear(');
      expect(Number(effect.getTiming().duration)).toBeGreaterThan(200);
    });

    it('shrinks the dot the same way when unchecked', async () => {
      const {radio, part} = await setup(html`<petal-radio checked></petal-radio>`);
      expect(part('.dot').getAnimations().length).toBe(0);
      radio.checked = false;
      await env.waitForStability();
      const effect = part('.dot').getAnimations()[0].effect as KeyframeEffect;
      expect(effect.getKeyframes().map((k) => k.offset)).toEqual([
        0,
        5 / 6,
        1,
      ]);
    });

    it('does not animate a radio that starts checked', async () => {
      const {part} = await setup(html`<petal-radio checked></petal-radio>`);
      expect(part('.dot').getAnimations().length).toBe(0);
    });
  });
});
