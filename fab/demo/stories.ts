/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import 'petal-elements/fab/branded-fab.js';
import 'petal-elements/fab/fab.js';
import 'petal-elements/icon/icon.js';

import {FabSize} from 'petal-elements/fab/fab.js';
import {
  labelStyles,
  MaterialStoryInit,
} from './material-collection.js';
import {css, html, nothing} from 'lit';

/** Knob types for fab stories. */
export interface StoryKnobs {
  icon: string;
  label: string;
  lowered: boolean;
  size: FabSize | undefined;
}

const styles = css`
  .row {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
  }

  label {
    flex-direction: column;
    gap: 16px;
  }
`;

const standard: MaterialStoryInit<StoryKnobs> = {
  name: 'Floating action buttons',
  styles: [labelStyles, styles],
  render({icon, label, lowered, size}) {
    return html`
      <div class="row">
        <label>
          <span aria-hidden="true">Surface</span>
          <petal-fab
            aria-label=${label ? nothing : 'An example surface FAB'}
            variant="surface"
            .lowered=${lowered}
            .label=${label}
            .size=${size!}>
            <petal-icon slot="icon">${icon}</petal-icon>
          </petal-fab>
        </label>

        <label>
          <span aria-hidden="true">Primary</span>
          <petal-fab
            aria-label=${label ? nothing : 'An example primary FAB'}
            variant="primary"
            .lowered=${lowered}
            .label=${label}
            .size=${size!}>
            <petal-icon slot="icon">${icon}</petal-icon>
          </petal-fab>
        </label>

        <label>
          <span aria-hidden="true">Secondary</span>
          <petal-fab
            aria-label=${label ? nothing : 'An example secondary FAB'}
            variant="secondary"
            .lowered=${lowered}
            .label=${label}
            .size=${size!}>
            <petal-icon slot="icon">${icon}</petal-icon>
          </petal-fab>
        </label>

        <label>
          <span aria-hidden="true">Tertiary</span>
          <petal-fab
            aria-label=${label ? nothing : 'An example tertiary FAB'}
            variant="tertiary"
            .lowered=${lowered}
            .label=${label}
            .size=${size!}>
            <petal-icon slot="icon">${icon}</petal-icon>
          </petal-fab>
        </label>

        <label>
          <span aria-hidden="true">Branded</span>
          <petal-branded-fab
            aria-label=${label ? nothing : 'An example branded FAB'}
            .lowered=${lowered}
            .label=${label}
            .size=${size!}>
            <svg slot="icon" width="36" height="36" viewBox="0 0 36 36">
              <ellipse cx="18" cy="10" rx="5" ry="8" fill="#F48FB1"></ellipse>
              <ellipse cx="26" cy="18" rx="8" ry="5" fill="#EC407A"></ellipse>
              <ellipse cx="18" cy="26" rx="5" ry="8" fill="#F06292"></ellipse>
              <ellipse cx="10" cy="18" rx="8" ry="5" fill="#F8BBD0"></ellipse>
              <circle cx="18" cy="18" r="4" fill="#FFD54F"></circle>
            </svg>
          </petal-branded-fab>
        </label>
      </div>
    `;
  },
};

/** Checkbox stories. */
export const stories = [standard];
