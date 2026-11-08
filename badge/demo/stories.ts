/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import 'petal-elements/badge/badge.js';
import 'petal-elements/icon/icon.js';
import 'petal-elements/iconbutton/icon-button.js';

import {MaterialStoryInit} from './material-collection.js';
import {css, html} from 'lit';

/** Knob types for the stories of this demo. */
export interface StoryKnobs {
  value: string;
}

const styles = css`
  .row { display: flex; gap: 24px; }
`;

const story0: MaterialStoryInit<StoryKnobs> = {
  name: 'Badges',
  styles,
  render({value}) {
    return html`
      <div class="row">
        <petal-icon-button aria-label="Notifications">
          <petal-icon>notifications</petal-icon>
          <petal-badge slot="badge"></petal-badge>
        </petal-icon-button>
        <petal-icon-button aria-label="Mail">
          <petal-icon>mail</petal-icon>
          <petal-badge slot="badge" value=${value}></petal-badge>
        </petal-icon-button>
      </div>
    `;
  },
};

export const stories = [story0];
