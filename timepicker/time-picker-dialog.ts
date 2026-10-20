/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import './time-picker.js';

import {CSSResultOrNative} from 'lit';
import {customElement} from 'lit/decorators.js';

import {TimePickerDialog} from './internal/time-picker-dialog.js';
import {styles} from './internal/time-picker-dialog-styles.cssresult.js';

export {TimePickerDialog} from './internal/time-picker-dialog.js';

declare global {
  interface HTMLElementTagNameMap {
    'petal-time-picker-dialog': PetalTimePickerDialog;
  }
}

/**
 * @summary Time pickers let people select a time.
 *
 * @description
 * A time picker in a modal dialog with a mode switch, Cancel and OK, as
 * Compose's `TimePickerDialog`.
 *
 * @final
 * @suppress {visibility}
 */
@customElement('petal-time-picker-dialog')
export class PetalTimePickerDialog extends TimePickerDialog {
  static override styles: CSSResultOrNative[] = [styles];
}
