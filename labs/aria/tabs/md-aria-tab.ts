/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import {AriaTabElement} from './tab.js';

declare global {
  interface HTMLElementTagNameMap {
    'petal-aria-tab': AriaTabElement;
  }
}

customElements.define('petal-aria-tab', AriaTabElement);
