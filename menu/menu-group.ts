/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import {CSSResultOrNative} from 'lit';
import {customElement} from 'lit/decorators.js';

import {styles} from './internal/menugroup/menu-group-styles.cssresult.js';
import {MenuGroup} from './internal/menugroup/menu-group.js';

declare global {
  interface HTMLElementTagNameMap {
    'petal-menu-group': PetalMenuGroup;
  }
}

/**
 * @summary Menu groups put menu items on separate surfaces within one menu.
 *
 * @description
 * Place `<petal-menu-group>` elements in a `<petal-menu>`, each holding
 * `<petal-menu-item>` elements. Every group is its own surface, separated from
 * the next by a small gap, as in Material 3 Expressive menus. Items with
 * `checked` show the selected colors and shape.
 *
 * @final
 * @suppress {visibility}
 */
@customElement('petal-menu-group')
export class PetalMenuGroup extends MenuGroup {
  static override styles: CSSResultOrNative[] = [styles];
}
