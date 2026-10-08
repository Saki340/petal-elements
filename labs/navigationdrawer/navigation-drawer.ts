/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import {customElement} from 'lit/decorators.js';

import {NavigationDrawer} from './internal/navigation-drawer.js';
import {styles} from './internal/navigation-drawer-styles.cssresult.js';
import {styles as sharedStyles} from './internal/shared-styles.cssresult.js';

declare global {
  interface HTMLElementTagNameMap {
    'petal-navigation-drawer': PetalNavigationDrawer;
  }
}

/**
 * @final
 * @suppress {visibility}
 */
@customElement('petal-navigation-drawer')
export class PetalNavigationDrawer extends NavigationDrawer {
  static override readonly styles = [sharedStyles, styles];
}
