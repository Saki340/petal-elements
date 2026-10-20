/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import {CSSResultOrNative} from 'lit';
import {customElement} from 'lit/decorators.js';

import {RichTooltip} from './internal/rich-tooltip.js';
import {styles} from './internal/rich-tooltip-styles.cssresult.js';

export {RichTooltip} from './internal/rich-tooltip.js';

declare global {
  interface HTMLElementTagNameMap {
    'petal-rich-tooltip': PetalRichTooltip;
  }
}

/**
 * @summary Rich tooltips give more context about an element: a title,
 * supporting text and an action.
 *
 * @description
 * A rich tooltip, after Jetpack Compose Material 3's `RichTooltip`. Give it
 * `for` with the id of its anchor. The title goes in the `title` slot, the
 * text in the default slot, buttons in the `action` slot.
 *
 * @final
 * @suppress {visibility}
 */
@customElement('petal-rich-tooltip')
export class PetalRichTooltip extends RichTooltip {
  static override styles: CSSResultOrNative[] = [styles];
}
