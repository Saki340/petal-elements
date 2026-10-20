/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import {CSSResultOrNative} from 'lit';
import {customElement} from 'lit/decorators.js';

import {TimePicker} from './internal/time-picker.js';
import {styles} from './internal/time-picker-styles.cssresult.js';

export {
  TimePicker,
  type TimePickerDisplayMode,
  type TimePickerLayout,
  type TimePickerMessages,
  type TimePickerSelection,
} from './internal/time-picker.js';

declare global {
  interface HTMLElementTagNameMap {
    'petal-time-picker': PetalTimePicker;
  }
}

/**
 * @summary Time pickers let people select a time.
 *
 * @description
 * The clock dial or the text fields, as Compose's `TimePicker` and
 * `TimeInput`, to place in a page. For a dialog with OK and Cancel, use
 * `petal-time-picker-dialog`.
 *
 * @final
 * @suppress {visibility}
 */
@customElement('petal-time-picker')
export class PetalTimePicker extends TimePicker {
  static override styles: CSSResultOrNative[] = [styles];
}
