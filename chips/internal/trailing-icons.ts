/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import '../../focus/md-focus-ring.js';
import '../../ripple/ripple.js';

import {html, nothing} from 'lit';

import {Chip} from './chip.js';

interface RemoveButtonProperties {
  ariaLabel: string | null;
  disabled: boolean;
  focusListener: EventListener;
  tabbable?: boolean;
}

/** @protected */
export function renderRemoveButton({
  ariaLabel,
  disabled,
  focusListener,
  tabbable = false,
}: RemoveButtonProperties) {
  // When an aria-label is not provided, we use two spans with aria-labelledby
  // to create the "Remove <textContent>" label for the remove button. The first
  // is this #remove-label span, the second is the chip's #label slot span.
  return html`
    <span id="remove-label" hidden aria-hidden="true">Remove</span>
    <button
      class="trailing action"
      aria-label=${ariaLabel || nothing}
      aria-labelledby=${!ariaLabel ? 'remove-label label' : nothing}
      tabindex=${!tabbable ? -1 : nothing}
      @click=${handleRemoveClick}
      @focus=${focusListener}>
      <petal-focus-ring part="trailing-focus-ring"></petal-focus-ring>
      <petal-ripple ?disabled=${disabled}></petal-ripple>
      <span class="trailing icon" aria-hidden="true">
        <slot name="remove-trailing-icon">
          <svg viewBox="0 96 960 960">
            <path
              d="m249 849-42-42 231-231-231-231 42-42 231 231 231-231 42 42-231 231 231 231-42 42-231-231-231 231Z" />
          </svg>
        </slot>
      </span>
      <span class="touch"></span>
    </button>
  `;
}

function handleRemoveClick(this: Chip, event: Event) {
  if (this.disabled || this.softDisabled) {
    return;
  }

  event.stopPropagation();
  const preventDefault = !this.dispatchEvent(
    new Event('remove', {cancelable: true}),
  );
  if (preventDefault) {
    return;
  }

  this.remove();
}
