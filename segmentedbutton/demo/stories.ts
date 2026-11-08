/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import 'petal-elements/segmentedbutton/segmented-button.js';
import 'petal-elements/segmentedbutton/segmented-button-set.js';

import {MaterialStoryInit} from './material-collection.js';
import {html} from 'lit';

/** Knob types for the stories of this demo. */
export interface StoryKnobs {
  multiselect: boolean;
}

const story0: MaterialStoryInit<StoryKnobs> = {
  name: 'Segmented button',
  render({multiselect}) {
    return html`
      <petal-segmented-button-set
        aria-label="Range"
        ?multiselect=${multiselect}>
        <petal-segmented-button label="Day" selected></petal-segmented-button>
        <petal-segmented-button label="Week"></petal-segmented-button>
        <petal-segmented-button label="Month"></petal-segmented-button>
      </petal-segmented-button-set>
    `;
  },
};

export const stories = [story0];
