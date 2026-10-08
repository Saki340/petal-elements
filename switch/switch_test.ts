/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

// import 'jasmine'; (google3-only)

import {html} from 'lit';

import {Environment} from '../testing/environment.js';
import {createFormTests} from '../testing/forms.js';
import {createTokenTests} from '../testing/tokens.js';

import {SwitchHarness} from './harness.js';
import {PetalSwitch} from './switch.js';

describe('<petal-switch>', () => {
  const env = new Environment();

  describe('.styles', () => {
    createTokenTests(PetalSwitch.styles);
  });

  describe('forms', () => {
    createFormTests({
      queryControl: (root) => root.querySelector('petal-switch'),
      valueTests: [
        {
          name: 'unnamed',
          render: () => html`<petal-switch selected></petal-switch>`,
          assertValue(formData) {
            expect(formData)
              .withContext('should not add anything to form without a name')
              .toHaveSize(0);
          },
        },
        {
          name: 'unselected',
          render: () => html`<petal-switch name="switch"></petal-switch>`,
          assertValue(formData) {
            expect(formData)
              .withContext('should not add anything to form when unselected')
              .toHaveSize(0);
          },
        },
        {
          name: 'selected default value',
          render: () => html`<petal-switch name="switch" selected></petal-switch>`,
          assertValue(formData) {
            expect(formData.get('switch')).toBe('on');
          },
        },
        {
          name: 'selected custom value',
          render: () =>
            html`<petal-switch
              name="switch"
              selected
              value="Custom value"></petal-switch>`,
          assertValue(formData) {
            expect(formData.get('switch')).toBe('Custom value');
          },
        },
        {
          name: 'disabled',
          render: () =>
            html`<petal-switch name="switch" selected disabled></petal-switch>`,
          assertValue(formData) {
            expect(formData)
              .withContext('should not add anything to form when disabled')
              .toHaveSize(0);
          },
        },
      ],
      resetTests: [
        {
          name: 'reset to unselected',
          render: () => html`<petal-switch name="switch"></petal-switch>`,
          change(control) {
            control.selected = true;
          },
          assertReset(control) {
            expect(control.selected)
              .withContext('control.selected after reset')
              .toBeFalse();
          },
        },
        {
          name: 'reset to selected',
          render: () => html`<petal-switch name="switch" selected></petal-switch>`,
          change(control) {
            control.selected = false;
          },
          assertReset(control) {
            expect(control.selected)
              .withContext('control.selected after reset')
              .toBeTrue();
          },
        },
      ],
      restoreTests: [
        {
          name: 'restore unselected',
          render: () => html`<petal-switch name="switch"></petal-switch>`,
          assertRestored(control) {
            expect(control.selected)
              .withContext('control.selected after restore')
              .toBeFalse();
          },
        },
        {
          name: 'restore selected',
          render: () => html`<petal-switch name="switch" selected></petal-switch>`,
          assertRestored(control) {
            expect(control.selected)
              .withContext('control.selected after restore')
              .toBeTrue();
          },
        },
      ],
    });
  });

  describe('enter key activation', () => {
    // Don't use harness.clickWithKeyboard() since it simulates a click event.
    // The underlying `<input type="checkbox">` will not dispatch click events
    // in response to the Enter key.

    it('should toggle the switch on', async () => {
      // Arrange
      const root = env.render(html`<petal-switch></petal-switch>`);
      const harness = new SwitchHarness(root.querySelector('petal-switch')!);

      // Act
      await harness.keypress('Enter');
      await harness.element.updateComplete;

      // Assert
      expect(harness.element.selected)
        .withContext('switch is selected after Enter')
        .toBeTrue();
    });

    it('should toggle the switch off', async () => {
      // Arrange
      const root = env.render(html`<petal-switch selected></petal-switch>`);
      const harness = new SwitchHarness(root.querySelector('petal-switch')!);

      // Act
      await harness.keypress('Enter');
      await harness.element.updateComplete;

      // Assert
      expect(harness.element.selected)
        .withContext('switch is unselected after Enter')
        .toBeFalse();
    });

    it('should not toggle the switch when disabled', async () => {
      // Arrange
      const root = env.render(html`<petal-switch disabled></petal-switch>`);
      const harness = new SwitchHarness(root.querySelector('petal-switch')!);

      // Act
      await harness.keypress('Enter');
      await harness.element.updateComplete;

      // Assert
      expect(harness.element.selected)
        .withContext('disabled switch is not selected after Enter')
        .toBeFalse();
    });

    it('should not toggle the switch when keydown event is canceled', async () => {
      // Arrange
      const root = env.render(html`<petal-switch></petal-switch>`);
      const harness = new SwitchHarness(root.querySelector('petal-switch')!);
      harness.element.addEventListener('keydown', (event) => {
        event.preventDefault();
      });

      // Act
      await harness.keypress('Enter');
      await harness.element.updateComplete;

      // Assert
      expect(harness.element.selected)
        .withContext('switch is not selected when Enter is canceled')
        .toBeFalse();
    });
  });
});
