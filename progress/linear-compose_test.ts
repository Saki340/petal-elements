/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

// Checks the flat petal-linear-progress against Jetpack Compose Material 3
// (LinearProgressIndicator, drawLinearIndicator and drawStopIndicator in
// ProgressIndicator.kt, LinearProgressIndicatorTokens at androidx commit
// df73c24).

import {html} from 'lit';

import {Environment} from '../testing/environment.js';

import './linear-progress.js';

import type {PetalLinearProgress} from './linear-progress.js';

// Fallbacks of the light scheme (no theme on the test page).
const PRIMARY = 'rgb(103, 80, 164)';
const SECONDARY_CONTAINER = 'rgb(232, 222, 248)';

describe('petal-linear-progress after Compose', () => {
  const env = new Environment();

  async function setup(template: ReturnType<typeof html>) {
    const root = env.render(template);
    await env.waitForStability();
    return root.querySelector('petal-linear-progress') as PetalLinearProgress;
  }

  /** A part's left and right edges from the start of the indicator, or null. */
  function span(progress: PetalLinearProgress, selector: string) {
    const host = progress.getBoundingClientRect();
    const part = progress.renderRoot.querySelector(selector);
    if (!part) return null;
    const rect = part.getBoundingClientRect();
    if (rect.width < 0.01) return null;
    return [
      Math.round((rect.left - host.left) * 10) / 10,
      Math.round((rect.right - host.left) * 10) / 10,
    ];
  }

  const style = (progress: PetalLinearProgress, selector: string) =>
    getComputedStyle(progress.renderRoot.querySelector(selector)!);

  it('draws 4px lines with round caps in primary and secondary-container', async () => {
    const progress = await setup(html`
      <petal-linear-progress style="width: 240px" value="0.5"></petal-linear-progress>
    `);
    expect(progress.getBoundingClientRect().height).toBe(4);
    const active = style(progress, '.segment.active');
    expect(active.height).toBe('4px');
    expect(active.borderTopLeftRadius).not.toBe('0px');
    expect(active.backgroundColor).toBe(PRIMARY);
    expect(style(progress, '.segment.track').backgroundColor).toBe(SECONDARY_CONTAINER);
  });

  it('leaves a 4px gap between the indicator and the track', async () => {
    const progress = await setup(html`
      <petal-linear-progress style="width: 240px" value="0.5"></petal-linear-progress>
    `);
    // The indicator's cap ends 2px after 120px; the track starts 4px + 4px
    // after it, its cap 2px before.
    expect(span(progress, '.segment.active')).toEqual([0, 122]);
    expect(span(progress, '.segment.track')).toEqual([126, 240]);
  });

  it('narrows the gap to the progress near 0, and draws no track near 1', async () => {
    const start = await setup(html`
      <petal-linear-progress style="width: 240px" value="0.01"></petal-linear-progress>
    `);
    // min(progress, gap): the track starts 2.4px after 2.4px.
    expect(span(start, '.segment.track')).toEqual([2.8, 240]);
    // The indicator keeps its caps: at least as wide as it is high.
    expect(span(start, '.segment.active')).toEqual([0, 4.4]);
    const end = await setup(html`
      <petal-linear-progress style="width: 240px" value="0.99"></petal-linear-progress>
    `);
    expect(span(end, '.segment.track')).toBeNull();
  });

  it('draws no indicator at 0', async () => {
    const progress = await setup(html`
      <petal-linear-progress style="width: 240px" value="0"></petal-linear-progress>
    `);
    expect(progress.renderRoot.querySelector('.segment.active')).toBeNull();
    expect(span(progress, '.segment.track')).toEqual([0, 240]);
  });

  it('draws a 4px stop indicator at the end', async () => {
    const progress = await setup(html`
      <petal-linear-progress style="width: 240px" value="0.5"></petal-linear-progress>
    `);
    expect(span(progress, '.stop')).toEqual([236, 240]);
    expect(style(progress, '.stop').backgroundColor).toBe(PRIMARY);
  });

  it('keeps the gap and the stop inset when thicker', async () => {
    const progress = await setup(html`
      <petal-linear-progress
        style="width: 240px; --md-linear-progress-track-height: 8px"
        value="0.5"></petal-linear-progress>
    `);
    expect(span(progress, '.segment.active')).toEqual([0, 124]);
    expect(span(progress, '.segment.track')).toEqual([128, 240]);
    // min(4px, height), (8 - 4) / 2 from the end.
    expect(span(progress, '.stop')).toEqual([234, 238]);
  });

  it('draws two lines and the track between them when indeterminate', async () => {
    const progress = await setup(html`
      <petal-linear-progress style="width: 240px" indeterminate></petal-linear-progress>
    `);
    expect(progress.renderRoot.querySelectorAll('.segment.active').length).toBe(2);
    expect(progress.renderRoot.querySelectorAll('.segment.track').length).toBe(3);
    expect(progress.renderRoot.querySelector('.stop')).toBeNull();
  });
});
