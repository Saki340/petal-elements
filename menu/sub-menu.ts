/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import {CSSResultOrNative} from 'lit';
import {customElement} from 'lit/decorators.js';

import {SubMenu} from './internal/submenu/sub-menu.js';
import {styles} from './internal/submenu/sub-menu-styles.cssresult.js';

declare global {
  interface HTMLElementTagNameMap {
    'petal-sub-menu': PetalSubMenu;
  }
}

/**
 * @summary Menus show a list of choices on a temporary surface.
 *
 * @description
 * Menu items are the selectable choices within the menu. Menu items must
 * implement the `Menu` interface and also have the `petal-menu`
 * attribute. Additionally menu items are list items so they must also have the
 * `petal-list-item` attribute.
 *
 * Menu items can control a menu by selectively firing the `close-menu` and
 * `deselect-items` events.
 *
 * This menu item will open a sub-menu that is slotted in the `submenu` slot.
 * Additionally, the containing menu must either have `has-overflow` or
 * `positioning=fixed` set to `true` in order to display the containing menu
 * properly.
 *
 * @example
 * ```html
 * <div style="position:relative;">
 *   <button
 *       id="anchor"
 *       @click=${() => this.menuRef.value.show()}>
 *     Click to open menu
 *   </button>
 *   <!--
 *     `has-overflow` is required when using a submenu which overflows the
 *     menu's contents
 *   -->
 *   <petal-menu anchor="anchor" has-overflow ${ref(menuRef)}>
 *     <petal-menu-item headline="This is a headline"></petal-menu-item>
 *     <petal-sub-menu>
 *       <petal-menu-item
 *           slot="item"
 *           headline="this is a submenu item">
 *       </petal-menu-item>
 *       <petal-menu slot="menu">
 *         <petal-menu-item headline="This is an item inside a submenu">
 *         </petal-menu-item>
 *       </petal-menu>
 *     </petal-sub-menu>
 *   </petal-menu>
 * </div>
 * ```
 *
 * @final
 * @suppress {visibility}
 */
@customElement('petal-sub-menu')
export class PetalSubMenu extends SubMenu {
  static override styles: CSSResultOrNative[] = [styles];
}
