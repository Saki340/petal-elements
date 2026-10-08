/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import {CSSResultOrNative} from 'lit';
import {customElement} from 'lit/decorators.js';

import {FocusRing} from './internal/focus-ring.js';
import {styles} from './internal/focus-ring-styles.cssresult.js';

declare global {
  interface HTMLElementTagNameMap {
    'petal-focus-ring': PetalFocusRing;
  }
}

/**
 * TODO(b/267336424): add docs
 *
 * @final
 * @suppress {visibility}
 */
@customElement('petal-focus-ring')
export class PetalFocusRing extends FocusRing {
  static override styles: CSSResultOrNative[] = [styles];
}
