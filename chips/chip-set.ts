/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import {CSSResultOrNative} from 'lit';
import {customElement} from 'lit/decorators.js';

import {ChipSet} from './internal/chip-set.js';
import {styles} from './internal/chip-set-styles.cssresult.js';

declare global {
  interface HTMLElementTagNameMap {
    'petal-chip-set': PetalChipSet;
  }
}

/**
 * TODO(b/243982145): add docs
 *
 * @final
 * @suppress {visibility}
 */
@customElement('petal-chip-set')
export class PetalChipSet extends ChipSet {
  static override styles: CSSResultOrNative[] = [styles];
}
