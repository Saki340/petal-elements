/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

// The bottom app bar after Jetpack Compose Material 3 (AppBar.kt,
// BottomAppBarTokens, DockedToolbarTokens at androidx commit df73c24). The
// bar settles on real animation frames, so no Environment.

import {html, render, TemplateResult} from 'lit';

import '../fab/fab.js';
import '../iconbutton/icon-button.js';
import './bottom-app-bar.js';

import type {PetalBottomAppBar} from './bottom-app-bar.js';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const frame = () => new Promise(requestAnimationFrame);

describe('petal-bottom-app-bar', () => {
  let root: HTMLElement;

  beforeEach(() => {
    root = document.createElement('div');
    document.body.append(root);
  });

  afterEach(() => root.remove());

  async function setup(template: TemplateResult) {
    render(template, root);
    const bar = root.querySelector('petal-bottom-app-bar') as PetalBottomAppBar;
    await bar.updateComplete;
    await wait(0);
    return bar;
  }

  const standard = () =>
    setup(html`<petal-bottom-app-bar style="width: 412px">
      <petal-icon-button aria-label="One"><span>1</span></petal-icon-button>
      <petal-icon-button aria-label="Two"><span>2</span></petal-icon-button>
      <petal-fab slot="fab" aria-label="Add"><span slot="icon">+</span></petal-fab>
    </petal-bottom-app-bar>`);

  const box = (el: Element) => el.getBoundingClientRect();

  it('is 80px high on surface-container, without a shadow', async () => {
    const bar = await standard();
    expect(box(bar).height).toBe(80);
    const container = bar.shadowRoot!.querySelector('.bar')!;
    expect(getComputedStyle(container).backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
    expect(getComputedStyle(container).boxShadow).toBe('none');
  });

  it('puts the actions at the start, 4px in, centered below 4px of padding', async () => {
    const bar = await standard();
    const first = bar.querySelector('petal-icon-button')!;
    expect(box(first).left - box(bar).left).toBe(4);
    const middle = box(first).top + box(first).height / 2 - box(bar).top;
    expect(middle).toBe(42);
  });

  it('puts the FAB 12px from the top and 16px from the end, without a shadow', async () => {
    const bar = await standard();
    const fab = bar.querySelector('petal-fab')!;
    expect(box(fab).top - box(bar).top).toBe(12);
    expect(box(bar).right - box(fab).right).toBe(16);
    expect(getComputedStyle(fab).getPropertyValue('--md-fab-container-elevation').trim()).toBe('0');
  });

  it('is 64px high with 16px at the ends and the content spread when flexible', async () => {
    const bar = await setup(html`<petal-bottom-app-bar flexible style="width: 412px">
      <petal-icon-button aria-label="One"><span>1</span></petal-icon-button>
      <petal-icon-button aria-label="Two"><span>2</span></petal-icon-button>
      <petal-icon-button aria-label="Three"><span>3</span></petal-icon-button>
    </petal-bottom-app-bar>`);
    expect(box(bar).height).toBe(64);
    const buttons = [...bar.querySelectorAll('petal-icon-button')];
    expect(box(buttons[0]).left - box(bar).left).toBe(16);
    expect(box(bar).right - box(buttons[2]).right).toBe(16);
    const gap1 = box(buttons[1]).left - box(buttons[0]).right;
    const gap2 = box(buttons[2]).left - box(buttons[1]).right;
    expect(gap1).toBeCloseTo(gap2, 0);
  });

  describe('hide-on-scroll (exitAlwaysScrollBehavior)', () => {
    async function scrolling() {
      const bar = await setup(html`
        <div id="list" style="height: 300px; overflow: auto">
          <div style="height: 3000px"></div>
        </div>
        <petal-bottom-app-bar hide-on-scroll scroll-target="list" style="width: 412px">
          <petal-icon-button aria-label="One"><span>1</span></petal-icon-button>
        </petal-bottom-app-bar>`);
      const list = root.querySelector('#list') as HTMLElement;
      return {bar, list};
    }

    async function scrollTo(list: HTMLElement, top: number) {
      list.scrollTop = top;
      list.dispatchEvent(new Event('scroll'));
      await frame();
    }

    it('moves down by what the content scrolls, and comes back on scrolling up', async () => {
      const {bar, list} = await scrolling();
      await scrollTo(list, 30);
      expect(getComputedStyle(bar).translate).toBe('0px 30px');
      expect(bar.hiddenFraction).toBeCloseTo(30 / 80, 2);
      await scrollTo(list, 500);
      expect(bar.hiddenFraction).toBe(1);
      expect(bar.hasAttribute('hidden-by-scroll')).toBeTrue();
      await scrollTo(list, 480);
      expect(getComputedStyle(bar).translate).toBe('0px 60px');
    });

    it('settles to the closer end on the fast spatial spring when scrolling stops', async () => {
      const {bar, list} = await scrolling();
      await scrollTo(list, 30);
      list.dispatchEvent(new Event('scrollend'));
      await wait(500);
      expect(bar.hiddenFraction).toBe(0);
      // Down another 50px: more than half hidden.
      await scrollTo(list, 80);
      expect(bar.hiddenFraction).toBeCloseTo(50 / 80, 2);
      list.dispatchEvent(new Event('scrollend'));
      await wait(500);
      expect(bar.hiddenFraction).toBe(1);
    });

    it('does not move without hide-on-scroll', async () => {
      const bar = await setup(html`
        <div id="list" style="height: 300px; overflow: auto"><div style="height: 3000px"></div></div>
        <petal-bottom-app-bar scroll-target="list"></petal-bottom-app-bar>`);
      const list = root.querySelector('#list') as HTMLElement;
      await scrollTo(list, 200);
      expect(bar.hiddenFraction).toBe(0);
    });

    it('shows again with show()', async () => {
      const {bar, list} = await scrolling();
      await scrollTo(list, 500);
      bar.show();
      await wait(500);
      expect(bar.hiddenFraction).toBe(0);
    });
  });
});
