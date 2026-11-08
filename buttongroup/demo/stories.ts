/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import 'petal-elements/button/filled-tonal-button.js';
import 'petal-elements/buttongroup/button-group.js';

import {MaterialStoryInit} from './material-collection.js';
import {html} from 'lit';

/** Knob types for the stories of this demo. */
export interface StoryKnobs {
  connected: boolean;
  singleSelect: boolean;
}

const story0: MaterialStoryInit<StoryKnobs> = {
  name: 'Button group',
  render({connected, singleSelect}) {
    return html`
      <petal-button-group
        ?connected=${connected}
        ?single-select=${singleSelect}>
        <petal-filled-tonal-button toggle>Day</petal-filled-tonal-button>
        <petal-filled-tonal-button toggle selected>Week</petal-filled-tonal-button>
        <petal-filled-tonal-button toggle>Month</petal-filled-tonal-button>
      </petal-button-group>
    `;
  },
};

export const stories = [story0];
