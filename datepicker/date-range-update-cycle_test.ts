/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import {html} from 'lit';

import {Environment} from '../testing/environment.js';

import './date-range-picker.js';

import type {PetalDateRangePicker} from './date-range-picker.js';

describe('petal-date-range-picker update cycle', () => {
  // The Environment fails a test on Lit's change-in-update warnings.
  const env = new Environment();

  it('selects, sets dates and switches modes without extra updates', async () => {
    const root = env.render(html`<div lang="en-US">
      <petal-date-range-picker start="2026-10-12"></petal-date-range-picker>
    </div>`);
    const picker = root.querySelector('petal-date-range-picker') as PetalDateRangePicker;
    await env.waitForStability();
    const shadow = picker.shadowRoot!;
    shadow.querySelector<HTMLElement>('.day[aria-label*="October 20,"]')!.click();
    await env.waitForStability();
    picker.start = '2027-01-02';
    picker.end = '';
    await env.waitForStability();
    picker.min = '2026-12-01';
    await env.waitForStability();
    shadow.querySelector<HTMLElement>('.mode-toggle')!.click();
    await env.waitForStability();
    expect(picker.displayMode).toBe('input');
  });
});
