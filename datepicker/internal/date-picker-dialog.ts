/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import '../../button/text-button.js';
import '../../dialog/dialog.js';

import {html, LitElement, PropertyValues} from 'lit';
import {property, query, state} from 'lit/decorators.js';

import type {Dialog} from '../../dialog/internal/dialog.js';

import type {DatePickerDisplayMode, DatePickerMessages} from './date-picker.js';

/**
 * A date picker in a dialog, after Jetpack Compose Material 3
 * (`DatePickerDialog`): the picker, with Cancel and OK at the end. The
 * selection is only kept when OK is pressed.
 *
 * @fires open {Event} The dialog is opening, before any animations.
 * --cancelable
 * @fires opened {Event} The dialog has opened, after any animations.
 * @fires close {Event} The dialog is closing, before any animations.
 * --cancelable
 * @fires closed {Event} The dialog has closed, after any animations.
 * @fires cancel {Event} The dialog was canceled with Escape or by clicking
 * outside it. --cancelable
 * @fires change {Event} A date was confirmed with OK. --bubbles
 */
export class DatePickerDialog extends LitElement {
  /** Opens the dialog when `true`, closes it when `false`. */
  @property({type: Boolean, reflect: true}) open = false;

  /** The confirmed date, as an ISO date (`2026-10-21`), or `''`. */
  @property() value = '';

  /** The earliest date that can be selected, as an ISO date. */
  @property() min = '';

  /** The latest date that can be selected, as an ISO date. */
  @property() max = '';

  /** The locale; see `petal-date-picker`. */
  @property() locale = '';

  /** The first day of the week, 0 for Sunday to 6 for Saturday. */
  @property({type: Number, attribute: 'first-day-of-week'}) firstDayOfWeek?: number;

  /** `picker` shows the calendar, `input` a text field. */
  @property({attribute: 'display-mode'}) displayMode: DatePickerDisplayMode = 'picker';

  /** Hides the button that switches between the calendar and the text field. */
  @property({type: Boolean, attribute: 'hide-mode-toggle'}) hideModeToggle = false;

  /** The title above the headline in calendar mode. */
  @property({attribute: 'picker-title'}) pickerTitle = 'Select date';

  /** The title above the headline in text input mode. */
  @property({attribute: 'input-title'}) inputTitle = 'Select date';

  /** The headline in calendar mode while no date is selected. */
  @property({attribute: 'picker-headline'}) pickerHeadline = 'Selected date';

  /** The headline in text input mode while no date is entered. */
  @property({attribute: 'input-headline'}) inputHeadline = 'Entered date';

  /** The text field's label in text input mode. */
  @property({attribute: 'input-label'}) inputLabel = 'Date';

  /** The confirm button's label. */
  @property({attribute: 'confirm-label'}) confirmLabel = 'OK';

  /** The dismiss button's label. */
  @property({attribute: 'dismiss-label'}) dismissLabel = 'Cancel';

  /** Skips the opening and closing animations. */
  @property({type: Boolean}) quick = false;

  /** Whether a date can be selected; see `petal-date-picker`. */
  @property({attribute: false}) isDateSelectable?: (date: string) => boolean;

  /** Replaces some of the read-out and error texts. */
  @property({attribute: false}) messages: DatePickerMessages = {};

  /** The date picked in the open dialog, not yet confirmed. */
  @state() private pending = '';

  @query('petal-dialog') private readonly dialog!: Dialog | null;

  /** How the dialog was last closed: `confirm`, `dismiss` or `''`. */
  get returnValue() {
    return this.dialog?.returnValue ?? '';
  }

  /** Opens the dialog. Resolves once it has opened. */
  async show() {
    if (this.open) return;
    const opened = new Promise<void>((resolve) => (this.resolveShow = resolve));
    this.open = true;
    await opened;
  }

  /** Resolves the promise of `show()`. */
  private resolveShow?: () => void;

  private settleShow() {
    this.resolveShow?.();
    this.resolveShow = undefined;
  }

  /** Closes the dialog. Resolves once it has closed. */
  async close(returnValue?: string) {
    await this.dialog?.close(returnValue);
  }

  protected override willUpdate(changed: PropertyValues<this>) {
    // Each opening starts from the confirmed date.
    if (changed.has('open') && this.open) this.pending = this.value;
  }

  protected override render() {
    return html`
      <petal-dialog
        .open=${this.open}
        ?quick=${this.quick}
        aria-label=${this.displayMode === 'input' ? this.inputTitle : this.pickerTitle}
        @open=${this.handleOpen}
        @opened=${this.handleOpened}
        @close=${this.redispatch}
        @closed=${this.handleClosed}
        @cancel=${this.redispatch}>
        <petal-date-picker
          slot="content"
          .value=${this.pending}
          min=${this.min}
          max=${this.max}
          locale=${this.locale}
          .firstDayOfWeek=${this.firstDayOfWeek}
          display-mode=${this.displayMode}
          ?hide-mode-toggle=${this.hideModeToggle}
          picker-title=${this.pickerTitle}
          input-title=${this.inputTitle}
          picker-headline=${this.pickerHeadline}
          input-headline=${this.inputHeadline}
          input-label=${this.inputLabel}
          .isDateSelectable=${this.isDateSelectable}
          .messages=${this.messages}
          @input=${this.handlePickerInput}
          @change=${(event: Event) => event.stopPropagation()}></petal-date-picker>
        <div slot="actions" class="actions">
          <petal-text-button @click=${this.dismiss}>${this.dismissLabel}</petal-text-button>
          <petal-text-button ?disabled=${!this.pending} @click=${this.confirm}
            >${this.confirmLabel}</petal-text-button
          >
        </div>
      </petal-dialog>
    `;
  }

  private handlePickerInput(event: Event) {
    event.stopPropagation();
    this.pending = (event.target as HTMLElement & {value: string}).value;
  }

  private confirm() {
    const changed = this.pending !== this.value;
    this.value = this.pending;
    if (changed) this.dispatchEvent(new Event('change', {bubbles: true}));
    this.dialog?.close('confirm');
  }

  private dismiss() {
    this.dialog?.close('dismiss');
  }

  private handleOpen(event: Event) {
    // A prevented open leaves the dialog closed.
    if (!this.redispatch(event)) {
      this.open = false;
      this.settleShow();
    }
  }

  private handleOpened(event: Event) {
    this.redispatch(event);
    this.settleShow();
  }

  // The inner dialog stays open until its closing animation ends.
  private handleClosed(event: Event) {
    this.open = false;
    this.redispatch(event);
    this.settleShow();
  }

  /** Dispatches a copy of a dialog event on this element; false if prevented. */
  private redispatch(event: Event) {
    const copy = new Event(event.type, {cancelable: event.cancelable});
    const proceed = this.dispatchEvent(copy);
    if (!proceed) event.preventDefault();
    return proceed;
  }
}
