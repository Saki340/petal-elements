/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import {CSSResultOrNative} from 'lit';
import {customElement} from 'lit/decorators.js';

import {OutlinedSelect} from './internal/outlined-select.js';
import {styles} from './internal/outlined-select-styles.cssresult.js';
import {styles as sharedStyles} from './internal/shared-styles.cssresult.js';

declare global {
  interface HTMLElementTagNameMap {
    'petal-outlined-select': PetalOutlinedSelect;
  }
}

/**
 * @summary Select menus show a list of options and the selected option in a
 * field.
 *
 * @description
 * The select component allows users to choose a value from a fixed list of
 * available options. Composed of an interactive anchor button and a menu, it is
 * analogous to the native HTML `<select>` element. This is the "outlined"
 * variant.
 *
 * @example
 * ```html
 * <petal-outlined-select label="fruits">
 *   <!-- An empty selected option will give select an "un-filled" state -->
 *   <petal-select-option selected></petal-select-option>
 *   <petal-select-option value="apple" headline="Apple"></petal-select-option>
 *   <petal-select-option value="banana" headline="Banana"></petal-select-option>
 *   <petal-select-option value="kiwi" headline="Kiwi"></petal-select-option>
 *   <petal-select-option value="orange" headline="Orange"></petal-select-option>
 *   <petal-select-option value="tomato" headline="Tomato"></petal-select-option>
 * </petal-outlined-select>
 * ```
 *
 * @final
 * @suppress {visibility}
 */
@customElement('petal-outlined-select')
export class PetalOutlinedSelect extends OutlinedSelect {
  static override styles: CSSResultOrNative[] = [sharedStyles, styles];
}
