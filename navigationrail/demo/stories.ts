/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import 'petal-elements/icon/icon.js';
import 'petal-elements/navigationrail/navigation-rail.js';
import 'petal-elements/navigationrail/navigation-rail-item.js';

import {MaterialStoryInit} from './material-collection.js';
import {css, html} from 'lit';

/** Knob types for the stories of this demo. */
export interface StoryKnobs {
  expanded: boolean;
}

const styles = css`
  .frame { display: flex; height: 360px; }
`;

const story0: MaterialStoryInit<StoryKnobs> = {
  name: 'Navigation rail',
  styles,
  render({expanded}) {
    return html`
      <div class="frame">
        <petal-navigation-rail ?expanded=${expanded}>
          <petal-navigation-rail-item selected>
            <petal-icon slot="icon">home</petal-icon>
            Home
          </petal-navigation-rail-item>
          <petal-navigation-rail-item>
            <petal-icon slot="icon">search</petal-icon>
            Search
          </petal-navigation-rail-item>
          <petal-navigation-rail-item>
            <petal-icon slot="icon">person</petal-icon>
            Profile
          </petal-navigation-rail-item>
        </petal-navigation-rail>
      </div>
    `;
  },
};

export const stories = [story0];
