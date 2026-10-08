/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import 'petal-elements/labs/aria/buttons/md-aria-toggle.js';

import {MaterialStoryInit} from './material-collection.js';
import {css, html} from 'lit';

/** Knob types for ARIA Button stories. */
export interface StoryKnobs {
  disabled: boolean;
  selected: boolean;
}

const styles = [
  css`
    petal-aria-toggle {
      padding: 8px 16px;
      font-family: sans-serif;
      border-radius: 8px;
    }
  `,
];

const toggles: MaterialStoryInit<StoryKnobs> = {
  name: 'Toggle buttons',
  styles,
  render(knobs) {
    return html`
      <petal-aria-toggle ?selected=${knobs.selected} ?disabled=${knobs.disabled}>
        Bluetooth
      </petal-aria-toggle>
      <petal-aria-toggle selected ?disabled=${knobs.disabled}>
        Wi-Fi
      </petal-aria-toggle>
      <petal-aria-toggle disabled>AI</petal-aria-toggle>
    `;
  },
};

/** ARIA Button stories. */
export const stories = [toggles];
