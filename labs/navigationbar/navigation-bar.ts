/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import {CSSResultOrNative} from 'lit';
import {customElement} from 'lit/decorators.js';

import {NavigationBar} from './internal/navigation-bar.js';
import {styles} from './internal/navigation-bar-styles.cssresult.js';

declare global {
  interface HTMLElementTagNameMap {
    'petal-navigation-bar': PetalNavigationBar;
  }
}

/**
 * @final
 * @suppress {visibility}
 */
@customElement('petal-navigation-bar')
export class PetalNavigationBar extends NavigationBar {
  static override styles: CSSResultOrNative[] = [styles];
}
