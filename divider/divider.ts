/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import {CSSResultOrNative} from 'lit';
import {customElement} from 'lit/decorators.js';

import {Divider} from './internal/divider.js';
import {styles} from './internal/divider-styles.cssresult.js';

declare global {
  interface HTMLElementTagNameMap {
    'petal-divider': PetalDivider;
  }
}

/**
 * @summary A divider is a thin line that separates content in lists and
 * containers.
 *
 * @final
 * @suppress {visibility}
 */
@customElement('petal-divider')
export class PetalDivider extends Divider {
  static override styles: CSSResultOrNative[] = [styles];
}
