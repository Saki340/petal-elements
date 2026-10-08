/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import 'petal-elements/divider/divider.js';
import 'petal-elements/icon/icon.js';
import 'petal-elements/list/list.js';
import 'petal-elements/list/list-item.js';

import {MaterialStoryInit} from './material-collection.js';
import {css, html, nothing} from 'lit';
import {classMap} from 'lit/directives/class-map.js';

/** Knob types for list stories. */
export interface StoryKnobs {
  disabled: boolean;
  overline: string;
  trailingSupportingText: string;
  leadingIcon: boolean;
  trailingIcon: boolean;
}

const styles = css`
  petal-list {
    border-radius: 8px;
    outline: 1px solid var(--md-sys-color-outline);
    max-width: 360px;
    overflow: hidden;
    width: 100%;
  }
`;

const standard: MaterialStoryInit<StoryKnobs> = {
  name: 'List',
  styles,
  render(knobs) {
    return html`
      <petal-list aria-label="Static example">
        <petal-list-item ?disabled=${knobs.disabled}>
          Single line item ${getKnobContent(knobs)}
        </petal-list-item>

        <petal-list-item ?disabled=${knobs.disabled}>
          Two line item
          <div slot="supporting-text">Supporting text</div>
          ${getKnobContent(knobs)}
        </petal-list-item>

        <petal-list-item ?disabled=${knobs.disabled}>
          Three line item
          <div slot="supporting-text">
            <div>Second line text</div>
            <div>Third line text</div>
          </div>
          ${getKnobContent(knobs, /* threeLines */ true)}
        </petal-list-item>
      </petal-list>
    `;
  },
};

const interactive: MaterialStoryInit<StoryKnobs> = {
  name: 'Interactive list',
  styles,
  render(knobs) {
    const knobsNoTrailing = {...knobs, trailingIcon: false};
    return html`
      <petal-list aria-label="Interactive example">
        <petal-list-item
          ?disabled=${knobs.disabled}
          type="link"
          href="https://google.com"
          target="_blank">
          Link item
          <petal-icon slot="end">link</petal-icon>
          ${getKnobContent(knobsNoTrailing)}
        </petal-list-item>

        <petal-list-item type="button" ?disabled=${knobs.disabled}>
          Button item ${getKnobContent(knobs)}
        </petal-list-item>

        <petal-list-item ?disabled=${knobs.disabled}>
          Non-interactive item ${knobs.disabled ? '(disabled)' : nothing}
          ${getKnobContent(knobs)}
        </petal-list-item>
      </petal-list>
    `;
  },
};

function getKnobContent(knobs: StoryKnobs, threeLines = false) {
  const overline = knobs.overline
    ? html`<div slot="overline">${knobs.overline}</div>`
    : nothing;

  const classes = {
    'align-start': threeLines,
  };

  const trailingText = knobs.trailingSupportingText
    ? html`<div class=${classMap(classes)} slot="trailing-supporting-text"
        >${knobs.trailingSupportingText}</div
      >`
    : nothing;

  const leadingIcon = knobs.leadingIcon
    ? html`<petal-icon class=${classMap(classes)} slot="start">event</petal-icon>`
    : nothing;

  const trailingIcon = knobs.trailingIcon
    ? html`<petal-icon class=${classMap(classes)} slot="end">star</petal-icon>`
    : nothing;

  return [overline, trailingText, leadingIcon, trailingIcon];
}

/** List stories. */
export const stories = [standard, interactive];
