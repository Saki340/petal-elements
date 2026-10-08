/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import {ButtonGroupElement} from './button-group-element.js';

declare global {
  interface HTMLElementTagNameMap {
    /** A Material Design button group. */
    'petal-gb-button-group': ButtonGroupElement;
  }
}

customElements.define('petal-gb-button-group', ButtonGroupElement);
