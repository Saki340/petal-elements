/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import '../tooltip.js';

import {html} from 'lit';

import {Environment} from '../../testing/environment.js';
import {Tooltip} from './tooltip.js';

describe('<petal-tooltip>', () => {
  const env = new Environment();

  async function setupTest() {
    const root = env.render(html`
      <div style="padding: 80px">
        <button id="anchor">Anchor</button>
        <petal-tooltip for="anchor">Tooltip text</petal-tooltip>
      </div>
    `);
    const anchor = root.querySelector('button')!;
    const tooltip = root.querySelector('petal-tooltip') as Tooltip;
    await env.waitForStability();
    await Promise.resolve(); // The tooltip attaches in a microtask.
    return {anchor, tooltip};
  }

  const isOpen = (tooltip: Tooltip) => tooltip.matches(':popover-open');

  it('is a tooltip that describes its anchor', async () => {
    const {anchor, tooltip} = await setupTest();
    expect(tooltip.getAttribute('role')).toBe('tooltip');
    expect(tooltip.id).toBeTruthy();
    expect(anchor.getAttribute('aria-describedby')).toBe(tooltip.id);
  });

  it('shows on hover and hides when the pointer leaves', async () => {
    const {anchor, tooltip} = await setupTest();
    anchor.dispatchEvent(new PointerEvent('pointerenter', {pointerType: 'mouse'}));
    await env.waitForStability();
    expect(isOpen(tooltip)).toBeTrue();

    anchor.dispatchEvent(new PointerEvent('pointerleave', {pointerType: 'mouse'}));
    await env.waitForStability();
    // Closing plays an animation, then hides the popover.
    const container = tooltip.shadowRoot!.querySelector('.tooltip')!;
    expect(container.classList.contains('closing')).toBeTrue();
  });

  it('shows on keyboard focus but not on focus from a click', async () => {
    const {anchor, tooltip} = await setupTest();
    anchor.dispatchEvent(new PointerEvent('pointerdown', {pointerType: 'mouse'}));
    anchor.dispatchEvent(new FocusEvent('focusin'));
    await env.waitForStability();
    expect(isOpen(tooltip)).withContext('after a click').toBeFalse();

    anchor.dispatchEvent(new FocusEvent('focusout'));
    anchor.dispatchEvent(new FocusEvent('focusin'));
    await env.waitForStability();
    expect(isOpen(tooltip)).withContext('after keyboard focus').toBeTrue();
  });

  it('shows after a 400ms touch long press, for 1.5s', async () => {
    const {anchor, tooltip} = await setupTest();
    const closeSpy = jasmine.createSpy('close');
    tooltip.addEventListener('close', closeSpy);
    anchor.dispatchEvent(new PointerEvent('pointerdown', {pointerType: 'touch'}));

    jasmine.clock().tick(399);
    expect(isOpen(tooltip)).withContext('before 400ms').toBeFalse();
    jasmine.clock().tick(1);
    expect(isOpen(tooltip)).withContext('after 400ms').toBeTrue();

    jasmine.clock().tick(1499);
    expect(closeSpy).not.toHaveBeenCalled();
    jasmine.clock().tick(1);
    expect(closeSpy).toHaveBeenCalledTimes(1);
  });

  it('sits 4px above its anchor, centered', async () => {
    const {anchor, tooltip} = await setupTest();
    tooltip.show();
    await env.waitForStability();
    for (const animation of tooltip.shadowRoot!.querySelector('.tooltip')!.getAnimations()) {
      animation.finish();
    }

    const a = anchor.getBoundingClientRect();
    const t = tooltip.getBoundingClientRect();
    expect(Math.round(a.top - t.bottom)).toBe(4);
    expect(Math.round(t.left + t.width / 2)).toBe(Math.round(a.left + a.width / 2));
  });

  it('hides on Escape', async () => {
    const {tooltip} = await setupTest();
    const closeSpy = jasmine.createSpy('close');
    tooltip.addEventListener('close', closeSpy);
    tooltip.show();
    await env.waitForStability();

    document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape'}));
    expect(closeSpy).toHaveBeenCalledTimes(1);
  });

  it('shows one tooltip at a time', async () => {
    const root = env.render(html`
      <button id="a">A</button><petal-tooltip for="a">A</petal-tooltip>
      <button id="b">B</button><petal-tooltip for="b">B</petal-tooltip>
    `);
    await env.waitForStability();
    await Promise.resolve(); // The tooltip attaches in a microtask.
    const [first, second] = root.querySelectorAll('petal-tooltip') as NodeListOf<Tooltip>;
    const closeSpy = jasmine.createSpy('close');
    first.addEventListener('close', closeSpy);

    first.show();
    second.show();

    expect(closeSpy).toHaveBeenCalledTimes(1);
    second.hide();
  });
});
