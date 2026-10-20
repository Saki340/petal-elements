/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import {CSSResultOrNative} from 'lit';
import {customElement} from 'lit/decorators.js';

import {SegmentedButton} from './internal/segmented-button.js';
import {styles} from './internal/segmented-button-styles.cssresult.js';

export {SegmentedButton} from './internal/segmented-button.js';

declare global {
  interface HTMLElementTagNameMap {
    'petal-segmented-button': PetalSegmentedButton;
  }
}

/**
 * @summary Segmented buttons help people select options, switch views, or
 * sort elements.
 *
 * @description
 * A segmented button is one choice in a `petal-segmented-button-set`.
 *
 * @suppress {visibility}
 */
@customElement('petal-segmented-button')
export class PetalSegmentedButton extends SegmentedButton {
  static override styles: CSSResultOrNative[] = [styles];
}
