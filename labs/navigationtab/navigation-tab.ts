/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import {CSSResultOrNative} from 'lit';
import {customElement} from 'lit/decorators.js';

import {NavigationTab} from './internal/navigation-tab.js';
import {styles} from './internal/navigation-tab-styles.cssresult.js';

declare global {
  interface HTMLElementTagNameMap {
    'petal-navigation-tab': PetalNavigationTab;
  }
}

/**
 * @final
 * @suppress {visibility}
 */
@customElement('petal-navigation-tab')
export class PetalNavigationTab extends NavigationTab {
  static override styles: CSSResultOrNative[] = [styles];
}
