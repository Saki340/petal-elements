/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import 'petal-elements/labs/gb/components/menu/md-gb-menu.js';
import 'petal-elements/labs/gb/components/menu/md-gb-menu-group.js';
import 'petal-elements/labs/gb/components/menu/md-gb-menu-item.js';

import {MaterialStoryInit} from './material-collection.js';
import {button} from 'petal-elements/labs/gb/components/button/button.js';
import {styles as buttonStyles} from 'petal-elements/labs/gb/components/button/button.cssresult.js';
import {divider} from 'petal-elements/labs/gb/components/divider/divider.js';
import {styles as dividerStyles} from 'petal-elements/labs/gb/components/divider/divider.cssresult.js';
import {styles as focusRingStyles} from 'petal-elements/labs/gb/components/focus/focus-ring.cssresult.js';
import {styles as menuStyles} from 'petal-elements/labs/gb/components/menu/menu.cssresult.js';
import {styles as rippleStyles} from 'petal-elements/labs/gb/components/ripple/ripple.cssresult.js';
import {adoptStyles} from 'petal-elements/labs/gb/styles/adopt-styles.js';
import {styles as m3Styles} from 'petal-elements/labs/gb/styles/m3.cssresult.js';
import {css, html} from 'lit';

/** Knob types for menu stories. */
export interface StoryKnobs {
  vibrant: boolean;
}

adoptStyles(document, [
  m3Styles,
  css`
    :root {
      --md-icon-font: 'Material Symbols Outlined';
    }
  `,
]);

const styles = [
  dividerStyles,
  menuStyles,
  buttonStyles,
  focusRingStyles,
  rippleStyles,
];

const playground: MaterialStoryInit<StoryKnobs> = {
  name: 'Playground',
  styles,
  render(knobs) {
    return html`
      <button popovertarget="menu" class=${button({color: 'filled'})}>
        Open Menu
      </button>
      <petal-gb-menu id="menu" color=${knobs.vibrant ? 'vibrant' : 'standard'}>
        <petal-gb-menu-item>Standard Item 1</petal-gb-menu-item>
        <petal-gb-menu-item>
          Standard Item 2
          <span slot="supporting-text">Supporting text</span>
        </petal-gb-menu-item>
        <petal-gb-menu-item disabled>Standard Item 3</petal-gb-menu-item>
        <hr class=${divider()} />
        <petal-gb-menu-group checkable="single">
          <petal-gb-menu-item checked>Radio 1</petal-gb-menu-item>
          <petal-gb-menu-item>Radio 2</petal-gb-menu-item>
          <petal-gb-menu-item disabled>Radio 3</petal-gb-menu-item>
        </petal-gb-menu-group>
        <hr class=${divider()} />
        <petal-gb-menu-group checkable="multiple">
          <petal-gb-menu-item checked>Checkbox 1</petal-gb-menu-item>
          <petal-gb-menu-item>Checkbox 2</petal-gb-menu-item>
          <petal-gb-menu-item disabled checked>Checkbox 3</petal-gb-menu-item>
        </petal-gb-menu-group>
      </petal-gb-menu>
    `;
  },
};

// TODO: add submenu support

/** Menu stories. */
export const stories = [playground];
