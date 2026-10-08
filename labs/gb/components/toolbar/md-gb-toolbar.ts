/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import {ToolbarElement} from './toolbar-element.js';

declare global {
  interface HTMLElementTagNameMap {
    /** A Material Design gBreeze toolbar custom element. */
    'petal-gb-toolbar': ToolbarElement;
  }
}

customElements.define('petal-gb-toolbar', ToolbarElement);
