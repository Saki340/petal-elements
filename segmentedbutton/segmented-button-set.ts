/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import {CSSResultOrNative} from 'lit';
import {customElement} from 'lit/decorators.js';

import {SegmentedButtonSet} from './internal/segmented-button-set.js';
import {styles} from './internal/segmented-button-set-styles.cssresult.js';

export {SegmentedButtonSet} from './internal/segmented-button-set.js';

declare global {
  interface HTMLElementTagNameMap {
    'petal-segmented-button-set': PetalSegmentedButtonSet;
  }
}

/**
 * @summary Segmented buttons help people select options, switch views, or
 * sort elements.
 *
 * @description
 * A row of `petal-segmented-button`s: single-select by default (a radio
 * group), or `multiselect`.
 *
 * @suppress {visibility}
 */
@customElement('petal-segmented-button-set')
export class PetalSegmentedButtonSet extends SegmentedButtonSet {
  static override styles: CSSResultOrNative[] = [styles];
}
