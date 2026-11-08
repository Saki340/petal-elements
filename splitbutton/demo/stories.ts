/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import 'petal-elements/icon/icon.js';
import 'petal-elements/splitbutton/split-button.js';

import {MaterialStoryInit} from './material-collection.js';
import {html} from 'lit';

/** Knob types for the stories of this demo. */
export interface StoryKnobs {
  label: string;
  tonal: boolean;
}

const story0: MaterialStoryInit<StoryKnobs> = {
  name: 'Split button',
  render({label, tonal}) {
    return html`
      <petal-split-button variant=${tonal ? 'tonal' : 'filled'}>
        ${label}
        <petal-icon slot="icon">save</petal-icon>
      </petal-split-button>
    `;
  },
};

export const stories = [story0];
