/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import {CSSResultOrNative} from 'lit';
import {customElement} from 'lit/decorators.js';

import {Item} from './internal/item.js';
import {styles} from './internal/item-styles.cssresult.js';

declare global {
  interface HTMLElementTagNameMap {
    'petal-item': PetalItem;
  }
}

/**
 * An item layout component that can be used inside list items to give them
 * their customizable structure.
 *
 * `<petal-item>` does not have any functionality, which must be added by the
 * component using it.
 *
 * All text will wrap unless `white-space: nowrap` is set on the item or any of
 * its children.
 *
 * Slots available:
 * - `<default>`: The headline, or custom content.
 * - `headline`: The first line.
 * - `supporting-text`: Supporting text lines underneath the headline.
 * - `trailing-supporting-text`: A small text snippet at the end of the item.
 * - `start`: Any leading content, such as icons, avatars, or checkboxes.
 * - `end`: Any trailing content, such as icons and buttons.
 * - `container`: Background container content, intended for adding additional
 *     styles, such as ripples or focus rings.
 *
 * @example
 * ```html
 * <petal-item>Single line</petal-item>
 *
 * <petal-item>
 *   <div class="custom-content">...</div>
 * </petal-item>
 *
 * <!-- Classic 1 to 3+ line list items -->
 * <petal-item>
 *   <petal-icon slot="start">image</petal-icon>
 *   <div slot="overline">Overline</div>
 *   <div slot="headline">Headline</div>
 *   <div="supporting-text">Supporting text</div>
 *   <div="trailing-supporting-text">Trailing</div>
 *   <petal-icon slot="end">image</petal-icon>
 * </petal-item>
 * ```
 *
 * When wrapping `<petal-item>`, forward the available slots to use the same slot
 * structure for the wrapping component (this is what `<petal-list-item>` does).
 *
 * @example
 * ```html
 * <petal-item>
 *   <slot></slot>
 *   <slot name="overline" slot="overline"></slot>
 *   <slot name="headline" slot="headline"></slot>
 *   <slot name="supporting-text" slot="supporting-text"></slot>
 *   <slot name="trailing-supporting-text"
 *       slot="trailing-supporting-text"></slot>
 *   <slot name="start" slot="start"></slot>
 *   <slot name="end" slot="end"></slot>
 * </petal-item>
 * ```
 *
 * @final
 * @suppress {visibility}
 */
@customElement('petal-item')
export class PetalItem extends Item {
  static override styles: CSSResultOrNative[] = [styles];
}
