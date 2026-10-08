/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import '@material/web/button/outlined-button.js';
import '@material/web/button/text-button.js';
import '@material/web/icon/icon.js';
import '@material/web/iconbutton/icon-button.js';
import '@material/web/textfield/filled-text-field.js';
import '@material/web/textfield/outlined-text-field.js';

import {MaterialStoryInit} from './material-collection.js';
import {PetalFilledTextField} from '@material/web/textfield/filled-text-field.js';
import {css, html, nothing} from 'lit';

/** Knob types for Textfield stories. */
export interface StoryKnobs {
  label: string;
  placeholder: string;
  disabled: boolean;
  prefixText: string;
  suffixText: string;
  supportingText: string;
}

// Set min-height for resizable textareas
const styles = css`
  .row {
    align-items: flex-start;
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
  }

  petal-filled-text-field,
  petal-outlined-text-field {
    width: 200px;
  }

  [type='textarea'] {
    min-height: 56px;
  }

  [type='textarea'][supporting-text] {
    min-height: 76px;
  }
`;

const textfields: MaterialStoryInit<StoryKnobs> = {
  name: 'Text fields',
  styles,
  render(knobs) {
    return html`
      <div class="row">
        <petal-filled-text-field
          ?disabled=${knobs.disabled}
          label=${knobs.label || nothing}
          placeholder=${knobs.placeholder || nothing}
          prefix-text=${knobs.prefixText || nothing}
          suffix-text=${knobs.suffixText || nothing}
          supporting-text=${knobs.supportingText ||
          nothing}></petal-filled-text-field>

        <petal-outlined-text-field
          ?disabled=${knobs.disabled}
          label=${knobs.label || nothing}
          placeholder=${knobs.placeholder || nothing}
          prefix-text=${knobs.prefixText || nothing}
          suffix-text=${knobs.suffixText || nothing}
          supporting-text=${knobs.supportingText ||
          nothing}></petal-outlined-text-field>
      </div>
    `;
  },
};

const textareas: MaterialStoryInit<StoryKnobs> = {
  name: 'Text areas',
  styles,
  render(knobs) {
    return html`
      <div class="row">
        <petal-filled-text-field
          type="textarea"
          ?disabled=${knobs.disabled}
          label=${knobs.label || nothing}
          placeholder=${knobs.placeholder || nothing}
          supporting-text=${knobs.supportingText ||
          nothing}></petal-filled-text-field>

        <petal-outlined-text-field
          type="textarea"
          ?disabled=${knobs.disabled}
          label=${knobs.label || nothing}
          placeholder=${knobs.placeholder || nothing}
          supporting-text=${knobs.supportingText ||
          nothing}></petal-outlined-text-field>
      </div>
    `;
  },
};

const icons: MaterialStoryInit<StoryKnobs> = {
  name: 'Icons',
  styles,
  render(knobs) {
    return html`
      <div class="row">
        <petal-filled-text-field
          ?disabled=${knobs.disabled}
          label=${knobs.label || nothing}
          placeholder=${knobs.placeholder || nothing}
          value="Value"
          prefix-text=${knobs.prefixText || nothing}
          suffix-text=${knobs.suffixText || nothing}
          supporting-text=${knobs.supportingText || nothing}>
          <petal-icon slot="leading-icon">search</petal-icon>
          <petal-icon-button
            aria-label="Clear input"
            ?disabled=${knobs.disabled}
            slot="trailing-icon"
            @click=${clearInput}>
            <petal-icon>clear</petal-icon>
          </petal-icon-button>
        </petal-filled-text-field>

        <petal-outlined-text-field
          ?disabled=${knobs.disabled}
          label=${knobs.label || nothing}
          placeholder=${knobs.placeholder || nothing}
          value="Value"
          prefix-text=${knobs.prefixText || nothing}
          suffix-text=${knobs.suffixText || nothing}
          supporting-text=${knobs.supportingText || nothing}>
          <petal-icon slot="leading-icon">search</petal-icon>
          <petal-icon-button
            aria-label="Clear input"
            ?disabled=${knobs.disabled}
            slot="trailing-icon"
            @click=${clearInput}>
            <petal-icon>clear</petal-icon>
          </petal-icon-button>
        </petal-outlined-text-field>
      </div>
    `;
  },
};

const validation: MaterialStoryInit<StoryKnobs> = {
  name: 'Validation',
  styles,
  render(knobs) {
    return html`
      <div class="row">
        <petal-outlined-text-field
          ?disabled=${knobs.disabled}
          label="Required"
          value="Value"
          required
          supporting-text="* this field is required"
          @change=${reportValidity}></petal-outlined-text-field>

        <petal-outlined-text-field
          ?disabled=${knobs.disabled}
          type="number"
          label="Numeric"
          min="1"
          max="10"
          supporting-text="Enter a number between 1 and 10"
          @change=${reportValidity}></petal-outlined-text-field>

        <petal-outlined-text-field
          ?disabled=${knobs.disabled}
          label="Length"
          minlength="3"
          maxlength="10"
          supporting-text="3 to 10 characters"
          @change=${reportValidity}></petal-outlined-text-field>

        <petal-outlined-text-field
          style="text-align: end"
          ?disabled=${knobs.disabled}
          label="Pattern"
          pattern="[a-zA-Z]+"
          placeholder="username"
          suffix-text="@gmail.com"
          supporting-text="Characters only"
          @change=${reportValidity}></petal-outlined-text-field>
      </div>
    `;
  },
};

const forms: MaterialStoryInit<StoryKnobs> = {
  name: 'Forms',
  styles: [
    styles,
    css`
      .buttons {
        justify-content: flex-end;
        padding: 16px;
      }
    `,
  ],
  render(knobs) {
    return html`
      <form @submit=${alertValues}>
        <div class="row">
          <petal-filled-text-field
            ?disabled=${knobs.disabled}
            label="First name"
            name="first-name"
            required
            no-asterisk
            autocomplete="given-name"></petal-filled-text-field>
          <petal-filled-text-field
            ?disabled=${knobs.disabled}
            label="Last name"
            name="last-name"
            required
            no-asterisk
            autocomplete="family-name"></petal-filled-text-field>
        </div>
        <div class="row buttons">
          <petal-text-button type="reset">Reset</petal-text-button>
          <petal-outlined-button type="submit">Submit</petal-outlined-button>
        </div>
      </form>
    `;
  },
};

async function reportValidity(event: Event) {
  const textField = event.target as PetalFilledTextField;
  textField.reportValidity();
}

function clearInput(event: Event) {
  const iconButton = event.target as HTMLElement;
  const textField = iconButton.parentElement as PetalFilledTextField;
  iconButton.blur();
  textField.value = '';
  textField.focus();
}

function alertValues(event: SubmitEvent) {
  event.preventDefault();
  const data = new FormData(event.target as HTMLFormElement);
  const first = data.get('first-name') || '<empty>';
  const last = data.get('last-name') || '<empty>';
  alert(`First name: ${first}, Last name: ${last}`);
}

/** Textfield stories. */
export const stories = [textfields, textareas, icons, validation, forms];
