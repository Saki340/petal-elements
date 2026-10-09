/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import '../snackbar.js';

import {html} from 'lit';

import {Environment} from '../../testing/environment.js';
import {Snackbar} from './snackbar.js';

describe('<petal-snackbar>', () => {
  const env = new Environment();

  async function setupTest(attributes = '') {
    const root = env.render(html`<petal-snackbar>Message sent</petal-snackbar>`);
    const snackbar = root.querySelector('petal-snackbar') as Snackbar;
    for (const attribute of attributes.split(' ').filter(Boolean)) {
      const [name, value = ''] = attribute.split('=');
      snackbar.setAttribute(name, value);
    }
    await env.waitForStability();
    return snackbar;
  }

  /** Spies on setTimeout; returns the delays the snackbar asked for. */
  function captureTimers() {
    const timers: Array<{ms: number; run: () => void}> = [];
    spyOn(window, 'setTimeout').and.callFake(((run: () => void, ms: number) => {
      timers.push({ms, run});
      return timers.length;
    }) as unknown as typeof setTimeout);
    return timers;
  }

  it('is a polite status region', async () => {
    const snackbar = await setupTest();
    expect(snackbar.getAttribute('role')).toBe('status');
    expect(snackbar.getAttribute('aria-live')).toBe('polite');
  });

  it('is hidden until shown', async () => {
    const snackbar = await setupTest();
    const container = snackbar.shadowRoot!.querySelector('.snackbar')!;
    expect(getComputedStyle(container).display).toBe('none');

    snackbar.show();
    await env.waitForStability();

    expect(snackbar.open).toBeTrue();
    expect(getComputedStyle(container).display).not.toBe('none');
  });

  it('closes after 4 s by default (SnackbarDuration.Short)', async () => {
    const snackbar = await setupTest();
    const timers = captureTimers();
    const result = snackbar.show();
    await snackbar.updateComplete;

    const timer = timers[timers.length - 1];
    expect(timer.ms).toBe(4000);
    timer.run();
    expect(snackbar.open).toBeFalse();
    expect(await result).toBe('timeout');
  });

  it('closes after 10 s with duration="long"', async () => {
    const snackbar = await setupTest('duration=long');
    const timers = captureTimers();
    snackbar.show();
    await snackbar.updateComplete;

    expect(timers[timers.length - 1].ms).toBe(10000);
  });

  it('stays open with an action, unless a duration is set', async () => {
    const snackbar = await setupTest('action=Undo');
    const timers = captureTimers();
    snackbar.show();
    await snackbar.updateComplete;

    expect(timers.filter((timer) => timer.ms >= 4000)).toEqual([]);
  });

  it('closes with "action" when the action is clicked', async () => {
    const snackbar = await setupTest('action=Undo');
    const actionSpy = jasmine.createSpy('action');
    const closeSpy = jasmine.createSpy('close');
    snackbar.addEventListener('action', actionSpy);
    snackbar.addEventListener('close', closeSpy);
    const result = snackbar.show();
    await env.waitForStability();

    const button = snackbar.shadowRoot!.querySelector<HTMLElement>('.action')!;
    expect(button.textContent!.trim()).toBe('Undo');
    button.click();
    await env.waitForStability();

    expect(actionSpy).toHaveBeenCalledTimes(1);
    expect(closeSpy.calls.mostRecent().args[0].detail.reason).toBe('action');
    expect(await result).toBe('action');
  });

  it('stays open when the action event is canceled', async () => {
    const snackbar = await setupTest('action=Retry');
    snackbar.addEventListener('action', (event) => {
      event.preventDefault();
    });
    snackbar.show();
    await env.waitForStability();

    snackbar.shadowRoot!.querySelector<HTMLElement>('.action')!.click();
    await env.waitForStability();

    expect(snackbar.open).toBeTrue();
  });

  it('closes with "dismiss" from the close button', async () => {
    const snackbar = await setupTest('dismissible');
    const result = snackbar.show();
    await env.waitForStability();

    const dismiss = snackbar.shadowRoot!.querySelector<HTMLElement>('.dismiss')!;
    expect(dismiss.getAttribute('aria-label')).toBe('Dismiss');
    dismiss.click();
    await env.waitForStability();

    expect(await result).toBe('dismiss');
  });

  it('fires close when the open attribute is removed', async () => {
    const snackbar = await setupTest('open');
    const closeSpy = jasmine.createSpy('close');
    snackbar.addEventListener('close', closeSpy);

    snackbar.removeAttribute('open');
    await env.waitForStability();

    expect(closeSpy).toHaveBeenCalledTimes(1);
    expect(closeSpy.calls.mostRecent().args[0].detail.reason).toBe('close');
  });

  it('returns the same promise when shown again while open', async () => {
    const snackbar = await setupTest();
    const first = snackbar.show();
    const second = snackbar.show();
    expect(second).toBe(first);
    snackbar.close();
    expect(await first).toBe('close');
  });
});
