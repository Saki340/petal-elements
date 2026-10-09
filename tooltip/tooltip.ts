/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import {CSSResultOrNative} from 'lit';
import {customElement} from 'lit/decorators.js';

import {Tooltip} from './internal/tooltip.js';
import {styles} from './internal/tooltip-styles.cssresult.js';

declare global {
  interface HTMLElementTagNameMap {
    'petal-tooltip': PetalTooltip;
  }
}

/**
 * @summary Plain tooltips briefly describe an element, such as an icon
 * button, on hover, keyboard focus or long press.
 *
 * @final
 * @suppress {visibility}
 */
@customElement('petal-tooltip')
export class PetalTooltip extends Tooltip {
  static override styles: CSSResultOrNative[] = [styles];
}
