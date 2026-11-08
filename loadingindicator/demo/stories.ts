/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import 'petal-elements/loadingindicator/loading-indicator.js';

import {MaterialStoryInit} from './material-collection.js';
import {html} from 'lit';

/** Knob types for the stories of this demo. */
export interface StoryKnobs {
  contained: boolean;
}

const story0: MaterialStoryInit<StoryKnobs> = {
  name: 'Loading indicator',
  render({contained}) {
    return html`
      <petal-loading-indicator
        aria-label="Loading"
        ?contained=${contained}></petal-loading-indicator>
    `;
  },
};

export const stories = [story0];
