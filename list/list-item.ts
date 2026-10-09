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
 * @summary An item in a list.
 *
 * @description
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
