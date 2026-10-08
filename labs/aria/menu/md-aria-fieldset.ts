/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import {AriaFieldsetElement} from './fieldset.js';

declare global {
  interface HTMLElementTagNameMap {
    'petal-aria-fieldset': AriaFieldsetElement;
  }
}

customElements.define('petal-aria-fieldset', AriaFieldsetElement);
