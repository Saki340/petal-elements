/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import '@material/web/button/elevated-button.js';
import '@material/web/button/filled-button.js';
import '@material/web/button/filled-tonal-button.js';
import '@material/web/button/outlined-button.js';
import '@material/web/button/text-button.js';
import '@material/web/icon/icon.js';

import {MaterialStoryInit} from './material-collection.js';
import {css, html} from 'lit';

/** Knob types for button stories. */
export interface StoryKnobs {
  label: string;
  disabled: boolean;
  softDisabled: boolean;
}

const styles = css`
  .column {
    display: flex;
    flex-direction: column;
    gap: 16px;
    max-width: 600px;
  }

  .row {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
  }
`;

const buttons: MaterialStoryInit<StoryKnobs> = {
  name: 'Button variants',
  styles,
  render({label, disabled, softDisabled}) {
    return html`
      <div class="column">
        <div class="row">
          <petal-filled-button
            ?disabled=${disabled}
            ?soft-disabled=${softDisabled}>
            ${label || 'Filled'}
          </petal-filled-button>

          <petal-outlined-button
            ?disabled=${disabled}
            ?soft-disabled=${softDisabled}>
            ${label || 'Outlined'}
          </petal-outlined-button>

          <petal-elevated-button
            ?disabled=${disabled}
            ?soft-disabled=${softDisabled}>
            ${label || 'Elevated'}
          </petal-elevated-button>

          <petal-filled-tonal-button
            ?disabled=${disabled}
            ?soft-disabled=${softDisabled}>
            ${label || 'Tonal'}
          </petal-filled-tonal-button>

          <petal-text-button ?disabled=${disabled} ?soft-disabled=${softDisabled}>
            ${label || 'Text'}
          </petal-text-button>
        </div>
        <div class="row">
          <petal-filled-button
            ?disabled=${disabled}
            ?soft-disabled=${softDisabled}
            aria-label="${label || 'Filled'} button with icon">
            <petal-icon slot="icon">upload</petal-icon>
            ${label || 'Filled'}
          </petal-filled-button>

          <petal-outlined-button
            ?disabled=${disabled}
            ?soft-disabled=${softDisabled}
            aria-label="${label || 'Outlined'} button with icon">
            <petal-icon slot="icon">upload</petal-icon>
            ${label || 'Outlined'}
          </petal-outlined-button>

          <petal-elevated-button
            ?disabled=${disabled}
            ?soft-disabled=${softDisabled}
            aria-label="${label || 'Elevated'} button with icon">
            <petal-icon slot="icon">upload</petal-icon>
            ${label || 'Elevated'}
          </petal-elevated-button>

          <petal-filled-tonal-button
            ?disabled=${disabled}
            ?soft-disabled=${softDisabled}
            aria-label="${label || 'Tonal'} button with icon">
            <petal-icon slot="icon">upload</petal-icon>
            ${label || 'Tonal'}
          </petal-filled-tonal-button>

          <petal-text-button
            ?disabled=${disabled}
            ?soft-disabled=${softDisabled}
            aria-label="${label || 'Text'} button with icon">
            <petal-icon slot="icon">upload</petal-icon>
            ${label || 'Text'}
          </petal-text-button>
        </div>
      </div>
    `;
  },
};

const links: MaterialStoryInit<StoryKnobs> = {
  name: 'Links',
  styles,
  render({label, disabled, softDisabled}) {
    return html`
      <div class="column">
        <div class="row">
          <petal-filled-button
            ?disabled=${disabled}
            ?soft-disabled=${softDisabled}
            href="https://google.com"
            target="_blank"
            trailing-icon>
            ${label || 'Filled'}
          </petal-filled-button>

          <petal-outlined-button
            ?disabled=${disabled}
            ?soft-disabled=${softDisabled}
            href="https://google.com"
            target="_blank"
            trailing-icon>
            ${label || 'Outlined'}
          </petal-outlined-button>

          <petal-elevated-button
            ?disabled=${disabled}
            ?soft-disabled=${softDisabled}
            href="https://google.com"
            target="_blank"
            trailing-icon>
            ${label || 'Elevated'}
          </petal-elevated-button>

          <petal-filled-tonal-button
            ?disabled=${disabled}
            ?soft-disabled=${softDisabled}
            href="https://google.com"
            target="_blank"
            trailing-icon>
            ${label || 'Tonal'}
          </petal-filled-tonal-button>

          <petal-text-button
            ?disabled=${disabled}
            ?soft-disabled=${softDisabled}
            href="https://google.com"
            target="_blank"
            trailing-icon>
            ${label || 'Text'}
          </petal-text-button>
        </div>
        <div class="row">
          <petal-filled-button
            aria-label="${label || 'Filled'} link with trailing icon"
            ?disabled=${disabled}
            ?soft-disabled=${softDisabled}
            href="https://google.com"
            target="_blank"
            trailing-icon>
            <petal-icon slot="icon">open_in_new</petal-icon>
            ${label || 'Filled'}
          </petal-filled-button>

          <petal-outlined-button
            aria-label="${label || 'Outlined'} link with trailing icon"
            ?disabled=${disabled}
            ?soft-disabled=${softDisabled}
            href="https://google.com"
            target="_blank"
            trailing-icon>
            <petal-icon slot="icon">open_in_new</petal-icon>
            ${label || 'Outlined'}
          </petal-outlined-button>

          <petal-elevated-button
            aria-label="${label || 'Elevated'} link with trailing icon"
            ?disabled=${disabled}
            ?soft-disabled=${softDisabled}
            href="https://google.com"
            target="_blank"
            trailing-icon>
            <petal-icon slot="icon">open_in_new</petal-icon>
            ${label || 'Elevated'}
          </petal-elevated-button>

          <petal-filled-tonal-button
            aria-label="${label || 'Tonal'} link with trailing icon"
            ?disabled=${disabled}
            ?soft-disabled=${softDisabled}
            href="https://google.com"
            target="_blank"
            trailing-icon>
            <petal-icon slot="icon">open_in_new</petal-icon>
            ${label || 'Tonal'}
          </petal-filled-tonal-button>

          <petal-text-button
            aria-label="${label || 'Text'} link with trailing icon"
            ?disabled=${disabled}
            ?soft-disabled=${softDisabled}
            href="https://google.com"
            target="_blank"
            trailing-icon>
            <petal-icon slot="icon">open_in_new</petal-icon>
            ${label || 'Text'}
          </petal-text-button>
        </div>
      </div>
    `;
  },
};

/** Button stories. */
export const stories = [buttons, links];
