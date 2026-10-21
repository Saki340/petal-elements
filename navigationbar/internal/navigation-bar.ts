/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import {html} from 'lit';
import {property, state} from 'lit/decorators.js';
import {styleMap} from 'lit/directives/style-map.js';

import {NavigationContainer} from '../../internal/navigation/navigation-container.js';

/**
 * How the items of a navigation bar share its width, as Compose's
 * `ShortNavigationBarArrangement`.
 */
export type NavigationBarArrangement = 'equal-weight' | 'centered';

/**
 * A Material 3 Expressive navigation bar, after Jetpack Compose
 * (`ShortNavigationBar`).
 *
 * The bar keeps one of its items selected and fires `change` when the user
 * picks another.
 *
 * @slot - The `petal-navigation-bar-item`s (three to five).
 */
export class NavigationBar extends NavigationContainer {
  protected readonly orientation = 'horizontal';

  /**
   * `equal-weight` gives every item the same width. `centered` groups the items
   * in the middle, with a side padding that depends on how many there are.
   */
  @property({reflect: true}) arrangement: NavigationBarArrangement = 'equal-weight';

  @state() private count = 0;

  protected override render() {
    // Compose's calculateCenteredContentHorizontalPadding: (100 - 10 * (n + 3))
    // / 2 percent of the bar on each side, for up to 6 items.
    const n = this.count;
    const padding =
      this.arrangement === 'centered' && n > 0 && n <= 6 ? (100 - 10 * (n + 3)) / 2 : 0;
    return html`<div class="bar" style=${styleMap({paddingInline: `${padding}%`})}>
      <slot @slotchange=${this.onSlotChange}></slot>
    </div>`;
  }

  private onSlotChange() {
    this.count = this.items.length;
    this.handleSlotChange();
  }
}
