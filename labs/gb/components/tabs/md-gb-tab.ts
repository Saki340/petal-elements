/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import {TabElement} from './tab-element.js';

declare global {
  interface HTMLElementTagNameMap {
    /** A Material Design tab component. */
    'petal-gb-tab': TabElement;
  }
}

customElements.define('petal-gb-tab', TabElement);
