/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import '../linear-progress.js';

import {html} from 'lit';

import {Environment} from '../../testing/environment.js';

import {LinearProgress} from './linear-progress.js';
import {
  determinateAmplitude,
  drawWavy,
  EMPHASIZED_ACCELERATE,
  indeterminateFractions,
  stopIndicator,
} from './wavy.js';

describe('wavy linear progress drawing', () => {
  it('moves the indeterminate lines on Compose timing', () => {
    // First head starts at 0ms, first tail at 250ms, second head at 650ms,
    // second tail at 900ms; heads and tails of the first line take 1000ms,
    // of the second 850ms.
    expect(indeterminateFractions(0)).toEqual([0, 0, 0, 0]);
    const [firstTail, firstHead, secondTail, secondHead] = indeterminateFractions(500);
    expect(firstHead).toBeCloseTo(EMPHASIZED_ACCELERATE(0.5), 6);
    expect(firstTail).toBeCloseTo(EMPHASIZED_ACCELERATE(0.25), 6);
    expect(secondTail).toBe(0);
    expect(secondHead).toBe(0);
    expect(indeterminateFractions(1700).slice(0, 2)).toEqual([1, 1]);
    expect(indeterminateFractions(1700)[3]).toBe(1);
    // The cycle repeats every 1750ms.
    expect(indeterminateFractions(1750 + 500)).toEqual(indeterminateFractions(500));
  });

  it('flattens determinate waves below 10% and from 95%', () => {
    expect(determinateAmplitude(0.1)).toBe(0);
    expect(determinateAmplitude(0.11)).toBe(1);
    expect(determinateAmplitude(0.94)).toBe(1);
    expect(determinateAmplitude(0.95)).toBe(0);
  });

  it('draws a flat bar, a 4px gap and the track', () => {
    const {progress, track} = drawWavy(200, 10, [0, 0.5], 0, 0, 40);
    // Caps take 2px at each end.
    expect(progress).toEqual(['M2 5L100 5']);
    // From the right end to the head plus the gap and both caps.
    expect(track).toBe('M198 5L108 5M2 5');
  });

  it('draws a wave 3px high with quadratic half waves', () => {
    const {progress} = drawWavy(200, 10, [0, 0.5], 1, 0, 40);
    const d = progress[0];
    // Starts near the left cap: like Compose, segments are taken at the
    // distance x times the path's length per pixel, not at x itself.
    const [x] = d.slice(1).split(/[ Q]/).map(Number);
    expect(x).toBeGreaterThan(1.5);
    expect(x).toBeLessThan(2.5);
    const ys = Array.from(d.matchAll(/[MQ ]?(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g)).map((m) =>
      Number(m[2]),
    );
    // Control points at 5 ± 6, so the wave peaks at 5 ± 3.
    expect(Math.max(...ys)).toBeCloseTo(11, 1);
    expect(Math.min(...ys)).toBeCloseTo(-1, 1);
  });

  it('shrinks the stop indicator as the progress reaches it', () => {
    expect(stopIndicator(200, 10, 0.5)).toEqual({cx: 198, cy: 5, r: 2});
    const near = stopIndicator(200, 10, 0.985);
    expect(near.r).toBeLessThan(2);
    expect(stopIndicator(200, 10, 1).r).toBe(0);
  });
});

describe('<petal-linear-progress wavy>', () => {
  const env = new Environment();

  it('draws an SVG wave 10px high in Compose colors', async () => {
    const root = env.render(
      html`<petal-linear-progress wavy value="0.5" style="width: 200px"></petal-linear-progress>`,
    );
    const progress = root.querySelector('petal-linear-progress') as LinearProgress;
    await env.waitForStability();
    expect(progress.getBoundingClientRect().height).toBe(10);
    const svg = progress.shadowRoot!.querySelector('svg.wavy')!;
    expect(svg).not.toBeNull();
    expect(progress.shadowRoot!.querySelector('.bar')).toBeNull();
    const [track, active] = Array.from(svg.querySelectorAll('path'));
    expect(getComputedStyle(active).stroke).toBe('rgb(103, 80, 164)');
    expect(getComputedStyle(track).stroke).toBe('rgb(232, 222, 248)');
    expect(getComputedStyle(active).strokeWidth).toBe('4px');
  });

  it('draws flat lines without wavy', async () => {
    const root = env.render(html`<petal-linear-progress value="0.5"></petal-linear-progress>`);
    const progress = root.querySelector('petal-linear-progress')!;
    await env.waitForStability();
    expect(progress.shadowRoot!.querySelector('svg.wavy')).toBeNull();
    expect(progress.shadowRoot!.querySelector('.segment.active')).not.toBeNull();
  });
});
