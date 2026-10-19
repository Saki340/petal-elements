/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

// Checks petal-slider against Jetpack Compose Material 3 (Slider.kt and
// SliderTokens at androidx commit df73c24).

import {html} from 'lit';

import {Environment} from '../testing/environment.js';

import './slider.js';

import type {PetalSlider} from './slider.js';

// Fallbacks of the light scheme (no theme on the test page).
const PRIMARY = 'rgb(103, 80, 164)';
const SECONDARY_CONTAINER = 'rgb(232, 222, 248)';

describe('petal-slider after Compose', () => {
  const env = new Environment();

  async function setup(template: ReturnType<typeof html>) {
    const root = env.render(template);
    await env.waitForStability();
    return root.querySelector('petal-slider') as PetalSlider;
  }

  function part(slider: PetalSlider, selector: string) {
    return slider.renderRoot.querySelector(selector) as HTMLElement;
  }

  /** A part's start and end from the start of the slider, or null. */
  function span(slider: PetalSlider, selector: string) {
    const host = slider.getBoundingClientRect();
    const rect = part(slider, selector).getBoundingClientRect();
    if (rect.width === 0) return null;
    return [
      Math.round((rect.left - host.left) * 10) / 10,
      Math.round((rect.right - host.left) * 10) / 10,
    ];
  }

  function handleCenter(slider: PetalSlider, which = 'end') {
    const host = slider.getBoundingClientRect();
    const rect = part(slider, `.handle.${which} .handleNub`).getBoundingClientRect();
    return Math.round(((rect.left + rect.right) / 2 - host.left) * 10) / 10;
  }

  it('has a 4px x 44px handle and a 16px track in a 48px slider', async () => {
    const slider = await setup(html`<petal-slider style="width: 300px" value="50"></petal-slider>`);
    const nub = part(slider, '.handleNub').getBoundingClientRect();
    expect([nub.width, nub.height]).toEqual([4, 44]);
    expect(part(slider, '.segment.active').getBoundingClientRect().height).toBe(16);
    expect(slider.getBoundingClientRect().height).toBe(48);
  });

  it('keeps the track 6px plus half the handle away from the handle', async () => {
    const slider = await setup(html`<petal-slider style="width: 300px" value="50"></petal-slider>`);
    // The track is the width minus the handle width: 296px from 2px.
    expect(handleCenter(slider)).toBe(150);
    expect(span(slider, '.segment.active')).toEqual([2, 142]);
    expect(span(slider, '.segment.inactive.end')).toEqual([158, 298]);
  });

  it('rounds the track ends fully and the ends next to the handle by 2px', async () => {
    const slider = await setup(html`<petal-slider style="width: 300px" value="50"></petal-slider>`);
    const active = getComputedStyle(part(slider, '.segment.active'));
    expect(active.borderTopLeftRadius).toBe('8px');
    expect(active.borderTopRightRadius).toBe('2px');
    const inactive = getComputedStyle(part(slider, '.segment.inactive.end'));
    expect(inactive.borderTopLeftRadius).toBe('2px');
    expect(inactive.borderTopRightRadius).toBe('8px');
    expect(active.backgroundColor).toBe(PRIMARY);
    expect(inactive.backgroundColor).toBe(SECONDARY_CONTAINER);
  });

  it('does not draw a part of the track narrower than its corner radius', async () => {
    const slider = await setup(html`<petal-slider style="width: 300px" value="5"></petal-slider>`);
    // The active track would be 14.8 - 8 = 6.8px wide.
    expect(span(slider, '.segment.active')).toBeNull();
  });

  it('draws a stop indicator 8px before the end, in the active track color', async () => {
    const slider = await setup(html`<petal-slider style="width: 300px" value="50"></petal-slider>`);
    const host = slider.getBoundingClientRect();
    const stop = part(slider, '.end > .stop');
    const rect = stop.getBoundingClientRect();
    expect([rect.width, rect.height]).toEqual([4, 4]);
    expect((rect.left + rect.right) / 2 - host.left).toBe(290);
    expect(getComputedStyle(stop).backgroundColor).toBe(PRIMARY);
  });

  it('insets the values between the first and the last tick by the corner radius', async () => {
    const slider = await setup(html`
      <petal-slider style="width: 300px" ticks step="10" value="20"></petal-slider>
    `);
    // 2 + 8 + 0.2 * (296 - 16).
    expect(handleCenter(slider)).toBe(66);
    // Ticks: 4px, in the inactive track color on the active track; no tick
    // where the stop indicator is.
    const ticks = slider.renderRoot.querySelectorAll('.segment.active .tick');
    expect(ticks.length).toBe(10);
    expect(getComputedStyle(ticks[0]).backgroundColor).toBe(SECONDARY_CONTAINER);
    const inactiveTick = part(slider, '.inactive .tick');
    expect(getComputedStyle(inactiveTick).backgroundColor).toBe(PRIMARY);
  });

  it('gives a range slider inside corners and stop indicators at both ends', async () => {
    const slider = await setup(html`
      <petal-slider style="width: 300px" range value-start="20" value-end="70"></petal-slider>
    `);
    expect(handleCenter(slider, 'start')).toBe(61.2);
    expect(span(slider, '.segment.inactive.start')).toEqual([2, 53.2]);
    expect(span(slider, '.segment.active')).toEqual([69.2, 201.2]);
    expect(getComputedStyle(part(slider, '.segment.active')).borderTopLeftRadius).toBe('2px');
    expect(part(slider, '.start > .stop')).not.toBeNull();
  });

  it('halves the handle width while focused', async () => {
    const slider = await setup(html`<petal-slider value="50"></petal-slider>`);
    slider.focus();
    await env.waitForStability();
    expect(part(slider, '.handleNub').getBoundingClientRect().width).toBe(2);
  });

  it('shows the value in a plain tooltip', async () => {
    const slider = await setup(html`<petal-slider labeled value="40"></petal-slider>`);
    const label = part(slider, '.label');
    const style = getComputedStyle(label);
    expect(style.minWidth).toBe('40px');
    expect(style.minHeight).toBe('24px');
    expect(style.paddingInlineStart).toBe('8px');
    expect(style.borderTopLeftRadius).toBe('4px');
    expect(style.backgroundColor).toBe('rgb(50, 47, 53)');
  });
});
