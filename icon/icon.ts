/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import {CSSResultOrNative} from 'lit';
import {customElement} from 'lit/decorators.js';

import {Icon} from './internal/icon.js';
import {styles} from './internal/icon-styles.cssresult.js';

declare global {
  interface HTMLElementTagNameMap {
    'petal-icon': PetalIcon;
  }
}

/**
 * @final
 * @suppress {visibility}
 */
@customElement('petal-icon')
export class PetalIcon extends Icon {
  /** @nocollapse */
  static override styles: CSSResultOrNative[] = [styles];
}
