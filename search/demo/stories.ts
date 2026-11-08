/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import 'petal-elements/list/list.js';
import 'petal-elements/list/list-item.js';
import 'petal-elements/search/search-bar.js';

import {MaterialStoryInit} from './material-collection.js';
import {css, html} from 'lit';

/** Knob types for the stories of this demo. */
export interface StoryKnobs {
  placeholder: string;
  docked: boolean;
}

const styles = css`
  petal-list {
    --md-list-container-color: transparent;
    --md-list-item-container-color: transparent;
  }
`;

const story0: MaterialStoryInit<StoryKnobs> = {
  name: 'Search bar',
  styles,
  render({placeholder, docked}) {
    return html`
      <petal-search-bar
        placeholder=${placeholder}
        layout=${docked ? 'docked' : 'full-screen'}>
        <petal-list>
          <petal-list-item type="button">Calendar</petal-list-item>
          <petal-list-item type="button">Camera</petal-list-item>
          <petal-list-item type="button">Clock</petal-list-item>
        </petal-list>
      </petal-search-bar>
    `;
  },
};

export const stories = [story0];
