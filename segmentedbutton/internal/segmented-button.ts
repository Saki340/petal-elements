/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import '../../focus/md-focus-ring.js';
import '../../ripple/ripple.js';

import {html, LitElement, nothing, PropertyValues, svg} from 'lit';
import {property, state} from 'lit/decorators.js';
import {classMap} from 'lit/directives/class-map.js';

import {ARIAMixinStrict} from '../../internal/aria/aria.js';
import {mixinDelegatesAria} from '../../internal/aria/delegate.js';

// Separate variable needed for closure.
const segmentedButtonBaseClass = mixinDelegatesAria(LitElement);

/**
 * A segmented button, after Jetpack Compose Material 3 (`SegmentedButton` in
 * SegmentedButton.kt). Only for use as a child of a segmented button set.
 *
 * @fires segmented-button-interaction {Event} Dispatched when the button is
 * clicked. --bubbles --composed
 * @fires segmented-button-selected-change {Event} Dispatched when `selected`
 * changes, so the set can update which button is in the tab order.
 * --bubbles --composed
 *
 * @slot icon - An icon before the label.
 */
export class SegmentedButton extends segmentedButtonBaseClass {
  /** Whether the button is disabled. */
  @property({type: Boolean, reflect: true}) disabled = false;

  /** Whether the button is selected. */
  @property({type: Boolean, reflect: true}) selected = false;

  /** The label text. */
  @property() label = '';

  /**
   * Hides the checkmark that a selected button shows in front of its label.
   */
  @property({type: Boolean, attribute: 'no-checkmark'}) noCheckmark = false;

  /**
   * Set by the segmented button set: `radio` in a single-select set,
   * `toggle` in a multiselect set.
   *
   * @internal
   */
  @property({attribute: false}) selectionRole: 'radio' | 'toggle' = 'toggle';

  /**
   * Set by the segmented button set: whether the button is in the tab order.
   *
   * @internal
   */
  @property({attribute: false}) tabbable = true;

  @state() private hasIcon = false;

  override focus(options?: FocusOptions) {
    this.renderRoot.querySelector('button')?.focus(options);
  }

  // In willUpdate, not updated: the set answers by setting `tabbable` on this
  // button, which then joins this update.
  protected override willUpdate(changed: PropertyValues<this>) {
    if (changed.has('selected') && changed.get('selected') !== undefined) {
      this.dispatchEvent(
        new Event('segmented-button-selected-change', {
          bubbles: true,
          composed: true,
        }),
      );
    }
  }

  protected override render() {
    // Needed for closure conformance
    const {ariaLabel} = this as ARIAMixinStrict;
    const radio = this.selectionRole === 'radio';
    const classes = {
      'selected': this.selected,
      'has-icon': this.hasIcon,
      'has-label': this.label !== '',
      'no-checkmark': this.noCheckmark,
    };
    return html`
      <button
        class="button ${classMap(classes)}"
        role=${radio ? 'radio' : nothing}
        aria-checked=${radio ? String(this.selected) : nothing}
        aria-pressed=${radio ? nothing : String(this.selected)}
        aria-label=${ariaLabel || nothing}
        tabindex=${this.tabbable ? 0 : -1}
        ?disabled=${this.disabled}
        @click=${this.handleClick}>
        <petal-focus-ring part="focus-ring"></petal-focus-ring>
        <petal-ripple ?disabled=${this.disabled}></petal-ripple>
        <span class="outline"></span>
        <span class="touch"></span>
        <span class="content">
          <span class="icon" aria-hidden="true">
            ${this.noCheckmark ? nothing : this.renderCheckmark()}
            <span class="slotted-icon">
              <slot name="icon" @slotchange=${this.handleIconSlotChange}></slot>
            </span>
          </span>
          <span class="label">${this.label}</span>
        </span>
      </button>
    `;
  }

  // Icons.Filled.Check, as SegmentedButtonDefaults.ActiveIcon.
  private renderCheckmark() {
    return html`<svg class="checkmark" viewBox="0 0 24 24">
      ${svg`<path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />`}
    </svg>`;
  }

  private handleIconSlotChange(event: Event) {
    const slot = event.target as HTMLSlotElement;
    this.hasIcon = slot.assignedElements({flatten: true}).length > 0;
  }

  private handleClick() {
    this.dispatchEvent(
      new Event('segmented-button-interaction', {bubbles: true, composed: true}),
    );
  }
}
