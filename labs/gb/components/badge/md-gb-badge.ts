/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import {BadgeElement} from './badge-element.js';

declare global {
  interface HTMLElementTagNameMap {
    /** A Material Design badge component. */
    'petal-gb-badge': BadgeElement;
  }
}

customElements.define('petal-gb-badge', BadgeElement);
