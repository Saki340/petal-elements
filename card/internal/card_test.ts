/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import '../elevated-card.js';
import '../filled-card.js';
import '../outlined-card.js';

import {html} from 'lit';

import {Environment} from '../../testing/environment.js';
import {Card} from './card.js';

describe('cards', () => {
  const env = new Environment();

  async function setupTest(template = html`<petal-filled-card>Content</petal-filled-card>`) {
    const root = env.render(template);
    const card = root.querySelector('[class], petal-filled-card, petal-elevated-card, petal-outlined-card') as Card;
    await env.waitForStability();
    return card;
  }

  const level = (card: Card) =>
    getComputedStyle(card).getPropertyValue('--md-elevation-level').trim();

  it('uses the Compose container colors and elevations', async () => {
    const root = env.render(html`
      <petal-filled-card>A</petal-filled-card>
      <petal-elevated-card>B</petal-elevated-card>
      <petal-outlined-card>C</petal-outlined-card>
    `);
    await env.waitForStability();
    const [filled, elevated, outlined] = root.querySelectorAll<Card>('*');
    const background = (card: Card) =>
      getComputedStyle(card.shadowRoot!.querySelector('.background')!).backgroundColor;

    // surface-container-highest, surface-container-low, surface.
    expect(background(filled)).toBe('rgb(230, 224, 233)');
    expect(background(elevated)).toBe('rgb(247, 242, 250)');
    expect(background(outlined)).toBe('rgb(254, 247, 255)');
    expect([level(filled), level(elevated), level(outlined)]).toEqual(['0', '1', '0']);

    const outline = getComputedStyle(outlined.shadowRoot!.querySelector('.outline')!);
    expect(outline.borderTopWidth).toBe('1px');
    // outline-variant
    expect(outline.borderTopColor).toBe('rgb(202, 196, 208)');
  });

  it('is not interactive by default', async () => {
    const card = await setupTest();
    expect(card.shadowRoot!.querySelector('.action')).toBeNull();
  });

  it('renders a link with href', async () => {
    const card = await setupTest(
      html`<petal-elevated-card href="/news" aria-label="News">Content</petal-elevated-card>`,
    );
    const link = card.shadowRoot!.querySelector('a.action')!;
    expect(link.getAttribute('href')).toBe('/news');
    expect(link.getAttribute('aria-label')).toBe('News');
  });

  it('renders a button when clickable, disabled when disabled', async () => {
    const card = await setupTest(
      html`<petal-filled-card clickable disabled aria-label="Open">Content</petal-filled-card>`,
    );
    const button = card.shadowRoot!.querySelector('button.action') as HTMLButtonElement;
    expect(button.getAttribute('aria-label')).toBe('Open');
    expect(button.disabled).toBeTrue();
  });

  it('shows the dragged elevation', async () => {
    const card = await setupTest(html`<petal-filled-card dragged>Content</petal-filled-card>`);
    expect(level(card)).toBe('3');
  });
});
