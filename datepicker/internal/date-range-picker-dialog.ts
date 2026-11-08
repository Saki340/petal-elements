/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import '../../button/text-button.js';
import '../../dialog/dialog.js';
import '../../iconbutton/icon-button.js';

import {html, PropertyValues} from 'lit';
import {property, query, state} from 'lit/decorators.js';

import {icon, ICONS} from './date-entry.js';
import {DateEntryDialog} from './date-entry-dialog.js';
import type {DateRangePicker} from './date-range-picker.js';

/**
 * A date range picker in a dialog, with the row of Compose's
 * `DateRangePickerSample` above it: Close at the start and Save at the end.
 * The selection is only kept when Save is pressed, which takes both dates.
 *
 * @fires open {Event} The dialog is opening, before any animations.
 * --cancelable
 * @fires opened {Event} The dialog has opened, after any animations.
 * @fires close {Event} The dialog is closing, before any animations.
 * --cancelable
 * @fires closed {Event} The dialog has closed, after any animations.
 * @fires cancel {Event} The dialog was canceled with Escape or by clicking
 * outside it. --cancelable
 * @fires change {Event} A range was confirmed with Save. --bubbles
 */
export class DateRangePickerDialog extends DateEntryDialog {
  /** The confirmed first date, as an ISO date (`2026-10-21`), or `''`. */
  @property() start = '';

  /** The confirmed last date, as an ISO date, or `''`. */
  @property() end = '';

  /** The title above the dates in calendar mode. */
  @property({attribute: 'picker-title'}) pickerTitle = 'Select dates';

  /** The title above the dates in text input mode. */
  @property({attribute: 'input-title'}) inputTitle = 'Enter dates';

  /** Names the first date: its text field and headline while it is empty. */
  @property({attribute: 'start-label'}) startLabel = 'Start date';

  /** Names the last date: its text field and headline while it is empty. */
  @property({attribute: 'end-label'}) endLabel = 'End date';

  /** The confirm button's label. */
  @property({attribute: 'confirm-label'}) confirmLabel = 'Save';

  /** The close button's accessible label. */
  @property({attribute: 'dismiss-label'}) dismissLabel = 'Close';

  /** The dates picked in the open dialog, not yet confirmed. */
  @state() private pendingStart = '';
  @state() private pendingEnd = '';

  @query('petal-date-range-picker') private readonly picker!: DateRangePicker | null;

  protected override willUpdate(changed: PropertyValues<this>) {
    // Each opening starts from the confirmed dates.
    if (changed.has('open') && this.open) {
      this.pendingStart = this.start;
      this.pendingEnd = this.end;
    }
  }

  protected override render() {
    return html`
      <petal-dialog
        .open=${this.open}
        ?quick=${this.quick}
        aria-label=${this.displayMode === 'input' ? this.inputTitle : this.pickerTitle}
        @open=${this.handleOpenWithRange}
        @opened=${this.handleOpened}
        @close=${this.redispatch}
        @closed=${this.handleClosed}
        @cancel=${this.redispatch}>
        <div slot="content" class="content">
          <div class="toolbar">
            <petal-icon-button aria-label=${this.dismissLabel} @click=${this.dismiss}
              >${icon(ICONS.close)}</petal-icon-button
            >
            <petal-text-button ?disabled=${!this.pendingEnd} @click=${this.confirm}
              >${this.confirmLabel}</petal-text-button
            >
          </div>
          <petal-date-range-picker
            .start=${this.pendingStart}
            .end=${this.pendingEnd}
            min=${this.min}
            max=${this.max}
            locale=${this.locale}
            .firstDayOfWeek=${this.firstDayOfWeek}
            display-mode=${this.displayMode}
            ?hide-mode-toggle=${this.hideModeToggle}
            picker-title=${this.pickerTitle}
            input-title=${this.inputTitle}
            start-label=${this.startLabel}
            end-label=${this.endLabel}
            .isDateSelectable=${this.isDateSelectable}
            .messages=${this.messages}
            @input=${this.handlePickerInput}
            @change=${(event: Event) => event.stopPropagation()}></petal-date-range-picker>
        </div>
      </petal-dialog>
    `;
  }

  // An earlier opening may have left the list scrolled elsewhere.
  private handleOpenWithRange(event: Event) {
    this.handleOpen(event);
    if (this.pendingStart) this.picker?.showMonthOf(this.pendingStart);
  }

  private handlePickerInput(event: Event) {
    event.stopPropagation();
    const picker = event.target as DateRangePicker;
    this.pendingStart = picker.start;
    this.pendingEnd = picker.end;
  }

  private confirm() {
    const changed = this.pendingStart !== this.start || this.pendingEnd !== this.end;
    this.start = this.pendingStart;
    this.end = this.pendingEnd;
    if (changed) this.dispatchEvent(new Event('change', {bubbles: true}));
    this.dialog?.close('confirm');
  }
}
