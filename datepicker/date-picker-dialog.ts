/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import './date-picker.js';

import {CSSResultOrNative} from 'lit';
import {customElement} from 'lit/decorators.js';

import {DatePickerDialog} from './internal/date-picker-dialog.js';
import {styles} from './internal/date-picker-dialog-styles.cssresult.js';

export {DatePickerDialog} from './internal/date-picker-dialog.js';

declare global {
  interface HTMLElementTagNameMap {
    'petal-date-picker-dialog': PetalDatePickerDialog;
  }
}

/**
 * @summary Date pickers let people select a date.
 *
 * @description
 * A date picker in a modal dialog with Cancel and OK, as Compose's
 * `DatePickerDialog`.
 *
 * @final
 * @suppress {visibility}
 */
@customElement('petal-date-picker-dialog')
export class PetalDatePickerDialog extends DatePickerDialog {
  static override styles: CSSResultOrNative[] = [styles];
}
