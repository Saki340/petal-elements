/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import './navigation-drawer.js';
import './navigation-drawer-item.js';

import {html} from 'lit';

import {Environment} from '../testing/environment.js';

import {PetalNavigationDrawer} from './navigation-drawer.js';
import {PetalNavigationDrawerItem} from './navigation-drawer-item.js';

describe('<petal-navigation-drawer>', () => {
  const env = new Environment();

  async function setupTest(type = 'modal') {
    const root = env.render(html`
      <div style="display: flex; height: 400px">
        <petal-navigation-drawer type=${type} quick aria-label="Mail">
          <h2>Mail</h2>
          <petal-navigation-drawer-item selected>
            <span slot="icon">i</span>Inbox<span slot="badge">24</span>
          </petal-navigation-drawer-item>
          <petal-navigation-drawer-item href="#sent">Sent</petal-navigation-drawer-item>
          <petal-navigation-drawer-item disabled>Spam</petal-navigation-drawer-item>
        </petal-navigation-drawer>
        <main id="content" style="flex: 1">Content</main>
      </div>
    `);
    const drawer = root.querySelector('petal-navigation-drawer') as PetalNavigationDrawer;
    const items = Array.from(
      root.querySelectorAll('petal-navigation-drawer-item'),
    ) as PetalNavigationDrawerItem[];
    const content = root.querySelector('#content') as HTMLElement;
    await env.waitForStability();
    return {drawer, items, content};
  }

  const sheet = (drawer: PetalNavigationDrawer) =>
    drawer.shadowRoot!.querySelector<HTMLElement>('.sheet')!;

  it('opens a modal drawer in a dialog with the Compose sizes and colors', async () => {
    const {drawer} = await setupTest();
    const dialog = drawer.shadowRoot!.querySelector('dialog')!;
    expect(dialog.open).toBeFalse();
    await drawer.show();
    expect(dialog.open).toBeTrue();
    expect(drawer.open).toBeTrue();
    expect(dialog.getAttribute('aria-label')).toBe('Mail');
    const style = getComputedStyle(sheet(drawer));
    // NavigationDrawerTokens: 360dp wide, modal container color, corner.large
    // on the end side.
    expect(style.width).toBe('360px');
    expect(style.backgroundColor).toBe('rgb(247, 242, 250)');
    expect([style.borderTopLeftRadius, style.borderTopRightRadius, style.borderBottomRightRadius])
      .toEqual(['0px', '16px', '16px']);
    // Open: no offset.
    expect(sheet(drawer).style.transform).toBe('translateX(0px)');
    // Keyboard focus goes to the first item.
    expect(document.activeElement).toBe(drawer.querySelector('petal-navigation-drawer-item'));

    await drawer.close();
    expect(dialog.open).toBeFalse();
    expect(drawer.open).toBeFalse();
  });

  it('closes on Escape and when the scrim is clicked', async () => {
    const {drawer} = await setupTest();
    const dialog = drawer.shadowRoot!.querySelector('dialog')!;
    const closed = jasmine.createSpy('closed');
    drawer.addEventListener('closed', closed);

    await drawer.show();
    dialog.dispatchEvent(new Event('cancel', {cancelable: true}));
    await env.waitForStability();
    await drawer.updateComplete;
    expect(drawer.open).toBeFalse();

    await drawer.show();
    dialog.click();
    await env.waitForStability();
    expect(drawer.open).toBeFalse();
    expect(closed).toHaveBeenCalledTimes(2);
  });

  it('can cancel opening and closing', async () => {
    const {drawer} = await setupTest();
    drawer.addEventListener('open', (event) => event.preventDefault(), {once: true});
    await drawer.show();
    expect(drawer.open).toBeFalse();
    await drawer.show();
    drawer.addEventListener('close', (event) => event.preventDefault(), {once: true});
    await drawer.close();
    expect(drawer.open).toBeTrue();
    await drawer.close();
  });

  it('pushes the content aside as a dismissible drawer', async () => {
    const {drawer, content} = await setupTest('dismissible');
    // Closed: moved out past the start edge and hidden.
    expect(content.getBoundingClientRect().left - drawer.parentElement!.getBoundingClientRect().left)
      .toBe(0);
    expect(getComputedStyle(sheet(drawer)).visibility).toBe('hidden');
    await drawer.show();
    expect(content.getBoundingClientRect().left - drawer.parentElement!.getBoundingClientRect().left)
      .toBe(360);
    // NavigationDrawerTokens.StandardContainerColor, a rectangle.
    const style = getComputedStyle(sheet(drawer));
    expect(style.backgroundColor).toBe('rgb(254, 247, 255)');
    expect(style.borderTopRightRadius).toBe('0px');
    expect(style.visibility).toBe('visible');
    await drawer.close();
    expect(getComputedStyle(sheet(drawer)).visibility).toBe('hidden');
  });

  it('shows at once without taking the focus when open from the start', async () => {
    const root = env.render(html`
      <div style="display: flex">
        <petal-navigation-drawer type="dismissible" open>
          <petal-navigation-drawer-item>Inbox</petal-navigation-drawer-item>
        </petal-navigation-drawer>
        <main style="flex: 1">Content</main>
      </div>
    `);
    await env.waitForStability();
    const drawer = root.querySelector('petal-navigation-drawer') as PetalNavigationDrawer;
    await drawer.updateComplete;
    expect(drawer.open).toBeTrue();
    expect(drawer.hasAttribute('moving')).toBeFalse();
    expect(document.activeElement).not.toBe(drawer.querySelector('petal-navigation-drawer-item'));
    const row = drawer.parentElement!.getBoundingClientRect().left;
    expect(root.querySelector('main')!.getBoundingClientRect().left - row).toBe(360);
  });

  it('is always shown as a standard drawer', async () => {
    const {drawer, content} = await setupTest('standard');
    expect(content.getBoundingClientRect().left - drawer.parentElement!.getBoundingClientRect().left)
      .toBe(360);
    expect(sheet(drawer).getAttribute('aria-label')).toBe('Mail');
  });

  it('selects an item on click and fires change', async () => {
    const {drawer, items} = await setupTest('standard');
    const change = jasmine.createSpy('change');
    drawer.addEventListener('change', change);
    items[1].click();
    await env.waitForStability();
    expect(items.map((item) => item.selected)).toEqual([false, true, false]);
    expect(change).toHaveBeenCalledTimes(1);
    // Selecting from outside deselects the others.
    items[0].selected = true;
    await env.waitForStability();
    expect(items.map((item) => item.selected)).toEqual([true, false, false]);
  });

  it('gives items the Compose sizes and the current page', async () => {
    const {items} = await setupTest('standard');
    const item = items[0].shadowRoot!.querySelector<HTMLElement>('.item')!;
    const style = getComputedStyle(item);
    // NavigationDrawerTokens.ActiveIndicatorHeight; 16dp and 24dp paddings.
    expect(item.getBoundingClientRect().height).toBe(56);
    expect([style.paddingLeft, style.paddingRight]).toEqual(['16px', '24px']);
    // Inset by NavigationDrawerItemDefaults.ItemPadding.
    expect(getComputedStyle(items[0]).marginLeft).toBe('12px');
    // The selected indicator: secondary-container.
    const indicator = items[0].shadowRoot!.querySelector('.indicator')!;
    expect(getComputedStyle(indicator).backgroundColor).toBe('rgb(232, 222, 248)');
    // A link or a button, the selected one is the current page.
    const internals = (el: PetalNavigationDrawerItem) =>
      (el as unknown as {internals: ElementInternals}).internals;
    expect(internals(items[0]).role).toBe('button');
    expect(internals(items[0]).ariaCurrent).toBe('page');
    expect(internals(items[1]).role).toBe('link');
    expect(internals(items[1]).ariaCurrent).toBeNull();
  });
});
