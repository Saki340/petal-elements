/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import {IconElement} from './icon-element.js';

declare global {
  interface HTMLElementTagNameMap {
    /** A Material Design icon component. */
    'petal-gb-icon': IconElement;
  }
}

customElements.define('petal-gb-icon', IconElement);
