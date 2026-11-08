/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import 'petal-elements/appbar/bottom-app-bar.js';
import 'petal-elements/fab/fab.js';
import 'petal-elements/icon/icon.js';
import 'petal-elements/iconbutton/icon-button.js';

import {MaterialStoryInit} from './material-collection.js';
import {html} from 'lit';

/** Knob types for the stories of this demo. */
export interface StoryKnobs {
  flexible: boolean;
}

const story0: MaterialStoryInit<StoryKnobs> = {
  name: 'Bottom app bar',
  render({flexible}) {
    return html`
      <petal-bottom-app-bar ?flexible=${flexible}>
        <petal-icon-button aria-label="Mark as done"><petal-icon>check_box</petal-icon></petal-icon-button>
        <petal-icon-button aria-label="Edit"><petal-icon>edit</petal-icon></petal-icon-button>
        <petal-icon-button aria-label="Record"><petal-icon>mic</petal-icon></petal-icon-button>
        <petal-fab slot="fab" variant="secondary" aria-label="New note">
          <petal-icon slot="icon">add</petal-icon>
        </petal-fab>
      </petal-bottom-app-bar>
    `;
  },
};

export const stories = [story0];
