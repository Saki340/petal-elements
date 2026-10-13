/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import '../top-app-bar.js';

import {html} from 'lit';

import {Environment} from '../../testing/environment.js';
import {TopAppBar} from './top-app-bar.js';

describe('<petal-top-app-bar>', () => {
  const env = new Environment();

  /** A bar in a 300px scrolling box, with tall content below it. */
  async function setupTest(attributes = '') {
    const root = env.render(html`
      <div id="scroller" style="height: 300px; overflow: auto">
        <petal-top-app-bar scroll-target="scroller" headline="Inbox"></petal-top-app-bar>
        <div style="height: 2000px"></div>
      </div>
    `);
    const bar = root.querySelector('petal-top-app-bar') as TopAppBar;
    for (const attribute of attributes.split(' ').filter(Boolean)) {
      const [name, value = ''] = attribute.split('=');
      bar.setAttribute(name, value);
    }
    await env.waitForStability();
    await Promise.resolve(); // The bar finds its scroll target in a microtask.
    const scroller = root.querySelector('#scroller') as HTMLElement;
    return {bar, scroller};
  }

  /** Scrolls and lets the bar update (it updates in an animation frame). */
  async function scroll(scroller: HTMLElement, top: number) {
    scroller.scrollTop = top;
    scroller.dispatchEvent(new Event('scroll'));
    jasmine.clock().tick(20);
    await env.waitForStability();
  }

  const height = (bar: TopAppBar) => Math.round(bar.getBoundingClientRect().height);

  it('is 64px tall when small', async () => {
    const {bar} = await setupTest();
    expect(height(bar)).toBe(64);
  });

  it('uses the Compose expanded heights', async () => {
    const {bar} = await setupTest('size=medium');
    expect(height(bar)).withContext('medium').toBe(112);
    bar.subtitle = '12 unread';
    await env.waitForStability();
    expect(height(bar)).withContext('medium with subtitle').toBe(136);
    bar.size = 'large';
    await env.waitForStability();
    expect(height(bar)).withContext('large with subtitle').toBe(152);
    bar.subtitle = '';
    await env.waitForStability();
    expect(height(bar)).withContext('large').toBe(120);
  });

  it('marks a small bar as scrolled when content is under it', async () => {
    const {bar, scroller} = await setupTest();
    expect(bar.collapsedFraction).toBe(0);
    await scroll(scroller, 10);
    expect(bar.collapsedFraction).toBe(1);
    expect(bar.hasAttribute('scrolled')).toBeTrue();
  });

  it('collapses a medium bar with the scroll position', async () => {
    const {bar, scroller} = await setupTest('size=medium');
    // 112 - 64 = 48px to collapse.
    await scroll(scroller, 24);
    expect(bar.collapsedFraction).toBeCloseTo(0.5, 2);
    await scroll(scroller, 200);
    expect(bar.collapsedFraction).toBe(1);
    // The top row stays in view.
    const top = bar.shadowRoot!.querySelector('.top')!.getBoundingClientRect();
    expect(Math.round(top.top - scroller.getBoundingClientRect().top)).toBe(0);
  });

  it('exposes one title to assistive technology', async () => {
    const {bar, scroller} = await setupTest('size=medium');
    const titles = () =>
      [...bar.shadowRoot!.querySelectorAll('.title')].map((title) =>
        title.getAttribute('aria-hidden'),
      );
    expect(titles()).withContext('expanded').toEqual(['true', null]);
    await scroll(scroller, 200);
    expect(titles()).withContext('collapsed').toEqual([null, 'true']);
  });

  it('notes a navigation icon', async () => {
    const root = env.render(html`
      <petal-top-app-bar headline="Inbox">
        <button slot="navigation">Menu</button>
      </petal-top-app-bar>
    `);
    await env.waitForStability();
    expect(root.querySelector('petal-top-app-bar')!.hasAttribute('has-navigation')).toBeTrue();
  });

  /** The text of the collapsed (top) and expanded (bottom) titles. */
  const titleTexts = (bar: TopAppBar) =>
    [...bar.shadowRoot!.querySelectorAll('.title')].map((title) =>
      [...title.querySelectorAll('slot')]
        .map((slot) => {
          const assigned = slot.assignedNodes();
          const nodes = assigned.length ? assigned : [...slot.childNodes];
          return nodes
            .filter((node) => node.nodeType !== Node.COMMENT_NODE)
            .map((node) => node.textContent)
            .join('')
            .trim();
        })
        .filter(Boolean)
        .join(' / '),
    );

  it('shows the subtitle in the collapsed row unless collapsed-subtitle is set', async () => {
    const {bar} = await setupTest('size=medium subtitle=Unread');
    expect(titleTexts(bar)).toEqual(['Inbox / Unread', 'Inbox / Unread']);

    bar.collapsedSubtitle = '';
    await env.waitForStability();
    expect(titleTexts(bar)).toEqual(['Inbox', 'Inbox / Unread']);
    const subtitles = bar.shadowRoot!.querySelectorAll<HTMLElement>('.subtitle');
    expect(subtitles[0].hidden).toBeTrue();
    expect(subtitles[1].hidden).toBeFalse();

    bar.collapsedHeadline = 'In';
    await env.waitForStability();
    expect(titleTexts(bar)[0]).toBe('In');
  });

  it('takes the title and subtitle from slots', async () => {
    const root = env.render(html`
      <petal-top-app-bar size="medium">
        <span slot="headline">JPY <b>to</b> CNY</span>
        <span slot="subtitle">Today</span>
        <span slot="collapsed-headline">JPY-CNY</span>
      </petal-top-app-bar>
    `);
    const bar = root.querySelector('petal-top-app-bar') as TopAppBar;
    await env.waitForStability();
    expect(titleTexts(bar)).toEqual(['JPY-CNY', 'JPY to CNY / Today']);
    // The expanded heights with a subtitle.
    expect(bar.hasAttribute('has-subtitle')).toBeTrue();
  });

  it('makes the titles headings with heading-level', async () => {
    const {bar} = await setupTest('size=medium');
    const titles = () => [...bar.shadowRoot!.querySelectorAll('.title')];
    expect(titles().every((title) => !title.hasAttribute('role'))).toBeTrue();
    bar.headingLevel = 1;
    await env.waitForStability();
    for (const title of titles()) {
      expect(title.getAttribute('role')).toBe('heading');
      expect(title.getAttribute('aria-level')).toBe('1');
    }
  });

  it('updates within the scroll event and fires collapse-change', async () => {
    const {bar, scroller} = await setupTest('size=medium');
    const handler = jasmine.createSpy('collapse-change');
    bar.addEventListener('collapse-change', handler);
    scroller.scrollTop = 200;
    scroller.dispatchEvent(new Event('scroll'));
    // No frame needed.
    expect(bar.collapsedFraction).toBe(1);
    expect(handler).toHaveBeenCalledTimes(1);
  });
});
