/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import 'petal-elements/icon/icon.js';

import {MaterialStoryInit} from './material-collection.js';
import {css, html} from 'lit';

/** Knob types for the stories of this demo. */
export interface StoryKnobs {
  name: string;
}

const styles = css`
  .row { display: flex; align-items: center; gap: 24px; }
`;

const story0: MaterialStoryInit<StoryKnobs> = {
  name: 'Sizes',
  styles,
  render({name}) {
    return html`
      <div class="row">
        <petal-icon style="--md-icon-size: 24px">${name}</petal-icon>
        <petal-icon style="--md-icon-size: 40px">${name}</petal-icon>
        <petal-icon style="--md-icon-size: 64px">${name}</petal-icon>
      </div>
    `;
  },
};

export const stories = [story0];
