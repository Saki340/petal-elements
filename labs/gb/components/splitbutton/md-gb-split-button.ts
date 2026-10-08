/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import {SplitButtonElement} from './split-button-element.js';

declare global {
  interface HTMLElementTagNameMap {
    /** A Material Design component. */
    'petal-gb-split-button': SplitButtonElement;
  }
}

customElements.define('petal-gb-split-button', SplitButtonElement);
