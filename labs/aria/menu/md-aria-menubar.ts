/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import {AriaMenubarElement} from './menubar.js';

declare global {
  interface HTMLElementTagNameMap {
    'petal-aria-menubar': AriaMenubarElement;
  }
}

customElements.define('petal-aria-menubar', AriaMenubarElement);
