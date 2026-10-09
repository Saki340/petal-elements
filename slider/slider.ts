/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import {CSSResultOrNative} from 'lit';
import {customElement} from 'lit/decorators.js';

import {styles as forcedColorsStyles} from './internal/forced-colors-styles.cssresult.js';
import {Slider} from './internal/slider.js';
import {styles} from './internal/slider-styles.cssresult.js';

declare global {
  interface HTMLElementTagNameMap {
    'petal-slider': PetalSlider;
  }
}

/**
 * @summary Sliders pick a value, or a range of values, along a track.
 *
 * @final
 * @suppress {visibility}
 */
@customElement('petal-slider')
export class PetalSlider extends Slider {
  static override styles: CSSResultOrNative[] = [styles, forcedColorsStyles];
}
