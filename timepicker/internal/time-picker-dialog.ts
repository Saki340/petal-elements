/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import '../../button/text-button.js';
import '../../dialog/dialog.js';
import '../../iconbutton/icon-button.js';

import {html, LitElement, nothing, PropertyValues, svg} from 'lit';
import {property, query, state} from 'lit/decorators.js';

import type {Dialog} from '../../dialog/internal/dialog.js';

import type {
  TimePickerDisplayMode,
  TimePickerLayout,
  TimePickerMessages,
} from './time-picker.js';

// Material icons (Apache-2.0): keyboard and schedule.
const KEYBOARD_ICON =
  'M20 5H4c-1.1 0-1.99.9-1.99 2L2 17c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-9 3h2v2h-2V8zm0 3h2v2h-2v-2zM8 8h2v2H8V8zm0 3h2v2H8v-2zm-1 2H5v-2h2v2zm0-3H5V8h2v2zm9 7H8v-2h8v2zm0-4h-2v-2h2v2zm0-3h-2V8h2v2zm3 3h-2v-2h2v2zm0-3h-2V8h2v2z';
const SCHEDULE_ICON =
  'M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z';

/**
 * A time picker in a dialog, after Jetpack Compose Material 3
 * (`TimePickerDialog` and `TimePickerDialogDefaults`): a title, the picker,
 * and a row with the mode switch at the start and Cancel and OK at the end.
 * The time is only kept when OK is pressed.
 *
 * @fires open {Event} The dialog is opening, before any animations.
 * --cancelable
 * @fires opened {Event} The dialog has opened, after any animations.
 * @fires close {Event} The dialog is closing, before any animations.
 * --cancelable
 * @fires closed {Event} The dialog has closed, after any animations.
 * @fires cancel {Event} The dialog was canceled with Escape or by clicking
 * outside it. --cancelable
 * @fires change {Event} A time was confirmed with OK. --bubbles
 */
export class TimePickerDialog extends LitElement {
  /** Opens the dialog when `true`, closes it when `false`. */
  @property({type: Boolean, reflect: true}) open = false;

  /** The confirmed time, as `HH:MM`, or `''`. */
  @property() value = '';

  /** `picker` shows the clock dial, `input` text fields. */
  @property({attribute: 'display-mode'}) displayMode: TimePickerDisplayMode = 'picker';

  /** `12` or `24` hours; defaults to the locale's. */
  @property({attribute: 'hour-cycle'}) hourCycle: '' | '12' | '24' = '';

  /** The locale; see `petal-time-picker`. */
  @property() locale = '';

  /** The picker's layout; see `petal-time-picker`. */
  @property() layout: TimePickerLayout = 'auto';

  /** Hides the button that switches between the dial and the text fields. */
  @property({type: Boolean, attribute: 'hide-mode-toggle'}) hideModeToggle = false;

  /** The title with the dial. */
  @property({attribute: 'picker-title'}) pickerTitle = 'Select Time';

  /** The title with the text fields. */
  @property({attribute: 'input-title'}) inputTitle = 'Enter Time';

  /** The confirm button's label. */
  @property({attribute: 'confirm-label'}) confirmLabel = 'OK';

  /** The dismiss button's label. */
  @property({attribute: 'dismiss-label'}) dismissLabel = 'Cancel';

  /** The mode button's name with the dial. */
  @property({attribute: 'input-mode-label'}) inputModeLabel = 'Switch to text input mode';

  /** The mode button's name with the text fields. */
  @property({attribute: 'picker-mode-label'}) pickerModeLabel = 'Switch to clock mode';

  /** The AM label; see `petal-time-picker`. */
  @property({attribute: 'am-label'}) amLabel = '';

  /** The PM label; see `petal-time-picker`. */
  @property({attribute: 'pm-label'}) pmLabel = '';

  /** Skips the opening and closing animations. */
  @property({type: Boolean}) quick = false;

  /** Replaces some of the picker's texts. */
  @property({attribute: false}) messages: TimePickerMessages = {};

  /** The time set in the open dialog, not yet confirmed. */
  @state() private pending = '';
  @state() private mode: TimePickerDisplayMode = 'picker';

  @query('petal-dialog') private readonly dialog!: Dialog | null;

  private resolveShow?: () => void;

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

  /** Closes the dialog. Resolves once it has closed. */
  async close(returnValue?: string) {
    await this.dialog?.close(returnValue);
  }

  protected override willUpdate(changed: PropertyValues<this>) {
    // Each opening starts from the confirmed time and the chosen mode.
    if (changed.has('open') && this.open) {
      this.pending = this.value;
      this.mode = this.displayMode;
    }
    if (changed.has('displayMode')) this.mode = this.displayMode;
  }

  protected override render() {
    const input = this.mode === 'input';
    const title = input ? this.inputTitle : this.pickerTitle;
    return html`
      <petal-dialog
        .open=${this.open}
        ?quick=${this.quick}
        aria-label=${title}
        @open=${this.handleOpen}
        @opened=${this.handleOpened}
        @close=${this.redispatch}
        @closed=${this.handleClosed}
        @cancel=${this.redispatch}>
        <div slot="content" class="layout">
          <div class="title">${title}</div>
          <petal-time-picker
            .value=${this.pending}
            display-mode=${this.mode}
            hour-cycle=${this.hourCycle}
            locale=${this.locale}
            layout=${this.layout}
            am-label=${this.amLabel}
            pm-label=${this.pmLabel}
            .messages=${this.messages}
            @input=${this.handlePickerInput}
            @change=${(event: Event) => event.stopPropagation()}></petal-time-picker>
          <div class="actions">
            ${this.hideModeToggle
              ? nothing
              : html`<petal-icon-button
                  class="mode-toggle"
                  aria-label=${input ? this.pickerModeLabel : this.inputModeLabel}
                  @click=${this.toggleMode}>
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    ${svg`<path d=${input ? SCHEDULE_ICON : KEYBOARD_ICON} />`}
                  </svg>
                </petal-icon-button>`}
            <span class="spacer"></span>
            <petal-text-button @click=${this.dismiss}>${this.dismissLabel}</petal-text-button>
            <petal-text-button @click=${this.confirm}>${this.confirmLabel}</petal-text-button>
          </div>
        </div>
      </petal-dialog>
    `;
  }

  private toggleMode() {
    this.mode = this.mode === 'input' ? 'picker' : 'input';
  }

  private handlePickerInput(event: Event) {
    event.stopPropagation();
    this.pending = (event.target as HTMLElement & {value: string}).value;
  }

  private confirm() {
    // A time picker always shows a time: confirming keeps it even untouched.
    const picker = this.renderRoot.querySelector('petal-time-picker') as
      | (HTMLElement & {value: string})
      | null;
    const value = this.pending || (picker ? this.shownTime(picker) : '');
    const changed = value !== this.value;
    this.value = value;
    if (changed) this.dispatchEvent(new Event('change', {bubbles: true}));
    this.dialog?.close('confirm');
  }

  /** The time the picker shows while its value is still `''`: 00:00. */
  private shownTime(picker: HTMLElement & {value: string}) {
    return picker.value || '00:00';
  }

  private dismiss() {
    this.dialog?.close('dismiss');
  }

  private settleShow() {
    this.resolveShow?.();
    this.resolveShow = undefined;
  }

  private handleOpen(event: Event) {
    if (!this.redispatch(event)) {
      this.open = false;
      this.settleShow();
    }
  }

  private handleOpened(event: Event) {
    this.redispatch(event);
    this.settleShow();
  }

  private handleClosed(event: Event) {
    this.open = false;
    this.redispatch(event);
    this.settleShow();
  }

  private redispatch(event: Event) {
    const copy = new Event(event.type, {cancelable: event.cancelable});
    const proceed = this.dispatchEvent(copy);
    if (!proceed) event.preventDefault();
    return proceed;
  }
}
