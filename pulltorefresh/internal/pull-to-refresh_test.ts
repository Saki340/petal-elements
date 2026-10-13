/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import '../pull-to-refresh.js';

import {html} from 'lit';

import {Environment} from '../../testing/environment.js';
import {PullToRefresh} from './pull-to-refresh.js';

describe('<petal-pull-to-refresh>', () => {
  const env = new Environment();

  async function setupTest(attributes = '') {
    const root = env.render(html`
      <petal-pull-to-refresh style="height: 200px">
        <div style="height: 1000px">Content</div>
      </petal-pull-to-refresh>
    `);
    const element = root.querySelector('petal-pull-to-refresh') as PullToRefresh;
    for (const attribute of attributes.split(' ').filter(Boolean)) {
      element.setAttribute(attribute, '');
    }
    await env.waitForStability();
    return element;
  }

  function indicatorOf(element: PullToRefresh) {
    return element.shadowRoot!.querySelector('.indicator')!;
  }

  function touch(element: Element, type: string, clientY: number) {
    const point = new Touch({identifier: 1, target: element, clientX: 10, clientY});
    const touches = type === 'touchend' || type === 'touchcancel' ? [] : [point];
    const event = new TouchEvent(type, {
      touches,
      changedTouches: [point],
      bubbles: true,
      cancelable: true,
    });
    element.dispatchEvent(event);
    return event;
  }

  /** Touches down at y = 0 and drags to `distance`, then releases. */
  function pull(element: Element, distance: number, release = true) {
    touch(element, 'touchstart', 0);
    touch(element, 'touchmove', distance / 2);
    const move = touch(element, 'touchmove', distance);
    if (release) touch(element, 'touchend', distance);
    return move;
  }

  it('is not refreshing by default and hides the indicator', async () => {
    const element = await setupTest();
    const indicator = indicatorOf(element);
    expect(element.refreshing).toBeFalse();
    expect(indicator.getAttribute('aria-hidden')).toBe('true');
    expect(indicator.hasAttribute('role')).toBeFalse();
  });

  it('exposes a progressbar with a label while refreshing', async () => {
    const element = await setupTest('refreshing');
    const indicator = indicatorOf(element);
    expect(indicator.getAttribute('role')).toBe('progressbar');
    expect(indicator.getAttribute('aria-label')).toBe('Refreshing');
    expect(indicator.hasAttribute('aria-hidden')).toBeFalse();

    element.label = 'Loading posts';
    await env.waitForStability();
    expect(indicator.getAttribute('aria-label')).toBe('Loading posts');
  });

  it('starts a refresh when pulled past the threshold', async () => {
    const element = await setupTest();
    const onRefresh = jasmine.createSpy('refresh');
    element.addEventListener('refresh', onRefresh);

    const move = pull(element, 400);
    await env.waitForStability();

    expect(move.defaultPrevented).toBeTrue();
    expect(onRefresh).toHaveBeenCalledTimes(1);
    expect(element.refreshing).toBeTrue();
    expect(element.hasAttribute('refreshing')).toBeTrue();
  });

  it('does not refresh when released before the threshold', async () => {
    const element = await setupTest();
    const onRefresh = jasmine.createSpy('refresh');
    element.addEventListener('refresh', onRefresh);

    pull(element, 30);
    await env.waitForStability();

    expect(onRefresh).not.toHaveBeenCalled();
    expect(element.refreshing).toBeFalse();
  });

  it('ignores pulls when disabled', async () => {
    const element = await setupTest('disabled');
    const onRefresh = jasmine.createSpy('refresh');
    element.addEventListener('refresh', onRefresh);

    const move = pull(element, 400);
    await env.waitForStability();

    expect(move.defaultPrevented).toBeFalse();
    expect(onRefresh).not.toHaveBeenCalled();
    expect(element.refreshing).toBeFalse();
  });

  it('ignores pulls when not scrolled to the top', async () => {
    const element = await setupTest();
    const onRefresh = jasmine.createSpy('refresh');
    element.addEventListener('refresh', onRefresh);
    element.scrollTop = 50;

    pull(element, 400);
    await env.waitForStability();

    expect(onRefresh).not.toHaveBeenCalled();
  });

  it('ignores pulls while already refreshing', async () => {
    const element = await setupTest('refreshing');
    const onRefresh = jasmine.createSpy('refresh');
    element.addEventListener('refresh', onRefresh);

    pull(element, 400);
    await env.waitForStability();

    expect(onRefresh).not.toHaveBeenCalled();
  });
});
