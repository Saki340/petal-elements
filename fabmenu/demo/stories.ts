/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import 'petal-elements/fabmenu/fab-menu.js';
import 'petal-elements/fabmenu/fab-menu-item.js';
import 'petal-elements/fabmenu/toggle-fab.js';
import 'petal-elements/icon/icon.js';

import {MaterialStoryInit} from './material-collection.js';
import {css, html} from 'lit';

/** Knob types for the stories of this demo. */
export interface StoryKnobs {
  itemsLabel: string;
}

const styles = css`
  .frame { display: flex; justify-content: flex-end; align-items: flex-end; height: 320px; }
`;

const story0: MaterialStoryInit<StoryKnobs> = {
  name: 'FAB menu',
  styles,
  render({itemsLabel}) {
    return html`
      <div class="frame">
        <petal-fab-menu items-label=${itemsLabel}>
          <petal-fab-menu-item>
            <petal-icon slot="icon">edit</petal-icon>
            Note
          </petal-fab-menu-item>
          <petal-fab-menu-item>
            <petal-icon slot="icon">checklist</petal-icon>
            List
          </petal-fab-menu-item>
          <petal-fab-menu-item>
            <petal-icon slot="icon">image</petal-icon>
            Image
          </petal-fab-menu-item>
          <petal-toggle-fab slot="button" aria-label=${itemsLabel}></petal-toggle-fab>
        </petal-fab-menu>
      </div>
    `;
  },
};

export const stories = [story0];
