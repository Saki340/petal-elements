/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import '../../focus/md-focus-ring.js';
import '../../ripple/ripple.js';

import {html, isServer, PropertyValues} from 'lit';

import {
  NavigationIconPosition,
  NavigationItem,
} from '../../internal/navigation/navigation-item.js';

/**
 * An item of a navigation drawer, after Jetpack Compose Material 3
 * (`NavigationDrawerItem` in NavigationDrawer.kt).
 *
 * The icon goes in the `icon` slot (and optionally a `selected-icon` slot),
 * the label in the default slot, and a badge (for example a count) in the
 * `badge` slot. An item with `href` is a link. The selected item is the
 * current page (`aria-current="page"`).
 *
 * @slot badge - Text at the end of the item, such as an unread count.
 */
export class NavigationDrawerItem extends NavigationItem {
  constructor() {
    super();
    if (isServer) return;
    // Items in a drawer are links or buttons in the page's tab order, with
    // headlines and dividers between them, rather than tabs in a tablist.
    this.internals.role = 'button';
  }

  override connectedCallback() {
    super.connectedCallback();
    // The drawer finds its items by this attribute.
    this.setAttribute('petal-navigation-drawer-item', '');
  }

  protected override get position(): NavigationIconPosition {
    return 'start';
  }

  protected override renderExtra() {
    return html`<span class="badge"><slot name="badge"></slot></span>`;
  }

  protected override updated(changed: PropertyValues<this>) {
    super.updated(changed);
    this.internals.role = this.href && !this.disabled ? 'link' : 'button';
    this.internals.ariaSelected = null;
    this.internals.ariaCurrent = this.selected ? 'page' : null;
  }
}
