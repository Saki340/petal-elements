/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import 'petal-elements/labs/gb/components/button/md-gb-button.js';
import 'petal-elements/labs/gb/components/buttongroup/md-gb-button-group.js';
import 'petal-elements/labs/gb/styles/icon/md-gb-icon.js';

import {MaterialStoryInit} from './material-collection.js';
import {
  type ButtonColor,
  type ButtonSize,
} from 'petal-elements/labs/gb/components/button/button.js';
import {
  type ButtonGroupSelection,
  type ButtonGroupVariant,
} from 'petal-elements/labs/gb/components/buttongroup/button-group.js';
import {adoptStyles} from 'petal-elements/labs/gb/styles/adopt-styles.js';
import {styles as m3Styles} from 'petal-elements/labs/gb/styles/m3.cssresult.js';
import {css, html, nothing} from 'lit';

/** Knob types for button group stories. */
export interface StoryKnobs {
  variant?: ButtonGroupVariant;
  size?: ButtonSize;
  color?: ButtonColor;
  square?: boolean;
  selection?: ButtonGroupSelection;
  disabled?: boolean;
  icon?: string;
  showIcon1?: boolean;
  showIcon2?: boolean;
  showIcon3?: boolean;
  showIcon4?: boolean;
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
  css`
    .story-column {
      display: flex;
      flex-direction: column;
      gap: 24px;
      align-items: flex-start;
      text-align: left;
    }
    .story-row {
      display: flex;
      flex-direction: row;
      gap: 16px;
      align-items: center;
      flex-wrap: wrap;
    }
  `,
];

const playground: MaterialStoryInit<StoryKnobs> = {
  name: 'Playground',
  styles,
  render(knobs) {
    const renderIcon = (show?: boolean) =>
      show && knobs.icon
        ? html`<petal-gb-icon>${knobs.icon}</petal-gb-icon>`
        : nothing;

    const size = knobs.size ?? 'sm';
    const color = knobs.color ?? 'filled';
    const square = knobs.square ?? false;

    return html`
      <div class="story-column">
        <petal-gb-button-group
          aria-label="Playground button group"
          variant=${knobs.variant ?? 'standard'}
          selection=${knobs.selection ?? 'none'}
          ?disabled=${knobs.disabled ?? false}>
          <petal-gb-button
            value="btn1"
            size=${size}
            color=${color}
            ?square=${square}>
            ${renderIcon(knobs.showIcon1)}Option 1
          </petal-gb-button>
          <petal-gb-button
            value="btn2"
            size=${size}
            color=${color}
            ?square=${square}>
            ${renderIcon(knobs.showIcon2)}Option 2
          </petal-gb-button>
          <petal-gb-button
            value="btn3"
            size=${size}
            color=${color}
            ?square=${square}>
            ${renderIcon(knobs.showIcon3)}Option 3
          </petal-gb-button>
          <petal-gb-button
            value="btn4"
            size=${size}
            color=${color}
            ?square=${square}>
            ${renderIcon(knobs.showIcon4)}Option 4
          </petal-gb-button>
        </petal-gb-button-group>
      </div>
    `;
  },
};

const icons: MaterialStoryInit<StoryKnobs> = {
  name: 'Icons',
  styles,
  render(knobs) {
    const disabled = Boolean(knobs.disabled);

    return html`
      <div class="story-column">
        <h3>Icon-only</h3>
        <petal-gb-button-group
          aria-label="Text alignment buttons"
          variant="connected"
          selection="single"
          ?disabled=${disabled}>
          <petal-gb-button value="left" aria-label="Align left" size="sm" selected>
            <petal-gb-icon>format_align_left</petal-gb-icon>
          </petal-gb-button>
          <petal-gb-button value="center" aria-label="Align center" size="sm">
            <petal-gb-icon>format_align_center</petal-gb-icon>
          </petal-gb-button>
          <petal-gb-button value="right" aria-label="Align right" size="sm">
            <petal-gb-icon>format_align_right</petal-gb-icon>
          </petal-gb-button>
        </petal-gb-button-group>

        <h3>Icon and label</h3>
        <petal-gb-button-group
          aria-label="Media controls"
          variant="connected"
          selection="single"
          ?disabled=${disabled}>
          <petal-gb-button value="play" size="sm">
            <petal-gb-icon>play_arrow</petal-gb-icon>
            Play
          </petal-gb-button>
          <petal-gb-button value="pause" size="sm">
            <petal-gb-icon>pause</petal-gb-icon>
            Pause
          </petal-gb-button>
          <petal-gb-button value="stop" size="sm">
            <petal-gb-icon>stop</petal-gb-icon>
            Stop
          </petal-gb-button>
        </petal-gb-button-group>

        <h3>Mixed set</h3>
        <petal-gb-button-group
          aria-label="Mixed icon and text actions"
          variant="connected"
          ?disabled=${disabled}>
          <petal-gb-button value="starred" size="sm">
            <petal-gb-icon>star</petal-gb-icon>
            Starred
          </petal-gb-button>
          <petal-gb-button value="all" size="sm">All</petal-gb-button>
          <petal-gb-button value="archive" size="sm">
            <petal-gb-icon>archive</petal-gb-icon>
            Archive
          </petal-gb-button>
        </petal-gb-button-group>
      </div>
    `;
  },
};

/** Button Group stories. */
export const stories = [playground, icons];
