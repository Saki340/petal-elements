/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import 'petal-elements/button/filled-button.js';
import 'petal-elements/snackbar/snackbar.js';

import {MaterialStoryInit} from './material-collection.js';
import {html} from 'lit';

/** Knob types for the stories of this demo. */
export interface StoryKnobs {
  message: string;
  action: string;
  dismissible: boolean;
}

type Snackbar = HTMLElement & {show(): Promise<string>};

const snackbar: MaterialStoryInit<StoryKnobs> = {
  name: 'Snackbar',
  render({message, action, dismissible}) {
    return html`
      <petal-filled-button
        @click=${(event: Event) => {
          void (
            (event.target as HTMLElement).nextElementSibling as Snackbar
          ).show();
        }}>
        Show snackbar
      </petal-filled-button>
      <petal-snackbar action=${action} ?dismissible=${dismissible}>
        ${message}
      </petal-snackbar>
    `;
  },
};

export const stories = [snackbar];
