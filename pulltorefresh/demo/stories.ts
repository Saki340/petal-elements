/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import 'petal-elements/list/list.js';
import 'petal-elements/list/list-item.js';
import 'petal-elements/pulltorefresh/pull-to-refresh.js';

import {MaterialStoryInit} from './material-collection.js';
import {css, html} from 'lit';

/** Knob types for the stories of this demo. */
export interface StoryKnobs {
  seconds: number;
}

type Refresher = HTMLElement & {refreshing: boolean};

const styles = css`
  petal-pull-to-refresh { display: block; height: 360px; }
`;

const story0: MaterialStoryInit<StoryKnobs> = {
  name: 'Drag down the list',
  styles,
  render({seconds}) {
    return html`
      <petal-pull-to-refresh
        @refresh=${(event: Event) => {
          const target = event.currentTarget as Refresher;
          setTimeout(() => {
            target.refreshing = false;
          }, seconds * 1000);
        }}>
        <petal-list>
          <petal-list-item>Inbox</petal-list-item>
          <petal-list-item>Starred</petal-list-item>
          <petal-list-item>Sent</petal-list-item>
          <petal-list-item>Drafts</petal-list-item>
        </petal-list>
      </petal-pull-to-refresh>
    `;
  },
};

export const stories = [story0];
