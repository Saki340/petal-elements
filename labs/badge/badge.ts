/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import {CSSResultOrNative} from 'lit';
import {customElement} from 'lit/decorators.js';

import {Badge} from './internal/badge.js';
import {styles} from './internal/badge-styles.cssresult.js';

declare global {
  interface HTMLElementTagNameMap {
    'petal-badge': PetalBadge;
  }
}

/**
 * @final
 * @suppress {visibility}
 */
@customElement('petal-badge')
export class PetalBadge extends Badge {
  static override styles: CSSResultOrNative[] = [styles];
}
