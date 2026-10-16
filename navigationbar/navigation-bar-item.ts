/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import {CSSResultOrNative} from 'lit';
import {customElement} from 'lit/decorators.js';

import {NavigationBarItem} from './internal/navigation-bar-item.js';
import {styles} from './internal/navigation-bar-item-styles.cssresult.js';

export {type NavigationIconPosition} from '../internal/navigation/navigation-item.js';

declare global {
  interface HTMLElementTagNameMap {
    'petal-navigation-bar-item': PetalNavigationBarItem;
  }
}

/**
 * @summary An item of a navigation bar: an icon, a label, and an indicator
 * that grows when the item is selected.
 *
 * @description
 * The icon goes in the `icon` slot, optionally with a `selected-icon` slot for
 * the selected state (or fill a Material Symbol with `--md-icon-fill`, which
 * the item sets to 1 when selected). The label is the default slot; an item
 * without one shows the icon only, so give it an `aria-label`. With `href` the
 * item is a link.
 *
 * @final
 * @suppress {visibility}
 */
@customElement('petal-navigation-bar-item')
export class PetalNavigationBarItem extends NavigationBarItem {
  static override styles: CSSResultOrNative[] = [styles];
}
