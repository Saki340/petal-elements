/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

// Compose FAB sizes, extended FAB sizes and the expanded animation.

import '../fab.js';

import {html} from 'lit';

import {Environment} from '../../testing/environment.js';
import {PetalFab} from '../fab.js';

describe('FAB (Compose)', () => {
  const env = new Environment();

  async function render(template: unknown) {
    const root = env.render(template as never);
    await env.waitForStability();
    return [...root.children] as PetalFab[];
  }

  const button = (fab: PetalFab) => fab.shadowRoot!.querySelector<HTMLElement>('.fab')!;
  const box = (el: Element) => {
    const rect = el.getBoundingClientRect();
    return [Math.round(rect.width), Math.round(rect.height)];
  };
  const icon = `<span slot="icon" style="display:block">x</span>`;
  const iconSize = (fab: PetalFab) =>
    box(fab.querySelector('[slot=icon]')!)[0];
  const radius = (fab: PetalFab) => getComputedStyle(button(fab)).borderTopLeftRadius;

  it('has the Compose sizes, shapes and icon sizes', async () => {
    const fabs = await render(html`
      <petal-fab size="small"><span slot="icon">x</span></petal-fab>
      <petal-fab><span slot="icon">x</span></petal-fab>
      <petal-fab size="medium"><span slot="icon">x</span></petal-fab>
      <petal-fab size="large"><span slot="icon">x</span></petal-fab>
    `);
    expect(fabs.map((fab) => box(button(fab)))).toEqual([
      [40, 40],
      [56, 56],
      [80, 80],
      [96, 96],
    ]);
    expect(fabs.map(radius)).toEqual(['12px', '16px', '20px', '28px']);
    expect(fabs.map(iconSize)).toEqual([24, 24, 28, 36]);
  });

  it('is primary container by default', async () => {
    const [fab] = await render(html`<petal-fab></petal-fab>`);
    expect(fab.variant).toBe('primary');
    expect(fab.size).toBe('baseline');
    // primary-container.
    expect(getComputedStyle(button(fab)).backgroundColor).toBe('rgb(234, 221, 255)');
  });

  it('has the Compose extended sizes', async () => {
    const fabs = await render(html`
      <petal-fab label="Compose" size="small"></petal-fab>
      <petal-fab label="Compose" size="medium"></petal-fab>
      <petal-fab label="Compose" size="large"></petal-fab>
      <petal-fab label="Go"></petal-fab>
    `);
    for (const fab of fabs) {
      fab.insertAdjacentHTML('afterbegin', icon);
    }
    await env.waitForStability();
    const [small, medium, large, baseline] = fabs;
    expect(box(button(small))[1]).toBe(56);
    expect(box(button(medium))[1]).toBe(80);
    expect(box(button(large))[1]).toBe(96);
    expect([small, medium, large].map(radius)).toEqual(['16px', '20px', '28px']);
    expect([small, medium, large].map(iconSize)).toEqual([24, 28, 32]);
    const padding = (fab: PetalFab) => {
      const style = getComputedStyle(button(fab));
      return [style.paddingInlineStart, style.paddingInlineEnd];
    };
    expect([small, medium, large].map(padding)).toEqual([
      ['16px', '16px'],
      ['26px', '26px'],
      ['28px', '28px'],
    ]);
    const gap = (fab: PetalFab) =>
      getComputedStyle(fab.querySelector('[slot=icon]')!).marginInlineEnd;
    expect([small, medium, large, baseline].map(gap)).toEqual(['8px', '12px', '16px', '12px']);
    const type = (fab: PetalFab) => {
      const style = getComputedStyle(fab.shadowRoot!.querySelector('.label')!);
      return [style.fontSize, style.lineHeight];
    };
    // Title medium, title large, headline small, label large.
    expect([small, medium, large, baseline].map(type)).toEqual([
      ['16px', '24px'],
      ['22px', '28px'],
      ['24px', '32px'],
      ['14px', '20px'],
    ]);
    // ExtendedFabMinimumWidth.
    expect(getComputedStyle(button(baseline)).minWidth).toBe('80px');
  });

  it('collapses to its height when not expanded', async () => {
    const [fab] = await render(html`
      <petal-fab label="Compose" size="medium" .expanded=${false}>
        <span slot="icon">x</span>
      </petal-fab>
    `);
    expect(box(button(fab))).toEqual([80, 80]);
    // The label still names the button.
    expect(fab.shadowRoot!.querySelector('.label')!.textContent).toBe('Compose');
    fab.expanded = true;
    await env.waitForStability();
    // Expanding starts from the collapsed width.
    expect(box(button(fab))[0]).toBeLessThan(90);
  });

  it('changes at once with reduced motion', async () => {
    spyOn(window, 'matchMedia').and.returnValue({matches: true} as MediaQueryList);
    const [fab] = await render(html`
      <petal-fab label="Compose"><span slot="icon">x</span></petal-fab>
    `);
    const full = box(button(fab))[0];
    fab.expanded = false;
    await env.waitForStability();
    expect(box(button(fab))).toEqual([56, 56]);
    fab.expanded = true;
    await env.waitForStability();
    expect(box(button(fab))[0]).toBe(full);
    expect(button(fab).style.width).toBe('');
  });
});
