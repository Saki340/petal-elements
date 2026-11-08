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
import {classMap} from 'lit/directives/class-map.js';

import type {Dialog} from '../../dialog/internal/dialog.js';

import type {
  TimePickerDisplayMode,
  TimePickerLayout,
  TimePickerMessages,
} from './time-picker.js';

// Material icons (Apache-2.0): keyboard, schedule and swipe_vertical.
const KEYBOARD_ICON =
  'M20 5H4c-1.1 0-1.99.9-1.99 2L2 17c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-9 3h2v2h-2V8zm0 3h2v2h-2v-2zM8 8h2v2H8V8zm0 3h2v2H8v-2zm-1 2H5v-2h2v2zm0-3H5V8h2v2zm9 7H8v-2h8v2zm0-4h-2v-2h2v2zm0-3h-2V8h2v2zm3 3h-2v-2h2v2zm0-3h-2V8h2v2z';
const SCHEDULE_ICON =
  'M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z';

const SWIPE_ICON =
  'M16.45 20.83q-0.57 0.2 -1.16 0.19T14.15 20.73L7.6 17.68l0.45 -1q0.25 -0.5 0.7 -0.81t1 -0.36l1.7 -0.13L8.65 7.7Q8.5 7.3 8.68 6.94T9.25 6.43q0.4 -0.15 0.76 0.02t0.51 0.57l2.4 6.58l0.95 -0.35L12.95 10.68Q12.8 10.27 12.93 9.79T13.45 9.15t0.76 0.03t0.51 0.58l1.02 2.82l0.93 -0.35L16 10.35Q15.85 9.95 16.03 9.59Q16.2 9.23 16.6 9.07T17.36 9.1q0.36 0.17 0.51 0.57l0.68 1.88L19.5 11.2q-0.15 -0.4 0.03 -0.76Q19.7 10.07 20.1 9.92t0.76 0.03t0.51 0.57l1.38 3.75q0.58 1.58 -0.11 3.06q-0.69 1.49 -2.26 2.06l-3.93 1.43zM2 22V20.5H4.03Q2.55 18.7 1.78 16.52T1 12T1.78 7.47T4.03 3.5H2V2H7V7H5.5V4.1Q4.05 5.75 3.28 7.77T2.5 12t0.78 4.23T5.5 19.9V17H7v5H2z';

/**
 * A time picker in a dialog, after Jetpack Compose Material 3
 * (`TimePickerDialog`, `VibrantTimePickerDialog` and
 * `TimePickerDialogDefaults`): a title, unless vibrant, the picker, and a row
 * with the mode switch at the start and Cancel and OK at the end. The time is
 * only kept when OK is pressed.
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

  /**
   * `picker` shows the clock dial, `input` text fields and `scroll` two scroll
   * wheels. The mode button goes between the text fields and the other one.
   */
  @property({attribute: 'display-mode'}) displayMode: TimePickerDisplayMode = 'picker';

  /** The dialog and picker of Compose's vibrant time picker; always for `scroll`. */
  @property({type: Boolean}) vibrant = false;

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

  /** The mode button's name with the text fields, going to the clock. */
  @property({attribute: 'picker-mode-label'}) pickerModeLabel = 'Switch to clock mode';

  /** The mode button's name with the text fields, going to the wheels. */
  @property({attribute: 'scroll-mode-label'}) scrollModeLabel = 'Switch to scroll mode';

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
    const scrolls = this.displayMode === 'scroll';
    const vibrant = this.vibrant || scrolls;
    const layoutClass = classMap({
      layout: true,
      vibrant,
      'picker-mode': this.mode === 'picker',
      [`layout-${this.layout}`]: true,
    });
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
        <div slot="content" class=${layoutClass}>
          ${vibrant ? nothing : html`<div class="title">${title}</div>`}
          <petal-time-picker
            .value=${this.pending}
            ?vibrant=${vibrant}
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
                  aria-label=${!input
                    ? this.inputModeLabel
                    : scrolls
                      ? this.scrollModeLabel
                      : this.pickerModeLabel}
                  @click=${this.toggleMode}>
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    ${svg`<path d=${!input ? KEYBOARD_ICON : scrolls ? SWIPE_ICON : SCHEDULE_ICON} />`}
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
    const other = this.displayMode === 'scroll' ? 'scroll' : 'picker';
    this.mode = this.mode === 'input' ? other : 'input';
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
