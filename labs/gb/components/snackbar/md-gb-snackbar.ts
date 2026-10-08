/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import {SnackbarElement} from './snackbar-element.js';

declare global {
  interface HTMLElementTagNameMap {
    /** A Material Design snackbar component. */
    'petal-gb-snackbar': SnackbarElement;
  }
}

customElements.define('petal-gb-snackbar', SnackbarElement);
