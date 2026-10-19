/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

// Checks petal-circular-progress against Jetpack Compose Material 3
// (CircularProgressIndicator in ProgressIndicator.kt, CircularWavyProgressIndicator
// and CircularWavyProgressModifiers.kt at androidx commit df73c24).

import {html} from 'lit';

import {Environment} from '../testing/environment.js';

import './circular-progress.js';
import {
  determinateArcs,
  indeterminateFrame,
  outlinePath,
  wavyDashes,
  wavyShapes,
} from './internal/circular-wavy.js';

import type {PetalCircularProgress} from './circular-progress.js';

// Fallbacks of the light scheme (no theme on the test page).
const PRIMARY = 'rgb(103, 80, 164)';
const SECONDARY_CONTAINER = 'rgb(232, 222, 248)';

describe('petal-circular-progress after Compose', () => {
  const env = new Environment();

  async function setup(template: ReturnType<typeof html>) {
    const root = env.render(template);
    await env.waitForStability();
    return root.querySelector('petal-circular-progress') as PetalCircularProgress;
  }

  it('is 40px with a 4px round stroke, 48px when wavy', async () => {
    const flat = await setup(html`<petal-circular-progress value="0.5"></petal-circular-progress>`);
    expect(flat.getBoundingClientRect().width).toBe(40);
    const active = flat.renderRoot.querySelector('.active-track')!;
    expect(getComputedStyle(active).strokeWidth).toBe('4px');
    expect(getComputedStyle(active).strokeLinecap).toBe('round');
    expect(getComputedStyle(active).stroke).toBe(PRIMARY);
    expect(getComputedStyle(flat.renderRoot.querySelector('.track')!).stroke).toBe(
      SECONDARY_CONTAINER,
    );
    const wavy = await setup(html`<petal-circular-progress wavy value="0.5"></petal-circular-progress>`);
    expect(wavy.getBoundingClientRect().width).toBe(48);
  });

  describe('determinate', () => {
    it('starts at 12 o\'clock and leaves a gap of 4px plus the caps', () => {
      const {active, track} = determinateArcs(0.25);
      expect(active).toEqual({start: 270, sweep: 90});
      // (4 + 4) / (π * 40) of a turn on each side.
      const gap = (8 / (Math.PI * 40)) * 360;
      expect(track.start).toBeCloseTo(270 + 90 + gap, 5);
      expect(track.sweep).toBeCloseTo(360 - 90 - 2 * gap, 5);
    });

    it('narrows the gap to the progress near 0', () => {
      const {track} = determinateArcs(0.01);
      expect(track.start).toBeCloseTo(270 + 3.6 + 3.6, 5);
    });

    it('draws dashes in degrees on the circle', async () => {
      const progress = await setup(html`<petal-circular-progress value="0.25"></petal-circular-progress>`);
      const active = progress.renderRoot.querySelector('.active-track')!;
      expect(active.getAttribute('stroke-dasharray')).toBe('90 270');
      expect(active.getAttribute('stroke-dashoffset')).toBe('-270');
    });

    it('draws no active arc at 0', async () => {
      const progress = await setup(html`<petal-circular-progress value="0"></petal-circular-progress>`);
      expect(progress.renderRoot.querySelector('.active-track')).toBeNull();
      expect(progress.renderRoot.querySelector('.track')!.getAttribute('stroke-dasharray')).toBe(
        '360 0',
      );
    });
  });

  describe('indeterminate', () => {
    it('has no track', async () => {
      const progress = await setup(html`<petal-circular-progress indeterminate></petal-circular-progress>`);
      expect(progress.renderRoot.querySelector('.track')).toBeNull();
    });

    it('turns 1080 degrees in 6s plus quarter turns of 300ms every 1.5s', () => {
      expect(indeterminateFrame(0).rotation).toBe(0);
      expect(indeterminateFrame(150).rotation).toBeCloseTo(27 + 45, 5);
      expect(indeterminateFrame(1500).rotation).toBeCloseTo(270 + 90, 5);
      expect(indeterminateFrame(4800).rotation).toBeCloseTo(864 + 360, 5);
    });

    it('grows the arc linearly to 87% and back to 10% on the standard easing', () => {
      expect(indeterminateFrame(0).sweep).toBeCloseTo(0.1, 5);
      expect(indeterminateFrame(1500).sweep).toBeCloseTo(0.485, 5);
      expect(indeterminateFrame(3000).sweep).toBeCloseTo(0.87, 5);
      // The standard easing is past halfway at half the time.
      expect(indeterminateFrame(4500).sweep).toBeLessThan(0.485);
    });
  });

  describe('wavy', () => {
    it('has as many waves as 15px wavelengths fit around it', () => {
      // 2π * 22 / 15 = 9.2.
      expect(wavyShapes().vertices).toBe(9);
    });

    it('starts the outline at 12 o\'clock', () => {
      const path = outlinePath(wavyShapes().morph.asCubics(1), 48);
      const [, x, y] = /^M(\S+) (\S+)C/.exec(path.d)!;
      expect(Number(x)).toBeCloseTo(24, 0);
      expect(Number(y)).toBeLessThan(10);
    });

    it('leaves a gap of 4px plus the caps before and after the track', () => {
      const shapes = wavyShapes();
      const active = outlinePath(shapes.morph.asCubics(1), 48);
      const track = outlinePath(shapes.morph.asCubics(0), 48);
      const {track: dash} = wavyDashes(0.5, 0, active, track);
      const [length] = dash!.dasharray.split(' ').map(Number);
      expect(length).toBeCloseTo(track.length / 2 - 16, 1);
      expect(Number(dash!.dashoffset)).toBeCloseTo(-(track.length / 2 + 8), 1);
    });
  });
});
