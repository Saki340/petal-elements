/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import {AppBarElement} from './app-bar-element.js';

declare global {
  interface HTMLElementTagNameMap {
    /** A Material Design app bar component. */
    'petal-gb-app-bar': AppBarElement;
  }
}

customElements.define('petal-gb-app-bar', AppBarElement);
