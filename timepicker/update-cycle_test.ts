/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

// Separate from time-picker_test.ts: the Environment's mock clock would stop
// the selector's spring there.

import {html} from 'lit';

import {Environment} from '../testing/environment.js';

import './time-picker.js';

import type {PetalTimePicker} from './time-picker.js';

describe('petal-time-picker update cycle', () => {
  // The Environment fails a test on Lit's change-in-update warnings.
  const env = new Environment();

  it('changes time, selection and mode without extra updates', async () => {
    const root = env.render(html`<div lang="en-US">
      <petal-time-picker value="14:30" layout="vertical"></petal-time-picker>
    </div>`);
    const picker = root.querySelector('petal-time-picker') as PetalTimePicker;
    await env.waitForStability();
    const shadow = picker.shadowRoot!;
    shadow.querySelector<HTMLElement>('.time-selector.minute')!.click();
    await env.waitForStability();
    shadow.querySelectorAll<HTMLElement>('.period-item')[0].click();
    await env.waitForStability();
    picker.value = '23:59';
    await env.waitForStability();
    picker.displayMode = 'input';
    await env.waitForStability();
    picker.hourCycle = '24';
    await env.waitForStability();
    expect(picker.value).toBe('23:59');
  });
});
