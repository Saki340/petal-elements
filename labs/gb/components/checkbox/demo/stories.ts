/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import 'petal-elements/labs/gb/components/checkbox/md-gb-checkbox.js';

import {MaterialStoryInit} from './material-collection.js';
import {adoptStyles} from 'petal-elements/labs/gb/styles/adopt-styles.js';
import {css, html} from 'lit';

import {styles as m3Styles} from 'petal-elements/labs/gb/styles/m3.css' with {type: 'css'}; // github-only
// import {styles as m3Styles} from 'petal-elements/labs/gb/styles/m3.cssresult.js'; // google3-only

/** Knob types for checkbox stories. */
export interface StoryKnobs {
  checked: boolean;
  indeterminate: boolean;
  error: boolean;
}

adoptStyles(document, [
  m3Styles,
  css`
    :root {
      --md-icon-font: 'Material Symbols Outlined';
    }
  `,
]);

const playground: MaterialStoryInit<StoryKnobs> = {
  name: 'Playground',
  render(knobs) {
    return html`
      <petal-gb-checkbox></petal-gb-checkbox>
      <petal-gb-checkbox checked></petal-gb-checkbox>
      <petal-gb-checkbox
        .checked=${knobs.checked}
        .indeterminate=${knobs.indeterminate}
        .error=${knobs.error}></petal-gb-checkbox>
    `;
  },
};

/** Checkbox stories. */
export const stories = [playground];
