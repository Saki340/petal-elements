/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import {CSSResultOrNative} from 'lit';
import {customElement} from 'lit/decorators.js';

import {PullToRefresh} from './internal/pull-to-refresh.js';
import {styles} from './internal/pull-to-refresh-styles.cssresult.js';

declare global {
  interface HTMLElementTagNameMap {
    'petal-pull-to-refresh': PetalPullToRefresh;
  }
}

/**
 * @summary Pull-to-refresh wraps scrollable content. Pulling it down at the
 * top shows the petal-elements flower, which blooms with the pull and spins
 * while refreshing.
 *
 * @description
 * The element is the scroll container, so give it a height. Pulling is touch
 * only: also offer another way to refresh, such as a button.
 *
 * @final
 * @suppress {visibility}
 */
@customElement('petal-pull-to-refresh')
export class PetalPullToRefresh extends PullToRefresh {
  static override styles: CSSResultOrNative[] = [styles];
}
