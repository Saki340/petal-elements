/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
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
 * @summary Badges show a notification dot or a short count on an icon.
 *
 * @final
 * @suppress {visibility}
 */
@customElement('petal-badge')
export class PetalBadge extends Badge {
  static override styles: CSSResultOrNative[] = [styles];
}
