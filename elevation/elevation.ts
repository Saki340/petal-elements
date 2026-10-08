/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import {CSSResultOrNative} from 'lit';
import {customElement} from 'lit/decorators.js';

import {Elevation} from './internal/elevation.js';
import {styles} from './internal/elevation-styles.cssresult.js';

declare global {
  interface HTMLElementTagNameMap {
    'petal-elevation': PetalElevation;
  }
}

/**
 * The `<petal-elevation>` custom element with default styles.
 *
 * Elevation is the relative distance between two surfaces along the z-axis.
 *
 * @final
 * @suppress {visibility}
 */
@customElement('petal-elevation')
export class PetalElevation extends Elevation {
  static override styles: CSSResultOrNative[] = [styles];
}
