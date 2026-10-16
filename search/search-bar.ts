/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import {CSSResultOrNative} from 'lit';
import {customElement} from 'lit/decorators.js';

import {SearchBar} from './internal/search-bar.js';
import {styles} from './internal/search-bar-styles.cssresult.js';

export {type SearchBarLayout} from './internal/search-bar.js';

declare global {
  interface HTMLElementTagNameMap {
    'petal-search-bar': PetalSearchBar;
  }
}

/**
 * @summary Search bars let people enter a keyword or phrase and get relevant
 * suggestions or results.
 *
 * @description
 * A search bar is a floating field that expands into a search view, full
 * screen or docked under the bar. The results go in the default slot.
 *
 * @final
 * @suppress {visibility}
 */
@customElement('petal-search-bar')
export class PetalSearchBar extends SearchBar {
  static override styles: CSSResultOrNative[] = [styles];
}
