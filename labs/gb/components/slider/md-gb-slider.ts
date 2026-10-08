/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import {SliderElement} from './slider-element.js';

declare global {
  interface HTMLElementTagNameMap {
    /** A Material Design slider component. */
    'petal-gb-slider': SliderElement;
  }
}

customElements.define('petal-gb-slider', SliderElement);
