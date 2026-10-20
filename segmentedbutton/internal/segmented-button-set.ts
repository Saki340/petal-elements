/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import {html, LitElement, nothing, PropertyValues} from 'lit';
import {property, queryAssignedElements} from 'lit/decorators.js';

import {ARIAMixinStrict} from '../../internal/aria/aria.js';
import {mixinDelegatesAria} from '../../internal/aria/delegate.js';

import {SegmentedButton} from './segmented-button.js';

// Separate variable needed for closure.
const segmentedButtonSetBaseClass = mixinDelegatesAria(LitElement);

/**
 * A row of segmented buttons, after Jetpack Compose Material 3
 * (`SingleChoiceSegmentedButtonRow` and `MultiChoiceSegmentedButtonRow` in
 * SegmentedButton.kt). **Only** segmented buttons may be used as children.
 *
 * A single-select set is a radio group: one button is in the tab order and
 * the arrow keys select the next or previous button. In a multiselect set
 * every button is a toggle button in the tab order.
 *
 * @fires segmented-button-set-selection {CustomEvent<{button: SegmentedButton, selected: boolean, index: number}>}
 * Dispatched when a button is selected programmatically with the
 * `setButtonSelected` method as well as on user interaction. --bubbles
 * --composed
 */
export class SegmentedButtonSet extends segmentedButtonSetBaseClass {
  /** Allows several buttons to be selected. */
  @property({type: Boolean}) multiselect = false;

  @queryAssignedElements({flatten: true})
  private readonly assignedElements!: HTMLElement[];

  /** The segmented buttons in the set. */
  get buttons(): SegmentedButton[] {
    return this.assignedElements.filter(
      (el): el is SegmentedButton => el instanceof SegmentedButton,
    );
  }

  getButtonDisabled(index: number): boolean {
    if (this.indexOutOfBounds(index)) return false;
    return this.buttons[index].disabled;
  }

  setButtonDisabled(index: number, disabled: boolean) {
    if (this.indexOutOfBounds(index)) return;
    this.buttons[index].disabled = disabled;
    this.updateButtons();
  }

  getButtonSelected(index: number): boolean {
    if (this.indexOutOfBounds(index)) return false;
    return this.buttons[index].selected;
  }

  setButtonSelected(index: number, selected: boolean) {
    // Ignore out-of-index values.
    if (this.indexOutOfBounds(index)) return;
    // Ignore disabled buttons.
    if (this.getButtonDisabled(index)) return;

    const buttons = this.buttons;
    if (this.multiselect) {
      buttons[index].selected = selected;
      this.emitSelectionEvent(index);
      return;
    }

    // Single-select segmented buttons are not unselectable.
    if (!selected) return;

    buttons[index].selected = true;
    // Deselect all other buttons for single-select.
    for (let i = 0; i < buttons.length; i++) {
      if (i !== index) buttons[i].selected = false;
    }
    this.updateButtons();
    this.emitSelectionEvent(index);
  }

  protected override updated(changed: PropertyValues<this>) {
    // Only the buttons' properties change here, not the set's own.
    if (changed.has('multiselect')) {
      this.updateButtons();
    }
  }

  protected override render() {
    // Needed for closure conformance
    const {ariaLabel} = this as ARIAMixinStrict;
    return html`
      <span
        class="set"
        role=${this.multiselect ? 'group' : 'radiogroup'}
        aria-label=${ariaLabel || nothing}
        @segmented-button-interaction=${this.handleInteraction}
        @segmented-button-selected-change=${this.updateButtons}
        @keydown=${this.handleKeydown}>
        <slot @slotchange=${this.updateButtons}></slot>
      </span>
    `;
  }

  // The buttons' roles, and which ones are in the tab order: all of them in a
  // multiselect set; the selected one (or else the first enabled one) in a
  // single-select set.
  private updateButtons() {
    const buttons = this.buttons;
    const enabled = buttons.filter((button) => !button.disabled);
    const current =
      enabled.find((button) => button.selected) ?? enabled[0] ?? null;
    for (const button of buttons) {
      button.selectionRole = this.multiselect ? 'toggle' : 'radio';
      button.tabbable = this.multiselect || button === current;
    }
  }

  private handleInteraction(event: Event) {
    const index = this.buttons.indexOf(event.target as SegmentedButton);
    if (this.indexOutOfBounds(index)) return;
    this.setButtonSelected(index, !this.buttons[index].selected);
  }

  private handleKeydown(event: KeyboardEvent) {
    if (this.multiselect) return;
    const isRtl = getComputedStyle(this).direction === 'rtl';
    let step = 0;
    switch (event.key) {
      case 'ArrowDown':
        step = 1;
        break;
      case 'ArrowUp':
        step = -1;
        break;
      case 'ArrowRight':
        step = isRtl ? -1 : 1;
        break;
      case 'ArrowLeft':
        step = isRtl ? 1 : -1;
        break;
      default:
        return;
    }

    const buttons = this.buttons;
    const from = buttons.indexOf(event.target as SegmentedButton);
    if (from < 0) return;
    event.preventDefault();
    for (let i = 1; i < buttons.length; i++) {
      const index = (from + step * i + buttons.length) % buttons.length;
      if (buttons[index].disabled) continue;
      buttons[index].focus();
      this.setButtonSelected(index, true);
      return;
    }
  }

  private indexOutOfBounds(index: number): boolean {
    return index < 0 || index >= this.buttons.length;
  }

  private emitSelectionEvent(index: number) {
    this.dispatchEvent(
      new CustomEvent('segmented-button-set-selection', {
        detail: {
          button: this.buttons[index],
          selected: this.buttons[index].selected,
          index,
        },
        bubbles: true,
        composed: true,
      }),
    );
  }
}
