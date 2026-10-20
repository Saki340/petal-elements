/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

// Segmented buttons after Jetpack Compose Material 3 (SegmentedButton.kt,
// OutlinedSegmentedButtonTokens at androidx commit df73c24).

import {html} from 'lit';

import {Environment} from '../testing/environment.js';

import '../icon/icon.js';
import '../labs/segmentedbutton/outlined-segmented-button.js';
import '../labs/segmentedbuttonset/outlined-segmented-button-set.js';
import './segmented-button-set.js';
import './segmented-button.js';

import type {PetalSegmentedButton} from './segmented-button.js';
import type {PetalSegmentedButtonSet} from './segmented-button-set.js';

describe('petal-segmented-button-set', () => {
  const env = new Environment();

  async function setup(multiselect = false) {
    const root = env.render(html`
      <petal-segmented-button-set ?multiselect=${multiselect} aria-label="Range">
        <petal-segmented-button label="Day" selected></petal-segmented-button>
        <petal-segmented-button label="Week"></petal-segmented-button>
        <petal-segmented-button label="Month"></petal-segmented-button>
        <petal-segmented-button label="Year" disabled></petal-segmented-button>
      </petal-segmented-button-set>
    `);
    await env.waitForStability();
    const set = root.querySelector('petal-segmented-button-set') as PetalSegmentedButtonSet;
    const buttons = [...root.querySelectorAll('petal-segmented-button')] as PetalSegmentedButton[];
    return {set, buttons};
  }

  const inner = (button: HTMLElement) =>
    button.shadowRoot!.querySelector('button') as HTMLButtonElement;

  describe('layout', () => {
    it('is 40px high with equal buttons at least 58px wide', async () => {
      const {buttons} = await setup();
      const boxes = buttons.map((b) => b.getBoundingClientRect());
      for (const box of boxes) {
        expect(box.height).toBe(40);
        expect(box.width).toBeGreaterThanOrEqual(58);
      }
      // The outlines overlap by their width (spacedBy(-BorderWidth)).
      expect(boxes[1].left).toBeCloseTo(boxes[0].right - 1, 1);
      expect(boxes[2].right - boxes[1].right).toBeCloseTo(
        boxes[1].right - boxes[0].right,
        1,
      );
    });

    it('rounds only the outer ends (itemShape)', async () => {
      const {buttons} = await setup();
      const [first, middle, last] = [buttons[0], buttons[1], buttons[3]].map(
        (b) => getComputedStyle(inner(b)),
      );
      expect(first.borderStartStartRadius).not.toBe('0px');
      expect(first.borderStartEndRadius).toBe('0px');
      expect(middle.borderStartStartRadius).toBe('0px');
      expect(middle.borderEndEndRadius).toBe('0px');
      expect(last.borderEndEndRadius).not.toBe('0px');
      expect(last.borderEndStartRadius).toBe('0px');
    });

    it('has 12px of padding, an 18px icon and the label large style', async () => {
      const {buttons} = await setup();
      const style = getComputedStyle(inner(buttons[0]));
      expect(style.paddingInlineStart).toBe('12px');
      expect(style.paddingInlineEnd).toBe('12px');
      const icon = buttons[0].shadowRoot!.querySelector('.icon')!;
      expect(icon.getBoundingClientRect().width).toBe(18);
      const label = getComputedStyle(buttons[0].shadowRoot!.querySelector('.label')!);
      expect(label.fontSize).toBe('14px');
      expect(label.fontWeight).toBe('500');
    });

    it('draws the selected button over its neighbours (interactionZIndex)', async () => {
      const {buttons} = await setup();
      expect(getComputedStyle(buttons[0]).zIndex).toBe('5');
      expect(getComputedStyle(buttons[1]).zIndex).toBe('0');
    });
  });

  describe('content', () => {
    it('shows the checkmark on the selected button only', async () => {
      const {buttons} = await setup();
      const check = (b: HTMLElement) =>
        getComputedStyle(b.shadowRoot!.querySelector('.checkmark')!);
      expect(check(buttons[0]).opacity).toBe('1');
      expect(check(buttons[1]).opacity).toBe('0');
    });

    it('centers the label of an unselected button by moving it back 13px', async () => {
      const {buttons} = await setup();
      const translate = (b: HTMLElement) =>
        getComputedStyle(b.shadowRoot!.querySelector('.label')!).translate;
      expect(translate(buttons[0])).toBe('none');
      expect(translate(buttons[1])).toBe('-13px');
    });

    it('slides the label on the fast spatial spring and grows the checkmark from its bottom start', async () => {
      const {buttons} = await setup();
      const label = getComputedStyle(buttons[0].shadowRoot!.querySelector('.label')!);
      expect(label.transitionProperty).toBe('translate');
      expect(label.transitionDuration).toBe('0.359s');
      const check = getComputedStyle(buttons[0].shadowRoot!.querySelector('.checkmark')!);
      expect(check.transitionProperty).toBe('scale, opacity');
      expect(check.transformOrigin).toBe('0px 18px');
    });

    it('cross-fades an icon with the checkmark', async () => {
      const root = env.render(html`
        <petal-segmented-button-set>
          <petal-segmented-button label="Walk" selected>
            <petal-icon slot="icon">directions_walk</petal-icon>
          </petal-segmented-button>
          <petal-segmented-button label="Drive">
            <petal-icon slot="icon">directions_car</petal-icon>
          </petal-segmented-button>
        </petal-segmented-button-set>
      `);
      await env.waitForStability();
      const [selected, unselected] = root.querySelectorAll('petal-segmented-button');
      const opacity = (b: Element, part: string) =>
        getComputedStyle(b.shadowRoot!.querySelector(part)!).opacity;
      expect(opacity(selected, '.checkmark')).toBe('1');
      expect(opacity(selected, '.slotted-icon')).toBe('0');
      expect(opacity(unselected, '.checkmark')).toBe('0');
      expect(opacity(unselected, '.slotted-icon')).toBe('1');
      // The label does not move when there is an icon.
      expect(getComputedStyle(unselected.shadowRoot!.querySelector('.label')!).translate).toBe('none');
    });
  });

  describe('single select', () => {
    it('is a radio group with the selected button in the tab order', async () => {
      const {set, buttons} = await setup();
      expect(set.shadowRoot!.querySelector('.set')!.getAttribute('role')).toBe('radiogroup');
      expect(inner(buttons[0]).getAttribute('role')).toBe('radio');
      expect(inner(buttons[0]).getAttribute('aria-checked')).toBe('true');
      expect(buttons.map((b) => inner(b).tabIndex)).toEqual([0, -1, -1, -1]);
    });

    it('selects the clicked button and deselects the others', async () => {
      const {set, buttons} = await setup();
      const spy = jasmine.createSpy('selection');
      set.addEventListener('segmented-button-set-selection', spy);
      inner(buttons[1]).click();
      await env.waitForStability();
      expect(buttons.map((b) => b.selected)).toEqual([false, true, false, false]);
      expect(buttons.map((b) => inner(b).tabIndex)).toEqual([-1, 0, -1, -1]);
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy.calls.mostRecent().args[0].detail.index).toBe(1);
    });

    it('does not deselect the selected button', async () => {
      const {buttons} = await setup();
      inner(buttons[0]).click();
      await env.waitForStability();
      expect(buttons[0].selected).toBeTrue();
    });

    it('moves and selects with the arrow keys, skipping disabled buttons', async () => {
      const {buttons} = await setup();
      buttons[0].focus();
      const press = (button: HTMLElement, key: string) =>
        inner(button).dispatchEvent(
          new KeyboardEvent('keydown', {key, bubbles: true, composed: true}),
        );
      press(buttons[0], 'ArrowRight');
      await env.waitForStability();
      expect(buttons[1].selected).toBeTrue();
      press(buttons[1], 'ArrowRight');
      press(buttons[2], 'ArrowRight');
      await env.waitForStability();
      // Year is disabled: from Month it wraps to Day.
      expect(buttons[0].selected).toBeTrue();
      press(buttons[0], 'ArrowLeft');
      await env.waitForStability();
      expect(buttons[2].selected).toBeTrue();
    });

    it('updates the tab order when selected is set directly', async () => {
      const {buttons} = await setup();
      buttons[0].selected = false;
      buttons[2].selected = true;
      await env.waitForStability();
      expect(buttons.map((b) => inner(b).tabIndex)).toEqual([-1, -1, 0, -1]);
    });
  });

  describe('multiselect', () => {
    it('is a group of toggle buttons, all in the tab order', async () => {
      const {set, buttons} = await setup(true);
      expect(set.shadowRoot!.querySelector('.set')!.getAttribute('role')).toBe('group');
      expect(inner(buttons[0]).getAttribute('aria-pressed')).toBe('true');
      expect(inner(buttons[0]).hasAttribute('role')).toBeFalse();
      expect(buttons.map((b) => inner(b).tabIndex)).toEqual([0, 0, 0, 0]);
    });

    it('toggles buttons independently', async () => {
      const {buttons} = await setup(true);
      inner(buttons[1]).click();
      inner(buttons[0]).click();
      await env.waitForStability();
      expect(buttons.map((b) => b.selected)).toEqual([false, true, false, false]);
    });
  });

  it('keeps the labs tags working', async () => {
    const root = env.render(html`
      <petal-outlined-segmented-button-set>
        <petal-outlined-segmented-button label="A" selected></petal-outlined-segmented-button>
        <petal-outlined-segmented-button label="B"></petal-outlined-segmented-button>
      </petal-outlined-segmented-button-set>
    `);
    await env.waitForStability();
    const [, b] = root.querySelectorAll('petal-outlined-segmented-button');
    (b.shadowRoot!.querySelector('button') as HTMLButtonElement).click();
    await env.waitForStability();
    expect((b as PetalSegmentedButton).selected).toBeTrue();
    expect(b.getBoundingClientRect().height).toBe(40);
  });
});
