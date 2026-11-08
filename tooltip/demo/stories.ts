/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import 'petal-elements/button/text-button.js';
import 'petal-elements/icon/icon.js';
import 'petal-elements/iconbutton/icon-button.js';
import 'petal-elements/tooltip/rich-tooltip.js';
import 'petal-elements/tooltip/tooltip.js';

import {MaterialStoryInit} from './material-collection.js';
import {css, html} from 'lit';

/** Knob types for the stories of this demo. */
export interface StoryKnobs {
  text: string;
}

const styles = css`
  .row { display: flex; gap: 48px; padding: 64px; }
`;

const story0: MaterialStoryInit<StoryKnobs> = {
  name: 'Hover or focus the buttons',
  styles,
  render({text}) {
    return html`
      <div class="row">
        <petal-icon-button id="bookmark" aria-label=${text}>
          <petal-icon>bookmark</petal-icon>
        </petal-icon-button>
        <petal-tooltip for="bookmark">${text}</petal-tooltip>

        <petal-icon-button id="info" aria-label="About camera settings">
          <petal-icon>info</petal-icon>
        </petal-icon-button>
        <petal-rich-tooltip for="info" persistent caret>
          <span slot="title">Camera settings</span>
          Choose the resolution and frame rate for new videos.
          <petal-text-button slot="action">Learn more</petal-text-button>
        </petal-rich-tooltip>
      </div>
    `;
  },
};

export const stories = [story0];
