/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import {html, isServer, LitElement} from 'lit';
import {property} from 'lit/decorators.js';

// The FILL axis of Material Symbols, as a registered property so it animates.
// It inherits, so a parent can fill its icons (for example when selected).
if (!isServer && 'registerProperty' in CSS) {
  try {
    CSS.registerProperty({
      name: '--md-icon-fill',
      syntax: '<number>',
      inherits: true,
      initialValue: '0',
    });
  } catch {
    // Already registered.
  }
}

/**
 * An icon element.
 *
 * @slot - The icon: a Material Symbols ligature name (`search`) or an `<svg>`.
 */
export class Icon extends LitElement {
  /**
   * Fills the icon (the Material Symbols FILL axis). Changes animate.
   */
  @property({type: Boolean, reflect: true}) filled = false;

  protected override render() {
    return html`<slot></slot>`;
  }

  override connectedCallback() {
    super.connectedCallback();
    const ariaHidden = this.getAttribute('aria-hidden');
    if (ariaHidden === 'false') {
      // Allow the user to set `aria-hidden="false"` to create an icon that is
      // announced by screenreaders.
      this.removeAttribute('aria-hidden');
      return;
    }

    // Needed for VoiceOver, which will create a "group" if the element is a
    // sibling to other content.
    this.setAttribute('aria-hidden', 'true');
  }
}
