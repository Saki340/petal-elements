/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

// The standard bottom sheet's springs. Real animation frames, so no
// Environment (its mock clock does not advance performance.now()).

import '../standard-bottom-sheet.js';

import {html, render} from 'lit';

import type {StandardBottomSheet} from './standard-bottom-sheet.js';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('<petal-standard-bottom-sheet> motion', () => {
  let root: HTMLElement;

  beforeEach(() => {
    root = document.createElement('div');
    root.style.cssText = 'position: relative; height: 600px; width: 800px';
    document.body.append(root);
  });

  afterEach(() => root.remove());

  async function setup() {
    render(
      html`<petal-standard-bottom-sheet contained>
        <div style="height: 300px"></div>
      </petal-standard-bottom-sheet>`,
      root,
    );
    const sheet = root.querySelector('petal-standard-bottom-sheet') as StandardBottomSheet;
    await sheet.updateComplete;
    await wait(50);
    return sheet;
  }

  const top = (sheet: StandardBottomSheet) =>
    sheet.shadowRoot!.querySelector('.sheet')!.getBoundingClientRect().top -
    root.getBoundingClientRect().top;

  it('expands on the default spatial spring, passing its anchor a little', async () => {
    const sheet = await setup();
    // The content and the 48px drag handle row.
    const sheetHeight = sheet.shadowRoot!.querySelector('.sheet')!.getBoundingClientRect().height;
    expect(sheetHeight).toBe(348);
    const expanded = 600 - sheetHeight;
    const done = sheet.expand();
    let lowest = Infinity;
    const start = performance.now();
    while (performance.now() - start < 600) {
      await new Promise(requestAnimationFrame);
      lowest = Math.min(lowest, top(sheet));
    }
    await done;
    // Damping 0.8 overshoots above the expanded position.
    expect(lowest).toBeLessThan(expanded - 0.5);
    expect(top(sheet)).toBeCloseTo(expanded, 0);
  });

  it('collapses on the fast effects spring, without overshooting', async () => {
    const sheet = await setup();
    await sheet.expand();
    const done = sheet.partialExpand();
    let lowest = -Infinity;
    const start = performance.now();
    while (performance.now() - start < 400) {
      await new Promise(requestAnimationFrame);
      lowest = Math.max(lowest, top(sheet));
    }
    await done;
    expect(lowest).toBeLessThanOrEqual(600 - 56 + 0.5);
    expect(top(sheet)).toBeCloseTo(600 - 56, 0);
  });
});
