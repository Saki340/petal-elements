/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import {CSSResultOrNative} from 'lit';
import {customElement} from 'lit/decorators.js';

import {LoadingIndicator} from './internal/loading-indicator.js';
import {styles} from './internal/loading-indicator-styles.cssresult.js';

declare global {
  interface HTMLElementTagNameMap {
    'petal-loading-indicator': PetalLoadingIndicator;
  }
}

/**
 * @summary Loading indicators show progress for short waits with a morphing
 * Material shape.
 *
 * @final
 * @suppress {visibility}
 */
@customElement('petal-loading-indicator')
export class PetalLoadingIndicator extends LoadingIndicator {
  static override styles: CSSResultOrNative[] = [styles];
}
