/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import '@material/web/checkbox/checkbox.js';

import {
  labelStyles,
  MaterialStoryInit,
} from './material-collection.js';
import {css, html} from 'lit';

/** Knob types for checkbox stories. */
export interface StoryKnobs {
  checked: boolean;
  disabled: boolean;
  indeterminate: boolean;
}

const checkbox: MaterialStoryInit<StoryKnobs> = {
  name: 'Checkbox',
  render({checked, disabled, indeterminate}) {
    return html`
      <petal-checkbox
        aria-label="An example checkbox"
        ?checked=${checked}
        ?disabled=${disabled}
        ?indeterminate=${indeterminate}
        touch-target="wrapper"></petal-checkbox>
    `;
  },
};

const withLabels: MaterialStoryInit<StoryKnobs> = {
  name: 'With labels',
  styles: [
    labelStyles,
    css`
      ol {
        all: unset;
        display: flex;
        flex-direction: column;
      }

      li {
        all: unset;
      }

      label {
        gap: 0;
      }
    `,
  ],
  render({disabled}) {
    return html`
      <ol aria-label="Animals">
        <li>
          <label>
            <petal-checkbox
              ?disabled=${disabled}
              aria-label="Cats"
              touch-target="wrapper"></petal-checkbox>
            Cats
          </label>
        </li>
        <li>
          <label>
            <petal-checkbox
              checked
              ?disabled=${disabled}
              aria-label="dogs"
              touch-target="wrapper"></petal-checkbox>
            Dogs
          </label>
        </li>
        <li>
          <label>
            <petal-checkbox
              indeterminate
              ?disabled=${disabled}
              aria-label="Birds"
              touch-target="wrapper"></petal-checkbox>
            Birds
          </label>
        </li>
      </ol>
    `;
  },
};

/** Checkbox stories. */
export const stories = [checkbox, withLabels];
