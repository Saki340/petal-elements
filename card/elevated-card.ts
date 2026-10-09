/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import {CSSResultOrNative} from 'lit';
import {customElement} from 'lit/decorators.js';

import {Card} from './internal/card.js';
import {styles as variantStyles} from './internal/elevated-styles.cssresult.js';
import {styles as sharedStyles} from './internal/shared-styles.cssresult.js';

declare global {
  interface HTMLElementTagNameMap {
    'petal-elevated-card': PetalElevatedCard;
  }
}

/**
 * @summary Cards hold content and actions about one subject.
 *
 * @final
 * @suppress {visibility}
 */
@customElement('petal-elevated-card')
export class PetalElevatedCard extends Card {
  static override styles: CSSResultOrNative[] = [sharedStyles, variantStyles];
}
