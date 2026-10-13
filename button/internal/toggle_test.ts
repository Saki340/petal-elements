/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

// Tests for the Material 3 Expressive additions: `size`, `shape`, `toggle`.

import '../filled-button.js';
import '../text-button.js';
import '../../icon/icon.js';

import {html} from 'lit';
import {customElement} from 'lit/decorators.js';

import {Environment} from '../../testing/environment.js';
import {ButtonHarness} from '../harness.js';
import {Button} from './button.js';

@customElement('test-toggle-button')
class TestToggleButton extends Button {}

describe('Button (Expressive)', () => {
  const env = new Environment();

  async function setupTest(template = html`<test-toggle-button toggle></test-toggle-button>`) {
    const root = env.render(template);
    await env.waitForStability();
    const button = root.querySelector<TestToggleButton>(
      'test-toggle-button, petal-text-button',
    )!;
    return {button, harness: new ButtonHarness(button)};
  }

  function innerButton(button: Button) {
    return button.renderRoot.querySelector('button')!;
  }

  describe('toggle', () => {
    it('toggles selected on click and updates aria-pressed', async () => {
      const {button, harness} = await setupTest();
      expect(innerButton(button).getAttribute('aria-pressed')).toBe('false');

      await harness.clickWithMouse();
      await env.waitForStability();

      expect(button.selected).toBeTrue();
      expect(button.hasAttribute('selected')).toBeTrue();
      expect(innerButton(button).getAttribute('aria-pressed')).toBe('true');

      await harness.clickWithMouse();
      await env.waitForStability();

      expect(button.selected).toBeFalse();
      expect(innerButton(button).getAttribute('aria-pressed')).toBe('false');
    });

    it('dispatches input and change once per click', async () => {
      const {button, harness} = await setupTest();
      const input = jasmine.createSpy('input');
      const change = jasmine.createSpy('change');
      button.addEventListener('input', input);
      button.addEventListener('change', change);

      await harness.clickWithMouse();

      expect(input).toHaveBeenCalledTimes(1);
      expect(change).toHaveBeenCalledTimes(1);
    });

    it('toggles once when clicked programmatically', async () => {
      const {button} = await setupTest();
      const change = jasmine.createSpy('change');
      button.addEventListener('change', change);

      button.click();
      await env.waitForStability();

      expect(button.selected).toBeTrue();
      expect(change).toHaveBeenCalledTimes(1);
    });

    it('does not toggle when the click is canceled', async () => {
      const {button, harness} = await setupTest();
      button.addEventListener('click', (event) => {
        event.preventDefault();
      });

      await harness.clickWithMouse();

      expect(button.selected).toBeFalse();
    });

    it('does not toggle when disabled or soft-disabled', async () => {
      const {button, harness} = await setupTest();
      button.disabled = true;
      await env.waitForStability();
      await harness.clickWithMouse();
      expect(button.selected).withContext('disabled').toBeFalse();

      button.disabled = false;
      button.softDisabled = true;
      await env.waitForStability();
      await harness.clickWithMouse();
      expect(button.selected).withContext('soft-disabled').toBeFalse();
    });

    it('has no aria-pressed without toggle', async () => {
      const {button, harness} = await setupTest(
        html`<test-toggle-button></test-toggle-button>`,
      );

      await harness.clickWithMouse();
      await env.waitForStability();

      expect(innerButton(button).hasAttribute('aria-pressed')).toBeFalse();
      expect(button.selected).toBeFalse();
    });

    it('is ignored by text buttons', async () => {
      const {button, harness} = await setupTest(
        html`<petal-text-button toggle>Label</petal-text-button>`,
      );

      await harness.clickWithMouse();
      await env.waitForStability();

      expect(innerButton(button).hasAttribute('aria-pressed')).toBeFalse();
      expect(button.selected).toBeFalse();
    });
  });

  describe('size and shape', () => {
    it('reflect no attributes by default', async () => {
      const {button} = await setupTest(
        html`<test-toggle-button></test-toggle-button>`,
      );

      expect(button.hasAttribute('size')).toBeFalse();
      expect(button.hasAttribute('shape')).toBeFalse();
    });

    it('reflect the set values', async () => {
      const {button} = await setupTest(
        html`<test-toggle-button></test-toggle-button>`,
      );

      button.size = 'large';
      button.shape = 'square';
      await env.waitForStability();

      expect(button.getAttribute('size')).toBe('large');
      expect(button.getAttribute('shape')).toBe('square');
    });
  });

  describe('tokens', () => {
    it('takes toggle container colors from public tokens', async () => {
      const root = env.render(html`
        <petal-filled-button
          toggle
          style="--md-filled-button-unselected-container-color: rgb(1, 2, 3);
            --md-filled-button-selected-container-color: rgb(4, 5, 6)"
          >Day</petal-filled-button
        >
      `);
      const button = root.querySelector('petal-filled-button')!;
      await env.waitForStability();
      const background = () =>
        getComputedStyle(button.renderRoot.querySelector('.background')!).backgroundColor;
      expect(background()).toBe('rgb(1, 2, 3)');
      button.selected = true;
      await env.waitForStability();
      expect(background()).toBe('rgb(4, 5, 6)');
    });

    it('takes the padding of a size from public tokens', async () => {
      const root = env.render(html`
        <petal-filled-button size="small" style="--md-button-small-leading-space: 6px"
          >Day</petal-filled-button
        >
      `);
      const button = root.querySelector('petal-filled-button')!;
      await env.waitForStability();
      expect(getComputedStyle(button).paddingInlineStart).toBe('6px');
      // Compose's small content padding.
      expect(getComputedStyle(button).paddingInlineEnd).toBe('16px');
    });
  });

  describe('icon only', () => {
    it('centers the icon without a label', async () => {
      const root = env.render(html`
        <petal-filled-button size="small">
          <petal-icon slot="icon">sync</petal-icon>
        </petal-filled-button>
        <petal-filled-button size="small">
          <petal-icon slot="icon">sync</petal-icon>Sync
        </petal-filled-button>
      `);
      const [iconOnly, labeled] = root.querySelectorAll('petal-filled-button');
      await env.waitForStability();
      const label = (button: Element) => button.shadowRoot!.querySelector('.label')!;
      expect(getComputedStyle(label(iconOnly)).display).toBe('none');
      expect(getComputedStyle(label(labeled)).display).not.toBe('none');
      // 16px padding, 20px icon, 16px padding (ButtonDefaults small).
      expect(iconOnly.getBoundingClientRect().width).toBe(52);
    });
  });
});
