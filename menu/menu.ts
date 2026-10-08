/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import {CSSResultOrNative} from 'lit';
import {customElement} from 'lit/decorators.js';

import {Menu} from './internal/menu.js';
import {styles} from './internal/menu-styles.cssresult.js';

export {type ListItem} from '../list/internal/list-navigation-helpers.js';
export {type MenuItem} from './internal/controllers/menuItemController.js';
export {
  CloseReason,
  FocusState,
  type CloseMenuEvent,
  type Menu,
} from './internal/controllers/shared.js';
export {Corner} from './internal/menu.js';

declare global {
  interface HTMLElementTagNameMap {
    'petal-menu': PetalMenu;
  }
}

/**
 * @summary Menus display a list of choices on a temporary surface.
 *
 * @description
 * Menus appear when users interact with a button, action, or other control.
 *
 * They can be opened from a variety of elements, most commonly icon buttons,
 * buttons, and text fields.
 *
 * petal-menu listens for the `close-menu` and `deselect-items` events.
 *
 * - `close-menu` closes the menu when dispatched from a child element.
 * - `deselect-items` deselects all of its immediate menu-item children.
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
 *     menu's contents.
 *
 *     Additionally, `anchor` ingests an idref which do not pass through shadow
 *     roots. You can also set `.anchorElement` to an element reference if
 *     necessary.
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
@customElement('petal-menu')
export class PetalMenu extends Menu {
  static override styles: CSSResultOrNative[] = [styles];
}
