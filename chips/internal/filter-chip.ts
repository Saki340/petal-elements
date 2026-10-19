/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import '../../elevation/elevation.js';

import {html, nothing} from 'lit';
import {property, query} from 'lit/decorators.js';

import {ARIAMixinStrict} from '../../internal/aria/aria.js';
import {redispatchEvent} from '../../internal/events/redispatch-event.js';

import {MultiActionChip} from './multi-action-chip.js';
import {renderRemoveButton} from './trailing-icons.js';

/**
 * A filter chip component.
 *
 * @fires remove {Event} Dispatched when the remove button is clicked.
 */
export class FilterChip extends MultiActionChip {
  @property({type: Boolean}) elevated = false;
  @property({type: Boolean}) removable = false;
  @property({type: Boolean, reflect: true}) selected = false;

  /**
   * Whether the chip has the expressive shapes of Compose's FilterChip with
   * `shapes`: rounder while not selected, fully rounded when selected and
   * less round while pressed, morphing on a spring. The spacing next to the
   * icons is tighter and the leading icon is on-surface-variant.
   */
  @property({type: Boolean, reflect: true}) expressive = false;

  /**
   * Only needed for SSR.
   *
   * Add this attribute when a filter chip has a `slot="selected-icon"` to avoid
   * a Flash Of Unstyled Content.
   */
  @property({type: Boolean, reflect: true, attribute: 'has-selected-icon'})
  hasSelectedIcon = false;

  protected get primaryId() {
    return 'button';
  }

  @query('.primary.action')
  protected readonly primaryAction!: HTMLElement | null;
  @query('.trailing.action')
  protected readonly trailingAction!: HTMLElement | null;

  protected override getContainerClasses() {
    return {
      ...super.getContainerClasses(),
      elevated: this.elevated,
      selected: this.selected,
      'has-trailing': this.removable,
    };
  }

  protected override renderPrimaryAction(content: unknown) {
    const {ariaLabel} = this as ARIAMixinStrict;
    return html`
      <button
        class="primary action"
        id="button"
        aria-label=${ariaLabel || nothing}
        aria-pressed=${this.selected}
        aria-disabled=${this.softDisabled || nothing}
        ?disabled=${this.disabled && !this.alwaysFocusable}
        @click=${this.handleClickOnChild}
        >${content}</button
      >
    `;
  }

  // The selected icon is always rendered, so that it can fade out and the
  // space for it can shrink after the chip is deselected (Compose's
  // AnimatingChipContent keeps the last leading icon while it animates out).
  protected override renderLeadingIcon() {
    return html`
      ${super.renderLeadingIcon()}
      <span class="selected-icon">
        <slot name="selected-icon">
          <svg class="checkmark" viewBox="0 0 18 18" aria-hidden="true">
            <path
              d="M6.75012 12.1274L3.62262 8.99988L2.55762 10.0574L6.75012 14.2499L15.7501 5.24988L14.6926 4.19238L6.75012 12.1274Z" />
          </svg>
        </slot>
      </span>
    `;
  }

  protected override renderTrailingAction(focusListener: EventListener) {
    if (this.removable) {
      return renderRemoveButton({
        focusListener,
        ariaLabel: this.ariaLabelRemove,
        disabled: this.disabled || this.softDisabled,
      });
    }

    return nothing;
  }

  // A flat filter chip has an elevation too: it rises to level 1 while
  // hovered (filterChipElevation() in Chip.kt).
  protected override renderOutline() {
    const elevation = html`<petal-elevation part="elevation"></petal-elevation>`;
    if (this.elevated) {
      return elevation;
    }

    return html`${elevation}${super.renderOutline()}`;
  }

  private handleClickOnChild(event: MouseEvent) {
    if (this.disabled || this.softDisabled) {
      return;
    }

    // Store prevValue to revert in case `chip.selected` is changed during an
    // event listener.
    const prevValue = this.selected;
    this.selected = !this.selected;

    const preventDefault = !redispatchEvent(this, event);
    if (preventDefault) {
      // We should not do `this.selected = !this.selected`, since a client
      // click listener could change its value. Instead, always revert to the
      // original value.
      this.selected = prevValue;
      return;
    }
  }
}
