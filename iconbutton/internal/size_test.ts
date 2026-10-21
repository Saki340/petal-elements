/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

// Material 3 Expressive icon button sizes and Compose colors.

import '../filled-icon-button.js';
import '../filled-tonal-icon-button.js';
import '../icon-button.js';
import '../outlined-icon-button.js';

import {html} from 'lit';

import {Environment} from '../../testing/environment.js';

describe('Icon button (Expressive)', () => {
  const env = new Environment();

  async function render(template: unknown) {
    const root = env.render(template as never);
    await env.waitForStability();
    return [...root.children] as HTMLElement[];
  }

  const size = (el: HTMLElement) => {
    const rect = el.getBoundingClientRect();
    return [Math.round(rect.width), Math.round(rect.height)];
  };

  it('takes the Compose sizes: icon plus leading and trailing space', async () => {
    const buttons = await render(html`
      <petal-filled-icon-button size="xsmall">x</petal-filled-icon-button>
      <petal-filled-icon-button size="small">x</petal-filled-icon-button>
      <petal-filled-icon-button size="medium">x</petal-filled-icon-button>
      <petal-filled-icon-button size="large">x</petal-filled-icon-button>
      <petal-filled-icon-button size="xlarge">x</petal-filled-icon-button>
      <petal-icon-button size="medium">x</petal-icon-button>
    `);
    expect(buttons.map(size)).toEqual([
      [32, 32],
      [40, 40],
      [56, 56],
      [96, 96],
      [136, 136],
      [56, 56],
    ]);
  });

  it('has narrow and wide widths', async () => {
    const buttons = await render(html`
      <petal-filled-icon-button size="medium" width="narrow">x</petal-filled-icon-button>
      <petal-filled-icon-button size="medium" width="wide">x</petal-filled-icon-button>
    `);
    // MediumIconButtonTokens: 24px icon, 12px narrow and 24px wide spaces.
    expect(buttons.map(size)).toEqual([
      [48, 56],
      [72, 56],
    ]);
  });

  it('is round, square, or selected with the selected shape', async () => {
    const [round, square, selected] = await render(html`
      <petal-filled-icon-button size="medium">x</petal-filled-icon-button>
      <petal-filled-icon-button size="medium" shape="square">x</petal-filled-icon-button>
      <petal-filled-icon-button size="medium" toggle selected>x</petal-filled-icon-button>
    `);
    const radius = (el: HTMLElement) =>
      getComputedStyle(el.shadowRoot!.querySelector('.icon-button')!).borderTopLeftRadius;
    // corner-full: half the smaller side, so the press morph is gradual.
    expect(radius(round)).toBe('28px');
    // corner-large.
    expect(radius(square)).toBe('16px');
    expect(radius(selected)).toBe('16px');
  });

  it('keeps the original look without a size', async () => {
    const [button] = await render(html`<petal-filled-icon-button>x</petal-filled-icon-button>`);
    expect(size(button)).toEqual([40, 40]);
  });

  it('uses the Compose toggle colors', async () => {
    const [filledOff, tonalOff, tonalOn] = await render(html`
      <petal-filled-icon-button toggle>x</petal-filled-icon-button>
      <petal-filled-tonal-icon-button toggle>x</petal-filled-tonal-icon-button>
      <petal-filled-tonal-icon-button toggle selected>x</petal-filled-tonal-icon-button>
    `);
    const colors = (el: HTMLElement) => {
      const button = el.shadowRoot!.querySelector('.icon-button')!;
      return [getComputedStyle(button, '::before').backgroundColor, getComputedStyle(button).color];
    };
    // surface-container, on-surface-variant.
    expect(colors(filledOff)).toEqual(['rgb(243, 237, 247)', 'rgb(73, 69, 79)']);
    // secondary-container; secondary with on-secondary.
    expect(colors(tonalOff)[0]).toBe('rgb(232, 222, 248)');
    expect(colors(tonalOn)).toEqual(['rgb(98, 91, 113)', 'rgb(255, 255, 255)']);
  });
});
