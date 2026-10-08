/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import {TabsElement} from './tabs-element.js';

declare global {
  interface HTMLElementTagNameMap {
    /** A Material Design tabs component. */
    'petal-gb-tabs': TabsElement;
  }
}

customElements.define('petal-gb-tabs', TabsElement);
