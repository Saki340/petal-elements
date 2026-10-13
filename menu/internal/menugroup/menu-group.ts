/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import '../../../elevation/elevation.js';

import {html, isServer, LitElement} from 'lit';

/**
 * A group of menu items on its own surface, after Jetpack Compose Material 3
 * Expressive (`DropdownMenuGroup`).
 *
 * Groups in a menu are separated by a small gap. The outer corners of the
 * first and last groups are larger. Once the pointer has hovered a group and
 * left it, the group takes the smaller inactive shape.
 */
export class MenuGroup extends LitElement {
  constructor() {
    super();
    if (isServer) return;
    this.addEventListener('pointerenter', this.onPointerEnter);
    this.addEventListener('pointerleave', this.onPointerLeave);
  }

  override connectedCallback() {
    super.connectedCallback();
    // The menu looks for its items inside elements with this attribute.
    this.setAttribute('petal-menu-group', '');
    if (!this.hasAttribute('role')) this.setAttribute('role', 'group');
  }

  protected override render() {
    return html`<petal-elevation part="elevation"></petal-elevation
      ><slot></slot>`;
  }

  // Compose's hover is a mouse hover.
  private readonly onPointerEnter = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse') return;
    this.removeAttribute('inactive');
    this.toggleAttribute('hovered', true);
  };

  private readonly onPointerLeave = () => {
    if (!this.hasAttribute('hovered')) return;
    this.removeAttribute('hovered');
    this.toggleAttribute('inactive', true);
  };
}
