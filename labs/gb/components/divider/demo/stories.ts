/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import '@material/web/labs/gb/components/divider/md-gb-divider.js';

import {MaterialStoryInit} from './material-collection.js';
import {divider} from '@material/web/labs/gb/components/divider/divider.js';
import {styles as dividerStyles} from '@material/web/labs/gb/components/divider/divider.cssresult.js';
import {adoptStyles} from '@material/web/labs/gb/styles/adopt-styles.js';
import {styles as m3Styles} from '@material/web/labs/gb/styles/m3.cssresult.js';
import {css, html} from 'lit';

/** Knob types for divider stories. */
export interface StoryKnobs {}

adoptStyles(document, [m3Styles]);

const styles = css`
  .column,
  .row {
    display: flex;
    gap: 8px;
    margin: 16px;
  }
  .column {
    flex-direction: column;
  }
  .row {
    flex-direction: row;
  }
`;

const playground: MaterialStoryInit<StoryKnobs> = {
  name: 'Playground',
  styles,
  render(knobs) {
    return html`
      <div class="column">
        <div>Vertical</div>
        <petal-gb-divider></petal-gb-divider>
        <div>Items</div>
      </div>

      <div class="row">
        <div>Horizontal</div>
        <petal-gb-divider vertical></petal-gb-divider>
        <div>Items</div>
      </div>
    `;
  },
};

const directive: MaterialStoryInit<StoryKnobs> = {
  name: 'Directive',
  styles: [styles, dividerStyles],
  render(knobs) {
    return html`
      <div class="column">
        <div>Vertical</div>
        <hr class="${divider()}" />
        <div>Items</div>
      </div>

      <div class="row">
        <div>Horizontal</div>
        <hr class="${divider({vertical: true})}" />
        <div>Items</div>
      </div>
    `;
  },
};

/** Divider stories. */
export const stories = [playground, directive];
