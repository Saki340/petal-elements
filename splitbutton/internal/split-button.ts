/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import '../../button/elevated-button.js';
import '../../button/filled-button.js';
import '../../button/filled-tonal-button.js';
import '../../button/outlined-button.js';

import {html, isServer, LitElement, nothing} from 'lit';
import {property, query} from 'lit/decorators.js';
import {literal, html as staticHtml} from 'lit/static-html.js';

import {ARIAMixinStrict} from '../../internal/aria/aria.js';
import {mixinDelegatesAria} from '../../internal/aria/delegate.js';
import {springEasing} from '../../internal/motion/spring.js';

/** Emphasis of a split button, like the Compose split button variants. */
export type SplitButtonVariant = 'filled' | 'tonal' | 'elevated' | 'outlined';

/** Sizes of a split button (SplitButtonDefaults heights). */
export type SplitButtonSize = 'xsmall' | 'small' | 'medium' | 'large' | 'xlarge';

/**
 * The rotation of the trailing icon is `animateFloatAsState(0f or 180f)` with
 * its default animation spec, spring() with damping ratio
 * Spring.DampingRatioNoBouncy (1) and stiffness Spring.StiffnessMedium (1500).
 */
const ICON_ROTATION_SPRING = {dampingRatio: 1, stiffness: 1500};
let iconRotation: {easing: string; duration: number} | undefined;

const splitButtonBaseClass = mixinDelegatesAria(LitElement);

/**
 * A split button: a leading button for the main action and a trailing button
 * that toggles a menu.
 *
 * @fires input {InputEvent} Dispatched when the trailing button toggles --bubbles
 * --composed
 * @fires change {Event} Dispatched when the trailing button toggles --bubbles
 * @fires trailing-click {Event} Dispatched when an `uncheckable` trailing
 * button is clicked --bubbles --composed
 */
export class SplitButton extends splitButtonBaseClass {
  /** @nocollapse */
  static override shadowRootOptions: ShadowRootInit = {
    mode: 'open',
    delegatesFocus: true,
  };

  /** `filled` (default), `tonal`, `elevated` or `outlined`. */
  @property({reflect: true}) variant: SplitButtonVariant = 'filled';

  /** `xsmall`, `small` (default), `medium`, `large` or `xlarge`. */
  @property({reflect: true}) size: SplitButtonSize = 'small';

  /** Whether both buttons are disabled. */
  @property({type: Boolean, reflect: true}) disabled = false;

  /**
   * Whether the trailing button is checked, which is when its menu is open.
   * Its shape becomes a circle and its icon turns upside down.
   */
  @property({type: Boolean, reflect: true}) checked = false;

  /**
   * Makes the trailing button a plain button: it cannot be checked, its icon
   * does not turn and it fires `trailing-click` instead of `change`.
   */
  @property({type: Boolean, reflect: true}) uncheckable = false;

  /** Accessible name of the trailing button, which only shows an icon. */
  @property({attribute: 'trailing-label'}) trailingLabel = 'More options';

  @query('.leading') private readonly leadingButton!: HTMLElement | null;
  @query('.trailing') private readonly trailingButton!: HTMLElement | null;

  override connectedCallback() {
    super.connectedCallback();
    if (isServer) return;
    // The spring of the icon rotation, as a CSS easing.
    iconRotation ??= springEasing(ICON_ROTATION_SPRING);
    this.style.setProperty('--_icon-rotation-easing', iconRotation.easing);
    this.style.setProperty(
      '--_icon-rotation-duration',
      `${iconRotation.duration}ms`,
    );
  }

  override focus(options?: FocusOptions) {
    this.leadingButton?.focus(options);
  }

  /** Focuses the trailing button. */
  focusTrailing(options?: FocusOptions) {
    this.trailingButton?.focus(options);
  }

  protected override render() {
    // Needed for closure conformance
    const {ariaLabel} = this as ARIAMixinStrict;
    const tag = {
      filled: literal`petal-filled-button`,
      tonal: literal`petal-filled-tonal-button`,
      elevated: literal`petal-elevated-button`,
      outlined: literal`petal-outlined-button`,
    }[this.variant] ?? literal`petal-filled-button`;
    const checkable = !this.uncheckable;
    return html`
      ${staticHtml`<${tag}
        class="part leading"
        size=${this.size}
        ?disabled=${this.disabled}
        aria-label=${ariaLabel || nothing}
        ><slot name="icon" slot="icon"></slot><slot></slot></${tag}>`}
      ${staticHtml`<${tag}
        class="part trailing"
        size=${this.size}
        ?disabled=${this.disabled}
        aria-label=${this.trailingLabel}
        aria-haspopup=${checkable ? 'menu' : nothing}
        aria-expanded=${checkable ? String(this.checked) : nothing}
        @click=${this.handleTrailingClick}
        ><span class="chevron" slot="icon"
          ><slot name="trailing-icon"
            ><svg viewBox="0 0 24 24" aria-hidden="true"
              ><path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6z"></path
            ></svg
          ></slot
        ></span></${tag}>`}
    `;
  }

  private handleTrailingClick(event: Event) {
    // A click on the host means the leading button.
    event.stopPropagation();
    if (this.disabled) return;
    if (this.uncheckable) {
      this.dispatchEvent(
        new Event('trailing-click', {bubbles: true, composed: true}),
      );
      return;
    }
    this.checked = !this.checked;
    this.dispatchEvent(
      new InputEvent('input', {bubbles: true, composed: true}),
    );
    // Bubbles but does not compose, like native <input> and <select>.
    this.dispatchEvent(new Event('change', {bubbles: true}));
  }
}
