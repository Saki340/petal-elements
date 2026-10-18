/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import '../split-button.js';

import {html} from 'lit';

import {Environment} from '../../testing/environment.js';
import {createTokenTests} from '../../testing/tokens.js';
import {PetalSplitButton} from '../split-button.js';

describe('<petal-split-button>', () => {
  const env = new Environment();

  async function setupTest(attrs = html`<petal-split-button>Save</petal-split-button>`) {
    const root = env.render(attrs);
    const split = root.querySelector('petal-split-button') as PetalSplitButton;
    await env.waitForStability();
    const leading = split.shadowRoot!.querySelector('.leading') as HTMLElement;
    const trailing = split.shadowRoot!.querySelector('.trailing') as HTMLElement;
    return {split, leading, trailing};
  }

  createTokenTests(PetalSplitButton.styles);

  it('renders a button of each variant in both halves', async () => {
    const tags: Record<string, string> = {
      filled: 'PETAL-FILLED-BUTTON',
      tonal: 'PETAL-FILLED-TONAL-BUTTON',
      elevated: 'PETAL-ELEVATED-BUTTON',
      outlined: 'PETAL-OUTLINED-BUTTON',
    };
    for (const variant of Object.keys(tags)) {
      const {split, leading, trailing} = await setupTest(
        html`<petal-split-button variant=${variant}>Save</petal-split-button>`,
      );
      expect(split.variant).toBe(variant as never);
      expect(leading.tagName).toBe(tags[variant]);
      expect(trailing.tagName).toBe(tags[variant]);
    }
  });

  it('passes the size to both buttons and defaults to small', async () => {
    const {split, leading, trailing} = await setupTest();
    expect(split.size).toBe('small');
    expect(leading.getAttribute('size')).toBe('small');
    split.size = 'large';
    await env.waitForStability();
    expect(trailing.getAttribute('size')).toBe('large');
    expect(split.getAttribute('size')).toBe('large');
  });

  it('is as tall as the Compose container height', async () => {
    const heights = {xsmall: 32, small: 40, medium: 56, large: 96, xlarge: 136};
    for (const [size, height] of Object.entries(heights)) {
      const {leading, trailing} = await setupTest(
        html`<petal-split-button size=${size}>Save</petal-split-button>`,
      );
      expect(leading.getBoundingClientRect().height).toBe(height);
      expect(trailing.getBoundingClientRect().height).toBe(height);
    }
  });

  it('gives the trailing button an accessible name and menu state', async () => {
    const {split, trailing} = await setupTest();
    expect(trailing.getAttribute('data-aria-label')).toBe('More options');
    expect(trailing.getAttribute('data-aria-haspopup')).toBe('menu');
    expect(trailing.getAttribute('data-aria-expanded')).toBe('false');
    split.trailingLabel = 'Save options';
    split.checked = true;
    await env.waitForStability();
    expect(trailing.getAttribute('data-aria-label')).toBe('Save options');
    expect(trailing.getAttribute('data-aria-expanded')).toBe('true');
  });

  it('toggles checked and fires input and change on the trailing button', async () => {
    const {split, trailing} = await setupTest();
    const events: string[] = [];
    split.addEventListener('input', () => events.push('input'));
    split.addEventListener('change', () => events.push('change'));
    trailing.click();
    await env.waitForStability();
    expect(split.checked).toBeTrue();
    expect(split.hasAttribute('checked')).toBeTrue();
    expect(events).toEqual(['input', 'change']);
    trailing.click();
    expect(split.checked).toBeFalse();
  });

  it('keeps click for the leading button', async () => {
    const {split, leading, trailing} = await setupTest();
    let clicks = 0;
    split.addEventListener('click', () => clicks++);
    trailing.click();
    expect(clicks).toBe(0);
    // Buttons ignore a second click in the same microtask.
    await env.waitForStability();
    leading.click();
    expect(clicks).toBe(1);
  });

  it('does not toggle when disabled', async () => {
    const {split, trailing} = await setupTest(
      html`<petal-split-button disabled>Save</petal-split-button>`,
    );
    expect(trailing.hasAttribute('disabled')).toBeTrue();
    trailing.click();
    expect(split.checked).toBeFalse();
  });

  it('fires trailing-click and never checks when uncheckable', async () => {
    const {split, trailing} = await setupTest(
      html`<petal-split-button uncheckable>Save</petal-split-button>`,
    );
    let clicks = 0;
    split.addEventListener('trailing-click', () => clicks++);
    trailing.click();
    expect(clicks).toBe(1);
    expect(split.checked).toBeFalse();
    expect(trailing.getAttribute('data-aria-expanded')).toBeNull();
  });

  it('has square inner corners and round outer corners', async () => {
    const {leading, trailing} = await setupTest();
    const l = getComputedStyle(leading);
    const t = getComputedStyle(trailing);
    // Compose: outer corners are full (height / 2), inner ones 4dp for small.
    expect(parseFloat(l.borderStartStartRadius)).toBe(20);
    expect(parseFloat(t.borderStartEndRadius)).toBe(20);
    expect(parseFloat(l.borderStartEndRadius)).toBe(4);
    expect(parseFloat(t.borderStartStartRadius)).toBe(4);
  });

  it('shifts the trailing icon toward the small corners by 0.11 of the difference', async () => {
    const {trailing} = await setupTest();
    const chevron = trailing.querySelector('.chevron') as HTMLElement;
    // 0.11 * (4 - 20)
    expect(parseFloat(getComputedStyle(chevron).translate)).toBeCloseTo(-1.76, 2);
  });

  it('turns the checked trailing icon upside down and makes the button a circle', async () => {
    const {split, trailing} = await setupTest();
    const chevron = trailing.querySelector('.chevron') as HTMLElement;
    split.checked = true;
    await env.waitForStability();
    // Set the end of the transitions directly (the mock clock does not run them).
    for (const e of [chevron, trailing]) {
      e.getAnimations().forEach((a) => a.finish());
    }
    expect(getComputedStyle(chevron).rotate).toBe('180deg');
    expect(parseFloat(getComputedStyle(trailing).borderStartStartRadius)).toBe(20);
    expect(parseFloat(getComputedStyle(chevron).translate)).toBeCloseTo(0, 5);
  });
});
