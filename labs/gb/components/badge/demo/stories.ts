/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import '@material/web/labs/gb/components/badge/md-gb-badge.js';

import {MaterialStoryInit} from './material-collection.js';
import {adoptStyles} from '@material/web/labs/gb/styles/adopt-styles.js';
import {styles as m3Styles} from '@material/web/labs/gb/styles/m3.cssresult.js';
import {html} from 'lit';

adoptStyles(document, [m3Styles]);

/** Knob types for badge stories. */
export interface StoryKnobs {
  // Badge is stateless and has no knobs currently.
}

const playground: MaterialStoryInit<StoryKnobs> = {
  name: 'Playground',
  render() {
    return html`
      <div style="display: flex; gap: 16px; align-items: center;">
        <petal-gb-badge></petal-gb-badge>
        <petal-gb-badge>3</petal-gb-badge>
        <petal-gb-badge>99+</petal-gb-badge>
      </div>
    `;
  },
};

const anchored: MaterialStoryInit<StoryKnobs> = {
  name: 'Anchored',
  render() {
    return html`
      <div
        style="display: flex; gap: 32px; align-items: center; padding: 16px;">
        <!-- Small badge (dot) -->
        <div style="display: inline-block;">
          <div
            style="width: 40px; height: 40px; background: #ccc; border-radius: 8px; anchor-name: --small-badge-anchor;"></div>
          <petal-gb-badge
            style="position: absolute; position-anchor: --small-badge-anchor; top: anchor(top); left: anchor(right); transform: translate(-50%, -50%);"></petal-gb-badge>
        </div>

        <!-- Large badge (with text) -->
        <div style="display: inline-block;">
          <div
            style="width: 40px; height: 40px; background: #ccc; border-radius: 8px; anchor-name: --large-badge-anchor-1;"></div>
          <petal-gb-badge
            style="position: absolute; position-anchor: --large-badge-anchor-1; top: anchor(top); left: anchor(right); transform: translate(-50%, -50%);"
            >3</petal-gb-badge
          >
        </div>

        <!-- Large badge (with multi-digit text) -->
        <div style="display: inline-block;">
          <div
            style="width: 40px; height: 40px; background: #ccc; border-radius: 8px; anchor-name: --large-badge-anchor-2;"></div>
          <petal-gb-badge
            style="position: absolute; position-anchor: --large-badge-anchor-2; top: anchor(top); left: anchor(right); transform: translate(-50%, -50%);"
            >99+</petal-gb-badge
          >
        </div>
      </div>
    `;
  },
};

/** Badge stories. */
export const stories = [playground, anchored];
