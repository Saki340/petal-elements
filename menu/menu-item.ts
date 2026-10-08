/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import {CSSResultOrNative} from 'lit';
import {customElement} from 'lit/decorators.js';

import {MenuItemEl} from './internal/menuitem/menu-item.js';
import {styles} from './internal/menuitem/menu-item-styles.cssresult.js';

export {type MenuItem} from './internal/controllers/menuItemController.js';
export {type CloseMenuEvent} from './internal/controllers/shared.js';

declare global {
  interface HTMLElementTagNameMap {
    'petal-menu-item': PetalMenuItem;
  }
}

/**
 * @summary Menus display a list of choices on a temporary surface.
 *
 * @description
 * Menu items are the selectable choices within the menu. Menu items must
 * implement the `MenuItem` interface and also have the `petal-menu-item`
 * attribute. Additionally menu items are list items so they must also have the
 * `petal-list-item` attribute.
 *
 * Menu items can control a menu by selectively firing the `close-menu` and
 * `deselect-items` events.
 *
 * @final
 * @suppress {visibility}
 */
@customElement('petal-menu-item')
export class PetalMenuItem extends MenuItemEl {
  static override styles: CSSResultOrNative[] = [styles];
}
