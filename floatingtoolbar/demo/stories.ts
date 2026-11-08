/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import 'petal-elements/floatingtoolbar/floating-toolbar.js';
import 'petal-elements/icon/icon.js';
import 'petal-elements/iconbutton/icon-button.js';

import {MaterialStoryInit} from './material-collection.js';
import {html} from 'lit';

/** Knob types for the stories of this demo. */
export interface StoryKnobs {
  vertical: boolean;
  vibrant: boolean;
  expanded: boolean;
}

const story0: MaterialStoryInit<StoryKnobs> = {
  name: 'Floating toolbar',
  render({vertical, vibrant, expanded}) {
    return html`
      <petal-floating-toolbar
        aria-label="Text formatting"
        orientation=${vertical ? 'vertical' : 'horizontal'}
        colors=${vibrant ? 'vibrant' : 'standard'}
        ?expanded=${expanded}>
        <petal-icon-button aria-label="Bold"><petal-icon>format_bold</petal-icon></petal-icon-button>
        <petal-icon-button aria-label="Italic"><petal-icon>format_italic</petal-icon></petal-icon-button>
        <petal-icon-button aria-label="Underline"><petal-icon>format_underlined</petal-icon></petal-icon-button>
      </petal-floating-toolbar>
    `;
  },
};

export const stories = [story0];
