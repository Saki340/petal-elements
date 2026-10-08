/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import '../button-group.js';
import '../../button/filled-button.js';

import {html} from 'lit';

import {ButtonHarness} from '../../button/harness.js';
import {Button} from '../../button/internal/button.js';
import {Environment} from '../../testing/environment.js';
import {ButtonGroup} from './button-group.js';

describe('<petal-button-group>', () => {
  const env = new Environment();

  async function setupTest(attributes = '') {
    const root = env.render(html`
      <petal-button-group>
        <petal-filled-button toggle>One</petal-filled-button>
        <petal-filled-button toggle>Two</petal-filled-button>
        <petal-filled-button toggle size="large">Three</petal-filled-button>
      </petal-button-group>
    `);
    const group = root.querySelector('petal-button-group') as ButtonGroup;
    for (const name of attributes.split(' ').filter(Boolean)) {
      group.setAttribute(name, '');
    }
    await env.waitForStability();
    const buttons = [...group.querySelectorAll('petal-filled-button')] as Button[];
    return {group, buttons};
  }

  it('has the group role', async () => {
    const {group} = await setupTest();
    expect(group.getAttribute('role')).toBe('group');
  });

  it('gives its size to buttons without one', async () => {
    const {group, buttons} = await setupTest();
    expect(buttons.map((b) => b.size)).toEqual(['small', 'small', 'large']);

    group.size = 'medium';
    await env.waitForStability();

    expect(buttons.map((b) => b.size))
      .withContext('a button with its own size keeps it')
      .toEqual(['medium', 'medium', 'large']);
  });

  it('allows several selected buttons by default', async () => {
    const {buttons} = await setupTest();

    await new ButtonHarness(buttons[0]).clickWithMouse();
    await new ButtonHarness(buttons[1]).clickWithMouse();

    expect(buttons.map((b) => b.selected)).toEqual([true, true, false]);
  });

  describe('single-select', () => {
    it('deselects the others when one is selected', async () => {
      const {buttons} = await setupTest('single-select');

      await new ButtonHarness(buttons[0]).clickWithMouse();
      await env.waitForStability();
      await new ButtonHarness(buttons[1]).clickWithMouse();
      await env.waitForStability();

      expect(buttons.map((b) => b.selected)).toEqual([false, true, false]);
    });

    it('keeps the selected button selected when clicked again', async () => {
      const {buttons} = await setupTest('single-select');

      await new ButtonHarness(buttons[2]).clickWithMouse();
      await new ButtonHarness(buttons[2]).clickWithMouse();

      expect(buttons[2].selected).toBeTrue();
    });
  });
});
