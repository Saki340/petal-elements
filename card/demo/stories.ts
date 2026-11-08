/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import 'petal-elements/card/elevated-card.js';
import 'petal-elements/card/filled-card.js';
import 'petal-elements/card/outlined-card.js';

import {MaterialStoryInit} from './material-collection.js';
import {css, html} from 'lit';

/** Knob types for the stories of this demo. */
export interface StoryKnobs {
  headline: string;
}

const styles = css`
  .row { display: flex; flex-wrap: wrap; gap: 16px; }
  .row > * { width: 220px; }
  .body { padding: 16px; }
  h3 { margin: 0 0 4px; }
  p { margin: 0; }
`;

const story0: MaterialStoryInit<StoryKnobs> = {
  name: 'Cards',
  styles,
  render({headline}) {
    return html`
      <div class="row">
        <petal-filled-card>
          <div class="body"><h3>${headline}</h3><p>Filled</p></div>
        </petal-filled-card>
        <petal-elevated-card>
          <div class="body"><h3>${headline}</h3><p>Elevated</p></div>
        </petal-elevated-card>
        <petal-outlined-card>
          <div class="body"><h3>${headline}</h3><p>Outlined</p></div>
        </petal-outlined-card>
      </div>
    `;
  },
};

export const stories = [story0];
