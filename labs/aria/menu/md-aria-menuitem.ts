/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import {AriaMenuitemElement} from './menuitem.js';

declare global {
  interface HTMLElementTagNameMap {
    'petal-aria-menuitem': AriaMenuitemElement;
  }
}

customElements.define('petal-aria-menuitem', AriaMenuitemElement);
