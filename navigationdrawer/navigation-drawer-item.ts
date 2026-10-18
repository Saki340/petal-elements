/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import {CSSResultOrNative} from 'lit';
import {customElement} from 'lit/decorators.js';

import {NavigationDrawerItem} from './internal/navigation-drawer-item.js';
import {styles} from './internal/navigation-drawer-item-styles.cssresult.js';

declare global {
  interface HTMLElementTagNameMap {
    'petal-navigation-drawer-item': PetalNavigationDrawerItem;
  }
}

/**
 * @summary A destination in a navigation drawer.
 *
 * @description
 * The icon goes in the `icon` slot (and optionally a different one for the
 * selected state in `selected-icon`), the label in the default slot, and a
 * badge such as a count in the `badge` slot. Set `href` to make it a link.
 *
 * @final
 * @suppress {visibility}
 */
@customElement('petal-navigation-drawer-item')
export class PetalNavigationDrawerItem extends NavigationDrawerItem {
  static override styles: CSSResultOrNative[] = [styles];
}
