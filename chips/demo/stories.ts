/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import 'petal-elements/chips/assist-chip.js';
import 'petal-elements/chips/chip-set.js';
import 'petal-elements/chips/filter-chip.js';
import 'petal-elements/chips/input-chip.js';
import 'petal-elements/chips/suggestion-chip.js';
import 'petal-elements/icon/icon.js';

import {MaterialStoryInit} from './material-collection.js';
import {css, html, svg} from 'lit';
import {classMap} from 'lit/directives/class-map.js';

/** Knob types for chips stories. */
export interface StoryKnobs {
  label: string;
  elevated: boolean;
  disabled: boolean;
  scrolling: boolean;
}

const LOGO = svg`
  <svg viewBox="0 0 36 36" slot="icon">
    <ellipse cx="18" cy="10" rx="5" ry="8" fill="#F48FB1"></ellipse>
    <ellipse cx="26" cy="18" rx="8" ry="5" fill="#EC407A"></ellipse>
    <ellipse cx="18" cy="26" rx="5" ry="8" fill="#F06292"></ellipse>
    <ellipse cx="10" cy="18" rx="8" ry="5" fill="#F8BBD0"></ellipse>
    <circle cx="18" cy="18" r="4" fill="#FFD54F"></circle>
  </svg>
`;

const styles = css`
  petal-chip-set.scrolling {
    flex-wrap: nowrap;
    max-width: 512px;
    overflow: scroll;
    /** Add room for focus ring. */
    padding: 8px;
  }
`;

const assist: MaterialStoryInit<StoryKnobs> = {
  name: 'Assist chips',
  styles,
  render({label, elevated, disabled, scrolling}) {
    const classes = {'scrolling': scrolling};
    return html`
      <petal-chip-set class=${classMap(classes)} aria-label="Assist chips">
        <petal-assist-chip ?disabled=${disabled} ?elevated=${elevated}>
          ${label || 'Assist chip'}
        </petal-assist-chip>
        <petal-assist-chip ?disabled=${disabled} ?elevated=${elevated}>
          <petal-icon slot="icon">local_laundry_service</petal-icon>
          ${label || 'Assist chip with icon'}
        </petal-assist-chip>
        <petal-assist-chip
          ?elevated=${elevated}
          href="https://google.com"
          target="_blank">
          ${LOGO} ${label || 'Assist link chip'}
        </petal-assist-chip>
        <petal-assist-chip soft-disabled always-focusable ?elevated=${elevated}>
          ${label || 'Soft-disabled assist chip (focusable)'}
        </petal-assist-chip>
      </petal-chip-set>
    `;
  },
};

const filters: MaterialStoryInit<StoryKnobs> = {
  name: 'Filter chips',
  styles,
  render({label, elevated, disabled, scrolling}) {
    const classes = {'scrolling': scrolling};
    return html`
      <petal-chip-set class=${classMap(classes)} aria-label="Filter chips">
        <petal-filter-chip ?disabled=${disabled} ?elevated=${elevated}>
          ${label || 'Filter chip'}
        </petal-filter-chip>
        <petal-filter-chip ?disabled=${disabled} ?elevated=${elevated}>
          <petal-icon slot="icon">local_laundry_service</petal-icon>
          ${label || 'Filter chip with icon'}
        </petal-filter-chip>
        <petal-filter-chip ?disabled=${disabled} ?elevated=${elevated} removable>
          ${label || 'Removable filter chip'}
        </petal-filter-chip>
        <petal-filter-chip
          soft-disabled
          always-focusable
          ?elevated=${elevated}
          removable>
          ${label || 'Soft-disabled filter chip (focusable)'}
        </petal-filter-chip>
      </petal-chip-set>
    `;
  },
};

const inputs: MaterialStoryInit<StoryKnobs> = {
  name: 'Input chips',
  styles,
  render({label, disabled, scrolling}) {
    const classes = {'scrolling': scrolling};
    return html`
      <petal-chip-set class=${classMap(classes)} aria-label="Input chips">
        <petal-input-chip ?disabled=${disabled}>
          ${label || 'Input chip'}
        </petal-input-chip>
        <petal-input-chip ?disabled=${disabled}>
          <petal-icon slot="icon">local_laundry_service</petal-icon>
          ${label || 'Input chip with icon'}
        </petal-input-chip>
        <petal-input-chip ?disabled=${disabled} avatar>
          <img
            slot="icon"
            src="https://lh3.googleusercontent.com/a/default-user=s48" />
          ${label || 'Input chip with avatar'}
        </petal-input-chip>
        <petal-input-chip href="https://google.com" target="_blank"
          >${LOGO} ${label || 'Input link chip'}</petal-input-chip
        >
        <petal-input-chip ?disabled=${disabled} remove-only>
          ${label || 'Remove-only input chip'}
        </petal-input-chip>
        <petal-input-chip soft-disabled always-focusable>
          ${label || 'Soft-disabled input chip (focusable)'}
        </petal-input-chip>
      </petal-chip-set>
    `;
  },
};

const suggestions: MaterialStoryInit<StoryKnobs> = {
  name: 'Suggestion chips',
  styles,
  render({label, elevated, disabled, scrolling}) {
    const classes = {'scrolling': scrolling};
    return html`
      <petal-chip-set class=${classMap(classes)} aria-label="Suggestion chips">
        <petal-suggestion-chip ?disabled=${disabled} ?elevated=${elevated}>
          ${label || 'Suggestion chip'}
        </petal-suggestion-chip>
        <petal-suggestion-chip ?disabled=${disabled} ?elevated=${elevated}>
          <petal-icon slot="icon">local_laundry_service</petal-icon>
          ${label || 'Suggestion chip with icon'}
        </petal-suggestion-chip>
        <petal-suggestion-chip
          ?elevated=${elevated}
          href="https://google.com"
          target="_blank"
          >${LOGO} ${label || 'Suggestion link chip'}</petal-suggestion-chip
        >
        <petal-suggestion-chip
          soft-disabled
          always-focusable
          ?elevated=${elevated}>
          ${label || 'Soft-disabled suggestion chip (focusable)'}
        </petal-suggestion-chip>
      </petal-chip-set>
    `;
  },
};

/** Chips stories. */
export const stories = [assist, filters, inputs, suggestions];
