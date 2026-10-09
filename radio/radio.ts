/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import {CSSResultOrNative} from 'lit';
import {customElement} from 'lit/decorators.js';

import {Radio} from './internal/radio.js';
import {styles} from './internal/radio-styles.cssresult.js';

declare global {
  interface HTMLElementTagNameMap {
    'petal-radio': PetalRadio;
  }
}

/**
 * @summary Radio buttons select exactly one option from a set.
 *
 * @description
 * Radio buttons with the same `name` form a group; checking one unchecks
 * the others.
 *
 * @final
 * @suppress {visibility}
 */
@customElement('petal-radio')
export class PetalRadio extends Radio {
  static override styles: CSSResultOrNative[] = [styles];
}
