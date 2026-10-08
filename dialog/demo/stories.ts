/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import '@material/web/button/filled-button.js';
import '@material/web/button/filled-tonal-button.js';
import '@material/web/button/text-button.js';
import '@material/web/dialog/dialog.js';
import '@material/web/icon/icon.js';
import '@material/web/iconbutton/icon-button.js';
import '@material/web/radio/radio.js';
import '@material/web/textfield/filled-text-field.js';

import {PetalDialog} from '@material/web/dialog/dialog.js';
import {MaterialStoryInit} from './material-collection.js';
import {css, html, nothing} from 'lit';

/** Knob types for dialog stories. */
export interface StoryKnobs {
  quick: boolean;
  noFocusTrap: boolean;
  icon: string;
  headline: string;
  supportingText: string;
}

function showDialog(event: Event) {
  ((event.target as Element).nextElementSibling as PetalDialog)?.show();
}

const standard: MaterialStoryInit<StoryKnobs> = {
  name: 'Dialog',
  render({icon, headline, supportingText, quick, noFocusTrap}) {
    return html`
      <petal-filled-button @click=${showDialog} aria-label="Open a dialog">
        Open
      </petal-filled-button>

      <petal-dialog
        aria-label=${headline ? nothing : 'A simple dialog'}
        ?quick=${quick}
        ?no-focus-trap=${noFocusTrap}>
        ${icon ? html`<petal-icon slot="icon">${icon}</petal-icon>` : nothing}
        <div slot="headline">${headline}</div>
        <form id="form" slot="content" method="dialog">
          <span>${supportingText}</span>
        </form>
        <div slot="actions">
          <petal-text-button form="form" value="close">Close</petal-text-button>
          <petal-text-button form="form" value="ok" autofocus>OK</petal-text-button>
        </div>
      </petal-dialog>
    `;
  },
};

const alert: MaterialStoryInit<StoryKnobs> = {
  name: 'Alert',
  render({quick, noFocusTrap}) {
    return html`
      <petal-filled-button @click=${showDialog} aria-label="Open an alert dialog">
        Alert
      </petal-filled-button>

      <petal-dialog type="alert" ?quick=${quick} ?no-focus-trap=${noFocusTrap}>
        <div slot="headline">Alert dialog</div>
        <form id="form" slot="content" method="dialog">
          This is a standard alert dialog. Alert dialogs interrupt users with
          urgent information, details, or actions.
        </form>
        <div slot="actions">
          <petal-text-button form="form" value="ok">OK</petal-text-button>
        </div>
      </petal-dialog>
    `;
  },
};

const confirm: MaterialStoryInit<StoryKnobs> = {
  name: 'Confirm',
  render({quick, noFocusTrap}) {
    return html`
      <petal-filled-button
        @click=${showDialog}
        aria-label="Open a confirmation dialog">
        Confirm
      </petal-filled-button>

      <petal-dialog
        style="max-width: 320px;"
        ?quick=${quick}
        ?no-focus-trap=${noFocusTrap}>
        <div slot="headline">Permanently delete?</div>
        <petal-icon slot="icon">delete_outline</petal-icon>
        <form id="form" slot="content" method="dialog">
          Deleting the selected photos will also remove them from all synced
          devices.
        </form>
        <div slot="actions">
          <petal-text-button form="form" value="delete">Delete</petal-text-button>
          <petal-filled-tonal-button form="form" value="cancel" autofocus
            >Cancel</petal-filled-tonal-button
          >
        </div>
      </petal-dialog>
    `;
  },
};

const choose: MaterialStoryInit<StoryKnobs> = {
  name: 'Choose',
  styles: css`
    label {
      display: flex;
      align-items: center;
    }
  `,
  render({quick, noFocusTrap}) {
    return html`
      <petal-filled-button @click=${showDialog} aria-label="Open a choice dialog">
        Choice
      </petal-filled-button>

      <petal-dialog ?quick=${quick} ?no-focus-trap=${noFocusTrap}>
        <div slot="headline">Choose your favorite pet</div>
        <form id="form" slot="content" method="dialog">
          <label>
            <petal-radio
              name="pet"
              value="cats"
              aria-label="Cats"
              touch-target="wrapper"
              checked></petal-radio>
            <span aria-hidden="true">Cats</span>
          </label>
          <label>
            <petal-radio
              name="pet"
              value="dogs"
              aria-label="Dogs"
              touch-target="wrapper"></petal-radio>
            <span aria-hidden="true">Dogs</span>
          </label>
          <label>
            <petal-radio
              name="pet"
              value="birds"
              aria-label="Birds"
              touch-target="wrapper"></petal-radio>
            <span aria-hidden="true">Birds</span>
          </label>
        </form>
        <div slot="actions">
          <petal-text-button form="form" value="cancel">Cancel</petal-text-button>
          <petal-text-button form="form" autofocus value="ok">OK</petal-text-button>
        </div>
      </petal-dialog>
    `;
  },
};

const contacts: MaterialStoryInit<StoryKnobs> = {
  name: 'Form',
  styles: css`
    .contacts {
      min-width: calc(100vw - 212px);
    }

    .contacts [slot='header'] {
      display: flex;
      flex-direction: row-reverse;
      align-items: center;
    }

    .contacts .headline {
      flex: 1;
    }

    .contact-content,
    .contact-row {
      display: flex;
      gap: 8px;
    }

    .contact-content {
      flex-direction: column;
    }

    .contact-row > * {
      flex: 1;
    }
  `,
  render({quick, noFocusTrap}) {
    return html`
      <petal-filled-button @click=${showDialog} aria-label="Open a form dialog">
        Form
      </petal-filled-button>

      <petal-dialog class="contacts" ?quick=${quick} ?no-focus-trap=${noFocusTrap}>
        <span slot="headline">
          <petal-icon-button form="form" value="close" aria-label="Close dialog">
            <petal-icon>close</petal-icon>
          </petal-icon-button>
          <span class="headline">Create new contact</span>
        </span>
        <form id="form" slot="content" method="dialog" class="contact-content">
          <div class="contact-row">
            <petal-filled-text-field
              autofocus
              label="First Name"></petal-filled-text-field>
            <petal-filled-text-field label="Last Name"></petal-filled-text-field>
          </div>
          <div class="contact-row">
            <petal-filled-text-field label="Company"></petal-filled-text-field>
            <petal-filled-text-field label="Job Title"></petal-filled-text-field>
          </div>
          <petal-filled-text-field label="Email"></petal-filled-text-field>
          <petal-filled-text-field label="Phone"></petal-filled-text-field>
        </form>
        <div slot="actions">
          <petal-text-button form="form" value="reset" type="reset"
            >Reset</petal-text-button
          >
          <div style="flex: 1"></div>
          <petal-text-button form="form" value="cancel">Cancel</petal-text-button>
          <petal-text-button form="form" value="save">Save</petal-text-button>
        </div>
      </petal-dialog>
    `;
  },
};

const floatingSheet: MaterialStoryInit<StoryKnobs> = {
  name: 'Floating sheet',
  render({quick, noFocusTrap}) {
    return html`
      <petal-filled-button @click=${showDialog} aria-label="Open a floating sheet">
        Floating sheet
      </petal-filled-button>

      <petal-dialog ?quick=${quick} ?no-focus-trap=${noFocusTrap}>
        <span slot="headline">
          <span style="flex: 1;">Floating Sheet</span>
          <petal-icon-button form="form" value="close" aria-label="Close dialog">
            <petal-icon>close</petal-icon>
          </petal-icon-button>
        </span>
        <form id="form" slot="content" method="dialog">
          This is a floating sheet with title. Floating sheets offer no action
          buttons at the bottom, but there's a close icon button at the top
          right. They accept any HTML content.
        </form>
      </petal-dialog>
    `;
  },
};

/** Dialog stories. */
export const stories = [
  standard,
  alert,
  confirm,
  choose,
  contacts,
  floatingSheet,
];
