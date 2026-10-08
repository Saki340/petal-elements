/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import {CardElement} from './card-element.js';

declare global {
  interface HTMLElementTagNameMap {
    /** A Material Design component. */
    'petal-gb-card': CardElement;
  }
}

customElements.define('petal-gb-card', CardElement);
