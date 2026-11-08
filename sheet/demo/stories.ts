/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import 'petal-elements/button/filled-button.js';
import 'petal-elements/button/text-button.js';
import 'petal-elements/sheet/bottom-sheet.js';

import {MaterialStoryInit} from './material-collection.js';
import {css, html} from 'lit';

/** Knob types for the stories of this demo. */
export interface StoryKnobs {
  skipPartiallyExpanded: boolean;
}

type Sheet = HTMLElement & {show(): void};

const styles = css`
  .content { padding: 0 24px 24px; }
`;

const story0: MaterialStoryInit<StoryKnobs> = {
  name: 'Bottom sheet',
  styles,
  render({skipPartiallyExpanded}) {
    return html`
      <petal-filled-button
        @click=${(event: Event) => {
          ((event.target as HTMLElement).nextElementSibling as Sheet).show();
        }}>
        Share
      </petal-filled-button>
      <petal-bottom-sheet
        aria-label="Share"
        ?skip-partially-expanded=${skipPartiallyExpanded}>
        <div class="content">
          <h2>Share</h2>
          <petal-text-button>Copy link</petal-text-button>
          <petal-text-button>Send by email</petal-text-button>
        </div>
      </petal-bottom-sheet>
    `;
  },
};

export const stories = [story0];
