/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

// The rich tooltip after Jetpack Compose Material 3 (RichTooltip and
// TooltipDefaults in Tooltip.kt, RichTooltipTokens at androidx commit
// df73c24).

import {html, render, TemplateResult} from 'lit';

import '../button/text-button.js';
import './rich-tooltip.js';

import type {PetalRichTooltip} from './rich-tooltip.js';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('petal-rich-tooltip', () => {
  let root: HTMLElement;

  beforeEach(() => {
    root = document.createElement('div');
    document.body.append(root);
  });

  afterEach(() => root.remove());

  async function setup(
    tooltip: TemplateResult = html`<petal-rich-tooltip for="anchor" persistent>
      <span slot="title">Camera settings</span>
      Choose the resolution and frame rate for new videos.
      <petal-text-button slot="action">Learn more</petal-text-button>
    </petal-rich-tooltip>`,
    anchorStyle = 'position: fixed; left: 200px; top: 300px',
  ) {
    render(
      html`<button id="anchor" style=${anchorStyle}>Info</button>
        <button id="outside" style="position: fixed; left: 0; top: 0">Outside</button>
        ${tooltip}`,
      root,
    );
    const tip = root.querySelector('petal-rich-tooltip') as PetalRichTooltip;
    await tip.updateComplete;
    await wait(0);
    const anchor = root.querySelector('#anchor') as HTMLElement;
    return {tip, anchor};
  }

  const open = (tip: Element) => tip.matches(':popover-open');

  /** Waits up to 1.5 s for the closing animation to end. */
  async function closed(tip: Element) {
    for (let i = 0; i < 30 && open(tip); i++) await wait(50);
    return !open(tip);
  }
  const part = (tip: Element, selector: string) =>
    tip.shadowRoot!.querySelector(selector) as HTMLElement;
  const box = (el: Element) => el.getBoundingClientRect();

  async function showStill(tip: PetalRichTooltip) {
    tip.show();
    await tip.updateComplete;
    // Measure without the opening scale.
    for (const animation of part(tip, '.tooltip').getAnimations()) animation.finish();
  }

  describe('layout', () => {
    it('is a 320px-wide card on surface-container with the medium shape', async () => {
      const {tip} = await setup();
      await showStill(tip);
      const card = part(tip, '.tooltip');
      expect(box(card).width).toBe(320);
      expect(getComputedStyle(card).borderTopLeftRadius).toBe('12px');
      expect(getComputedStyle(part(tip, 'petal-elevation')).getPropertyValue('--md-elevation-level').trim()).toBe('2');
    });

    it('puts the title’s baseline 28px from the top and the text’s 24px below the title', async () => {
      const {tip} = await setup();
      await showStill(tip);
      const top = box(part(tip, '.tooltip')).top;
      const [titleStrut, textStrut] = [...tip.shadowRoot!.querySelectorAll('.strut')];
      expect(box(titleStrut).bottom - top).toBe(28);
      expect(box(textStrut).bottom - box(part(tip, '.title')).bottom).toBe(24);
      expect(box(part(tip, '.content')).left - box(part(tip, '.tooltip')).left).toBe(0);
      const text = part(tip, '.text');
      expect(getComputedStyle(text).paddingLeft).toBe('0px');
      expect(box(text).left - box(part(tip, '.tooltip')).left).toBe(16);
    });

    it('leaves 16px under the text and puts the action in at least 36px with 8px under it', async () => {
      const {tip} = await setup();
      await showStill(tip);
      expect(getComputedStyle(part(tip, '.text')).paddingBottom).toBe('16px');
      const action = part(tip, '.action');
      expect(getComputedStyle(action).paddingBottom).toBe('8px');
      expect(box(action).height).toBeGreaterThanOrEqual(36 + 8);
      expect(box(part(tip, '.tooltip')).bottom - box(action).bottom).toBe(0);
    });

    it('has 4px above and below the text without a title or action', async () => {
      const {tip} = await setup(html`<petal-rich-tooltip for="anchor">Short text</petal-rich-tooltip>`);
      await showStill(tip);
      expect(getComputedStyle(part(tip, '.text')).paddingTop).toBe('4px');
      expect(part(tip, '.title').hidden).toBeTrue();
      expect(part(tip, '.action').hidden).toBeTrue();
    });
  });

  describe('position (TooltipAnchorPosition.Above)', () => {
    it('sits centered 4px above the anchor', async () => {
      const {tip, anchor} = await setup();
      await showStill(tip);
      const card = box(tip);
      expect(box(anchor).top - card.bottom).toBe(4);
      expect(card.left + card.width / 2).toBeCloseTo(box(anchor).left + box(anchor).width / 2, 0);
    });

    it('aligns with the anchor’s start at the viewport’s start', async () => {
      const {tip, anchor} = await setup(undefined, 'position: fixed; left: 10px; top: 300px');
      await showStill(tip);
      expect(box(tip).left).toBe(box(anchor).left);
    });

    it('goes below the anchor when there is no room above', async () => {
      const {tip, anchor} = await setup(undefined, 'position: fixed; left: 200px; top: 10px');
      await showStill(tip);
      expect(box(tip).top - box(anchor).bottom).toBe(4);
    });

    it('draws a 16 by 8px caret pointing at the anchor', async () => {
      const {tip, anchor} = await setup(html`<petal-rich-tooltip for="anchor" caret>Text</petal-rich-tooltip>`);
      await showStill(tip);
      const caret = box(part(tip, '.caret'));
      expect([caret.width, caret.height]).toEqual([16, 8]);
      expect(caret.left + 8).toBeCloseTo(box(anchor).left + box(anchor).width / 2, 0);
      expect(box(anchor).top - caret.bottom).toBe(4);
    });
  });

  describe('showing', () => {
    it('is a dialog when persistent, a tooltip otherwise', async () => {
      const {tip} = await setup();
      expect(tip.getAttribute('role')).toBe('dialog');
      tip.persistent = false;
      await tip.updateComplete;
      expect(tip.getAttribute('role')).toBe('tooltip');
    });

    it('stays when the pointer leaves, until something outside is pressed', async () => {
      const {tip, anchor} = await setup();
      anchor.dispatchEvent(new PointerEvent('pointerenter', {pointerType: 'mouse'}));
      expect(open(tip)).toBeTrue();
      anchor.dispatchEvent(new PointerEvent('pointerleave', {pointerType: 'mouse'}));
      await wait(300);
      expect(open(tip)).toBeTrue();
      root.querySelector('#outside')!.dispatchEvent(
        new PointerEvent('pointerdown', {bubbles: true, composed: true}),
      );
      expect(await closed(tip)).toBeTrue();
    });

    it('stays when the tooltip itself is pressed, and hides on its action', async () => {
      const {tip} = await setup();
      tip.show();
      part(tip, '.text').dispatchEvent(new PointerEvent('pointerdown', {bubbles: true, composed: true}));
      await wait(50);
      expect(open(tip)).toBeTrue();
      (tip.querySelector('petal-text-button') as HTMLElement).click();
      expect(await closed(tip)).toBeTrue();
    });

    it('hides on Escape', async () => {
      const {tip} = await setup();
      tip.show();
      document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape'}));
      expect(await closed(tip)).toBeTrue();
    });

    it('lets the pointer cross onto a non-persistent tooltip', async () => {
      const {tip, anchor} = await setup(html`<petal-rich-tooltip for="anchor">Text</petal-rich-tooltip>`);
      anchor.dispatchEvent(new PointerEvent('pointerenter', {pointerType: 'mouse'}));
      anchor.dispatchEvent(new PointerEvent('pointerleave', {pointerType: 'mouse'}));
      tip.dispatchEvent(new PointerEvent('pointerenter', {pointerType: 'mouse'}));
      await wait(300);
      expect(open(tip)).toBeTrue();
      tip.dispatchEvent(new PointerEvent('pointerleave', {pointerType: 'mouse'}));
      expect(await closed(tip)).toBeTrue();
    });
  });
});
