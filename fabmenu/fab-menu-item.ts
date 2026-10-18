/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import {CSSResultOrNative} from 'lit';
import {customElement} from 'lit/decorators.js';

import {FabMenuItem} from './internal/fab-menu-item.js';
import {styles} from './internal/fab-menu-item-styles.cssresult.js';

export {type FabMenuAlignment} from './internal/fab-menu-item.js';

declare global {
  interface HTMLElementTagNameMap {
    'petal-fab-menu-item': PetalFabMenuItem;
  }
}

/**
 * @summary An item of a FAB menu: a button with an icon and a label.
 *
 * @description
 * The label is the default slot and the icon goes in the `icon` slot. Listen
 * to `click`. The item does not close the menu; set the menu's `expanded` to
 * false in the handler.
 *
 * @final
 * @suppress {visibility}
 */
@customElement('petal-fab-menu-item')
export class PetalFabMenuItem extends FabMenuItem {
  static override styles: CSSResultOrNative[] = [styles];
}
