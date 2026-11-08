/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import 'petal-elements/button/filled-button.js';
import 'petal-elements/icon/icon.js';
import 'petal-elements/navigationdrawer/navigation-drawer.js';
import 'petal-elements/navigationdrawer/navigation-drawer-item.js';

import {MaterialStoryInit} from './material-collection.js';
import {html} from 'lit';

/** Knob types for the stories of this demo. */
export interface StoryKnobs {
  headline: string;
}

type Drawer = HTMLElement & {show(): void; close(): void};

const story0: MaterialStoryInit<StoryKnobs> = {
  name: 'Modal drawer',
  render({headline}) {
    return html`
      <petal-filled-button
        @click=${(event: Event) => {
          ((event.target as HTMLElement).nextElementSibling as Drawer).show();
        }}>
        Open drawer
      </petal-filled-button>
      <petal-navigation-drawer
        aria-label=${headline}
        @change=${(event: Event) => {
          (event.currentTarget as Drawer).close();
        }}>
        <h2>${headline}</h2>
        <petal-navigation-drawer-item selected>
          <petal-icon slot="icon">inbox</petal-icon>
          Inbox
          <span slot="badge">24</span>
        </petal-navigation-drawer-item>
        <petal-navigation-drawer-item>
          <petal-icon slot="icon">send</petal-icon>
          Sent
        </petal-navigation-drawer-item>
      </petal-navigation-drawer>
    `;
  },
};

export const stories = [story0];
