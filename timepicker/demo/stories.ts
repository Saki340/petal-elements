/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import 'petal-elements/timepicker/time-picker.js';

import {MaterialStoryInit} from './material-collection.js';
import {html} from 'lit';

/** Knob types for the stories of this demo. */
export interface StoryKnobs {
  value: string;
  hour24: boolean;
}

const story0: MaterialStoryInit<StoryKnobs> = {
  name: 'Time picker',
  render({value, hour24}) {
    return html`
      <petal-time-picker
        value=${value}
        hour-cycle=${hour24 ? '24' : '12'}></petal-time-picker>
    `;
  },
};

export const stories = [story0];
