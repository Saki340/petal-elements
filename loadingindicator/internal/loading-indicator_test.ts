/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import '../loading-indicator.js';

import {html} from 'lit';

import {Environment} from '../../testing/environment.js';
import {
  determinateFrame,
  indeterminateFrame,
  MORPH_INTERVAL_MS,
  MORPH_SPRING_MS,
  springProgress,
} from './animation.js';
import {LoadingIndicator} from './loading-indicator.js';
import {Cubic} from '../../internal/shapes/cubic.js';
import {MaterialShapes} from '../../internal/shapes/material-shapes.js';
import {Morph} from '../../internal/shapes/morph.js';

describe('<petal-loading-indicator>', () => {
  const env = new Environment();

  async function setupTest(template = html`<petal-loading-indicator></petal-loading-indicator>`) {
    const root = env.render(template);
    const indicator = root.querySelector('petal-loading-indicator') as LoadingIndicator;
    await env.waitForStability();
    const progressbar = indicator.shadowRoot!.querySelector('[role="progressbar"]')!;
    return {indicator, progressbar};
  }

  it('is a 48px indeterminate progressbar by default', async () => {
    const {indicator, progressbar} = await setupTest();
    expect(indicator.getBoundingClientRect().width).toBe(48);
    expect(progressbar.hasAttribute('aria-valuenow')).toBeFalse();
  });

  it('reports its value when determinate', async () => {
    const {progressbar} = await setupTest(
      html`<petal-loading-indicator value="0.4" aria-label="Uploading"></petal-loading-indicator>`,
    );
    expect(progressbar.getAttribute('aria-valuenow')).toBe('0.4');
    expect(progressbar.getAttribute('aria-valuemax')).toBe('1');
    expect(progressbar.getAttribute('aria-label')).toBe('Uploading');
  });

  it('uses primary, or on-primary-container in a primary container', async () => {
    const {indicator} = await setupTest();
    const fill = () => getComputedStyle(indicator.shadowRoot!.querySelector('path')!).fill;
    expect(fill()).toBe('rgb(103, 80, 164)');

    indicator.contained = true;
    await env.waitForStability();
    // Compose's on-primary-container and primary-container.
    expect(fill()).toBe('rgb(79, 55, 139)');
    const container = indicator.shadowRoot!.querySelector('.container')!;
    expect(getComputedStyle(container).backgroundColor).toBe('rgb(234, 221, 255)');
  });
});

describe('loading indicator motion', () => {
  it('runs each morph on the spring for 297ms (SpringEstimation)', () => {
    expect(MORPH_SPRING_MS).toBe(297);
    expect(springProgress(0)).toBe(0);
    // dampingRatio 0.6 overshoots.
    const peak = Math.max(...Array.from({length: 30}, (_, i) => springProgress(i * 10)));
    expect(peak).toBeGreaterThan(1);
    expect(springProgress(MORPH_SPRING_MS)).toBe(1);
  });

  it('turns a quarter per morph, plus once per 4666ms', () => {
    // At the end of the first morph: the starting quarter turn, plus one.
    const end = indeterminateFrame(MORPH_SPRING_MS);
    expect(end.rotation).toBeCloseTo(180 + (MORPH_SPRING_MS / 4666) * 360, 5);
    // The next morph starts where the last ended.
    const next = indeterminateFrame(MORPH_INTERVAL_MS);
    expect(next.d).toBe(indeterminateFrame(MORPH_SPRING_MS).d);
  });

  it('turns counterclockwise by half a turn over the determinate range', () => {
    expect(determinateFrame(0).rotation).toBeCloseTo(0, 5);
    expect(determinateFrame(1).rotation).toBe(-180);
  });

  it('starts and ends a morph on its shapes', () => {
    const start = MaterialShapes.softBurst();
    const end = MaterialShapes.cookie9Sided();
    const morph = new Morph(start, end);
    // Exact bounds of an outline, rounded.
    const bounds = (cubics: readonly Cubic[]) => {
      const all = cubics.map((c) => c.calculateBounds());
      return [
        Math.min(...all.map((b) => b[0])),
        Math.min(...all.map((b) => b[1])),
        Math.max(...all.map((b) => b[2])),
        Math.max(...all.map((b) => b[3])),
      ].map((v) => Number(v.toFixed(3)));
    };
    const anchors = (polygon: typeof start) => bounds(polygon.cubics);
    expect(bounds(morph.asCubics(0))).toEqual(anchors(start));
    expect(bounds(morph.asCubics(1))).toEqual(anchors(end));
  });
});
