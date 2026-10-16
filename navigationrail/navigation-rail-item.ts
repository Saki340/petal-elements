/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import {CSSResultOrNative} from 'lit';
import {customElement} from 'lit/decorators.js';

import {NavigationRailItem} from './internal/navigation-rail-item.js';
import {styles} from './internal/navigation-rail-item-styles.cssresult.js';

declare global {
  interface HTMLElementTagNameMap {
    'petal-navigation-rail-item': PetalNavigationRailItem;
  }
}

/**
 * @summary An item of a navigation rail: an icon, a label, and an indicator
 * that grows when the item is selected.
 *
 * @description
 * The icon goes in the `icon` slot, optionally with a `selected-icon` slot for
 * the selected state (or fill a Material Symbol with `--md-icon-fill`, which
 * the item sets to 1 when selected). The label is the default slot; an item
 * without one shows the icon only, so give it an `aria-label`. With `href` the
 * item is a link. In a collapsed rail the icon is above the label; in an
 * expanded rail it is before it.
 *
 * @final
 * @suppress {visibility}
 */
@customElement('petal-navigation-rail-item')
export class PetalNavigationRailItem extends NavigationRailItem {
  static override styles: CSSResultOrNative[] = [styles];
}
