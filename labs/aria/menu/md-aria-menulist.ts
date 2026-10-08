/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import {AriaMenulistElement} from './menulist.js';

declare global {
  interface HTMLElementTagNameMap {
    'petal-aria-menulist': AriaMenulistElement;
  }
}

customElements.define('petal-aria-menulist', AriaMenulistElement);
