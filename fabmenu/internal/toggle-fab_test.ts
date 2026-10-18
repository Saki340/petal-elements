/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import '../toggle-fab.js';

import {html} from 'lit';

import {Environment} from '../../testing/environment.js';
import {PetalToggleFab} from '../toggle-fab.js';

describe('<petal-toggle-fab>', () => {
  const env = new Environment();

  async function setupTest(attributes = '') {
    const root = env.render(html`<petal-toggle-fab aria-label="Add"></petal-toggle-fab>`);
    const fab = root.querySelector('petal-toggle-fab') as PetalToggleFab;
    for (const attribute of attributes.split(' ').filter(Boolean)) {
      const [name, value = ''] = attribute.split('=');
      fab.setAttribute(name, value);
    }
    await env.waitForStability();
    const button = fab.shadowRoot!.querySelector('button')!;
    return {fab, button};
  }

  /** Sets the checked progress, as a frame of the spring would. */
  async function setProgress(fab: PetalToggleFab, progress: number) {
    (fab as any).progress = progress;
    await fab.updateComplete;
  }

  it('is a 56px FAB with a 16px corner radius, unchecked', async () => {
    const {fab, button} = await setupTest();
    const rect = button.getBoundingClientRect();
    expect(rect.width).toBe(56);
    expect(rect.height).toBe(56);
    expect(getComputedStyle(button).borderTopLeftRadius).toBe('16px');
    expect(fab.getBoundingClientRect().width).toBe(56);
  });

  it('is 80px and 96px with the medium and large sizes', async () => {
    const medium = await setupTest('size=medium');
    expect(medium.button.getBoundingClientRect().width).toBe(80);
    expect(getComputedStyle(medium.button).borderTopLeftRadius).toBe('20px');
    const large = await setupTest('size=large');
    expect(large.button.getBoundingClientRect().width).toBe(96);
    expect(getComputedStyle(large.button).borderTopLeftRadius).toBe('28px');
  });

  it('is 56px and round when checked, and keeps the room of its size', async () => {
    const {fab, button} = await setupTest('size=large checked');
    expect(button.getBoundingClientRect().width).toBe(56);
    expect(getComputedStyle(button).borderTopLeftRadius).toBe('28px');
    expect(fab.getBoundingClientRect().width).toBe(96);
    // At the top and end of its room.
    const room = fab.getBoundingClientRect();
    const rect = button.getBoundingClientRect();
    expect(rect.top).toBe(room.top);
    expect(rect.right).toBe(room.right);
  });

  it('lerps the size and radius with the checked progress', async () => {
    const {fab, button} = await setupTest('size=large');
    await setProgress(fab, 0.5);
    // 96 to 56, and 28 to 28; the icon 36 to 20.
    expect(button.getBoundingClientRect().width).toBe(76);
    await setProgress(fab, 1);
    expect(button.getBoundingClientRect().width).toBe(56);
    const icon = fab.shadowRoot!.querySelector('.icon')!.getBoundingClientRect();
    expect(icon.width).toBe(20);
  });

  it('lerps the radius of a baseline FAB from 16px to 28px', async () => {
    const {fab, button} = await setupTest();
    await setProgress(fab, 0.5);
    expect(getComputedStyle(button).borderTopLeftRadius).toBe('22px');
  });

  it('switches the icon at 50% progress', async () => {
    const {fab} = await setupTest();
    const icon = fab.shadowRoot!.querySelector('.icon')!;
    const display = (name: string) =>
      getComputedStyle(icon.querySelector(`slot[name=${name}]`)!).display;
    await setProgress(fab, 0.5);
    expect(display('icon')).not.toBe('none');
    expect(display('checked-icon')).toBe('none');
    await setProgress(fab, 0.51);
    expect(display('icon')).toBe('none');
    expect(display('checked-icon')).not.toBe('none');
  });

  it('blends the container from primary container to primary', async () => {
    const {fab, button} = await setupTest();
    fab.style.setProperty('--md-toggle-fab-container-color', 'rgb(0, 0, 0)');
    fab.style.setProperty('--md-toggle-fab-checked-container-color', 'rgb(255, 255, 255)');
    await setProgress(fab, 0);
    expect(getComputedStyle(button).backgroundColor).toBe('oklab(0 0 0)');
    await setProgress(fab, 1);
    const checked = getComputedStyle(button).backgroundColor;
    expect(checked).toMatch(/^oklab\(0\.9999/);
    // Clamped past 1.
    await setProgress(fab, 1.4);
    expect(getComputedStyle(button).backgroundColor).toBe(checked);
  });

  it('toggles and fires change when clicked', async () => {
    const {fab, button} = await setupTest();
    let changes = 0;
    fab.addEventListener('change', () => changes++);
    button.click();
    await fab.updateComplete;
    expect(fab.checked).toBeTrue();
    expect(changes).toBe(1);
    expect(button.getAttribute('aria-pressed')).toBe('true');
    // Moves toward 1 on the spring.
    (fab as any).advance(16);
    expect((fab as any).progress).toBeGreaterThan(0);
    for (let i = 0; i < 100; i++) (fab as any).advance(16);
    expect((fab as any).progress).toBe(1);
  });

  it('reports aria-expanded instead of aria-pressed for a popup', async () => {
    const {fab, button} = await setupTest('popup');
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(button.hasAttribute('aria-pressed')).toBeFalse();
    fab.checked = true;
    await fab.updateComplete;
    expect(button.getAttribute('aria-expanded')).toBe('true');
  });

  it('starts at its state without animating', async () => {
    const {fab} = await setupTest('checked');
    expect((fab as any).progress).toBe(1);
  });
});
