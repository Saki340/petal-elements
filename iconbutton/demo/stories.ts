/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import '@material/web/icon/icon.js';
import '@material/web/iconbutton/filled-icon-button.js';
import '@material/web/iconbutton/filled-tonal-icon-button.js';
import '@material/web/iconbutton/icon-button.js';
import '@material/web/iconbutton/outlined-icon-button.js';

import {MaterialStoryInit} from './material-collection.js';
import {styles as typescaleStyles} from '@material/web/typography/md-typescale-styles.cssresult.js';
import {css, html} from 'lit';

/** Knob types for icon button stories. */
export interface StoryKnobs {
  icon: string;
  selectedIcon: string;
  disabled: boolean;
  softDisabled: boolean;
}

const styles = [
  typescaleStyles,
  css`
    .column {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .row {
      display: flex;
      gap: 32px;
    }

    p {
      color: var(--md-sys-color-on-surface);
    }
  `,
];

const buttons: MaterialStoryInit<StoryKnobs> = {
  name: 'Icon button variants',
  styles,
  render({icon, disabled, softDisabled}) {
    return html`
      <div class="row md-typescale-body-medium">
        <div class="column">
          <p>Standard</p>
          <petal-icon-button
            aria-label="Open settings"
            ?disabled=${disabled}
            ?soft-disabled=${softDisabled}>
            <petal-icon>${icon || 'settings'}</petal-icon>
          </petal-icon-button>
        </div>

        <div class="column">
          <p>Outlined</p>
          <petal-outlined-icon-button
            aria-label="Search"
            ?disabled=${disabled}
            ?soft-disabled=${softDisabled}>
            <petal-icon>${icon || 'search'}</petal-icon>
          </petal-outlined-icon-button>
        </div>

        <div class="column">
          <p>Filled</p>
          <petal-filled-icon-button
            aria-label="Complete"
            ?disabled=${disabled}
            ?soft-disabled=${softDisabled}>
            <petal-icon>${icon || 'done'}</petal-icon>
          </petal-filled-icon-button>
        </div>

        <div class="column">
          <p>Filled tonal</p>
          <petal-filled-tonal-icon-button
            aria-label="Add new"
            ?disabled=${disabled}
            ?soft-disabled=${softDisabled}>
            <petal-icon>${icon || 'add'}</petal-icon>
          </petal-filled-tonal-icon-button>
        </div>
      </div>
    `;
  },
};

const toggles: MaterialStoryInit<StoryKnobs> = {
  name: 'Toggle icon buttons',
  styles,
  render({icon, selectedIcon, disabled, softDisabled}) {
    return html`
      <div class="row">
        <div class="column">
          <p>Standard</p>
          <petal-icon-button
            aria-label="Show password"
            aria-label-selected="Hide password"
            toggle
            ?disabled=${disabled}
            ?soft-disabled=${softDisabled}>
            <petal-icon>${icon || 'visibility'}</petal-icon>
            <petal-icon slot="selected">
              ${selectedIcon || 'visibility_off'}
            </petal-icon>
          </petal-icon-button>
        </div>

        <div class="column">
          <p>Outlined</p>
          <petal-outlined-icon-button
            aria-label="Play"
            aria-label-selected="Pause"
            toggle
            ?disabled=${disabled}
            ?soft-disabled=${softDisabled}>
            <petal-icon>${icon || 'play_arrow'}</petal-icon>
            <petal-icon slot="selected">${selectedIcon || 'pause'}</petal-icon>
          </petal-outlined-icon-button>
        </div>

        <div class="column">
          <p>Filled</p>
          <petal-filled-icon-button
            aria-label="Show more"
            aria-label-selected="Show less"
            toggle
            ?disabled=${disabled}
            ?soft-disabled=${softDisabled}>
            <petal-icon>${icon || 'expand_more'}</petal-icon>
            <petal-icon slot="selected">${selectedIcon || 'expand_less'}</petal-icon>
          </petal-filled-icon-button>
        </div>

        <div class="column">
          <p>Filled tonal</p>
          <petal-filled-tonal-icon-button
            aria-label="Open menu"
            aria-label-selected="Close menu"
            toggle
            ?disabled=${disabled}
            ?soft-disabled=${softDisabled}>
            <petal-icon>${icon || 'menu'}</petal-icon>
            <petal-icon slot="selected">${selectedIcon || 'close'}</petal-icon>
          </petal-filled-tonal-icon-button>
        </div>
      </div>
    `;
  },
};

const links: MaterialStoryInit<StoryKnobs> = {
  name: 'Links',
  styles,
  render({icon}) {
    return html`
      <div class="row">
        <div class="column">
          <p>Standard</p>
          <petal-icon-button
            aria-label="Go home"
            href="https://google.com"
            target="_blank">
            <petal-icon>${icon || 'home'}</petal-icon>
          </petal-icon-button>
        </div>

        <div class="column">
          <p>Outlined</p>
          <petal-outlined-icon-button
            aria-label="Open new tab"
            href="https://google.com"
            target="_blank">
            <petal-icon>${icon || 'open_in_new'}</petal-icon>
          </petal-outlined-icon-button>
        </div>

        <div class="column">
          <p>Filled</p>
          <petal-filled-icon-button
            aria-label="Download Google"
            href="https://google.com"
            target="_blank">
            <petal-icon>${icon || 'download'}</petal-icon>
          </petal-filled-icon-button>
        </div>

        <div class="column">
          <p>Filled tonal</p>
          <petal-filled-tonal-icon-button
            aria-label="Logout"
            href="https://google.com"
            target="_blank">
            <petal-icon>${icon || 'logout'}</petal-icon>
          </petal-filled-tonal-icon-button>
        </div>
      </div>
    `;
  },
};

/** Icon button stories. */
export const stories = [buttons, toggles, links];
