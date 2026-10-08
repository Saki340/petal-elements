/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

// Tests for the Material 3 Expressive additions: `size`, `shape`, `toggle`.

import '../text-button.js';

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
});
