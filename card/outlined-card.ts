/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import {CSSResultOrNative} from 'lit';
import {customElement} from 'lit/decorators.js';

import {Card} from './internal/card.js';
import {styles as variantStyles} from './internal/outlined-styles.cssresult.js';
import {styles as sharedStyles} from './internal/shared-styles.cssresult.js';

declare global {
  interface HTMLElementTagNameMap {
    'petal-outlined-card': PetalOutlinedCard;
  }
}

/**
 * @summary Cards hold content and actions about one subject.
 *
 * @final
 * @suppress {visibility}
 */
@customElement('petal-outlined-card')
export class PetalOutlinedCard extends Card {
  static override styles: CSSResultOrNative[] = [sharedStyles, variantStyles];
}
