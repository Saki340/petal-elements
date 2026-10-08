/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import {CSSResultOrNative} from 'lit';
import {customElement} from 'lit/decorators.js';

import {OutlinedSegmentedButton} from './internal/outlined-segmented-button.js';
import {styles as outlinedStyles} from './internal/outlined-styles.cssresult.js';
import {styles as sharedStyles} from './internal/shared-styles.cssresult.js';

declare global {
  interface HTMLElementTagNameMap {
    'petal-outlined-segmented-button': PetalOutlinedSegmentedButton;
  }
}

/**
 * PetalOutlinedSegmentedButton is the custom element for the Material
 * Design outlined segmented button component.
 * @final
 * @suppress {visibility}
 */
@customElement('petal-outlined-segmented-button')
export class PetalOutlinedSegmentedButton extends OutlinedSegmentedButton {
  static override styles: CSSResultOrNative[] = [sharedStyles, outlinedStyles];
}
