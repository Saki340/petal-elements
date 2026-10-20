/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

// `animate-value` (a petal-elements option): the value moves on the slow
// spatial spring. Uses real animation frames, so no Environment (its mock
// clock does not advance performance.now()).

import {html, render} from 'lit';

import './circular-progress.js';
import './linear-progress.js';

import type {PetalLinearProgress} from './linear-progress.js';

const frames = (count: number) =>
  new Promise<void>((resolve) => {
    const next = (left: number) =>
      left ? requestAnimationFrame(() => next(left - 1)) : resolve();
    next(count);
  });

function activeWidth(progress: HTMLElement) {
  const active = progress.shadowRoot!.querySelector('.segment.active');
  return active ? active.getBoundingClientRect().width : 0;
}

describe('animate-value', () => {
  let root: HTMLElement;

  beforeEach(() => {
    root = document.createElement('div');
    document.body.append(root);
  });

  afterEach(() => {
    root.remove();
  });

  async function setup(animate: boolean) {
    render(
      html`<petal-linear-progress
        style="width: 240px"
        max="100"
        value="20"
        ?animate-value=${animate}></petal-linear-progress>`,
      root,
    );
    const progress = root.querySelector('petal-linear-progress') as PetalLinearProgress;
    await progress.updateComplete;
    return progress;
  }

  it('does not animate the first value', async () => {
    const progress = await setup(true);
    // 20% of 240px plus the cap.
    expect(activeWidth(progress)).toBeCloseTo(50, 0);
  });

  it('jumps without animate-value, as in Compose', async () => {
    const progress = await setup(false);
    progress.value = 70;
    await progress.updateComplete;
    expect(activeWidth(progress)).toBeCloseTo(170, 0);
  });

  it('moves toward the new value on a spring and settles on it', async () => {
    const progress = await setup(true);
    progress.value = 70;
    await progress.updateComplete;
    await frames(3);
    const moving = activeWidth(progress);
    expect(moving).toBeGreaterThan(50);
    expect(moving).toBeLessThan(170);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    expect(activeWidth(progress)).toBeCloseTo(170, 0);
  });

  it('overshoots a little on the way', async () => {
    const progress = await setup(true);
    progress.value = 70;
    await progress.updateComplete;
    let widest = 0;
    for (let i = 0; i < 90; i++) {
      await frames(1);
      widest = Math.max(widest, activeWidth(progress));
    }
    expect(widest).toBeGreaterThan(170.5);
  });

  it('continues from where it is when the value changes on the way', async () => {
    const progress = await setup(true);
    progress.value = 70;
    await progress.updateComplete;
    await frames(10);
    const before = activeWidth(progress);
    progress.value = 40;
    await progress.updateComplete;
    await frames(1);
    // No jump back to the start or to the new value.
    expect(Math.abs(activeWidth(progress) - before)).toBeLessThan(20);
  });

  it('keeps the real value for assistive technology', async () => {
    const progress = await setup(true);
    progress.value = 70;
    await progress.updateComplete;
    const bar = progress.shadowRoot!.querySelector('[role="progressbar"]')!;
    expect(bar.getAttribute('aria-valuenow')).toBe('70');
  });
});
