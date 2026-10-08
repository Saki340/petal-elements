/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import '@material/web/labs/gb/components/fab/md-gb-fab.js';
import '@material/web/labs/gb/styles/icon/md-gb-icon.js';

import {MaterialStoryInit} from './material-collection.js';
import {FabColor, FabSize} from '@material/web/labs/gb/components/fab/fab.js';
import {adoptStyles} from '@material/web/labs/gb/styles/adopt-styles.js';
import {styles as m3Styles} from '@material/web/labs/gb/styles/m3.cssresult.js';
import {css, html, nothing} from 'lit';

/** Knob types for fab stories. */
export interface StoryKnobs {
  icon: string;
  label: string;
  color?: FabColor;
  size?: FabSize;
}

adoptStyles(document, [
  m3Styles,
  css`
    :root {
      --md-icon-font: 'Material Symbols Outlined';
    }
  `,
]);

const playground: MaterialStoryInit<StoryKnobs> = {
  name: 'Playground',
  render(knobs) {
    return html`
      <petal-gb-fab
        color="${knobs.color || nothing}"
        size="${knobs.size || nothing}">
        <petal-gb-icon>${knobs.icon}</petal-gb-icon>
        ${knobs.label}
      </petal-gb-fab>
    `;
  },
};

const extendedFab: MaterialStoryInit<StoryKnobs> = {
  name: 'Extended FAB',
  render(knobs) {
    return html`
      <petal-gb-fab
        color="${knobs.color || nothing}"
        size="${knobs.size || nothing}">
        <petal-gb-icon>${knobs.icon || 'add'}</petal-gb-icon>
        ${knobs.label || 'Add'}
      </petal-gb-fab>
    `;
  },
};

const colors: MaterialStoryInit<StoryKnobs> = {
  name: 'Colors',
  render(knobs) {
    return html`
      <petal-gb-fab color="primary-container" size="${knobs.size || nothing}">
        <petal-gb-icon>${knobs.icon}</petal-gb-icon>
        ${knobs.label}
      </petal-gb-fab>
      <petal-gb-fab color="secondary-container" size="${knobs.size || nothing}">
        <petal-gb-icon>${knobs.icon}</petal-gb-icon>
        ${knobs.label}
      </petal-gb-fab>
      <petal-gb-fab color="tertiary-container" size="${knobs.size || nothing}">
        <petal-gb-icon>${knobs.icon}</petal-gb-icon>
        ${knobs.label}
      </petal-gb-fab>
      <petal-gb-fab color="primary" size="${knobs.size || nothing}">
        <petal-gb-icon>${knobs.icon}</petal-gb-icon>
        ${knobs.label}
      </petal-gb-fab>
      <petal-gb-fab color="secondary" size="${knobs.size || nothing}">
        <petal-gb-icon>${knobs.icon}</petal-gb-icon>
        ${knobs.label}
      </petal-gb-fab>
      <petal-gb-fab color="tertiary" size="${knobs.size || nothing}">
        <petal-gb-icon>${knobs.icon}</petal-gb-icon>
        ${knobs.label}
      </petal-gb-fab>
    `;
  },
};

const sizes: MaterialStoryInit<StoryKnobs> = {
  name: 'Sizes',
  render(knobs) {
    return html`
      <petal-gb-fab color="${knobs.color || nothing}">
        <petal-gb-icon>${knobs.icon}</petal-gb-icon>
        ${knobs.label}
      </petal-gb-fab>
      <petal-gb-fab color="${knobs.color || nothing}" size="md">
        <petal-gb-icon>${knobs.icon}</petal-gb-icon>
        ${knobs.label}
      </petal-gb-fab>
      <petal-gb-fab color="${knobs.color || nothing}" size="lg">
        <petal-gb-icon>${knobs.icon}</petal-gb-icon>
        ${knobs.label}
      </petal-gb-fab>
    `;
  },
};

/** Fab stories. */
export const stories = [playground, extendedFab, colors, sizes];
