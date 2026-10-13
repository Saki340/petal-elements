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

  describe('single-select keyboard', () => {
    /** The focused button, through shadow roots. */
    const focusedButton = () => document.activeElement?.closest('petal-filled-button');

    it('keeps only the selected button in the tab order', async () => {
      const {group} = await setupTest('connected single-select');
      const [one, two, three] = [...group.querySelectorAll('petal-filled-button')] as Button[];
      two.selected = true;
      two.dispatchEvent(new Event('change', {bubbles: true}));
      await env.waitForStability();
      expect([one, two, three].map((b) => b.tabIndex)).toEqual([-1, 0, -1]);
    });

    it('moves and selects with arrow keys, Home and End', async () => {
      const {group} = await setupTest('connected single-select');
      const buttons = [...group.querySelectorAll('petal-filled-button')] as Button[];
      const selected = () => buttons.map((b) => b.selected);
      /** Presses a key on the focused button. */
      const sendKeys = async ({press}: {press: string}) => {
        const target = document.activeElement!.shadowRoot!.activeElement!;
        target.dispatchEvent(
          new KeyboardEvent('keydown', {key: press, bubbles: true, composed: true, cancelable: true}),
        );
      };
      buttons[0].focus();
      await sendKeys({press: 'ArrowRight'});
      await env.waitForStability();
      expect(focusedButton()).toBe(buttons[1]);
      expect(selected()).toEqual([false, true, false]);
      await sendKeys({press: 'End'});
      await env.waitForStability();
      expect(selected()).toEqual([false, false, true]);
      // Wraps around.
      await sendKeys({press: 'ArrowRight'});
      await env.waitForStability();
      expect(selected()).toEqual([true, false, false]);
      expect(buttons.map((b) => b.tabIndex)).toEqual([0, -1, -1]);
    });

    it('leaves the tab order alone without single-select', async () => {
      const {group} = await setupTest('connected');
      const buttons = [...group.querySelectorAll('petal-filled-button')];
      expect(buttons.every((b) => !b.hasAttribute('tabindex'))).toBeTrue();
    });
  });

  describe('pressed item width', () => {
    for (const attributes of ['', 'connected']) {
      it(`widens the pressed item into its neighbors${attributes ? ' (connected)' : ''}`, async () => {
        const {buttons} = await setupTest(attributes);
        const paddings = () =>
          buttons.map((b) => parseFloat(getComputedStyle(b).paddingInlineStart));
        const before = paddings();
        buttons[1].dispatchEvent(
          new PointerEvent('pointerdown', {button: 0, bubbles: true, composed: true}),
        );
        jasmine.clock().tick(20); // the next frame
        await env.waitForStability();
        for (const button of buttons) button.style.transition = 'none';
        const after = paddings();
        expect(after[1]).toBeGreaterThan(before[1]);
        expect(after[0]).toBeLessThan(before[0]);
        expect(after[2]).toBeLessThan(before[2]);
        window.dispatchEvent(new PointerEvent('pointerup'));
      });
    }
  });
});
