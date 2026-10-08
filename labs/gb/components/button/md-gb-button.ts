/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import {ButtonElement} from './button-element.js';

declare global {
  interface HTMLElementTagNameMap {
    /** A Material Design button. */
    'petal-gb-button': ButtonElement;
  }
}

customElements.define('petal-gb-button', ButtonElement);
