/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import '../../elevation/elevation.js';
import '../../focus/md-focus-ring.js';
import '../../ripple/ripple.js';

import {html, isServer, LitElement, nothing} from 'lit';
import {property} from 'lit/decorators.js';

import {ARIAMixinStrict} from '../../internal/aria/aria.js';
import {mixinDelegatesAria} from '../../internal/aria/delegate.js';

const cardBaseClass = mixinDelegatesAria(LitElement);

/**
 * A Material 3 card, after Jetpack Compose (`Card`, `ElevatedCard`,
 * `OutlinedCard`).
 *
 * Content goes in the default slot. With `href` or `clickable`, the whole
 * card is one link or button, with a state layer and elevation by state; give
 * it an `aria-label`.
 *
 * With a mouse, a clickable card lifts 3px while hovered, and its state
 * layer is a soft light around the pointer (a petal-elements addition).
 *
 * @slot - The card's content. Put your own padding inside it.
 */
export class Card extends cardBaseClass {
  /** @nocollapse */
  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  /** Makes the whole card a link. */
  @property({reflect: true}) href = '';

  /** Where to open the link, as `<a target>`. */
  @property() target = '';

  /** Makes the whole card a button. */
  @property({type: Boolean, reflect: true}) clickable = false;

  /** Disables a clickable card. */
  @property({type: Boolean, reflect: true}) disabled = false;

  /** Shows the dragged elevation, while the card is being dragged. */
  @property({type: Boolean, reflect: true}) dragged = false;

  constructor() {
    super();
    if (isServer) return;
    // The hover light follows a mouse pointer (styles in _card.scss).
    this.addEventListener('pointermove', (event) => {
      if (event.pointerType !== 'mouse') return;
      const box = this.getBoundingClientRect();
      this.style.setProperty('--_pointer-x', `${event.clientX - box.left}px`);
      this.style.setProperty('--_pointer-y', `${event.clientY - box.top}px`);
    });
  }

  protected override render() {
    return html`
      <petal-elevation part="elevation"></petal-elevation>
      <div class="background"></div>
      <div class="light"></div>
      ${this.renderAction()}
      <slot></slot>
      <div class="outline"></div>
    `;
  }

  private renderAction() {
    // Needed for closure conformance
    const {ariaLabel} = this as ARIAMixinStrict;
    if (this.href && !this.disabled) {
      return html`<a
          id="action"
          class="action"
          href=${this.href}
          target=${this.target || nothing}
          aria-label=${ariaLabel || nothing}></a>
        <petal-focus-ring part="focus-ring" for="action"></petal-focus-ring>
        <petal-ripple for="action"></petal-ripple>`;
    }
    if (this.clickable || (this.href && this.disabled)) {
      return html`<button
          id="action"
          class="action"
          ?disabled=${this.disabled}
          aria-label=${ariaLabel || nothing}></button>
        <petal-focus-ring part="focus-ring" for="action"></petal-focus-ring>
        <petal-ripple for="action" ?disabled=${this.disabled}></petal-ripple>`;
    }
    return nothing;
  }
}
