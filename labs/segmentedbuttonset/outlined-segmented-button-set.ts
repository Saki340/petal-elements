/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The segmented button set left labs: use
 * petal-elements/segmentedbutton/segmented-button-set.js
 * (`petal-segmented-button-set`). This module keeps the old
 * `petal-outlined-segmented-button-set` tag working until 1.0.
 */

import {customElement} from 'lit/decorators.js';

import {PetalSegmentedButtonSet} from '../../segmentedbutton/segmented-button-set.js';

declare global {
  interface HTMLElementTagNameMap {
    'petal-outlined-segmented-button-set': PetalOutlinedSegmentedButtonSet;
  }
}

/**
 * @deprecated Use `petal-segmented-button-set`.
 * @suppress {visibility}
 */
@customElement('petal-outlined-segmented-button-set')
export class PetalOutlinedSegmentedButtonSet extends PetalSegmentedButtonSet {}
