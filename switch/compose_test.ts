/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

// Checks petal-switch against Jetpack Compose Material 3 (Switch.kt,
// SwitchDefaults, SwitchTokens at androidx commit df73c24).

import {html} from 'lit';

import {Environment} from '../testing/environment.js';

import './switch.js';

import type {PetalSwitch} from './switch.js';

const OUTLINE = 'rgb(121, 116, 126)';
const SURFACE_CONTAINER_HIGHEST = 'rgb(230, 224, 233)';
const PRIMARY = 'rgb(103, 80, 164)';
const ON_PRIMARY = 'rgb(255, 255, 255)';

describe('petal-switch after Compose', () => {
  const env = new Environment();

  async function setup(template = html`<petal-switch></petal-switch>`) {
    const root = env.render(template);
    await env.waitForStability();
    const element = root.querySelector('petal-switch') as PetalSwitch;
    const part = (selector: string) =>
      element.renderRoot.querySelector(selector) as HTMLElement;
    return {element, part};
  }

  const size = (element: HTMLElement) => {
    const {width, height} = element.getBoundingClientRect();
    return [width, height];
  };

  it('has a 52x32dp track', async () => {
    const {part} = await setup();
    expect(size(part('.switch'))).toEqual([52, 32]);
  });

  describe('thumb', () => {
    it('is 16dp unchecked, 24dp checked or with an icon', async () => {
      expect(size((await setup()).part('.handle'))).toEqual([16, 16]);
      expect(
        size(
          (await setup(html`<petal-switch selected></petal-switch>`)).part(
            '.handle',
          ),
        ),
      ).toEqual([24, 24]);
      expect(
        size(
          (await setup(html`<petal-switch icons></petal-switch>`)).part(
            '.handle',
          ),
        ),
      ).toEqual([24, 24]);
    });

    it('is centered at 16dp unchecked and 36dp checked', async () => {
      for (const [template, center] of [
        [html`<petal-switch></petal-switch>`, 16],
        [html`<petal-switch icons></petal-switch>`, 16],
        [html`<petal-switch selected></petal-switch>`, 36],
      ] as const) {
        const {part} = await setup(template);
        const track = part('.switch').getBoundingClientRect();
        const handle = part('.handle').getBoundingClientRect();
        expect(handle.left - track.left + handle.width / 2).toBeCloseTo(center);
      }
    });

    it('unchecked: Outline thumb, SurfaceContainerHighest track with an Outline border', async () => {
      const {part} = await setup();
      expect(getComputedStyle(part('.handle'), '::before').backgroundColor).toBe(
        OUTLINE,
      );
      const track = getComputedStyle(part('.track'), '::before');
      expect(track.backgroundColor).toBe(SURFACE_CONTAINER_HIGHEST);
      expect(track.borderTopColor).toBe(OUTLINE);
      expect(track.borderTopWidth).toBe('2px');
    });

    it('checked: OnPrimary thumb on a Primary track', async () => {
      const {part} = await setup(html`<petal-switch selected></petal-switch>`);
      expect(getComputedStyle(part('.handle'), '::before').backgroundColor).toBe(
        ON_PRIMARY,
      );
      expect(getComputedStyle(part('.track'), '::before').backgroundColor).toBe(
        PRIMARY,
      );
    });

    it('keeps its color on focus (only the ripple changes)', async () => {
      const unchecked = await setup();
      (unchecked.part('input') as HTMLElement).focus();
      expect(
        getComputedStyle(unchecked.part('.handle'), '::before').backgroundColor,
      ).toBe(OUTLINE);
      const checked = await setup(html`<petal-switch selected></petal-switch>`);
      (checked.part('input') as HTMLElement).focus();
      expect(
        getComputedStyle(checked.part('.handle'), '::before').backgroundColor,
      ).toBe(ON_PRIMARY);
    });

    it('can still be set per state with the thumb tokens', async () => {
      const {element, part} = await setup(
        html`<petal-switch
          selected
          style="--md-switch-selected-focus-handle-color: rgb(1, 2, 3)"></petal-switch>`,
      );
      (part('input') as HTMLElement).focus();
      expect(
        getComputedStyle(part('.handle'), '::before').backgroundColor,
      ).toBe('rgb(1, 2, 3)');
      expect(element.selected).toBeTrue();
    });
  });

  describe('motion', () => {
    it('moves and resizes the thumb with the fast spatial spring', async () => {
      const {part} = await setup();
      // ExpressiveMotionTokens.SpringFastSpatial: 359ms.
      expect(getComputedStyle(part('.handle-container')).transitionDuration).toBe(
        '0.359s',
      );
      expect(getComputedStyle(part('.handle')).transitionDuration).toBe(
        '0.359s, 0.359s',
      );
      expect(getComputedStyle(part('.handle')).transitionTimingFunction).toContain(
        'linear(',
      );
    });

    it('does not animate the colors', async () => {
      const {part} = await setup(html`<petal-switch icons></petal-switch>`);
      expect(
        getComputedStyle(part('.handle'), '::before').transitionDuration,
      ).toBe('0s');
      expect(
        getComputedStyle(part('.track'), '::before').transitionDuration,
      ).toBe('0s');
      expect(getComputedStyle(part('.icon')).transitionDuration).toBe('0s');
    });

    it('does not rotate or fade the icon in', async () => {
      const {part} = await setup(html`<petal-switch icons></petal-switch>`);
      expect(getComputedStyle(part('.icon--on')).transform).toBe('none');
    });

    it('does not animate the thumb while disabled', async () => {
      const {part} = await setup(
        html`<petal-switch selected disabled></petal-switch>`,
      );
      expect(getComputedStyle(part('.handle')).transitionDuration).toBe('0s');
    });
  });
});
