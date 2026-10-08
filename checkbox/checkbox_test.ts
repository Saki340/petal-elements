/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

// import 'jasmine'; (google3-only)

import {html} from 'lit';

import {createFormTests} from '../testing/forms.js';
import {createTokenTests} from '../testing/tokens.js';

import {PetalCheckbox} from './checkbox.js';

describe('<petal-checkbox>', () => {
  describe('.styles', () => {
    createTokenTests(PetalCheckbox.styles);
  });

  describe('forms', () => {
    createFormTests({
      queryControl: (root) => root.querySelector('petal-checkbox'),
      valueTests: [
        {
          name: 'unnamed',
          render: () => html`<petal-checkbox checked></petal-checkbox>`,
          assertValue(formData) {
            expect(formData)
              .withContext('should not add anything to form without a name')
              .toHaveSize(0);
          },
        },
        {
          name: 'unchecked',
          render: () => html`<petal-checkbox name="checkbox"></petal-checkbox>`,
          assertValue(formData) {
            expect(formData)
              .withContext('should not add anything to form when unchecked')
              .toHaveSize(0);
          },
        },
        {
          name: 'checked default value',
          render: () =>
            html`<petal-checkbox name="checkbox" checked></petal-checkbox>`,
          assertValue(formData) {
            expect(formData.get('checkbox')).toBe('on');
          },
        },
        {
          name: 'checked custom value',
          render: () =>
            html`<petal-checkbox
              name="checkbox"
              checked
              value="Custom value"></petal-checkbox>`,
          assertValue(formData) {
            expect(formData.get('checkbox')).toBe('Custom value');
          },
        },
        {
          name: 'indeterminate',
          render: () =>
            html`<petal-checkbox
              name="checkbox"
              checked
              indeterminate></petal-checkbox>`,
          assertValue(formData) {
            expect(formData)
              .withContext('should not add anything to form when indeterminate')
              .toHaveSize(0);
          },
        },
        {
          name: 'disabled',
          render: () =>
            html`<petal-checkbox name="checkbox" checked disabled></petal-checkbox>`,
          assertValue(formData) {
            expect(formData)
              .withContext('should not add anything to form when disabled')
              .toHaveSize(0);
          },
        },
      ],
      resetTests: [
        {
          name: 'reset to unchecked',
          render: () => html`<petal-checkbox name="checkbox"></petal-checkbox>`,
          change(checkbox) {
            checkbox.checked = true;
          },
          assertReset(checkbox) {
            expect(checkbox.checked)
              .withContext('checkbox.checked after reset')
              .toBeFalse();
          },
        },
        {
          name: 'reset to checked',
          render: () =>
            html`<petal-checkbox name="checkbox" checked></petal-checkbox>`,
          change(checkbox) {
            checkbox.checked = false;
          },
          assertReset(checkbox) {
            expect(checkbox.checked)
              .withContext('checkbox.checked after reset')
              .toBeTrue();
          },
        },
        {
          name: 'reset to indeterminate',
          render: () =>
            html`<petal-checkbox name="checkbox" indeterminate></petal-checkbox>`,
          change(checkbox) {
            checkbox.indeterminate = false;
          },
          assertReset(checkbox) {
            expect(checkbox.indeterminate)
              .withContext('checkbox.indeterminate should not be reset')
              .toBeFalse();
          },
        },
      ],
      restoreTests: [
        {
          name: 'restore unchecked',
          render: () => html`<petal-checkbox name="checkbox"></petal-checkbox>`,
          assertRestored(checkbox) {
            expect(checkbox.checked)
              .withContext('checkbox.checked after restore')
              .toBeFalse();
          },
        },
        {
          name: 'restore checked',
          render: () =>
            html`<petal-checkbox name="checkbox" checked></petal-checkbox>`,
          assertRestored(checkbox) {
            expect(checkbox.checked)
              .withContext('checkbox.checked after restore')
              .toBeTrue();
          },
        },
        {
          name: 'restore indeterminate',
          render: () =>
            html`<petal-checkbox name="checkbox" indeterminate></petal-checkbox>`,
          assertRestored(checkbox) {
            expect(checkbox.indeterminate)
              .withContext('checkbox.indeterminate should not be restored')
              .toBeFalse();
          },
        },
      ],
    });
  });
});
