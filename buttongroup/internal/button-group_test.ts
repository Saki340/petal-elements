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
        // The mocked clock does not move performance.now(): set the spring at
        // the end of the press and lay out once.
        const group = buttons[0].parentElement as unknown as {
          presses: Map<Element, {value: number}>;
          layoutPresses(): void;
        };
        group.presses.get(buttons[1])!.value = 1;
        group.layoutPresses();
        const after = paddings();
        expect(after[1]).toBeGreaterThan(before[1]);
        expect(after[0]).toBeLessThan(before[0]);
        expect(after[2]).toBeLessThan(before[2]);
        window.dispatchEvent(new PointerEvent('pointerup'));
      });
    }
  });

  it('holds a quick press until it is 75% of the way, like Compose', async () => {
    const {group, buttons} = await setupTest('connected');
    buttons[1].dispatchEvent(new PointerEvent('pointerdown', {button: 0, bubbles: true, composed: true}));
    window.dispatchEvent(new PointerEvent('pointerup'));
    const state = group as unknown as {
      presses: Map<HTMLElement, {target: number; value: number}>;
      releasing: Set<HTMLElement>;
    };
    // Released at once, but still heading to fully pressed.
    expect(state.presses.get(buttons[1])!.target).toBe(1);
    expect(state.releasing.has(buttons[1])).toBeTrue();
  });

  it('ends a press when the release cannot reach the group', async () => {
    const {group, buttons} = await setupTest('connected');
    const state = group as unknown as {
      presses: Map<HTMLElement, {target: number; value: number}>;
    };
    // Space held, then focus moves away: the keyup goes elsewhere.
    buttons[0].dispatchEvent(new KeyboardEvent('keydown', {key: ' ', bubbles: true, composed: true}));
    state.presses.get(buttons[0])!.value = 1;
    buttons[0].dispatchEvent(new FocusEvent('focusout', {bubbles: true, composed: true}));
    expect(state.presses.get(buttons[0])!.target).toBe(0);

    // Pressed with the pointer, then the window loses focus: no pointerup.
    buttons[1].dispatchEvent(new PointerEvent('pointerdown', {button: 0, bubbles: true, composed: true}));
    state.presses.get(buttons[1])!.value = 1;
    window.dispatchEvent(new Event('blur'));
    expect(state.presses.get(buttons[1])!.target).toBe(0);
  });

  it('makes room across the whole group, in proportion to the widths', async () => {
    const root = env.render(html`
      <petal-button-group connected style="display: flex; width: 400px">
        <petal-filled-button style="flex: 1 1 0">A</petal-filled-button>
        <petal-filled-button style="flex: 1 1 0">B</petal-filled-button>
        <petal-filled-button style="flex: 1 1 0">C</petal-filled-button>
        <petal-filled-button style="flex: 1 1 0">D</petal-filled-button>
      </petal-button-group>
    `);
    await env.waitForStability();
    const buttons = [...root.querySelectorAll('petal-filled-button')];
    const widths = () => buttons.map((b) => b.getBoundingClientRect().width);
    const before = widths();
    buttons[2].dispatchEvent(
      new PointerEvent('pointerdown', {button: 0, bubbles: true, composed: true}),
    );
    // Let the spring settle.
    for (let i = 0; i < 60; i++) jasmine.clock().tick(16);
    await env.waitForStability();
    const state = root.querySelector('petal-button-group') as unknown as {
      presses: Map<Element, {value: number; target: number; spec: unknown}>;
      layoutPresses(): void;
    };
    // The mocked clock does not move performance.now(): settle the spring
    // directly and lay out once.
    state.presses.get(buttons[2])!.value = 1;
    state.layoutPresses();
    const after = widths();
    // 15% of its width.
    expect(after[2] - before[2]).toBeCloseTo(before[2] * 0.15, 0);
    // Every other button gives up the same share, the far one too.
    expect(after[0]).toBeCloseTo(after[1], 1);
    expect(after[0]).toBeCloseTo(after[3], 1);
    expect(after[0]).toBeLessThan(before[0]);
    window.dispatchEvent(new PointerEvent('pointerup'));
  });
});
