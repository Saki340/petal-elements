/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import {CSSResultOrNative} from 'lit';
import {customElement} from 'lit/decorators.js';

import {LinearProgress} from './internal/linear-progress.js';
import {styles} from './internal/linear-progress-styles.cssresult.js';

declare global {
  interface HTMLElementTagNameMap {
    'petal-linear-progress': PetalLinearProgress;
  }
}

/**
 * @summary A linear progress indicator.
 *
 * @description
 * Determinate when `value` is set, indeterminate with `indeterminate`.
 * `buffer` shows a second, lighter bar.
 *
 * @final
 * @suppress {visibility}
 */
@customElement('petal-linear-progress')
export class PetalLinearProgress extends LinearProgress {
  static override styles: CSSResultOrNative[] = [styles];
}
