/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

// import 'jasmine'; (google3-only)

import {html, render} from 'lit';

import {createFormTests} from '../testing/forms.js';
import {createTokenTests} from '../testing/tokens.js';

import {PetalFilledSelect} from './filled-select.js';
import {SelectHarness} from './harness.js';
import {PetalOutlinedSelect} from './outlined-select.js';
import {PetalSelectOption} from './select-option.js';

describe('<petal-outlined-select>', () => {
  describe('.styles', () => {
    createTokenTests(PetalOutlinedSelect.styles);
  });

  let root: HTMLDivElement;

  beforeEach(() => {
    root = document.createElement('div');
    document.body.appendChild(root);
  });

  afterEach(() => {
    root?.remove();
  });

  it('clicking on option triggers change', async () => {
    let changed = false;
    render(
      html` <petal-outlined-select
        @change=${() => {
          changed = true;
        }}>
        <petal-select-option selected></petal-select-option>
        <petal-select-option></petal-select-option>
      </petal-outlined-select>`,
      root,
    );
    const selectEl = root.querySelector('petal-outlined-select')!;
    await selectEl.updateComplete;

    await new SelectHarness(selectEl).clickOption(1);

    expect(changed).toBeTrue();
  });

  it('typeahead selects an option', async () => {
    let changed = false;
    render(
      html` <petal-outlined-select
        @change=${() => {
          changed = true;
        }}>
        <petal-select-option
          value="apple"
          typeahead-text="apple"></petal-select-option>
        <petal-select-option
          value="banana"
          typeahead-text="banana"></petal-select-option>
      </petal-outlined-select>`,
      root,
    );
    const selectEl = root.querySelector('petal-outlined-select')!;
    await selectEl.updateComplete;

    const harness = new SelectHarness(selectEl);
    await harness.focusWithKeyboard();
    await harness.keypress('b');
    await selectEl.updateComplete;

    expect(selectEl.value).withContext('value after typeahead').toBe('banana');
    expect(changed).withContext('option changed').toBeTrue();
  });

  it('typeahead with no matching option does not change selected option', async () => {
    let changed = false;
    render(
      html` <petal-outlined-select
        @change=${() => {
          changed = true;
        }}>
        <petal-select-option
          value="apple"
          typeahead-text="apple"
          selected></petal-select-option>
        <petal-select-option
          value="banana"
          typeahead-text="banana"></petal-select-option>
      </petal-outlined-select>`,
      root,
    );
    const selectEl = root.querySelector('petal-outlined-select')!;
    await selectEl.updateComplete;

    const harness = new SelectHarness(selectEl);
    await harness.focusWithKeyboard();
    await harness.keypress('z');
    await selectEl.updateComplete;

    expect(selectEl.value)
      .withContext('value after non-matching typeahead keypress')
      .toBe('apple');
    expect(changed).withContext('did not change').toBeFalse();
  });

  it('clicking an option with mouse and then typeahead with no matching option does not change the selected option', async () => {
    render(
      html` <petal-outlined-select>
        <petal-select-option
          value="apple"
          typeahead-text="apple"
          selected></petal-select-option>
        <petal-select-option
          value="banana"
          typeahead-text="banana"></petal-select-option>
      </petal-outlined-select>`,
      root,
    );
    const selectEl = root.querySelector('petal-outlined-select')!;
    await selectEl.updateComplete;

    // Open menu to click an option
    const harness = new SelectHarness(selectEl);
    await harness.clickWithMouse();
    await selectEl.updateComplete; // wait for menu to open

    await harness.clickOption(1);
    expect(selectEl.value)
      .withContext('value after clicking option')
      .toBe('banana');

    await harness.keypress('z');
    await selectEl.updateComplete;

    expect(selectEl.value)
      .withContext(
        'value after non-matching typeahead keypress stays the same (banana)',
      )
      .toBe('banana');
  });

  describe('forms', () => {
    createFormTests({
      queryControl: (root) => root.querySelector('petal-outlined-select'),
      valueTests: [
        {
          name: 'unnamed',
          render: () => html`
            <petal-outlined-select>
              <petal-select-option value="one"></petal-select-option>
              <petal-select-option value="two" selected></petal-select-option>
            </petal-outlined-select>
          `,
          assertValue(formData) {
            expect(formData)
              .withContext('should not add anything to form without a name')
              .toHaveSize(0);
          },
        },
        {
          name: 'unselected',
          render: () => html`
            <petal-outlined-select name="select">
              <petal-select-option value="one"></petal-select-option>
              <petal-select-option value="two"></petal-select-option>
            </petal-outlined-select>
          `,
          assertValue(formData) {
            expect(formData.get('select')).toBe('');
          },
        },
        {
          name: 'selected',
          render: () => html`
            <petal-outlined-select name="select">
              <petal-select-option value="one"></petal-select-option>
              <petal-select-option value="two" selected></petal-select-option>
            </petal-outlined-select>
          `,
          assertValue(formData) {
            expect(formData.get('select')).toBe('two');
          },
        },
        {
          name: 'disabled',
          render: () => html`
            <petal-outlined-select name="select" disabled>
              <petal-select-option value="one"></petal-select-option>
              <petal-select-option value="two" selected></petal-select-option>
            </petal-outlined-select>
          `,
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
          render: () => html`
            <petal-outlined-select name="select">
              <petal-select-option value="one"></petal-select-option>
              <petal-select-option value="two"></petal-select-option>
            </petal-outlined-select>
          `,
          change(select) {
            select.value = 'one';
          },
          assertReset(select) {
            expect(select.value)
              .withContext('select.value after reset')
              .toBe('');
          },
        },
        {
          name: 'reset to selected',
          render: () => html`
            <petal-outlined-select name="select">
              <petal-select-option value="one"></petal-select-option>
              <petal-select-option value="two" selected></petal-select-option>
            </petal-outlined-select>
          `,
          change(select) {
            select.value = 'one';
          },
          assertReset(select) {
            expect(select.value)
              .withContext('select.value after reset')
              .toBe('two');
          },
        },
      ],
      restoreTests: [
        {
          name: 'restore unselected',
          render: () => html`
            <petal-outlined-select name="select">
              <petal-select-option value="one"></petal-select-option>
              <petal-select-option value="two"></petal-select-option>
            </petal-outlined-select>
          `,
          assertRestored(select) {
            expect(select.value)
              .withContext('select.value after restore')
              .toBe('');
          },
        },
        {
          name: 'restore selected',
          render: () => html`
            <petal-outlined-select name="select">
              <petal-select-option value="one"></petal-select-option>
              <petal-select-option value="two" selected></petal-select-option>
            </petal-outlined-select>
          `,
          assertRestored(select) {
            expect(select.value)
              .withContext('select.value after restore')
              .toBe('two');
          },
        },
      ],
    });
  });
});

describe('<petal-filled-select>', () => {
  describe('.styles', () => {
    createTokenTests(PetalFilledSelect.styles);
  });
});

describe('<petal-select-option>', () => {
  describe('.styles', () => {
    createTokenTests(PetalSelectOption.styles);
  });
});
