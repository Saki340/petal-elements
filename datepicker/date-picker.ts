/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import {CSSResultOrNative} from 'lit';
import {customElement} from 'lit/decorators.js';

import {DatePicker} from './internal/date-picker.js';
import {styles} from './internal/date-picker-styles.cssresult.js';

export {
  DatePicker,
  type DatePickerDisplayMode,
  type DatePickerMessages,
} from './internal/date-picker.js';

declare global {
  interface HTMLElementTagNameMap {
    'petal-date-picker': PetalDatePicker;
  }
}

/**
 * @summary Date pickers let people select a date.
 *
 * @description
 * The calendar with a header, as Compose's `DatePicker`, to place in a page.
 * For a dialog with OK and Cancel, use `petal-date-picker-dialog`.
 *
 * @final
 * @suppress {visibility}
 */
@customElement('petal-date-picker')
export class PetalDatePicker extends DatePicker {
  static override styles: CSSResultOrNative[] = [styles];
}
