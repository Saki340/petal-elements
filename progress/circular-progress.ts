/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import {CSSResultOrNative} from 'lit';
import {customElement} from 'lit/decorators.js';

import {CircularProgress} from './internal/circular-progress.js';
import {styles} from './internal/circular-progress-styles.cssresult.js';

declare global {
  interface HTMLElementTagNameMap {
    'petal-circular-progress': PetalCircularProgress;
  }
}

/**
 * @summary A circular progress indicator.
 *
 * @description
 * Determinate when `value` is set, indeterminate with `indeterminate`.
 *
 * @final
 * @suppress {visibility}
 */
@customElement('petal-circular-progress')
export class PetalCircularProgress extends CircularProgress {
  static override styles: CSSResultOrNative[] = [styles];
}
