/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import 'petal-elements/button/filled-tonal-button.js';
import 'petal-elements/datepicker/date-picker.js';
import 'petal-elements/datepicker/date-picker-dialog.js';

import {MaterialStoryInit} from './material-collection.js';
import {html} from 'lit';

/** Knob types for the stories of this demo. */
export interface StoryKnobs {
  value: string;
}

type Dialog = HTMLElement & {show(): void};

const story0: MaterialStoryInit<StoryKnobs> = {
  name: 'Docked',
  render({value}) {
    return html`
      <petal-date-picker value=${value}></petal-date-picker>
    `;
  },
};

const story1: MaterialStoryInit<StoryKnobs> = {
  name: 'Dialog',
  render({value}) {
    return html`
      <petal-filled-tonal-button
        @click=${(event: Event) => {
          ((event.target as HTMLElement).nextElementSibling as Dialog).show();
        }}>
        Pick a date
      </petal-filled-tonal-button>
      <petal-date-picker-dialog value=${value}></petal-date-picker-dialog>
    `;
  },
};

export const stories = [story0, story1];
