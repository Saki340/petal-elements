/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import {CSSResultOrNative} from 'lit';
import {customElement} from 'lit/decorators.js';

import {BottomAppBar} from './internal/bottom-app-bar.js';
import {styles} from './internal/bottom-app-bar-styles.cssresult.js';

export {BottomAppBar} from './internal/bottom-app-bar.js';

declare global {
  interface HTMLElementTagNameMap {
    'petal-bottom-app-bar': PetalBottomAppBar;
  }
}

/**
 * @summary Bottom app bars show actions and a floating action button at the
 * bottom of the screen.
 *
 * @description
 * A bottom app bar, after Jetpack Compose Material 3's `BottomAppBar` and
 * `FlexibleBottomAppBar`. The actions go in the default slot, a floating
 * action button in the `fab` slot.
 *
 * @final
 * @suppress {visibility}
 */
@customElement('petal-bottom-app-bar')
export class PetalBottomAppBar extends BottomAppBar {
  static override styles: CSSResultOrNative[] = [styles];
}
