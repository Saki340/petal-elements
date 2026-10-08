/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import {NavBarItemElement} from './nav-bar-item-element.js';

declare global {
  interface HTMLElementTagNameMap {
    /** A Material Design gBreeze navigation bar item custom element. */
    'petal-gb-nav-bar-item': NavBarItemElement;
  }
}

if (!customElements.get('petal-gb-nav-bar-item')) {
  customElements.define('petal-gb-nav-bar-item', NavBarItemElement);
}
