/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

// Checks petal-checkbox against Jetpack Compose Material 3 (Checkbox.kt,
// CheckboxDefaults, CheckboxTokens at androidx commit df73c24).

import {html} from 'lit';

import {Environment} from '../testing/environment.js';

import './checkbox.js';

import type {PetalCheckbox} from './checkbox.js';
import {checkmarkGeometry} from './internal/checkbox.js';

// Fallbacks of the light scheme (no theme on the test page).
const ON_SURFACE_VARIANT = 'rgb(73, 69, 79)';
const PRIMARY = 'rgb(103, 80, 164)';
const ON_PRIMARY = 'rgb(255, 255, 255)';
const ON_SURFACE = 'rgb(29, 27, 32)';

interface MarkInternals {
  draw: {value: number; target: number; spec: unknown};
  gravitation: {value: number; target: number};
  markState: string;
}

describe('petal-checkbox after Compose', () => {
  const env = new Environment();

  async function setup(attributes = '') {
    const root = env.render(
      attributes === 'disabled'
        ? html`<petal-checkbox disabled></petal-checkbox>`
        : attributes === 'checked'
          ? html`<petal-checkbox checked></petal-checkbox>`
          : attributes === 'checked disabled'
            ? html`<petal-checkbox checked disabled></petal-checkbox>`
            : attributes === 'indeterminate'
              ? html`<petal-checkbox indeterminate></petal-checkbox>`
              : html`<petal-checkbox></petal-checkbox>`,
    );
    await env.waitForStability();
    const checkbox = root.querySelector('petal-checkbox') as PetalCheckbox;
    const part = (selector: string) =>
      checkbox.renderRoot.querySelector(selector) as HTMLElement;
    return {checkbox, part, internals: checkbox as unknown as MarkInternals};
  }

  it('is a 20dp box with 2dp corners (CheckboxSize, RadiusSize)', async () => {
    const {checkbox, part} = await setup();
    const rect = checkbox.getBoundingClientRect();
    expect([rect.width, rect.height]).toEqual([20, 20]);
    expect(getComputedStyle(part('.box')).borderRadius).toBe('2px');
  });

  it('unchecked: a 2dp outline in OnSurfaceVariant, no fill', async () => {
    const {part} = await setup();
    const style = getComputedStyle(part('.box'));
    expect(style.borderTopWidth).toBe('2px');
    expect(style.borderTopColor).toBe(ON_SURFACE_VARIANT);
    expect(style.backgroundColor).toBe('rgba(0, 0, 0, 0)');
  });

  it('does not change its outline color on focus (only the ripple does)', async () => {
    const {checkbox, part} = await setup();
    (checkbox.renderRoot.querySelector('input') as HTMLElement).focus();
    expect(getComputedStyle(part('.box')).borderTopColor).toBe(
      ON_SURFACE_VARIANT,
    );
  });

  it('checked: filled with Primary, the checkmark in OnPrimary', async () => {
    const {part} = await setup('checked');
    const box = getComputedStyle(part('.box'));
    expect(box.backgroundColor).toBe(PRIMARY);
    expect(box.borderTopColor).toBe(PRIMARY);
    const mark = getComputedStyle(part('.mark'));
    expect(mark.stroke).toBe(ON_PRIMARY);
    expect(mark.strokeWidth).toBe('2px');
    expect(mark.strokeLinecap).toBe('square');
  });

  it('draws the checkmark path of Compose drawCheck in a 20 unit box', async () => {
    const {part} = await setup('checked');
    expect(part('.mark').getAttribute('d')).toBe('M4 10L8 14L16 6');
    // The whole path is drawn.
    const {length} = checkmarkGeometry(1, 0);
    const dash = part('.mark')
      .style.strokeDasharray.split(/[ ,]+/)
      .map(Number);
    expect(dash[0]).toBeCloseTo(length);
    expect(dash[1]).toBeCloseTo(length);
  });

  it('draws the indeterminate dash on the middle line', async () => {
    const {part} = await setup('indeterminate');
    expect(part('.mark').getAttribute('d')).toBe('M4 10L10 10L16 10');
    expect(getComputedStyle(part('.box')).backgroundColor).toBe(PRIMARY);
  });

  it('draws the checkmark with PathMeasure.getSegment(0, length * fraction)', () => {
    const full = checkmarkGeometry(1, 0);
    expect(full.length).toBeCloseTo(Math.hypot(4, 4) + Math.hypot(8, 8));
    expect(checkmarkGeometry(0.5, 0).visible).toBeCloseTo(full.length / 2);
    // The spring overshoots: the segment stops at the path's end.
    expect(checkmarkGeometry(1.2, 0).visible).toBeCloseTo(full.length);
    expect(checkmarkGeometry(-0.1, 0).visible).toBe(0);
    // The dash is a line from the left end to the right end.
    expect(checkmarkGeometry(1, 1).length).toBeCloseTo(12);
  });

  it('is not drawn when unchecked', async () => {
    const {part} = await setup();
    expect(part('.mark').style.display).toBe('none');
    expect(getComputedStyle(part('.mark')).stroke).toBe('rgba(0, 0, 0, 0)');
  });

  it('disabled: OnSurface at 38%, and the checkmark keeps OnPrimary', async () => {
    const {part} = await setup('checked disabled');
    const box = getComputedStyle(part('.box'));
    expect(box.backgroundColor).toBe(ON_SURFACE);
    expect(box.opacity).toBe('0.38');
    // isCheckboxStylingFixEnabled is off: the checked checkmark color.
    expect(getComputedStyle(part('.mark')).stroke).toBe(ON_PRIMARY);
  });

  it('disabled unchecked: a 2dp OnSurface outline at 38%', async () => {
    const {part} = await setup('disabled');
    const box = getComputedStyle(part('.box'));
    expect(box.borderTopColor).toBe(ON_SURFACE);
    expect(box.borderTopWidth).toBe('2px');
    expect(box.opacity).toBe('0.38');
    expect(box.backgroundColor).toBe('rgba(0, 0, 0, 0)');
  });

  describe('motion', () => {
    it('animates the colors with a default effects spring in, a fast effects spring out', async () => {
      const {part} = await setup('checked');
      // MotionSchemeKeyTokens.DefaultEffects: 230ms; FastEffects: 149ms.
      expect(getComputedStyle(part('.box')).transitionDuration).toContain(
        '0.23s',
      );
      expect(getComputedStyle(part('.icon')).transitionDuration).toBe('0.23s');
      const unchecked = await setup();
      expect(
        getComputedStyle(unchecked.part('.box')).transitionDuration,
      ).toContain('0.149s');
    });

    it('does not animate the box while disabled', async () => {
      const {part} = await setup('checked disabled');
      expect(getComputedStyle(part('.box')).transitionDuration).toBe('0s');
    });

    it('draws the mark with the default spatial spring', async () => {
      const {checkbox, internals} = await setup();
      checkbox.checked = true;
      await env.waitForStability();
      expect(internals.draw.target).toBe(1);
      expect(internals.draw.spec).toEqual({dampingRatio: 0.8, stiffness: 380});
      expect(internals.gravitation.target).toBe(0);
    });

    it('from unchecked to indeterminate, the dash is already formed', async () => {
      const {checkbox, internals} = await setup();
      checkbox.indeterminate = true;
      await env.waitForStability();
      expect(internals.draw.target).toBe(1);
      // The morph snaps (checkCenterGravitationShiftFraction: snap()).
      expect(internals.gravitation.value).toBe(1);
    });

    it('from checked to indeterminate, the checkmark morphs with a spring', async () => {
      const {checkbox, internals} = await setup('checked');
      checkbox.indeterminate = true;
      await env.waitForStability();
      expect(internals.draw.value).toBe(1);
      expect(internals.gravitation.value).toBe(0);
      expect(internals.gravitation.target).toBe(1);
    });

    it('keeps the mark for 100ms when unchecked, then removes it at once', async () => {
      const {checkbox, part, internals} = await setup('checked');
      checkbox.checked = false;
      await env.waitForStability();
      expect(internals.draw.value).toBe(1);
      expect(part('.mark').style.display).toBe('');
      jasmine.clock().tick(99);
      expect(part('.mark').style.display).toBe('');
      jasmine.clock().tick(2);
      expect(internals.draw.value).toBe(0);
      expect(part('.mark').style.display).toBe('none');
    });
  });
});
