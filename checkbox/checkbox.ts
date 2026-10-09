/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import {CSSResultOrNative} from 'lit';
import {customElement} from 'lit/decorators.js';

import {Checkbox} from './internal/checkbox.js';
import {styles} from './internal/checkbox-styles.cssresult.js';

declare global {
  interface HTMLElementTagNameMap {
    'petal-checkbox': PetalCheckbox;
  }
}

/**
 * @summary Checkboxes select any number of items from a set, or turn a single
 * option on or off.
 *
 * @final
 * @suppress {visibility}
 */
@customElement('petal-checkbox')
export class PetalCheckbox extends Checkbox {
  static override styles: CSSResultOrNative[] = [styles];
}
