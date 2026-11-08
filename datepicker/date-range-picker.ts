/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import {CSSResultOrNative} from 'lit';
import {customElement} from 'lit/decorators.js';

import {DateRangePicker} from './internal/date-range-picker.js';
import {styles} from './internal/date-range-picker-styles.cssresult.js';

export {DateRangePicker} from './internal/date-range-picker.js';

declare global {
  interface HTMLElementTagNameMap {
    'petal-date-range-picker': PetalDateRangePicker;
  }
}

/**
 * @summary Date range pickers let people select a start and an end date.
 *
 * @description
 * A list of months with a header, as Compose's `DateRangePicker`, to place in
 * a page. For a dialog with Close and Save, use
 * `petal-date-range-picker-dialog`.
 *
 * @final
 * @suppress {visibility}
 */
@customElement('petal-date-range-picker')
export class PetalDateRangePicker extends DateRangePicker {
  static override styles: CSSResultOrNative[] = [styles];
}
