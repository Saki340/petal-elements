/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import {AriaTablistElement} from './tablist.js';

declare global {
  interface HTMLElementTagNameMap {
    'petal-aria-tablist': AriaTablistElement;
  }
}

customElements.define('petal-aria-tablist', AriaTablistElement);
