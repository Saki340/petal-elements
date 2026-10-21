/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

// The carousel after Jetpack Compose Material 3 (Carousel.kt, Keylines.kt,
// Strategy.kt, KeylineSnapPosition.kt at androidx commit df73c24). Items are
// laid out on real animation frames, so no Environment.

import {html, render, TemplateResult} from 'lit';

import './carousel.js';

import type {PetalCarousel} from './carousel.js';
import {multiBrowseKeylineList} from './internal/keylines.js';
import {itemLayout, itemScrollOffset, maxScrollOffset} from './internal/layout.js';
import {Strategy} from './internal/strategy.js';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const frame = () => new Promise(requestAnimationFrame);

describe('petal-carousel', () => {
  let root: HTMLElement;

  beforeEach(() => {
    root = document.createElement('div');
    document.body.append(root);
  });

  afterEach(() => root.remove());

  async function setup(template: TemplateResult) {
    render(template, root);
    const carousel = root.querySelector('petal-carousel') as PetalCarousel;
    await carousel.updateComplete;
    await wait(0);
    await carousel.updateComplete;
    await frame();
    return carousel;
  }

  const items = (count: number) =>
    Array.from({length: count}, (_, i) => html`<div>${i + 1}</div>`);

  const multiBrowse = (dir = 'ltr') =>
    setup(html`<petal-carousel
      dir=${dir}
      item-width="186"
      item-spacing="8"
      style="width: 380px">
      ${items(10)}
    </petal-carousel>`);

  const scroller = (carousel: PetalCarousel) =>
    carousel.shadowRoot!.querySelector<HTMLElement>('.scroller')!;

  const strategy = new Strategy(multiBrowseKeylineList(380, 186, 8, 10), 380, 8, 0, 0);
  const max = maxScrollOffset(strategy, 10);

  /** The item's shown box, from the carousel's start, after its mask. */
  function shown(carousel: PetalCarousel, index: number) {
    const item = carousel.children[index] as HTMLElement;
    const box = item.getBoundingClientRect();
    const host = carousel.getBoundingClientRect();
    const width = parseFloat(item.style.getPropertyValue('--carousel-item-mask-width'));
    const center = box.left + box.width / 2 - host.left;
    return {center, width};
  }

  async function scrollTo(carousel: PetalCarousel, left: number) {
    scroller(carousel).style.scrollSnapType = 'none';
    scroller(carousel).scrollLeft = left;
    await frame();
    await frame();
  }

  it('names itself and its items for assistive technology', async () => {
    const carousel = await multiBrowse();
    expect(carousel.getAttribute('role')).toBe('region');
    expect(carousel.getAttribute('aria-roledescription')).toBe('carousel');
    const first = carousel.children[0];
    expect(first.getAttribute('role')).toBe('group');
    expect(first.getAttribute('aria-roledescription')).toBe('slide');
    expect(first.getAttribute('aria-label')).toBe('1 of 10');
  });

  it('scrolls as far as the items laid end to end at the large size', async () => {
    const carousel = await multiBrowse();
    const el = scroller(carousel);
    expect(el.scrollWidth - el.clientWidth).toBe(max);
  });

  it('shows a large item, then a medium and a small one, at the start', async () => {
    const carousel = await multiBrowse();
    for (const index of [0, 1, 2]) {
      const expected = itemLayout(strategy, index, 0, max);
      const {center, width} = shown(carousel, index);
      expect(width).toBeCloseTo(expected.size, 1);
      expect(center).toBeCloseTo(expected.center, 1);
    }
    expect(shown(carousel, 0).width).toBe(186);
    expect(shown(carousel, 2).width).toBe(56);
  });

  it('masks items to their keyline with the item shape', async () => {
    const carousel = await multiBrowse();
    const small = carousel.children[2] as HTMLElement;
    expect(small.getBoundingClientRect().width).toBe(186);
    expect(small.style.clipPath).toContain(`${(186 - 56) / 2}px`);
    expect(small.style.clipPath).toContain('round');
    // Between Compose's minItemSize (the 10px anchors) and maxItemSize.
    expect(small.style.getPropertyValue('--carousel-item-mask-fraction')).toBe(
      ((56 - 10) / (186 - 10)).toFixed(4),
    );
    const large = carousel.children[0] as HTMLElement;
    expect(large.style.getPropertyValue('--carousel-item-mask-fraction')).toBe('1.0000');
  });

  it('moves items to their keylines as it scrolls', async () => {
    const carousel = await multiBrowse();
    const offset = 250;
    await scrollTo(carousel, offset);
    for (const index of [0, 1, 2, 3]) {
      const expected = itemLayout(strategy, index, offset, max);
      const {center, width} = shown(carousel, index);
      expect(width).toBeCloseTo(expected.size, 1);
      expect(center).toBeCloseTo(expected.center, 1);
    }
  });

  it('puts the current item above the others', async () => {
    const carousel = await multiBrowse();
    await scrollTo(carousel, itemScrollOffset(strategy, 3, 10));
    expect(carousel.currentIndex).toBe(3);
    const z = (i: number) => Number((carousel.children[i] as HTMLElement).style.zIndex);
    expect(z(3)).toBeGreaterThan(z(2));
    expect(z(3)).toBeGreaterThan(z(4));
  });

  it('marks the scroll offsets at which items rest for snapping', async () => {
    const carousel = await multiBrowse();
    const snaps = [...carousel.shadowRoot!.querySelectorAll<HTMLElement>('.snap')];
    expect(snaps.length).toBeGreaterThan(1);
    expect(getComputedStyle(scroller(carousel)).scrollSnapType).toBe('x mandatory');
    expect(getComputedStyle(snaps[0]).scrollSnapStop).toBe('always');
    const lefts = snaps.map((s) => s.offsetLeft);
    expect(lefts[0]).toBe(0);
    expect(lefts[lefts.length - 1]).toBe(max);
  });

  it('scrolls an item to its resting place', async () => {
    const carousel = await multiBrowse();
    carousel.scrollToItem(4, 'instant');
    await frame();
    expect(scroller(carousel).scrollLeft).toBeCloseTo(itemScrollOffset(strategy, 4, 10), 0);
    carousel.scrollToItem(99, 'instant');
    await frame();
    expect(scroller(carousel).scrollLeft).toBeCloseTo(max, 0);
  });

  it('does not snap when uncontained', async () => {
    const carousel = await setup(html`<petal-carousel
      variant="uncontained"
      item-width="150"
      item-spacing="8"
      style="width: 400px">
      ${items(6)}
    </petal-carousel>`);
    expect(carousel.shadowRoot!.querySelectorAll('.snap').length).toBe(0);
    expect(getComputedStyle(scroller(carousel)).scrollSnapType).toBe('none');
    // Each item is the item width; the one at the end is cut by the mask.
    expect(shown(carousel, 0).width).toBe(158);
    expect((carousel.children[0] as HTMLElement).getBoundingClientRect().width).toBe(158);
  });

  it('fills the width less small items for a centered hero', async () => {
    const carousel = await setup(html`<petal-carousel
      variant="hero"
      item-spacing="8"
      style="width: 400px">
      ${items(5)}
    </petal-carousel>`);
    const first = shown(carousel, 0);
    expect(first.width).toBeGreaterThan(200);
    expect(first.center - first.width / 2).toBeCloseTo(0, 0);
    carousel.scrollToItem(2, 'instant');
    await frame();
    await frame();
    const middle = shown(carousel, 2);
    expect(middle.width).toBe(first.width);
    expect(middle.center).toBeCloseTo(200, 0);
  });

  it('mirrors in right-to-left pages', async () => {
    const carousel = await multiBrowse('rtl');
    const host = carousel.getBoundingClientRect();
    const first = (carousel.children[0] as HTMLElement).getBoundingClientRect();
    expect(host.right - first.right).toBeCloseTo(0, 3);
    await scrollTo(carousel, -250);
    const item = carousel.children[1] as HTMLElement;
    const expected = itemLayout(strategy, 1, 250, max);
    const box = item.getBoundingClientRect();
    expect(host.right - (box.left + box.width / 2)).toBeCloseTo(expected.center, 1);
  });

  it('does not grow its flex container with its scroll track', async () => {
    render(
      html`<div style="display: flex; width: 380px">
        <petal-carousel item-width="186" item-spacing="8" style="width: 100%">${items(10)}</petal-carousel>
      </div>`,
      root,
    );
    const carousel = root.querySelector('petal-carousel') as PetalCarousel;
    await carousel.updateComplete;
    await wait(0);
    await frame();
    expect(carousel.getBoundingClientRect().width).toBe(380);
    expect(scroller(carousel).scrollWidth - 380).toBe(max);
  });

  it('lays out again when it is resized', async () => {
    const carousel = await multiBrowse();
    carousel.style.width = '600px';
    await wait(50);
    await frame();
    const el = scroller(carousel);
    const wide = new Strategy(multiBrowseKeylineList(600, 186, 8, 10), 600, 8, 0, 0);
    expect(el.scrollWidth - el.clientWidth).toBeCloseTo(maxScrollOffset(wide, 10), -0.5);
  });
});
