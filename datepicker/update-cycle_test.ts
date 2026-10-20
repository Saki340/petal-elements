/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

// Separate from date-picker_test.ts: the Environment's mock clock would stop
// the paging springs there.

import {html} from 'lit';

import {Environment} from '../testing/environment.js';

import './date-picker.js';

import type {PetalDatePicker} from './date-picker.js';

describe('petal-date-picker update cycle', () => {
  // The Environment fails a test on Lit's change-in-update warnings.
  const env = new Environment();

  it('selects, opens the years and switches modes without extra updates', async () => {
    const root = env.render(html`<div lang="en-US">
      <petal-date-picker value="2026-10-21"></petal-date-picker>
    </div>`);
    const picker = root.querySelector('petal-date-picker') as PetalDatePicker;
    await env.waitForStability();
    const shadow = picker.shadowRoot!;
    [...shadow.querySelectorAll<HTMLElement>('.month:not([inert]) .day')]
      .find((day) => day.textContent!.trim() === '5')!
      .click();
    await env.waitForStability();
    shadow.querySelector<HTMLElement>('.year-button')!.click();
    await env.waitForStability();
    shadow.querySelector<HTMLElement>('.year[data-year="2028"]')!.click();
    await env.waitForStability();
    shadow.querySelector<HTMLElement>('.mode-toggle')!.click();
    await env.waitForStability();
    picker.value = '2027-01-02';
    await env.waitForStability();
    expect(picker.displayMode).toBe('input');
  });
});
