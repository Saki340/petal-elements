/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import {CSSResultOrNative} from 'lit';
import {customElement} from 'lit/decorators.js';

import {ListItemEl as ListItem} from './internal/listitem/list-item.js';
import {styles} from './internal/listitem/list-item-styles.cssresult.js';

export {type ListItemType} from './internal/listitem/list-item.js';

declare global {
  interface HTMLElementTagNameMap {
    'petal-list-item': PetalListItem;
  }
}

/**
 * @summary
 * Lists are continuous, vertical indexes of text or images. Items are placed
 * inside the list.
 *
 * @description
 * Lists consist of one or more list items, and can contain actions represented
 * by icons and text. List items come in three sizes: one-line, two-line, and
 * three-line.
 *
 * __Takeaways:__
 *
 * - Lists should be sorted in logical ways that make content easy to scan, such
 *   as alphabetical, numerical, chronological, or by user preference.
 * - Lists present content in a way that makes it easy to identify a specific
 *   item in a collection and act on it.
 * - Lists should present icons, text, and actions in a consistent format.
 *
 * Acceptable slot child variants are:
 *
 * - `img[slot=end]`
 * - `img[slot=start]`
 *
 *  @example
 * ```html
 * <petal-list-item
 *     headline="User Name"
 *     supportingText="user@name.com">
 *   <petal-icon slot="start">account_circle</petal-icon>
 *   <petal-icon slot="end">check</petal-icon>
 * </petal-list-item>
 * ```
 *
 * @example
 *
 * @final
 * @suppress {visibility}
 */
@customElement('petal-list-item')
export class PetalListItem extends ListItem {
  static override styles: CSSResultOrNative[] = [styles];
}
