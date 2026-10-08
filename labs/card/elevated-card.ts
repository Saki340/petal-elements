/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import {CSSResultOrNative} from 'lit';
import {customElement} from 'lit/decorators.js';

import {Card} from './internal/card.js';
import {styles as elevatedStyles} from './internal/elevated-styles.cssresult.js';
import {styles as sharedStyles} from './internal/shared-styles.cssresult.js';

declare global {
  interface HTMLElementTagNameMap {
    'petal-elevated-card': PetalElevatedCard;
  }
}

/**
 * @final
 * @suppress {visibility}
 */
@customElement('petal-elevated-card')
export class PetalElevatedCard extends Card {
  static override styles: CSSResultOrNative[] = [sharedStyles, elevatedStyles];
}
