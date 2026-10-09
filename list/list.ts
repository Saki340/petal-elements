/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import {CSSResultOrNative} from 'lit';
import {customElement} from 'lit/decorators.js';

import {List} from './internal/list.js';
import {styles} from './internal/list-styles.cssresult.js';

declare global {
  interface HTMLElementTagNameMap {
    'petal-list': PetalList;
  }
}

/**
 * @summary Lists show items of text and images in a vertical column.
 *
 * @final
 * @suppress {visibility}
 */
@customElement('petal-list')
export class PetalList extends List {
  static override styles: CSSResultOrNative[] = [styles];
}
