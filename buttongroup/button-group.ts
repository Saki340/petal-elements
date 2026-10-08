/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import {CSSResultOrNative} from 'lit';
import {customElement} from 'lit/decorators.js';

import {ButtonGroup} from './internal/button-group.js';
import {styles} from './internal/button-group-styles.cssresult.js';

declare global {
  interface HTMLElementTagNameMap {
    'petal-button-group': PetalButtonGroup;
  }
}

/**
 * A Material 3 Expressive button group.
 *
 * @summary Groups buttons. Standard groups space buttons apart and widen the
 * pressed one; connected groups join them with small inner corners.
 *
 * @final
 * @suppress {visibility}
 */
@customElement('petal-button-group')
export class PetalButtonGroup extends ButtonGroup {
  static override styles: CSSResultOrNative[] = [styles];
}
