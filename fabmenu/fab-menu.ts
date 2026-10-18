/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import {CSSResultOrNative} from 'lit';
import {customElement} from 'lit/decorators.js';

import {FabMenu} from './internal/fab-menu.js';
import {styles} from './internal/fab-menu-styles.cssresult.js';

declare global {
  interface HTMLElementTagNameMap {
    'petal-fab-menu': PetalFabMenu;
  }
}

/**
 * @summary A FAB that opens a menu of related actions, each a labelled button.
 *
 * @description
 * The items (`petal-fab-menu-item`) go in the default slot and the button, a
 * `petal-toggle-fab`, in the `button` slot. The menu keeps the button's
 * `checked` in sync with `expanded` and opens or closes when it is clicked.
 * Escape or a press outside closes it.
 *
 * @fires open The menu started to open. {@type Event}
 * @fires close The menu started to close. {@type Event}
 *
 * @final
 * @suppress {visibility}
 */
@customElement('petal-fab-menu')
export class PetalFabMenu extends FabMenu {
  static override styles: CSSResultOrNative[] = [styles];
}
