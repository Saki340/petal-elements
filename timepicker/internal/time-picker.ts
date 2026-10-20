/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import '../../focus/md-focus-ring.js';
import '../../ripple/ripple.js';

import {html, isServer, LitElement, nothing, PropertyValues} from 'lit';
import {property, query, state} from 'lit/decorators.js';
import {classMap} from 'lit/directives/class-map.js';

import {mixinElementInternals} from '../../behaviors/element-internals.js';
import {getFormValue, mixinFormAssociated} from '../../behaviors/form-associated.js';
import {DEFAULT_SPATIAL, Spring, springFromCss} from '../../internal/motion/spring.js';

import {
  angleToHour,
  angleToMinute,
  DayPeriods,
  dayPeriods,
  displayHour,
  formatTime,
  hourAngle,
  minuteAngle,
  nearestAngle,
  NumberFormatter,
  numberFormatter,
  parseTime,
  pointAngle,
  Time,
  uses24Hour,
  validLocale,
} from './time.js';

/** Which number the dial sets, Compose's `TimePickerSelectionMode`. */
export type TimePickerSelection = 'hour' | 'minute';

/** The clock dial or the text fields, Compose's `TimePickerDisplayMode`. */
export type TimePickerDisplayMode = 'picker' | 'input';

/** The arrangement: `vertical`, `horizontal`, or `auto` from the viewport. */
export type TimePickerLayout = 'auto' | 'vertical' | 'horizontal';

/**
 * The texts the time picker reads out or shows, to replace its English
 * defaults (Compose's strings). `%1` is replaced by a number.
 */
export interface TimePickerMessages {
  selectHour?: string;
  selectMinute?: string;
  selectPeriod?: string;
  hourSuffix?: string;
  hour24Suffix?: string;
  minuteSuffix?: string;
  hourField?: string;
  minuteField?: string;
  hour?: string;
  minute?: string;
  hourError?: string;
  hour24Error?: string;
  minuteError?: string;
}

const DEFAULT_MESSAGES = {
  selectHour: 'Select hour',
  selectMinute: 'Select minutes',
  selectPeriod: 'Select AM or PM',
  hourSuffix: "%1 o'clock",
  hour24Suffix: '%1 hours',
  minuteSuffix: '%1 minutes',
  hourField: 'for hour',
  minuteField: 'for minutes',
  hour: 'Hour',
  minute: 'Minute',
  hourError: 'Hour must be 1–12',
  hour24Error: 'Hour must be 0–23',
  minuteError: 'Minute must be 0–59',
};

function fill(template: string, value: string) {
  return template.replace('%1', value);
}

// The dial (TimePicker.kt): numbers on a circle 101/256 of the dial's size
// across, the 24-hour inner circle on 69/256; a pointer closer to the center
// than 74/256 sets an inner hour.
const OUTER_RATIO = 101 / 256;
const INNER_RATIO = 69 / 256;
const MAX_DISTANCE_RATIO = 74 / 256;

/** Hours, from the top: 12, 1 … 11. */
const HOURS = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

/** How long a tap on an hour waits before the dial shows minutes. */
const AUTO_SWITCH_DELAY = 100;

const TOUCH_SLOP = 8;

/** A number on the dial. */
interface DialItem {
  value: number;
  ring: 'outer' | 'inner';
}

const timePickerBaseClass = mixinFormAssociated(mixinElementInternals(LitElement));

/**
 * A time picker, after Jetpack Compose Material 3 (`TimePicker` and
 * `TimeInput` in TimePicker.kt): the hour and minute, an AM and PM toggle in
 * 12-hour time, and a clock dial to set them; or, in `input` mode, two text
 * fields.
 *
 * @fires input {Event} The time changed. --bubbles --composed
 * @fires change {Event} The time changed. --bubbles
 */
export class TimePicker extends timePickerBaseClass {
  /** The time, as `HH:MM` in 24 hours (`14:30`), or `''` for none yet. */
  @property() value = '';

  /** `picker` shows the clock dial, `input` text fields. */
  @property({reflect: true, attribute: 'display-mode'})
  displayMode: TimePickerDisplayMode = 'picker';

  /**
   * `12` or `24` hours. Defaults to the locale's: 24 hours for `de` or `zh`,
   * 12 for `en-US`.
   */
  @property({attribute: 'hour-cycle'}) hourCycle: '' | '12' | '24' = '';

  /**
   * The locale for numbers, AM and PM and the hour cycle. Defaults to the
   * closest `lang` attribute or the browser's language.
   */
  @property() locale = '';

  /**
   * `vertical` (the dial below the time), `horizontal` (beside it), or `auto`:
   * horizontal in a landscape viewport less than 600px high.
   */
  @property({reflect: true}) layout: TimePickerLayout = 'auto';

  /** The AM label. Defaults to the locale's. */
  @property({attribute: 'am-label'}) amLabel = '';

  /** The PM label. Defaults to the locale's. */
  @property({attribute: 'pm-label'}) pmLabel = '';

  /** Replaces some of the read-out and shown texts. */
  @property({attribute: false}) messages: TimePickerMessages = {};

  /** Which number the dial sets. */
  @property({reflect: true}) selection: TimePickerSelection = 'hour';

  @state() private hour = 0;
  @state() private minute = 0;
  /** The text fields' text, which may not be a valid hour or minute. */
  @state() private hourText = '';
  @state() private minuteText = '';

  @query('.dial') private readonly dial!: HTMLElement | null;
  @query('.hour-field') private readonly hourField!: HTMLInputElement | null;
  @query('.minute-field') private readonly minuteField!: HTMLInputElement | null;

  // The selector's angle, on a spring.
  private readonly angleSpring = new Spring(DEFAULT_SPATIAL, 0.001);
  private frame = 0;
  private lastTime = 0;
  private switchTimer = 0;
  private pointer: {
    id: number;
    x: number;
    y: number;
    dragging: boolean;
  } | null = null;
  /** The value set by this element, so it does not jump the selector. */
  private ownValue: string | null = null;

  override [getFormValue]() {
    return this.value || null;
  }

  override formResetCallback() {
    this.value = this.getAttribute('value') ?? '';
  }

  override formStateRestoreCallback(state: string) {
    this.value = state;
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    if (isServer) return;
    cancelAnimationFrame(this.frame);
    this.frame = 0;
    clearTimeout(this.switchTimer);
  }

  protected override willUpdate(changed: PropertyValues<this>) {
    if (changed.has('value') && this.value !== this.ownValue) {
      // From outside: the selector jumps (AnalogTimePickerState.hourInput).
      const time = parseTime(this.value) ?? {hour: 0, minute: 0};
      this.hour = time.hour;
      this.minute = time.minute;
      this.angleSpring.value = this.targetAngle();
      this.angleSpring.target = this.angleSpring.value;
      this.angleSpring.velocity = 0;
      this.resetFields();
    }
    this.ownValue = null;
    if (changed.has('hourCycle') || changed.has('locale')) this.resetFields();
  }

  protected override updated(changed: PropertyValues<this>) {
    // Only the selector's position changes here, not reactive properties.
    if (changed.has('selection')) this.animateToSelection();
    this.paint();
  }

  // Locale --------------------------------------------------------------------

  private get resolvedLocale() {
    if (this.locale) return validLocale(this.locale);
    if (isServer) return 'en-US';
    let node: Element | null = this;
    while (node) {
      const lang = node.closest('[lang]')?.getAttribute('lang');
      if (lang) return validLocale(lang);
      const root = node.getRootNode();
      node = root instanceof ShadowRoot ? root.host : null;
    }
    return validLocale(navigator.language);
  }

  /** Whether the picker shows 24 hours. */
  get is24Hour() {
    if (this.hourCycle) return this.hourCycle === '24';
    return uses24Hour(this.resolvedLocale);
  }

  private get text() {
    return {...DEFAULT_MESSAGES, ...this.messages};
  }

  private get isPm() {
    return this.hour >= 12;
  }

  // Rendering -----------------------------------------------------------------

  protected override render() {
    const locale = this.resolvedLocale;
    const numbers = numberFormatter(locale);
    const periods = dayPeriods(locale);
    const labels = {am: this.amLabel || periods.am, pm: this.pmLabel || periods.pm};
    const input = this.displayMode === 'input';
    return html`<div class="time-picker ${input ? 'input-mode' : 'picker-mode'}">
      ${input ? this.renderInput(numbers, labels) : this.renderPicker(numbers, labels)}
    </div>`;
  }

  private renderPicker(
    numbers: NumberFormatter,
    labels: DayPeriods,
  ) {
    const text = this.text;
    const is24 = this.is24Hour;
    const shownHour = displayHour(this.hour, is24);
    return html`
      <div class="display">
        <div class="numbers" dir="ltr">
          ${this.renderTimeSelector('hour', numbers.two(shownHour), text.selectHour,
            fill(is24 ? text.hour24Suffix : text.hourSuffix, String(shownHour)))}
          <div class="separator" aria-hidden="true">:</div>
          ${this.renderTimeSelector('minute', numbers.two(this.minute), text.selectMinute,
            fill(text.minuteSuffix, String(this.minute)))}
        </div>
        ${is24 ? nothing : this.renderPeriodToggle(labels)}
      </div>
      ${this.renderDial(numbers)}
    `;
  }

  private renderTimeSelector(
    selection: TimePickerSelection,
    value: string,
    label: string,
    valueLabel: string,
  ) {
    const selected = this.selection === selection;
    return html`<button
      class="time-selector ${classMap({[selection]: true, selected})}"
      role="radio"
      aria-checked=${String(selected)}
      aria-label=${`${label}, ${valueLabel}`}
      @click=${() => (this.selection = selection)}>
      <petal-focus-ring part="focus-ring"></petal-focus-ring>
      <petal-ripple></petal-ripple>
      <span aria-hidden="true">${value}</span>
    </button>`;
  }

  private renderPeriodToggle(labels: DayPeriods) {
    const pm = this.isPm;
    const item = (isPm: boolean, label: string) => {
      const checked = pm === isPm;
      return html`<button
        class="period-item ${classMap({checked})}"
        role="radio"
        aria-checked=${String(checked)}
        @click=${() => this.setPeriod(isPm)}>
        <petal-focus-ring part="focus-ring"></petal-focus-ring>
        <petal-ripple></petal-ripple>
        <span>${label}</span>
      </button>`;
    };
    return html`<div class="period" role="radiogroup" aria-label=${this.text.selectPeriod}>
      ${item(false, labels.am)} ${item(true, labels.pm)}
    </div>`;
  }

  private renderDial(numbers: NumberFormatter) {
    const text = this.text;
    const is24 = this.is24Hour;
    const minuteMode = this.selection === 'minute';
    // In 24 hours, 0 to 11 on the outer circle and 12 to 23 on the inner one.
    const hourFace: DialItem[] = HOURS.map((hour) => ({
      value: is24 ? hour % 12 : hour,
      ring: 'outer',
    }));
    if (is24) {
      for (const hour of HOURS) hourFace.push({value: (hour % 12) + 12, ring: 'inner'});
    }
    const minuteFace: DialItem[] = MINUTES.map((minute) => ({value: minute, ring: 'outer'}));
    const selectedHour = is24 ? this.hour : displayHour(this.hour, false);
    // ClockText: the closest five minutes count as selected.
    const selectedMinute = (Math.round(this.minute / 5) * 5) % 60;

    const face = (kind: TimePickerSelection, items: DialItem[], clone: boolean) => {
      const active = (kind === 'minute') === minuteMode;
      return html`<div
        class="face ${classMap({[kind]: true, active, clone})}"
        role=${clone ? nothing : 'radiogroup'}
        aria-label=${clone ? nothing : kind === 'hour' ? text.selectHour : text.selectMinute}
        aria-hidden=${clone || !active ? 'true' : nothing}
        ?inert=${clone || !active}>
        ${items.map((item, index) => {
          const angle = ((index % 12) / 12) * Math.PI * 2 - Math.PI / 2;
          const ratio = item.ring === 'outer' ? OUTER_RATIO : INNER_RATIO;
          const selected = kind === 'hour' ? item.value === selectedHour : item.value === selectedMinute;
          const label = fill(
            kind === 'minute' ? text.minuteSuffix : is24 ? text.hour24Suffix : text.hourSuffix,
            String(item.value),
          );
          return html`<button
            class="dial-number"
            style=${`--_x: ${(Math.cos(angle) * ratio).toFixed(5)}; --_y: ${(Math.sin(angle) * ratio).toFixed(5)}`}
            data-value=${item.value}
            role=${clone ? nothing : 'radio'}
            aria-checked=${clone ? nothing : String(selected)}
            aria-label=${clone ? nothing : label}
            tabindex=${!clone && active && selected ? 0 : -1}
            @click=${clone ? nothing : () => this.handleNumberActivate(kind, item.value)}
            @keydown=${clone ? nothing : this.handleNumberKeydown}>
            ${clone ? nothing : html`<petal-focus-ring part="focus-ring"></petal-focus-ring>`}
            <span aria-hidden="true">${numbers.one(item.value)}</span>
          </button>`;
        })}
      </div>`;
    };

    return html`<div
      class="dial"
      @pointerdown=${this.handlePointerDown}
      @pointermove=${this.handlePointerMove}
      @pointerup=${this.handlePointerUp}
      @pointercancel=${this.handlePointerCancel}>
      <div class="selector" aria-hidden="true">
        <span class="track"></span>
        <span class="center"></span>
        <span class="handle"></span>
      </div>
      ${face('hour', hourFace, false)} ${face('minute', minuteFace, false)}
      <div class="selected-labels" aria-hidden="true">
        ${minuteMode ? face('minute', minuteFace, true) : face('hour', hourFace, true)}
      </div>
    </div>`;
  }

  private renderInput(
    numbers: NumberFormatter,
    labels: DayPeriods,
  ) {
    const text = this.text;
    const is24 = this.is24Hour;
    const hourValid = this.hourTextValid();
    const minuteValid = this.minuteTextValid();
    const field = (
      selection: TimePickerSelection,
      value: string,
      valid: boolean,
      fieldLabel: string,
      support: string,
      error: string,
    ) => {
      const selected = this.selection === selection;
      return html`<div class="field-column">
        <input
          class="time-field ${classMap({[`${selection}-field`]: true, selected, invalid: !valid})}"
          inputmode="numeric"
          autocomplete="off"
          maxlength="3"
          aria-label=${`${selection === 'hour' ? text.hour : text.minute}, ${fieldLabel}`}
          aria-invalid=${valid ? nothing : 'true'}
          aria-describedby=${`${selection}-support`}
          .value=${value}
          @focus=${() => (this.selection = selection)}
          @input=${(event: InputEvent) => this.handleFieldInput(selection, event)}
          @keydown=${(event: KeyboardEvent) => this.handleFieldKeydown(selection, event)}
          @blur=${() => this.handleFieldBlur(selection)} />
        <div
          id=${`${selection}-support`}
          class="support ${classMap({error: !valid})}"
          aria-live=${valid ? nothing : 'polite'}>
          ${valid ? support : error}
        </div>
      </div>`;
    };
    return html`<div class="input" dir="ltr">
      ${field('hour', this.hourText, hourValid, text.hourField, text.hour, is24 ? text.hour24Error : text.hourError)}
      <div class="separator" aria-hidden="true">:</div>
      ${field('minute', this.minuteText, minuteValid, text.minuteField, text.minute, text.minuteError)}
      ${is24 ? nothing : this.renderPeriodToggle(labels)}
    </div>`;
  }

  // State changes -------------------------------------------------------------

  /** Sets the time and tells listeners, without jumping the selector. */
  private setTime(time: Time) {
    this.hour = time.hour;
    this.minute = time.minute;
    const value = formatTime(time);
    if (value === this.value) return;
    this.ownValue = value;
    this.value = value;
    this.dispatchEvent(new Event('input', {bubbles: true, composed: true}));
    this.dispatchEvent(new Event('change', {bubbles: true}));
  }

  private setPeriod(pm: boolean) {
    if (pm === this.isPm) return;
    this.setTime({hour: this.hour + (pm ? 12 : -12), minute: this.minute});
    this.resetFields();
    this.jumpSelector();
  }

  private resetFields() {
    const numbers = numberFormatter('en-US');
    this.hourText = numbers.two(displayHour(this.hour, this.is24Hour));
    this.minuteText = numbers.two(this.minute);
  }

  // Selector ------------------------------------------------------------------

  /** The angle of the selected hour or minute. */
  private targetAngle() {
    return this.selection === 'hour' ? hourAngle(this.hour) : minuteAngle(this.minute);
  }

  private reducedMotion() {
    return !isServer && matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  private jumpSelector() {
    this.angleSpring.value = nearestAngle(this.angleSpring.value, this.targetAngle());
    this.angleSpring.target = this.angleSpring.value;
    this.angleSpring.velocity = 0;
    this.paint();
  }

  /** Animates the selector to the selected value (animateToCurrent). */
  private animateToSelection() {
    this.animateAngle(this.targetAngle());
  }

  private animateAngle(target: number) {
    const end = nearestAngle(this.angleSpring.value, target);
    if (this.reducedMotion()) {
      this.angleSpring.value = end;
      this.angleSpring.target = end;
      this.paint();
      return;
    }
    this.angleSpring.spec = springFromCss(this, 'default-spatial', DEFAULT_SPATIAL);
    this.angleSpring.target = end;
    if (this.frame) return;
    this.lastTime = performance.now();
    this.frame = requestAnimationFrame(this.tick);
  }

  private readonly tick = (now: number) => {
    this.frame = 0;
    this.angleSpring.step(Math.min(now - this.lastTime, 64));
    this.lastTime = now;
    this.paint();
    if (!this.angleSpring.atRest) this.frame = requestAnimationFrame(this.tick);
  };

  /** Writes the selector's place to the dial (drawSelector). */
  private paint() {
    const dial = this.dial;
    if (!dial) return;
    const angle = this.angleSpring.value;
    const inner = this.is24Hour && this.isPm && this.selection === 'hour';
    const ratio = inner ? INNER_RATIO : OUTER_RATIO;
    dial.style.setProperty('--_sx', (Math.cos(angle) * ratio).toFixed(5));
    dial.style.setProperty('--_sy', (Math.sin(angle) * ratio).toFixed(5));
    dial.style.setProperty('--_ratio', ratio.toFixed(5));
    dial.style.setProperty('--_angle', `${angle}rad`);
  }

  // Dial gestures (ClockDialNode) ---------------------------------------------

  private pointFromEvent(event: PointerEvent) {
    const box = this.dial!.getBoundingClientRect();
    return {
      x: event.clientX - (box.left + box.width / 2),
      y: event.clientY - (box.top + box.height / 2),
      size: box.width,
    };
  }

  private handlePointerDown(event: PointerEvent) {
    if (!event.isPrimary || event.button !== 0 || this.disabled) return;
    this.pointer = {id: event.pointerId, x: event.clientX, y: event.clientY, dragging: false};
    // The dial takes the press: focus leaves the fields and numbers.
    ((this.renderRoot as ShadowRoot).activeElement as HTMLElement | null)?.blur();
  }

  private handlePointerMove(event: PointerEvent) {
    const pointer = this.pointer;
    if (!pointer || pointer.id !== event.pointerId) return;
    if (!pointer.dragging) {
      if (Math.hypot(event.clientX - pointer.x, event.clientY - pointer.y) < TOUCH_SLOP) return;
      pointer.dragging = true;
      try {
        this.dial!.setPointerCapture(event.pointerId);
      } catch {
        // The pointer is gone.
      }
    }
    // rotateTo without animation, and moveSelector.
    const {x, y, size} = this.pointFromEvent(event);
    const angle = pointAngle(x, y);
    this.setFromPoint(angle, Math.hypot(x, y), size, false);
    cancelAnimationFrame(this.frame);
    this.frame = 0;
    this.angleSpring.value = nearestAngle(this.angleSpring.value, angle);
    this.angleSpring.target = this.angleSpring.value;
    this.angleSpring.velocity = 0;
    this.paint();
  }

  private handlePointerUp(event: PointerEvent) {
    const pointer = this.pointer;
    if (!pointer || pointer.id !== event.pointerId) return;
    this.pointer = null;
    const {x, y, size} = this.pointFromEvent(event);
    if (pointer.dragging) {
      // onGestureEnd: to the exact place of the value, then minutes.
      this.animateToSelection();
      this.switchToMinutes(0);
      return;
    }
    // onTap: to the closest hour or five minutes.
    this.setFromPoint(pointAngle(x, y), Math.hypot(x, y), size, true);
    this.animateToSelection();
    if (this.selection === 'hour') this.switchToMinutes(AUTO_SWITCH_DELAY);
  }

  private handlePointerCancel(event: PointerEvent) {
    if (this.pointer?.id !== event.pointerId) return;
    this.pointer = null;
    this.animateToSelection();
  }

  /** Sets the hour or minute for a point on the dial. */
  private setFromPoint(angle: number, distance: number, size: number, tap: boolean) {
    if (this.selection === 'hour') {
      let hour = angleToHour(angle);
      if (this.is24Hour) {
        // moveSelector: the inner circle for the hours from 12.
        if (distance < MAX_DISTANCE_RATIO * size) hour += 12;
      } else if (this.isPm) {
        hour += 12;
      }
      this.setTime({hour, minute: this.minute});
    } else {
      let minute = angleToMinute(angle);
      if (tap) minute = (Math.round(minute / 5) * 5) % 60;
      this.setTime({hour: this.hour, minute});
    }
  }

  private switchToMinutes(delay: number) {
    if (this.selection !== 'hour') return;
    clearTimeout(this.switchTimer);
    this.switchTimer = window.setTimeout(() => (this.selection = 'minute'), delay);
  }

  // Dial keyboard (ClockText) -------------------------------------------------

  private handleNumberActivate(kind: TimePickerSelection, value: number) {
    // From the keyboard: no animation, no switch to minutes.
    if (kind === 'hour') {
      let hour = value;
      if (!this.is24Hour) hour = (value % 12) + (this.isPm ? 12 : 0);
      this.setTime({hour, minute: this.minute});
    } else {
      this.setTime({hour: this.hour, minute: value});
    }
    this.jumpSelector();
  }

  private handleNumberKeydown(event: KeyboardEvent) {
    const steps: Record<string, number> = {
      ArrowDown: 1,
      ArrowRight: 1,
      ArrowUp: -1,
      ArrowLeft: -1,
    };
    const step = steps[event.key];
    if (step === undefined) return;
    event.preventDefault();
    const button = event.currentTarget as HTMLElement;
    const buttons = [...button.parentElement!.querySelectorAll<HTMLElement>('.dial-number')];
    const next = buttons[(buttons.indexOf(button) + step + buttons.length) % buttons.length];
    button.tabIndex = -1;
    next.tabIndex = 0;
    next.focus();
  }

  // Text fields (TimeInputTransformation) -------------------------------------

  private hourTextValid() {
    const value = Number(this.hourText);
    if (this.hourText === '' || Number.isNaN(value)) return true;
    return this.is24Hour ? value <= 23 : value >= 1 && value <= 12;
  }

  private minuteTextValid() {
    const value = Number(this.minuteText);
    return this.minuteText === '' || (!Number.isNaN(value) && value <= 59);
  }

  private handleFieldInput(selection: TimePickerSelection, event: InputEvent) {
    const input = event.target as HTMLInputElement;
    const previous = selection === 'hour' ? this.hourText : this.minuteText;
    let text = input.value;
    if (!/^\d*$/.test(text)) {
      input.value = previous;
      return;
    }
    // Typing into two digits keeps only the new digit.
    if (text.length === 3 && previous.length === 2) {
      const caret = input.selectionStart ?? text.length;
      text = text.charAt(Math.max(0, caret - 1));
    }
    if (text.length > 2) {
      input.value = previous;
      return;
    }
    input.value = text;
    const number = text === '' ? 0 : Number(text);
    const is24 = this.is24Hour;
    if (selection === 'hour') {
      this.hourText = text;
      const hour = is24
        ? number
        : text === ''
          ? this.isPm
            ? 12
            : 0
          : number === 12
            ? this.isPm
              ? 12
              : 0
            : number + (this.isPm ? 12 : 0);
      if (this.hourTextValid()) {
        this.setTime({hour, minute: this.minute});
        const autoAdvance =
          text.length === 2 ||
          (!is24 && event.inputType.startsWith('insert') && number >= 2 && number <= 9);
        if (autoAdvance && text !== '') this.focusField('minute');
      }
    } else {
      this.minuteText = text;
      if (this.minuteTextValid()) this.setTime({hour: this.hour, minute: number});
    }
  }

  private handleFieldKeydown(selection: TimePickerSelection, event: KeyboardEvent) {
    if (event.key !== 'Enter') return;
    // ImeAction.Next, then Done.
    if (selection === 'hour' && this.hourTextValid()) this.focusField('minute');
    else if (selection === 'minute') (event.target as HTMLInputElement).blur();
  }

  private handleFieldBlur(selection: TimePickerSelection) {
    // A valid number shows with two digits again, as the time selector does.
    const numbers = numberFormatter('en-US');
    if (selection === 'hour' && this.hourTextValid()) {
      this.hourText = numbers.two(displayHour(this.hour, this.is24Hour));
    } else if (selection === 'minute' && this.minuteTextValid()) {
      this.minuteText = numbers.two(this.minute);
    }
  }

  private focusField(selection: TimePickerSelection) {
    this.selection = selection;
    const field = selection === 'hour' ? this.hourField : this.minuteField;
    field?.focus();
    field?.select();
  }
}
