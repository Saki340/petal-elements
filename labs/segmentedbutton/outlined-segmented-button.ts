/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The segmented button left labs: use
 * petal-elements/segmentedbutton/segmented-button.js (`petal-segmented-button`).
 * This module keeps the old `petal-outlined-segmented-button` tag working until
 * 1.0.
 */

import {customElement} from 'lit/decorators.js';

import {PetalSegmentedButton} from '../../segmentedbutton/segmented-button.js';

declare global {
  interface HTMLElementTagNameMap {
    'petal-outlined-segmented-button': PetalOutlinedSegmentedButton;
  }
}

/**
 * @deprecated Use `petal-segmented-button`.
 * @suppress {visibility}
 */
@customElement('petal-outlined-segmented-button')
export class PetalOutlinedSegmentedButton extends PetalSegmentedButton {}
