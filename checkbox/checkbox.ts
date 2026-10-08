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
 * @summary Checkboxes allow users to select one or more items from a set.
 * Checkboxes can turn an option on or off.
 *
 * @description
 * Use checkboxes to:
 * - Select one or more options from a list
 * - Present a list containing sub-selections
 * - Turn an item on or off in a desktop environment
 *
 * @final
 * @suppress {visibility}
 */
@customElement('petal-checkbox')
export class PetalCheckbox extends Checkbox {
  static override styles: CSSResultOrNative[] = [styles];
}
