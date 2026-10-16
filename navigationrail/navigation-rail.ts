/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import {CSSResultOrNative} from 'lit';
import {customElement} from 'lit/decorators.js';

import {NavigationRail} from './internal/navigation-rail.js';
import {styles} from './internal/navigation-rail-styles.cssresult.js';

declare global {
  interface HTMLElementTagNameMap {
    'petal-navigation-rail': PetalNavigationRail;
  }
}

/**
 * @summary Navigation rails let people switch between a few primary
 * destinations at the side of the screen, and expand to show labels beside the
 * icons.
 *
 * @description
 * Put `<petal-navigation-rail-item>` elements in the rail, and a menu button or
 * a floating action button in the `header` slot. The rail keeps one of the
 * items selected, puts it in the tab order, and moves the focus with the up and
 * down arrow keys. It has the `tablist` role and its items the `tab` role, as
 * in Compose. Listen to `change` to know when the user picks another item.
 * Set `expanded` to widen the rail; the items follow.
 *
 * @final
 * @suppress {visibility}
 */
@customElement('petal-navigation-rail')
export class PetalNavigationRail extends NavigationRail {
  static override styles: CSSResultOrNative[] = [styles];
}
