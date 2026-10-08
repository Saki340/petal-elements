/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import {CSSResultOrNative} from 'lit';
import {customElement} from 'lit/decorators.js';

import {InputChip} from './internal/input-chip.js';
import {styles} from './internal/input-styles.cssresult.js';
import {styles as selectableStyles} from './internal/selectable-styles.cssresult.js';
import {styles as sharedStyles} from './internal/shared-styles.cssresult.js';
import {styles as trailingIconStyles} from './internal/trailing-icon-styles.cssresult.js';

declare global {
  interface HTMLElementTagNameMap {
    'petal-input-chip': PetalInputChip;
  }
}

/**
 * TODO(b/243982145): add docs
 *
 * @final
 * @suppress {visibility}
 */
@customElement('petal-input-chip')
export class PetalInputChip extends InputChip {
  static override styles: CSSResultOrNative[] = [
    sharedStyles,
    trailingIconStyles,
    selectableStyles,
    styles,
  ];
}
