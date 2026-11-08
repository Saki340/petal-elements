/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import 'petal-elements/icon/icon.js';
import 'petal-elements/navigationbar/navigation-bar.js';
import 'petal-elements/navigationbar/navigation-bar-item.js';

import {MaterialStoryInit} from './material-collection.js';
import {html} from 'lit';

/** Knob types for the stories of this demo. */
export interface StoryKnobs {
  firstLabel: string;
}

const story0: MaterialStoryInit<StoryKnobs> = {
  name: 'Navigation bar',
  render({firstLabel}) {
    return html`
      <petal-navigation-bar>
        <petal-navigation-bar-item selected>
          <petal-icon slot="icon">home</petal-icon>
          ${firstLabel}
        </petal-navigation-bar-item>
        <petal-navigation-bar-item>
          <petal-icon slot="icon">search</petal-icon>
          Search
        </petal-navigation-bar-item>
        <petal-navigation-bar-item>
          <petal-icon slot="icon">bookmark</petal-icon>
          Saved
        </petal-navigation-bar-item>
      </petal-navigation-bar>
    `;
  },
};

export const stories = [story0];
