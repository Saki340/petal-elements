/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import '@material/web/labs/gb/components/menu/md-gb-menu.js';
import '@material/web/labs/gb/components/menu/md-gb-menu-item.js';
import '@material/web/labs/gb/components/splitbutton/md-gb-split-button.js';

import {MaterialStoryInit} from './material-collection.js';
import {
  type SplitButtonColor,
  type SplitButtonSize,
} from '@material/web/labs/gb/components/splitbutton/split-button.js';
import {adoptStyles} from '@material/web/labs/gb/styles/adopt-styles.js';
import {styles as m3Styles} from '@material/web/labs/gb/styles/m3.cssresult.js';
import {css, html, nothing} from 'lit';

/** Knob types for split button stories. */
export interface StoryKnobs {
  color?: SplitButtonColor;
  size?: SplitButtonSize;
}

adoptStyles(document, [m3Styles]);

const styles = [
  css`
    :host {
      --md-icon-font: 'Material Symbols Outlined';
    }
  `,
];

const playground: MaterialStoryInit<StoryKnobs> = {
  name: 'Playground',
  styles,
  render(knobs) {
    return html`
      <petal-gb-split-button
        color=${knobs.color || nothing}
        size=${knobs.size || nothing}>
        <button slot="leading">Label</button>
        <button
          slot="trailing"
          aria-label="More actions"
          popovertarget="menu-2">
        </button>
        <petal-gb-menu id="menu-2">
          <petal-gb-menu-item>Option 1</petal-gb-menu-item>
          <petal-gb-menu-item>Option 2</petal-gb-menu-item>
        </petal-gb-menu>
      </petal-gb-split-button>
    `;
  },
};

/** Split Button stories. */
export const stories = [playground];
