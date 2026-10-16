/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import {CSSResultOrNative} from 'lit';
import {customElement} from 'lit/decorators.js';

import {NavigationBar} from './internal/navigation-bar.js';
import {styles} from './internal/navigation-bar-styles.cssresult.js';

export {type NavigationBarArrangement} from './internal/navigation-bar.js';

declare global {
  interface HTMLElementTagNameMap {
    'petal-navigation-bar': PetalNavigationBar;
  }
}

/**
 * @summary Navigation bars let people switch between a few primary
 * destinations, usually at the bottom of the screen.
 *
 * @description
 * Put `<petal-navigation-bar-item>` elements in the bar. The bar keeps one of
 * them selected, puts it in the tab order, and moves the focus with the arrow
 * keys. It has the `tablist` role and its items the `tab` role, as in Compose.
 * Listen to `change` to know when the user picks another item.
 *
 * @final
 * @suppress {visibility}
 */
@customElement('petal-navigation-bar')
export class PetalNavigationBar extends NavigationBar {
  static override styles: CSSResultOrNative[] = [styles];
}
