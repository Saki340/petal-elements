/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import './date-range-picker.js';

import {CSSResultOrNative} from 'lit';
import {customElement} from 'lit/decorators.js';

import {DateRangePickerDialog} from './internal/date-range-picker-dialog.js';
import {styles} from './internal/date-range-picker-dialog-styles.cssresult.js';

export {DateRangePickerDialog} from './internal/date-range-picker-dialog.js';

declare global {
  interface HTMLElementTagNameMap {
    'petal-date-range-picker-dialog': PetalDateRangePickerDialog;
  }
}

/**
 * @summary Date range pickers let people select a start and an end date.
 *
 * @description
 * A date range picker in a modal dialog with Close and Save, as in Compose's
 * `DateRangePickerSample`.
 *
 * @final
 * @suppress {visibility}
 */
@customElement('petal-date-range-picker-dialog')
export class PetalDateRangePickerDialog extends DateRangePickerDialog {
  static override styles: CSSResultOrNative[] = [styles];
}
