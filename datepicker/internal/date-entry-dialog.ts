/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import {LitElement} from 'lit';
import {property, query} from 'lit/decorators.js';

import type {Dialog} from '../../dialog/internal/dialog.js';

import type {DatePickerDisplayMode, DatePickerMessages} from './date-entry.js';

/** What the dialogs of the date picker and the date range picker share. */
export class DateEntryDialog extends LitElement {
  /** Opens the dialog when `true`, closes it when `false`. */
  @property({type: Boolean, reflect: true}) open = false;

  /** The earliest date that can be selected, as an ISO date. */
  @property() min = '';

  /** The latest date that can be selected, as an ISO date. */
  @property() max = '';

  /** The locale; see `petal-date-picker`. */
  @property() locale = '';

  /** The first day of the week, 0 for Sunday to 6 for Saturday. */
  @property({type: Number, attribute: 'first-day-of-week'}) firstDayOfWeek?: number;

  /** `picker` shows the calendar, `input` text fields. */
  @property({attribute: 'display-mode'}) displayMode: DatePickerDisplayMode = 'picker';

  /** Hides the button that switches between the calendar and text input. */
  @property({type: Boolean, attribute: 'hide-mode-toggle'}) hideModeToggle = false;

  /** Skips the opening and closing animations. */
  @property({type: Boolean}) quick = false;

  /** Whether a date can be selected; see `petal-date-picker`. */
  @property({attribute: false}) isDateSelectable?: (date: string) => boolean;

  /** Replaces some of the read-out and error texts. */
  @property({attribute: false}) messages: DatePickerMessages = {};

  @query('petal-dialog') protected readonly dialog!: Dialog | null;

  /** How the dialog was last closed: `confirm`, `dismiss` or `''`. */
  get returnValue() {
    return this.dialog?.returnValue ?? '';
  }

  /** Resolves the promise of `show()`. */
  private resolveShow?: () => void;

  /** Opens the dialog. Resolves once it has opened. */
  async show() {
    if (this.open) return;
    const opened = new Promise<void>((resolve) => (this.resolveShow = resolve));
    this.open = true;
    await opened;
  }

  /** Closes the dialog. Resolves once it has closed. */
  async close(returnValue?: string) {
    await this.dialog?.close(returnValue);
  }

  private settleShow() {
    this.resolveShow?.();
    this.resolveShow = undefined;
  }

  protected dismiss() {
    this.dialog?.close('dismiss');
  }

  protected handleOpen(event: Event) {
    // A prevented open leaves the dialog closed.
    if (!this.redispatch(event)) {
      this.open = false;
      this.settleShow();
    }
  }

  protected handleOpened(event: Event) {
    this.redispatch(event);
    this.settleShow();
  }

  // The inner dialog stays open until its closing animation ends.
  protected handleClosed(event: Event) {
    this.open = false;
    this.redispatch(event);
    this.settleShow();
  }

  /** Dispatches a copy of a dialog event on this element; false if prevented. */
  protected redispatch(event: Event) {
    const copy = new Event(event.type, {cancelable: event.cancelable});
    const proceed = this.dispatchEvent(copy);
    if (!proceed) event.preventDefault();
    return proceed;
  }
}
