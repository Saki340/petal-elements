/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

// Hover as a preview of the press (_hover.scss), with a real mouse pointer:
// a hovered component goes 30% of the way to its pressed look. Transitions
// are finished before reading the result; springs run on real frames.

import {emulateMedia, resetMouse, sendMouse} from '@web/test-runner-commands';
import {html, render, TemplateResult} from 'lit';

import '../../button/filled-button.js';
import '../../buttongroup/button-group.js';
import '../../card/elevated-card.js';
import '../../fab/fab.js';
import '../../icon/icon.js';
import '../../iconbutton/icon-button.js';
import '../../switch/switch.js';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const frame = () => new Promise(requestAnimationFrame);

/** Finishes the transitions of an element and those in its shadow root. */
function finish(element: Element) {
  const animations = [
    ...element.getAnimations(),
    ...(element.shadowRoot?.getAnimations() ?? []),
  ];
  for (const animation of animations) animation.finish();
}

function center(element: Element): [number, number] {
  const box = element.getBoundingClientRect();
  return [Math.round(box.left + box.width / 2), Math.round(box.top + box.height / 2)];
}

async function hover(element: Element) {
  await sendMouse({type: 'move', position: center(element)});
  await frame();
}

const px = (value: string) => parseFloat(value);

describe('hover previews the press', () => {
  let root: HTMLElement;

  beforeAll(() => {
    // The tests need a mouse that hovers.
    expect(matchMedia('(hover: hover) and (pointer: fine)').matches)
      .withContext('Chromium has a fine pointer')
      .toBeTrue();
  });

  beforeEach(() => {
    root = document.createElement('div');
    root.style.padding = '40px';
    document.body.append(root);
  });

  afterEach(async () => {
    root.remove();
    await resetMouse();
    await emulateMedia({reducedMotion: 'no-preference'});
  });

  async function setup<T extends HTMLElement>(template: TemplateResult, selector: string) {
    render(template, root);
    const element = root.querySelector(selector) as T & {updateComplete?: Promise<unknown>};
    await element.updateComplete;
    await frame();
    finish(element);
    return element;
  }

  describe('button', () => {
    it('goes 30% of the way to the pressed shape', async () => {
      const button = await setup(
        html`<petal-filled-button size="small">Label</petal-filled-button>`,
        'petal-filled-button',
      );
      // Small: 40px high, fully rounded (20px), pressed 8px.
      expect(px(getComputedStyle(button).borderStartStartRadius)).toBe(20);
      await hover(button);
      finish(button);
      expect(px(getComputedStyle(button).borderStartStartRadius)).toBeCloseTo(20 + (8 - 20) * 0.3, 3);
    });

    it('enters on the fast spatial spring and leaves on the default spatial one', async () => {
      const button = await setup(
        html`<petal-filled-button size="medium">Label</petal-filled-button>`,
        'petal-filled-button',
      );
      await hover(button);
      expect(getComputedStyle(button).transitionDuration).toBe('0.359s');
      await sendMouse({type: 'move', position: [1, 1]});
      await frame();
      expect(getComputedStyle(button).transitionDuration).toBe('0.434s');
    });

    it('keeps a disabled button as it is', async () => {
      const button = await setup(
        html`<petal-filled-button size="small" disabled>Label</petal-filled-button>`,
        'petal-filled-button',
      );
      await hover(button);
      finish(button);
      expect(px(getComputedStyle(button).borderStartStartRadius)).toBe(20);
    });

    it('switches the shape without motion when motion is reduced', async () => {
      await emulateMedia({reducedMotion: 'reduce'});
      const button = await setup(
        html`<petal-filled-button size="small">Label</petal-filled-button>`,
        'petal-filled-button',
      );
      await hover(button);
      expect(px(getComputedStyle(button).borderStartStartRadius)).toBeCloseTo(16.4, 3);
    });
  });

  describe('icon button', () => {
    it('goes 30% of the way to the pressed shape from a full corner', async () => {
      const button = await setup(
        html`<petal-icon-button size="small" aria-label="Add"><petal-icon>add</petal-icon></petal-icon-button>`,
        'petal-icon-button',
      );
      const container = button.shadowRoot!.querySelector('.icon-button')!;
      // Small: 40px square, half of it rounded; pressed 8px.
      expect(px(getComputedStyle(container).borderStartStartRadius)).toBe(20);
      await hover(button);
      finish(button);
      expect(px(getComputedStyle(container).borderStartStartRadius)).toBeCloseTo(16.4, 3);
    });

    const motions: Array<[string, string, string]> = [
      ['arrow_forward', 'translate', '3px'],
      ['download', 'translate', '0px 2px'],
      ['open_in_new', 'translate', '2px -2px'],
      ['settings', 'rotate', '60deg'],
      ['refresh', 'rotate', '90deg'],
      ['favorite', 'scale', '1.15'],
    ];
    for (const [name, property, value] of motions) {
      it(`moves ${name} by its meaning`, async () => {
        const button = await setup(
          html`<petal-icon-button aria-label="Icon"><petal-icon>${name}</petal-icon></petal-icon-button>`,
          'petal-icon-button',
        );
        const icon = button.shadowRoot!.querySelector('.icon')!;
        await hover(button);
        finish(button);
        expect(getComputedStyle(icon).getPropertyValue(property)).toBe(value);
      });
    }

    it('takes the motion from icon-motion, or none', async () => {
      const button = await setup(
        html`<petal-icon-button aria-label="Next" icon-motion="none"><petal-icon>arrow_forward</petal-icon></petal-icon-button>`,
        'petal-icon-button',
      );
      const icon = button.shadowRoot!.querySelector('.icon')!;
      await hover(button);
      finish(button);
      expect(getComputedStyle(icon).translate).toBe('none');
      button.setAttribute('icon-motion', 'grow');
      await (button as unknown as {updateComplete: Promise<unknown>}).updateComplete;
      finish(button);
      expect(getComputedStyle(icon).scale).toBe('1.15');
    });

    it('moves a flipped arrow the other way', async () => {
      const button = await setup(
        html`<div dir="rtl"><petal-icon-button aria-label="Next" flip-icon-in-rtl><petal-icon>arrow_forward</petal-icon></petal-icon-button></div>`,
        'petal-icon-button',
      );
      const icon = button.shadowRoot!.querySelector('.icon')!;
      await hover(button);
      finish(button);
      expect(getComputedStyle(icon).translate).toBe('-3px');
    });

    it('does not move the icon when motion is reduced', async () => {
      await emulateMedia({reducedMotion: 'reduce'});
      const button = await setup(
        html`<petal-icon-button aria-label="Next"><petal-icon>arrow_forward</petal-icon></petal-icon-button>`,
        'petal-icon-button',
      );
      await hover(button);
      expect(getComputedStyle(button.shadowRoot!.querySelector('.icon')!).translate).toBe('none');
    });
  });

  describe('button group', () => {
    const group = () =>
      setup(
        html`<petal-button-group connected size="small">
          <petal-filled-button>One</petal-filled-button>
          <petal-filled-button>Two</petal-filled-button>
          <petal-filled-button>Three</petal-filled-button>
        </petal-button-group>`,
        'petal-button-group',
      );

    it('widens the hovered item by 30% of its press, and goes back', async () => {
      const element = await group();
      const [, two] = [...element.children] as HTMLElement[];
      const rest = two.getBoundingClientRect().width;
      await hover(two);
      await wait(800);
      // Small groups widen a pressed item by 15% of its width.
      expect(two.getBoundingClientRect().width).toBeCloseTo(rest * (1 + 0.15 * 0.3), 0);
      await sendMouse({type: 'move', position: [1, 1]});
      await wait(1000);
      expect(two.getBoundingClientRect().width).toBeCloseTo(rest, 1);
      expect(two.style.paddingInlineStart).toBe('');
    });

    it('takes the inner corners 30% of the way to the pressed ones', async () => {
      const element = await group();
      const two = element.children[1] as HTMLElement;
      const inner = px(getComputedStyle(two).borderStartStartRadius);
      const pressed = px(getComputedStyle(element).getPropertyValue('--_inner-pressed'));
      await hover(two);
      finish(two);
      expect(px(getComputedStyle(two).borderStartStartRadius)).toBeCloseTo(
        inner + (pressed - inner) * 0.3,
        3,
      );
    });
  });

  describe('card', () => {
    it('lifts a clickable card 3px and lights it around the pointer', async () => {
      const card = await setup(
        html`<petal-elevated-card clickable aria-label="Open" style="width: 200px; height: 120px"></petal-elevated-card>`,
        'petal-elevated-card',
      );
      const light = card.shadowRoot!.querySelector('.light')!;
      expect(getComputedStyle(light).opacity).toBe('0');
      await hover(card);
      finish(card);
      expect(getComputedStyle(card).translate).toBe('0px -3px');
      expect(getComputedStyle(light).opacity).toBe('1');
      expect(card.style.getPropertyValue('--_pointer-x')).toBe('100px');
      const ripple = card.shadowRoot!.querySelector('petal-ripple')!;
      expect(getComputedStyle(ripple).getPropertyValue('--md-ripple-hover-opacity').trim()).toBe('0');
    });

    it('leaves a card that cannot be clicked as it is', async () => {
      const card = await setup(
        html`<petal-elevated-card style="width: 200px; height: 120px"></petal-elevated-card>`,
        'petal-elevated-card',
      );
      const rest = getComputedStyle(card).getPropertyValue('--md-elevation-level');
      await hover(card);
      finish(card);
      expect(getComputedStyle(card).translate).toBe('none');
      // Its href reflects as href="", which is not a link.
      expect(card.getAttribute('href')).toBe('');
      expect(getComputedStyle(card).getPropertyValue('--md-elevation-level')).toBe(rest);
    });

    it('lights but does not lift when motion is reduced', async () => {
      await emulateMedia({reducedMotion: 'reduce'});
      const card = await setup(
        html`<petal-elevated-card clickable aria-label="Open" style="width: 200px; height: 120px"></petal-elevated-card>`,
        'petal-elevated-card',
      );
      await hover(card);
      finish(card);
      expect(getComputedStyle(card).translate).toBe('none');
      expect(getComputedStyle(card.shadowRoot!.querySelector('.light')!).opacity).toBe('1');
    });
  });

  describe('FAB follow-pointer', () => {
    it('moves up to 4px toward a pointer within 28px, and back', async () => {
      const fab = await setup(
        html`<petal-fab follow-pointer aria-label="Add"><petal-icon slot="icon">add</petal-icon></petal-fab>`,
        'petal-fab',
      );
      const inner = fab.shadowRoot!.querySelector('.fab') as HTMLElement;
      const box = inner.getBoundingClientRect();
      const y = Math.round(box.top + box.height / 2);
      await sendMouse({type: 'move', position: [Math.round(box.right + 20), y]});
      await frame();
      finish(fab);
      expect(getComputedStyle(inner).translate).toMatch(/^4px( 0px)?$/);
      await sendMouse({type: 'move', position: [Math.round(box.right + 60), y]});
      await frame();
      finish(fab);
      expect(getComputedStyle(inner).translate).toMatch(/^0px( 0px)?$/);
    });

    it('stays still without follow-pointer', async () => {
      const fab = await setup(
        html`<petal-fab aria-label="Add"><petal-icon slot="icon">add</petal-icon></petal-fab>`,
        'petal-fab',
      );
      const inner = fab.shadowRoot!.querySelector('.fab') as HTMLElement;
      const box = inner.getBoundingClientRect();
      await sendMouse({type: 'move', position: [Math.round(box.right + 10), Math.round(box.top + 10)]});
      await frame();
      expect(getComputedStyle(inner).translate).toBe('none');
    });
  });

  describe('switch', () => {
    it('takes the thumb 30% of the way to its pressed size', async () => {
      const unselected = await setup(html`<petal-switch></petal-switch>`, 'petal-switch');
      const handle = () => unselected.shadowRoot!.querySelector('.handle')!;
      expect(px(getComputedStyle(handle()).width)).toBe(16);
      await hover(unselected);
      finish(unselected);
      expect(px(getComputedStyle(handle()).width)).toBeCloseTo(16 + (28 - 16) * 0.3, 1);
      unselected.toggleAttribute('selected', true);
      await (unselected as unknown as {updateComplete: Promise<unknown>}).updateComplete;
      finish(unselected);
      expect(px(getComputedStyle(handle()).width)).toBeCloseTo(24 + (28 - 24) * 0.3, 1);
    });
  });
});
