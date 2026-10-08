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
 * @summary Circular progress indicators display progress by animating along an
 * invisible circular track in a clockwise direction. They can be applied
 * directly to a surface, such as a button or card.
 *
 * @description
 * Progress indicators inform users about the status of ongoing processes.
 * - Determinate indicators display how long a process will take.
 * - Indeterminate indicators express an unspecified amount of wait time.
 *
 * @final
 * @suppress {visibility}
 */
@customElement('petal-circular-progress')
export class PetalCircularProgress extends CircularProgress {
  static override styles: CSSResultOrNative[] = [styles];
}
