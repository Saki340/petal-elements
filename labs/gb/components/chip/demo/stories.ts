/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import 'petal-elements/labs/gb/components/chip/md-gb-chip.js';
import 'petal-elements/labs/gb/styles/icon/md-gb-icon.js';

import {MaterialStoryInit} from './material-collection.js';
import {
  type ChipColor,
  type ChipType,
} from 'petal-elements/labs/gb/components/chip/chip.js';
import {adoptStyles} from 'petal-elements/labs/gb/styles/adopt-styles.js';
import {styles as m3Styles} from 'petal-elements/labs/gb/styles/m3.cssresult.js';
import {css, html} from 'lit';

/** Knob types for chip stories. */
export interface StoryKnobs {
  color?: ChipColor;
  type?: ChipType;
  selected?: boolean;
  removable?: boolean;
  disabled?: boolean;
  softDisabled?: boolean;
}

adoptStyles(document, [
  m3Styles,
  css`
    :root {
      --md-icon-font: 'Material Symbols Outlined';
    }
  `,
]);

const styles = css`
  :host,
  .demo-group {
    font-family: var(
      --md-sys-typescale-body-md-font,
      var(--md-ref-typeface-plain, Roboto, sans-serif)
    );
  }
  .demo-group {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    align-items: center;
    margin-bottom: 24px;
    padding: 16px;
    border: 1px solid var(--md-sys-color-outline-variant);
    border-radius: 16px;
    background-color: var(--md-sys-color-surface);
  }
  .chip-avatar {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background-color: var(--md-sys-color-primary);
    color: var(--md-sys-color-on-primary);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 600;
  }
`;

const playground: MaterialStoryInit<StoryKnobs> = {
  name: 'Playground',
  styles,
  render(knobs) {
    return html`
      <div class="demo-group">
        <petal-gb-chip
          color=${knobs.color || 'elevated'}
          type=${knobs.type || 'action'}
          ?selected=${knobs.selected ?? false}
          ?removable=${knobs.removable ?? false}
          ?disabled=${knobs.disabled ?? false}
          ?soft-disabled=${knobs.softDisabled ?? false}>
          <petal-gb-icon slot="icon">star</petal-gb-icon>
          Expressive Chip
        </petal-gb-chip>
      </div>
    `;
  },
};

const variants: MaterialStoryInit<StoryKnobs> = {
  name: 'Expressive Action Variants',
  styles,
  render() {
    return html`
      <div class="demo-group">
        <petal-gb-chip color="elevated">
          <petal-gb-icon slot="icon">schedule</petal-gb-icon>
          Elevated Action
        </petal-gb-chip>
        <petal-gb-chip color="filled">
          <petal-gb-icon slot="icon">flight</petal-gb-icon>
          Filled Action
        </petal-gb-chip>
        <petal-gb-chip color="tonal">
          <petal-gb-icon slot="icon">event</petal-gb-icon>
          Tonal Action
        </petal-gb-chip>
        <petal-gb-chip color="outlined">
          <petal-gb-icon slot="icon">bookmark</petal-gb-icon>
          Outlined Action
        </petal-gb-chip>
      </div>
    `;
  },
};

const functional: MaterialStoryInit<StoryKnobs> = {
  name: 'Filter & Removable Chip',
  styles,
  render() {
    return html`
      <div class="demo-group">
        <petal-gb-chip type="filter" color="elevated"
          >Unselected Filter</petal-gb-chip
        >
        <petal-gb-chip type="filter" color="elevated" selected
          >Selected Filter</petal-gb-chip
        >
        <petal-gb-chip removable color="tonal">Removable Tag</petal-gb-chip>
        <petal-gb-chip removable color="outlined" disabled
          >Disabled Tag</petal-gb-chip
        >
      </div>
    `;
  },
};

const avatarsAndIcons: MaterialStoryInit<StoryKnobs> = {
  name: 'Avatars & Leading Icons',
  styles,
  render() {
    return html`
      <div class="demo-group">
        <petal-gb-chip color="elevated">
          <span slot="icon" class="chip-avatar">A</span>
          Avatar Chip
        </petal-gb-chip>
        <petal-gb-chip color="tonal" removable>
          <span slot="icon" class="chip-avatar">B</span>
          Removable Avatar
        </petal-gb-chip>
        <petal-gb-chip color="outlined">
          <petal-gb-icon slot="icon">face</petal-gb-icon>
          Leading Icon Chip
        </petal-gb-chip>
      </div>
    `;
  },
};

/** Chip stories. */
export const stories = [playground, variants, functional, avatarsAndIcons];
