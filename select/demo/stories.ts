/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import 'petal-elements/icon/icon.js';
import 'petal-elements/select/filled-select.js';
import 'petal-elements/select/outlined-select.js';
import 'petal-elements/select/select-option.js';

import {MaterialStoryInit} from './material-collection.js';
import {html, nothing} from 'lit';

/** Knob types for select stories. */
export interface StoryKnobs {
  'md-select': void;
  label: string;
  typeaheadDelay: number;
  quick: boolean;
  required: boolean;
  noAsterisk: boolean;
  disabled: boolean;
  errorText: string;
  supportingText: string;
  error: boolean;
  noClampMenuWidth: boolean;
  menuAlign: 'start' | 'end' | undefined;
  menuPositioning: 'absolute' | 'fixed' | 'popover' | undefined;

  'md-select Slots': void;
  'slot=leading-icon': string;
  'slot=trailing-icon': string;
}

const selects: MaterialStoryInit<StoryKnobs> = {
  name: 'Selects',
  render(knobs) {
    return html`
      <div style="display: flex; gap: 16px;">
        <petal-filled-select
          .label=${knobs.label}
          .quick=${knobs.quick}
          .required=${knobs.required}
          .noAsterisk=${knobs.noAsterisk}
          .disabled=${knobs.disabled}
          .errorText=${knobs.errorText}
          .supportingText=${knobs.supportingText}
          .noClampMenuWidth=${knobs.noClampMenuWidth}
          .menuAlign=${knobs.menuAlign!}
          .menuPositioning=${knobs.menuPositioning!}
          .typeaheadDelay=${knobs.typeaheadDelay}
          .error=${knobs.error}>
          ${renderIcon(knobs['slot=leading-icon'], 'leading-icon')}
          ${renderIcon(knobs['slot=trailing-icon'], 'trailing-icon')}
          ${renderItems()}
        </petal-filled-select>

        <petal-outlined-select
          .label=${knobs.label}
          .quick=${knobs.quick}
          .required=${knobs.required}
          .noAsterisk=${knobs.noAsterisk}
          .disabled=${knobs.disabled}
          .errorText=${knobs.errorText}
          .supportingText=${knobs.supportingText}
          .noClampMenuWidth=${knobs.noClampMenuWidth}
          .menuAlign=${knobs.menuAlign!}
          .menuPositioning=${knobs.menuPositioning!}
          .typeaheadDelay=${knobs.typeaheadDelay}
          .error=${knobs.error}>
          ${renderIcon(knobs['slot=leading-icon'], 'leading-icon')}
          ${renderIcon(knobs['slot=trailing-icon'], 'trailing-icon')}
          ${renderItems()}
        </petal-outlined-select>
      </div>
    `;
  },
};

function renderIcon(iconName: string, slot: 'leading-icon' | 'trailing-icon') {
  return iconName
    ? html`<petal-icon slot=${slot}><span>${iconName}</span></petal-icon>`
    : nothing;
}

function renderItems() {
  return html` <petal-select-option aria-label="blank" value=""></petal-select-option>
    <petal-select-option selected value="apple">
      <div slot="headline">Apple</div>
    </petal-select-option>
    <petal-select-option value="apricot">
      <div slot="headline">Apricot</div>
    </petal-select-option>
    <petal-select-option value="apricot">
      <div slot="headline">Apricots</div>
    </petal-select-option>
    <petal-select-option value="avocado">
      <div slot="headline">Avocado</div>
    </petal-select-option>
    <petal-select-option value="green_apple">
      <div slot="headline">Green Apple</div>
    </petal-select-option>
    <petal-select-option value="green_grapes">
      <div slot="headline">Green Grapes</div>
    </petal-select-option>
    <petal-select-option value="olive">
      <div slot="headline">Olive</div>
    </petal-select-option>
    <petal-select-option value="orange">
      <div slot="headline">Orange</div>
    </petal-select-option>`;
}

/** Select stories. */
export const stories = [selects];
