/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import 'petal-elements/labs/gb/components/button/md-gb-button.js';
import 'petal-elements/labs/gb/styles/icon/md-gb-icon.js';

import {MaterialStoryInit} from './material-collection.js';
import {
  ButtonColor,
  ButtonSize,
} from 'petal-elements/labs/gb/components/button/button.js';
import {adoptStyles} from 'petal-elements/labs/gb/styles/adopt-styles.js';
import {styles as m3Styles} from 'petal-elements/labs/gb/styles/m3.cssresult.js';
import {css, html, nothing} from 'lit';

/** Knob types for button stories. */
export interface StoryKnobs {
  icon?: string;
  color?: ButtonColor;
  size?: ButtonSize;
  square: boolean;
  disabled: boolean;
  softDisabled: boolean;
  toggle: boolean;
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
      <petal-gb-button
        color=${knobs.color || nothing}
        size=${knobs.size || nothing}
        ?square=${knobs.square}
        ?disabled=${knobs.disabled}
        ?soft-disabled=${knobs.softDisabled}
        type=${knobs.toggle ? 'toggle' : nothing}>
        ${knobs.icon ? html`<petal-gb-icon>${knobs.icon}</petal-gb-icon>` : nothing}
        Label
      </petal-gb-button>
    `;
  },
};

const colors: MaterialStoryInit<StoryKnobs> = {
  name: 'Colors',
  render(knobs) {
    return html`
      <petal-gb-button
        color="filled"
        size=${knobs.size || nothing}
        ?square=${knobs.square}
        ?disabled=${knobs.disabled}
        ?soft-disabled=${knobs.softDisabled}
        type=${knobs.toggle ? 'toggle' : nothing}>
        ${knobs.icon ? html`<petal-gb-icon>${knobs.icon}</petal-gb-icon>` : nothing}
        Filled
      </petal-gb-button>
      <petal-gb-button
        color="elevated"
        size=${knobs.size || nothing}
        ?square=${knobs.square}
        ?disabled=${knobs.disabled}
        ?soft-disabled=${knobs.softDisabled}
        type=${knobs.toggle ? 'toggle' : nothing}>
        ${knobs.icon ? html`<petal-gb-icon>${knobs.icon}</petal-gb-icon>` : nothing}
        Elevated
      </petal-gb-button>
      <petal-gb-button
        color="outlined"
        size=${knobs.size || nothing}
        ?square=${knobs.square}
        ?disabled=${knobs.disabled}
        ?soft-disabled=${knobs.softDisabled}
        type=${knobs.toggle ? 'toggle' : nothing}>
        ${knobs.icon ? html`<petal-gb-icon>${knobs.icon}</petal-gb-icon>` : nothing}
        Outlined
      </petal-gb-button>
      <petal-gb-button
        color="tonal"
        size=${knobs.size || nothing}
        ?square=${knobs.square}
        ?disabled=${knobs.disabled}
        ?soft-disabled=${knobs.softDisabled}
        type=${knobs.toggle ? 'toggle' : nothing}>
        ${knobs.icon ? html`<petal-gb-icon>${knobs.icon}</petal-gb-icon>` : nothing}
        Tonal
      </petal-gb-button>
      <petal-gb-button
        color="text"
        size=${knobs.size || nothing}
        ?square=${knobs.square}
        ?disabled=${knobs.disabled}
        ?soft-disabled=${knobs.softDisabled}
        type=${knobs.toggle ? 'toggle' : nothing}>
        ${knobs.icon ? html`<petal-gb-icon>${knobs.icon}</petal-gb-icon>` : nothing}
        Text
      </petal-gb-button>
    `;
  },
};

const sizes: MaterialStoryInit<StoryKnobs> = {
  name: 'Sizes',
  render(knobs) {
    return html`
      <petal-gb-button
        size="xs"
        color=${knobs.color || nothing}
        ?square=${knobs.square}
        ?disabled=${knobs.disabled}
        ?soft-disabled=${knobs.softDisabled}
        type=${knobs.toggle ? 'toggle' : nothing}>
        ${knobs.icon ? html`<petal-gb-icon>${knobs.icon}</petal-gb-icon>` : nothing}
        XS
      </petal-gb-button>
      <petal-gb-button
        size="sm"
        color=${knobs.color || nothing}
        ?square=${knobs.square}
        ?disabled=${knobs.disabled}
        ?soft-disabled=${knobs.softDisabled}
        type=${knobs.toggle ? 'toggle' : nothing}>
        ${knobs.icon ? html`<petal-gb-icon>${knobs.icon}</petal-gb-icon>` : nothing}
        SM
      </petal-gb-button>
      <petal-gb-button
        size="md"
        color=${knobs.color || nothing}
        ?square=${knobs.square}
        ?disabled=${knobs.disabled}
        ?soft-disabled=${knobs.softDisabled}
        type=${knobs.toggle ? 'toggle' : nothing}>
        ${knobs.icon ? html`<petal-gb-icon>${knobs.icon}</petal-gb-icon>` : nothing}
        MD
      </petal-gb-button>
      <petal-gb-button
        size="lg"
        color=${knobs.color || nothing}
        ?square=${knobs.square}
        ?disabled=${knobs.disabled}
        ?soft-disabled=${knobs.softDisabled}
        type=${knobs.toggle ? 'toggle' : nothing}>
        ${knobs.icon ? html`<petal-gb-icon>${knobs.icon}</petal-gb-icon>` : nothing}
        LG
      </petal-gb-button>
      <petal-gb-button
        size="xl"
        color=${knobs.color || nothing}
        ?square=${knobs.square}
        ?disabled=${knobs.disabled}
        ?soft-disabled=${knobs.softDisabled}
        type=${knobs.toggle ? 'toggle' : nothing}>
        ${knobs.icon ? html`<petal-gb-icon>${knobs.icon}</petal-gb-icon>` : nothing}
        XL
      </petal-gb-button>
    `;
  },
};

/** Button stories. */
export const stories = [playground, colors, sizes];
