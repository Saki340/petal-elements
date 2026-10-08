/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import {AriaTabpanelElement} from './tabpanel.js';

declare global {
  interface HTMLElementTagNameMap {
    'petal-aria-tabpanel': AriaTabpanelElement;
  }
}

customElements.define('petal-aria-tabpanel', AriaTabpanelElement);
