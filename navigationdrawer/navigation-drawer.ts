/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import {CSSResultOrNative} from 'lit';
import {customElement} from 'lit/decorators.js';

import {NavigationDrawer} from './internal/navigation-drawer.js';
import {styles} from './internal/navigation-drawer-styles.cssresult.js';

export {type NavigationDrawerType} from './internal/navigation-drawer.js';

declare global {
  interface HTMLElementTagNameMap {
    'petal-navigation-drawer': PetalNavigationDrawer;
  }
}

/**
 * @summary Navigation drawers give access to destinations in a side panel:
 * over the page, beside it, or always shown.
 *
 * @description
 * Put `<petal-navigation-drawer-item>` elements in the drawer, with headlines
 * and dividers between groups. Set `type` to `modal` (the default, over the
 * page with a scrim), `dismissible` (beside the page content, which it pushes
 * aside) or `standard` (always shown), and `open` (or call `show()` and
 * `close()`) to open and close it. Listen to `change` to know when the user
 * picks another item.
 *
 * @final
 * @suppress {visibility}
 */
@customElement('petal-navigation-drawer')
export class PetalNavigationDrawer extends NavigationDrawer {
  static override styles: CSSResultOrNative[] = [styles];
}
