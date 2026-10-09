/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import {CSSResultOrNative} from 'lit';
import {customElement} from 'lit/decorators.js';

import {TopAppBar} from './internal/top-app-bar.js';
import {styles} from './internal/top-app-bar-styles.cssresult.js';

export {type TopAppBarSize} from './internal/top-app-bar.js';

declare global {
  interface HTMLElementTagNameMap {
    'petal-top-app-bar': PetalTopAppBar;
  }
}

/**
 * @summary Top app bars show the title of the screen, navigation and
 * actions at the top of the page.
 *
 * @final
 * @suppress {visibility}
 */
@customElement('petal-top-app-bar')
export class PetalTopAppBar extends TopAppBar {
  static override styles: CSSResultOrNative[] = [styles];
}
