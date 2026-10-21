/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import '../../../elevation/elevation.js';

import {html, isServer, LitElement} from 'lit';
import {property} from 'lit/decorators.js';

/**
 * A group of menu items on its own surface, after Jetpack Compose Material 3
 * Expressive (`DropdownMenuGroup`).
 *
 * Groups in a menu are separated by a small gap. The outer corners of the
 * first and last groups are larger. Once the pointer has hovered a group and
 * left it, the group takes the smaller inactive shape on all corners, as in
 * Compose, until the menu opens again.
 *
 * @slot - The group's `petal-menu-item`s.
 */
export class MenuGroup extends LitElement {
  /**
   * Keeps the group's shape when the pointer leaves it, instead of the
   * smaller inactive shape. Also applies when set on the menu.
   */
  @property({type: Boolean, attribute: 'no-inactive-shape', reflect: true})
  noInactiveShape = false;

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
    if (this.noInactiveShape || this.closest('[no-inactive-shape]')) return;
    this.toggleAttribute('inactive', true);
  };

  /**
   * Forgets the hover, back to the group's own shape at once. The menu calls
   * this when it opens, as Compose starts a new DropdownMenuGroup each time.
   *
   * @internal
   */
  resetHover() {
    if (!this.hasAttribute('hovered') && !this.hasAttribute('inactive')) return;
    this.style.transition = 'none';
    this.removeAttribute('hovered');
    this.removeAttribute('inactive');
    // Apply the shape before the transition comes back.
    getComputedStyle(this).borderRadius;
    this.style.removeProperty('transition');
  }
}
