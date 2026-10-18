/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import {CSSResultOrNative} from 'lit';
import {customElement} from 'lit/decorators.js';

import {FloatingToolbar} from './internal/floating-toolbar.js';
import {styles} from './internal/floating-toolbar-styles.cssresult.js';

export {
  type FloatingToolbarColors,
  type FloatingToolbarFabPosition,
  type FloatingToolbarOrientation,
} from './internal/floating-toolbar.js';

declare global {
  interface HTMLElementTagNameMap {
    'petal-floating-toolbar': PetalFloatingToolbar;
  }
}

/**
 * @summary Floating toolbars hold the actions for the current screen in a
 * container that floats above the content. They expand and collapse.
 *
 * @description
 * A horizontal or vertical floating toolbar, after Jetpack Compose Material 3's
 * `HorizontalFloatingToolbar` and `VerticalFloatingToolbar`. The actions go in
 * the default slot. An element in the `fab` slot makes it a toolbar with a
 * floating action button, which stays when the toolbar collapses.
 *
 * @final
 * @suppress {visibility}
 */
@customElement('petal-floating-toolbar')
export class PetalFloatingToolbar extends FloatingToolbar {
  static override styles: CSSResultOrNative[] = [styles];
}
