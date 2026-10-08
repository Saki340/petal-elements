/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import {NavBarElement} from './nav-bar-element.js';

declare global {
  interface HTMLElementTagNameMap {
    /** A Material Design gBreeze navigation bar custom element. */
    'petal-gb-nav-bar': NavBarElement;
  }
}

if (!customElements.get('petal-gb-nav-bar')) {
  customElements.define('petal-gb-nav-bar', NavBarElement);
}
