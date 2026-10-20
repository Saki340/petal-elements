/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import '../../button/text-button.js';
import '../../divider/divider.js';
import '../../focus/md-focus-ring.js';
import '../../iconbutton/icon-button.js';
import '../../ripple/ripple.js';
import '../../textfield/outlined-text-field.js';

import {html, isServer, LitElement, nothing, PropertyValues, svg} from 'lit';
import {property, query, state} from 'lit/decorators.js';
import {classMap} from 'lit/directives/class-map.js';

import {mixinElementInternals} from '../../behaviors/element-internals.js';
import {getFormValue, mixinFormAssociated} from '../../behaviors/form-associated.js';
import {
  DEFAULT_EFFECTS,
  DEFAULT_SPATIAL,
  FAST_EFFECTS,
  Spring,
  SpringSpec,
  springEasing,
  springFromCss,
} from '../../internal/motion/spring.js';
import type {PetalOutlinedTextField} from '../../textfield/outlined-text-field.js';

import {
  addMonths,
  CalendarMonth,
  DateFormatter,
  dateInputFormat,
  dateParts,
  daysInMonth,
  firstDayOf,
  firstDayOfWeek,
  formatIso,
  formatter,
  monthOf,
  monthsBetween,
  parseInputDigits,
  parseIso,
  toInputDigits,
  today,
  weekday,
  weekdayNames,
  withDelimiters,
} from './calendar.js';

/** The date picker's display mode, as Compose's `DisplayMode`. */
export type DatePickerDisplayMode = 'picker' | 'input';

/**
 * The text the date picker reads out or shows in errors, to replace its
 * English defaults (Compose's strings). `%1` and `%2` are replaced.
 */
export interface DatePickerMessages {
  switchToInputMode?: string;
  switchToCalendarMode?: string;
  previousMonth?: string;
  nextMonth?: string;
  switchToYearSelection?: string;
  switchToDaySelection?: string;
  navigateToYear?: string;
  today?: string;
  noSelection?: string;
  headlineDescription?: string;
  inputHeadlineDescription?: string;
  invalidPattern?: string;
  invalidYearRange?: string;
  invalidNotAllowed?: string;
}

const DEFAULT_MESSAGES = {
  switchToInputMode: 'Switch to text input mode',
  switchToCalendarMode: 'Switch to calendar input mode',
  previousMonth: 'Change to previous month',
  nextMonth: 'Change to next month',
  switchToYearSelection: 'Activate to change the year',
  switchToDaySelection: 'Activate to change month and date',
  navigateToYear: 'Navigate to year %1',
  today: 'Today',
  noSelection: 'None',
  headlineDescription: 'Current selection: %1',
  inputHeadlineDescription: 'Entered date: %1',
  invalidPattern: 'Date does not match expected pattern: %1',
  invalidYearRange: 'Date out of expected year range %1 - %2',
  invalidNotAllowed: 'Date not allowed: %1',
};

function fill(template: string, ...values: string[]) {
  return values.reduce((text, value, i) => text.replace(`%${i + 1}`, value), template);
}

/** DatePickerDefaults.YearRange. */
const FIRST_YEAR = 1900;
const LAST_YEAR = 2100;

/** MaxCalendarRows, DaysInWeek. */
const ROWS = 6;
const DAYS_IN_WEEK = 7;

/**
 * The spring of LazyListState.animateScrollToItem (the default spring():
 * no bounce, StiffnessMedium), for the previous and next month buttons.
 */
const SCROLL_SPRING: SpringSpec = {dampingRatio: 1, stiffness: 1500};

/** A fling faster than this (px/s) pages in its direction. */
const FLING_VELOCITY = 400;

/** How far a pointer moves before a swipe starts (px). */
const TOUCH_SLOP = 8;

// Material icons (Apache-2.0): edit, date_range, keyboard_arrow_left,
// keyboard_arrow_right and arrow_drop_down.
const ICONS = {
  edit: 'M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z',
  calendar:
    'M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5a2 2 0 0 0-1.99 2L3 20a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 16H5V9h14v11z',
  previous: 'M15.41 16.59 10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z',
  next: 'M8.59 16.59 13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z',
  dropDown: 'M7 10l5 5 5-5z',
};

function icon(path: string, className = 'icon') {
  return html`<svg class=${className} viewBox="0 0 24 24" aria-hidden="true">
    ${svg`<path d=${path} />`}
  </svg>`;
}

/** A swipe on the calendar. */
interface DragState {
  id: number;
  x: number;
  y: number;
  started: boolean;
  samples: DragSample[];
}

interface DragSample {
  x: number;
  t: number;
}

const datePickerBaseClass = mixinFormAssociated(mixinElementInternals(LitElement));

/**
 * A date picker, after Jetpack Compose Material 3 (`DatePicker` in
 * DatePicker.kt and DateInput.kt): a header with the selected date, a month
 * calendar that pages by swiping or with the arrow buttons, a year grid, and
 * a text input mode.
 *
 * @fires input {Event} The selection changed. --bubbles --composed
 * @fires change {Event} The selection changed. --bubbles
 */
export class DatePicker extends datePickerBaseClass {
  /** The selected date, as an ISO date (`2026-10-21`), or `''`. */
  @property() value = '';

  /** The earliest date that can be selected, as an ISO date. */
  @property() min = '';

  /** The latest date that can be selected, as an ISO date. */
  @property() max = '';

  /**
   * The locale for month and weekday names, the date format and the first day
   * of the week. Defaults to the closest `lang` attribute or the browser's
   * language.
   */
  @property() locale = '';

  /**
   * The first day of the week, 0 for Sunday to 6 for Saturday. Defaults to the
   * locale's.
   */
  @property({type: Number, attribute: 'first-day-of-week'}) firstDayOfWeek?: number;

  /** `picker` shows the calendar, `input` a text field. */
  @property({reflect: true, attribute: 'display-mode'})
  displayMode: DatePickerDisplayMode = 'picker';

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

  /** Hides the title and the headline, leaving only the calendar. */
  @property({type: Boolean, attribute: 'no-header'}) noHeader = false;

  /**
   * Whether a date can be selected, as Compose's `SelectableDates`. Called
   * with ISO dates between `min` and `max`.
   */
  @property({attribute: false}) isDateSelectable?: (date: string) => boolean;

  /** Replaces some of the read-out and error texts. */
  @property({attribute: false}) messages: DatePickerMessages = {};

  /** The month the calendar shows. */
  @state() private displayedMonth: CalendarMonth = monthOf(today());
  @state() private yearPickerOpen = false;
  /** The day that has the roving tab stop, while focus is in the calendar. */
  @state() private focusDay: number | null = null;
  @state() private inputError = '';
  /** The text field's text, with delimiters. */
  @state() private inputText = '';
  /** The value the text field last set, so typing does not reformat it. */
  private typedValue: string | null = null;

  @query('.track') private readonly track!: HTMLElement | null;
  @query('.viewport') private readonly viewport!: HTMLElement | null;
  @query('.panes') private readonly panes!: HTMLElement | null;
  @query('petal-outlined-text-field') private readonly field!: PetalOutlinedTextField | null;

  private pageSpring: Spring | null = null;
  private pageFrame = 0;
  private pageDirection = 0;
  private offset = 0;
  private drag: DragState | null = null;

  /** The selected date, as a `Date` at UTC midnight. */
  get valueAsDate(): Date | null {
    const day = parseIso(this.value);
    return day === null ? null : new Date(day * 86400000);
  }
  set valueAsDate(date: Date | null) {
    this.value = date
      ? formatIso(
          Math.floor(
            Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) / 86400000,
          ),
        )
      : '';
  }

  /** Shows the month that has the given ISO date. */
  showMonthOf(date: string) {
    const day = parseIso(date);
    if (day !== null) this.displayedMonth = this.clampMonth(monthOf(day));
  }

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
    this.stopPaging();
  }

  protected override willUpdate(changed: PropertyValues<this>) {
    // Show the selected date's month when the value is set from outside, or
    // when the range moves away from the shown month.
    if (changed.has('value') || changed.has('min') || changed.has('max')) {
      const selected = parseIso(this.value);
      const month =
        changed.has('value') && selected !== null ? monthOf(selected) : this.displayedMonth;
      this.displayedMonth = this.clampMonth(month);
    }
    // The text field shows the value, unless the value came from typing.
    if (changed.has('value') || changed.has('locale')) {
      if (this.value !== this.typedValue) {
        const selected = parseIso(this.value);
        const format = dateInputFormat(this.resolvedLocale);
        this.inputText =
          selected === null ? '' : withDelimiters(toInputDigits(selected, format), format);
        this.inputError = '';
      }
      this.typedValue = null;
    }
  }

  // Locale and formats.

  private get resolvedLocale() {
    if (this.locale) return this.locale;
    if (isServer) return 'en-US';
    // The closest `lang`, also across shadow roots (as in a dialog).
    let node: Element | null = this;
    while (node) {
      const lang = node.closest('[lang]')?.getAttribute('lang');
      if (lang) return lang;
      const root = node.getRootNode();
      node = root instanceof ShadowRoot ? root.host : null;
    }
    return navigator.language || 'en-US';
  }

  private get text() {
    return {...DEFAULT_MESSAGES, ...this.messages};
  }

  // Range.

  private get minDay() {
    return parseIso(this.min);
  }

  private get maxDay() {
    return parseIso(this.max);
  }

  private get firstMonth(): CalendarMonth {
    const min = this.minDay;
    return min === null ? {year: FIRST_YEAR, month: 1} : monthOf(min);
  }

  private get lastMonth(): CalendarMonth {
    const max = this.maxDay;
    return max === null ? {year: LAST_YEAR, month: 12} : monthOf(max);
  }

  private clampMonth(month: CalendarMonth): CalendarMonth {
    if (monthsBetween(this.firstMonth, month) < 0) return this.firstMonth;
    if (monthsBetween(month, this.lastMonth) < 0) return this.lastMonth;
    return month;
  }

  private inRange(month: CalendarMonth) {
    return (
      monthsBetween(this.firstMonth, month) >= 0 && monthsBetween(month, this.lastMonth) >= 0
    );
  }

  private isSelectable(day: number) {
    const min = this.minDay;
    const max = this.maxDay;
    if (min !== null && day < min) return false;
    if (max !== null && day > max) return false;
    const {year} = dateParts(day);
    if (min === null && year < FIRST_YEAR) return false;
    if (max === null && year > LAST_YEAR) return false;
    return this.isDateSelectable?.(formatIso(day)) ?? true;
  }

  // Rendering.

  protected override render() {
    const locale = this.resolvedLocale;
    const format = formatter(locale);
    const selected = parseIso(this.value);
    const picker = this.displayMode === 'picker';
    return html`
      <div class="date-picker">
        ${this.noHeader ? nothing : this.renderHeader(format, selected, picker)}
        <div class="panes">
          <div class="pane picker-pane" ?inert=${!picker} ?hidden=${!picker}>
            ${this.renderCalendar(locale, format, selected)}
          </div>
          <div class="pane input-pane" ?inert=${picker} ?hidden=${picker}>
            ${this.renderInput(locale)}
          </div>
        </div>
      </div>
    `;
  }

  private renderHeader(
    format: DateFormatter,
    selected: number | null,
    picker: boolean,
  ) {
    const text = this.text;
    const headline =
      selected === null ? (picker ? this.pickerHeadline : this.inputHeadline) : format.headline(selected);
    const description = fill(
      picker ? text.headlineDescription : text.inputHeadlineDescription,
      selected === null ? text.noSelection : format.description(selected),
    );
    const toggle = this.hideModeToggle
      ? nothing
      : html`<petal-icon-button
          class="mode-toggle"
          aria-label=${picker ? text.switchToInputMode : text.switchToCalendarMode}
          @click=${this.toggleDisplayMode}
          >${icon(picker ? ICONS.edit : ICONS.calendar)}</petal-icon-button
        >`;
    return html`
      <div class="header">
        <div class="title">${picker ? this.pickerTitle : this.inputTitle}</div>
        <div class="headline-row">
          <div class="headline" aria-live="polite" aria-label=${description}>${headline}</div>
          ${toggle}
        </div>
      </div>
      <petal-divider></petal-divider>
    `;
  }

  private renderCalendar(
    locale: string,
    format: DateFormatter,
    selected: number | null,
  ) {
    const text = this.text;
    const month = this.displayedMonth;
    const previous = addMonths(month, -1);
    const next = addMonths(month, 1);
    const firstWeekday = this.firstDayOfWeek ?? firstDayOfWeek(locale);
    const names = weekdayNames(locale);
    const weekdays = Array.from({length: DAYS_IN_WEEK}, (_, i) => names[(firstWeekday + i) % 7]);
    const open = this.yearPickerOpen;
    return html`
      <div class="nav ${classMap({'year-picker-open': open})}">
        <petal-text-button
          class="year-button"
          aria-label=${`${format.monthYear(month)}, ${open ? text.switchToDaySelection : text.switchToYearSelection}`}
          aria-expanded=${String(open)}
          @click=${this.toggleYearPicker}>
          <span class="month-year" aria-live="polite">${format.monthYear(month)}</span>
          ${icon(ICONS.dropDown, 'drop-down')}
        </petal-text-button>
        <div class="arrows" ?hidden=${open}>
          <petal-icon-button
            class="previous"
            aria-label=${text.previousMonth}
            ?disabled=${!this.inRange(previous)}
            @click=${() => this.page(-1)}
            >${icon(ICONS.previous)}</petal-icon-button
          >
          <petal-icon-button
            class="next"
            aria-label=${text.nextMonth}
            ?disabled=${!this.inRange(next)}
            @click=${() => this.page(1)}
            >${icon(ICONS.next)}</petal-icon-button
          >
        </div>
      </div>
      <div class="calendar">
        <div class="grid" role="grid" aria-label=${format.monthYear(month)}>
          <div class="weekdays" role="row">
            ${weekdays.map(
              (name) =>
                html`<div class="weekday" role="columnheader" aria-label=${name.full}>
                  <span aria-hidden="true">${name.narrow}</span>
                </div>`,
            )}
          </div>
          <div
            class="viewport"
            @pointerdown=${this.handlePointerDown}
            @pointermove=${this.handlePointerMove}
            @pointerup=${this.handlePointerUp}
            @pointercancel=${this.handlePointerUp}
            @keydown=${this.handleDayKeydown}
            @focusout=${this.handleCalendarFocusOut}>
            <div class="track">
              ${this.renderMonth(previous, firstWeekday, format, selected, false)}
              ${this.renderMonth(month, firstWeekday, format, selected, true)}
              ${this.renderMonth(next, firstWeekday, format, selected, false)}
            </div>
          </div>
        </div>
        ${this.renderYears(format)}
      </div>
    `;
  }

  private renderMonth(
    month: CalendarMonth,
    firstWeekday: number,
    format: DateFormatter,
    selected: number | null,
    current: boolean,
  ) {
    if (!this.inRange(month)) {
      return html`<div class="month" aria-hidden="true"></div>`;
    }
    const text = this.text;
    const first = firstDayOf(month);
    const leading = (weekday(first) - firstWeekday + 7) % 7;
    const count = daysInMonth(month);
    const todayDay = today();
    const tabStop = current ? this.tabStop(month, selected, todayDay) : null;
    const rows = [];
    for (let row = 0; row < ROWS; row++) {
      const cells = [];
      for (let column = 0; column < DAYS_IN_WEEK; column++) {
        const index = row * DAYS_IN_WEEK + column - leading;
        if (index < 0 || index >= count) {
          cells.push(html`<div class="cell" role="gridcell"></div>`);
          continue;
        }
        const day = first + index;
        const isSelected = day === selected;
        const isToday = day === todayDay;
        const enabled = this.isSelectable(day) && !this.disabled;
        const label = isToday
          ? `${text.today}, ${format.description(day)}`
          : format.description(day);
        cells.push(html`<div class="cell" role="gridcell" aria-selected=${String(isSelected)}>
          <button
            class="day ${classMap({selected: isSelected, today: isToday})}"
            data-day=${day}
            tabindex=${current && day === tabStop ? 0 : -1}
            aria-label=${label}
            aria-current=${isToday ? 'date' : nothing}
            ?disabled=${!enabled}
            @click=${() => this.select(day)}>
            ${current
              ? html`<petal-focus-ring part="focus-ring"></petal-focus-ring>
                  <petal-ripple ?disabled=${!enabled}></petal-ripple>`
              : nothing}
            <span aria-hidden="true">${format.number(index + 1)}</span>
          </button>
        </div>`);
      }
      rows.push(html`<div class="week" role="row">${cells}</div>`);
    }
    return html`<div class="month" ?inert=${!current} aria-hidden=${current ? nothing : 'true'}>
      ${rows}
    </div>`;
  }

  /** The day in the tab order: the focused, selected, today's or first selectable day. */
  private tabStop(month: CalendarMonth, selected: number | null, todayDay: number) {
    const inMonth = (day: number | null) =>
      day !== null && monthsBetween(monthOf(day), month) === 0 && this.isSelectable(day);
    if (inMonth(this.focusDay)) return this.focusDay;
    if (inMonth(selected)) return selected;
    if (inMonth(todayDay)) return todayDay;
    const first = firstDayOf(month);
    for (let i = 0; i < daysInMonth(month); i++) {
      if (this.isSelectable(first + i)) return first + i;
    }
    return null;
  }

  private renderYears(format: DateFormatter) {
    const open = this.yearPickerOpen;
    const first = this.firstMonth.year;
    const last = this.lastMonth.year;
    const displayed = this.displayedMonth.year;
    const current = dateParts(today()).year;
    const years = [];
    for (let year = first; year <= last; year++) {
      const label = format.number(year);
      years.push(html`<button
        class="year ${classMap({selected: year === displayed, current: year === current})}"
        data-year=${year}
        tabindex=${year === displayed ? 0 : -1}
        aria-label=${fill(this.text.navigateToYear, label)}
        aria-pressed=${String(year === displayed)}
        @click=${() => this.selectYear(year)}
        @keydown=${this.handleYearKeydown}>
        <petal-focus-ring part="focus-ring"></petal-focus-ring>
        <petal-ripple></petal-ripple>
        <span aria-hidden="true">${label}</span>
      </button>`);
    }
    return html`<div class="years ${classMap({open})}" ?inert=${!open}>
      <div class="years-content">
        <div class="year-grid">${open ? years : nothing}</div>
        <petal-divider></petal-divider>
      </div>
    </div>`;
  }

  private renderInput(locale: string) {
    const pattern = dateInputFormat(locale).pattern.toUpperCase();
    return html`<petal-outlined-text-field
      class=${classMap({'has-error': !!this.inputError})}
      label=${this.inputLabel}
      placeholder=${pattern}
      aria-label=${`${this.inputLabel}, ${pattern}`}
      inputmode="numeric"
      autocomplete="off"
      .value=${this.inputText}
      ?error=${!!this.inputError}
      error-text=${this.inputError}
      ?disabled=${this.disabled}
      @input=${this.handleInput}
      @keydown=${this.handleInputKeydown}></petal-outlined-text-field>`;
  }

  // Selection.

  private select(day: number) {
    if (!this.isSelectable(day)) return;
    this.focusDay = day;
    this.setValue(formatIso(day));
  }

  private setValue(value: string) {
    if (value === this.value) return;
    this.value = value;
    this.dispatchEvent(new Event('input', {bubbles: true, composed: true}));
    this.dispatchEvent(new Event('change', {bubbles: true}));
  }

  // Paging between months.

  private reducedMotion() {
    return !isServer && matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /** Moves to the previous (-1) or next (1) month, sliding. */
  private page(direction: number, spec = SCROLL_SPRING, velocity = 0): Promise<void> {
    const target = addMonths(this.displayedMonth, direction);
    if (!this.inRange(target)) return Promise.resolve();
    const width = this.viewport?.clientWidth ?? 0;
    if (!width || this.reducedMotion()) {
      this.stopPaging();
      this.displayedMonth = target;
      this.setOffset(0);
      return this.updateComplete.then((): void => undefined);
    }
    // A page already moving the same way finishes first.
    if (this.pageSpring && this.pageDirection !== 0) this.finishPage();
    this.pageDirection = direction;
    const spring = new Spring(springFromCss(this, 'default-effects', spec), 0.5);
    spring.value = this.offset;
    spring.velocity = velocity;
    spring.target = -direction * width;
    return this.runSpring(spring);
  }

  /** Slides back to the shown month (after a short swipe). */
  private settle(velocity: number) {
    this.pageDirection = 0;
    const spring = new Spring(springFromCss(this, 'default-effects', DEFAULT_EFFECTS), 0.5);
    spring.value = this.offset;
    spring.velocity = velocity;
    spring.target = 0;
    return this.runSpring(spring);
  }

  private runSpring(spring: Spring) {
    cancelAnimationFrame(this.pageFrame);
    this.pageSpring = spring;
    return new Promise<void>((resolve) => {
      let last = performance.now();
      const frame = (now: number) => {
        if (this.pageSpring !== spring) return resolve();
        spring.step(Math.min(now - last, 64));
        last = now;
        this.setOffset(spring.value);
        if (spring.atRest) {
          this.finishPage();
          this.updateComplete.then(() => resolve());
          return;
        }
        this.pageFrame = requestAnimationFrame(frame);
      };
      this.pageFrame = requestAnimationFrame(frame);
    });
  }

  private finishPage() {
    cancelAnimationFrame(this.pageFrame);
    this.pageSpring = null;
    if (this.pageDirection !== 0) {
      this.displayedMonth = addMonths(this.displayedMonth, this.pageDirection);
    }
    this.pageDirection = 0;
    this.setOffset(0);
  }

  private stopPaging() {
    if (isServer) return;
    cancelAnimationFrame(this.pageFrame);
    this.pageSpring = null;
    this.pageDirection = 0;
  }

  private setOffset(offset: number) {
    this.offset = offset;
    this.track?.style.setProperty('--_offset', `${offset}px`);
  }

  private handlePointerDown(event: PointerEvent) {
    // Swiping is for touch and pens; a mouse uses the arrows.
    if (event.pointerType === 'mouse' || !event.isPrimary || this.drag) return;
    this.stopPaging();
    this.drag = {
      id: event.pointerId,
      x: event.clientX - this.offset,
      y: event.clientY,
      started: false,
      samples: [{x: event.clientX, t: event.timeStamp}],
    };
  }

  private handlePointerMove(event: PointerEvent) {
    const drag = this.drag;
    if (!drag || drag.id !== event.pointerId) return;
    const dx = event.clientX - drag.x;
    if (!drag.started) {
      const dy = event.clientY - drag.y;
      if (Math.abs(dx) < TOUCH_SLOP) return;
      if (Math.abs(dy) > Math.abs(dx)) {
        this.drag = null;
        return;
      }
      drag.started = true;
      this.viewport?.setPointerCapture(event.pointerId);
    }
    // No pulling past the first or last month.
    let offset = dx;
    if (offset > 0 && !this.inRange(addMonths(this.displayedMonth, -1))) offset = 0;
    if (offset < 0 && !this.inRange(addMonths(this.displayedMonth, 1))) offset = 0;
    this.setOffset(offset);
    drag.samples.push({x: event.clientX, t: event.timeStamp});
    if (drag.samples.length > 5) drag.samples.shift();
  }

  private handlePointerUp(event: PointerEvent) {
    const drag = this.drag;
    if (!drag || drag.id !== event.pointerId) return;
    this.drag = null;
    if (!drag.started) return;
    const [a, b] = [drag.samples[0], drag.samples[drag.samples.length - 1]];
    const velocity = b.t > a.t ? ((b.x - a.x) / (b.t - a.t)) * 1000 : 0;
    const width = this.viewport?.clientWidth ?? 1;
    // DatePickerDefaults.rememberSnapFlingBehavior: a fling goes to the next
    // month its way, a slow release to the closest; the default effects spring.
    let direction = 0;
    if (Math.abs(velocity) > FLING_VELOCITY) direction = velocity < 0 ? 1 : -1;
    else if (Math.abs(this.offset) > width / 2) direction = this.offset < 0 ? 1 : -1;
    if (direction !== 0 && this.inRange(addMonths(this.displayedMonth, direction))) {
      this.page(direction, DEFAULT_EFFECTS, velocity);
    } else {
      this.settle(velocity);
    }
  }

  // Keyboard in the calendar.

  private handleDayKeydown(event: KeyboardEvent) {
    const button = (event.target as HTMLElement).closest<HTMLElement>('.day');
    if (!button) return;
    const day = Number(button.dataset['day']);
    const rtl = getComputedStyle(this).direction === 'rtl';
    const {year, month, day: date} = dateParts(day);
    const firstWeekday = this.firstDayOfWeek ?? firstDayOfWeek(this.resolvedLocale);
    let target: number;
    switch (event.key) {
      case 'ArrowLeft':
        target = day + (rtl ? 1 : -1);
        break;
      case 'ArrowRight':
        target = day + (rtl ? -1 : 1);
        break;
      case 'ArrowUp':
        target = day - 7;
        break;
      case 'ArrowDown':
        target = day + 7;
        break;
      case 'Home':
        target = day - ((weekday(day) - firstWeekday + 7) % 7);
        break;
      case 'End':
        target = day + 6 - ((weekday(day) - firstWeekday + 7) % 7);
        break;
      case 'PageUp':
      case 'PageDown': {
        const step = event.key === 'PageUp' ? -1 : 1;
        const to = addMonths({year, month}, event.shiftKey ? step * 12 : step);
        target = firstDayOf(to) + Math.min(date, daysInMonth(to)) - 1;
        break;
      }
      default:
        return;
    }
    event.preventDefault();
    this.moveFocusTo(target);
  }

  private async moveFocusTo(day: number) {
    const min = this.minDay ?? firstDayOf({year: FIRST_YEAR, month: 1});
    const max = this.maxDay ?? firstDayOf({year: LAST_YEAR, month: 12}) + 30;
    if (day < min || day > max) return;
    this.focusDay = day;
    const delta = monthsBetween(this.displayedMonth, monthOf(day));
    if (Math.abs(delta) === 1) {
      await this.page(delta);
    } else if (delta !== 0) {
      this.stopPaging();
      this.displayedMonth = monthOf(day);
      this.setOffset(0);
    }
    await this.updateComplete;
    this.renderRoot.querySelector<HTMLElement>(`.day[data-day="${day}"]`)?.focus();
  }

  private handleCalendarFocusOut(event: FocusEvent) {
    const to = event.relatedTarget as Node | null;
    if (!to || !this.viewport?.contains(to)) this.focusDay = null;
  }

  // Years.

  private async toggleYearPicker() {
    this.yearPickerOpen = !this.yearPickerOpen;
    if (!this.yearPickerOpen) return;
    await this.updateComplete;
    // LazyVerticalGrid's first visible item: the row above the shown year.
    const grid = this.renderRoot.querySelector<HTMLElement>('.year-grid');
    const selected = this.renderRoot.querySelector<HTMLElement>('.year.selected');
    if (grid && selected) {
      grid.scrollTop = Math.max(0, selected.offsetTop - grid.offsetTop - selected.offsetHeight - 16);
      selected.focus({preventScroll: true});
    }
  }

  private async selectYear(year: number) {
    this.yearPickerOpen = false;
    this.stopPaging();
    this.setOffset(0);
    this.displayedMonth = this.clampMonth({year, month: this.displayedMonth.month});
    await this.updateComplete;
    this.renderRoot.querySelector<HTMLElement>('.year-button')?.focus();
  }

  private handleYearKeydown(event: KeyboardEvent) {
    const button = event.currentTarget as HTMLElement;
    const year = Number(button.dataset['year']);
    const rtl = getComputedStyle(this).direction === 'rtl';
    const steps: Record<string, number> = {
      ArrowLeft: rtl ? 1 : -1,
      ArrowRight: rtl ? -1 : 1,
      ArrowUp: -3,
      ArrowDown: 3,
    };
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      this.yearPickerOpen = false;
      this.updateComplete.then(() =>
        this.renderRoot.querySelector<HTMLElement>('.year-button')?.focus(),
      );
      return;
    }
    const step = steps[event.key];
    if (step === undefined) return;
    event.preventDefault();
    const target = this.renderRoot.querySelector<HTMLElement>(`.year[data-year="${year + step}"]`);
    if (!target) return;
    button.tabIndex = -1;
    target.tabIndex = 0;
    target.focus();
  }

  // Display mode.

  private async toggleDisplayMode() {
    const from = this.displayMode;
    const to: DatePickerDisplayMode = from === 'picker' ? 'input' : 'picker';
    const panes = this.panes;
    const startHeight = panes?.offsetHeight ?? 0;
    this.stopPaging();
    this.setOffset(0);
    this.yearPickerOpen = false;
    this.inputError = '';
    this.displayMode = to;
    await this.updateComplete;
    if (to === 'input') {
      // Compose focuses the text field after MotionTokens.DurationMedium2.
      setTimeout(() => this.field?.focus(), 300);
    }
    if (!panes || this.reducedMotion()) return;
    this.animateModeChange(panes, startHeight, from, to);
  }

  // SwitchableDateEntryContent: the incoming pane slides and fades in, the
  // outgoing one fades out and slides away, and the height follows.
  private animateModeChange(
    panes: HTMLElement,
    startHeight: number,
    from: DatePickerDisplayMode,
    to: DatePickerDisplayMode,
  ) {
    const incoming = panes.querySelector<HTMLElement>(`.${to}-pane`)!;
    const outgoing = panes.querySelector<HTMLElement>(`.${from}-pane`)!;
    const endHeight = incoming.offsetHeight;
    const spatial = springEasing(springFromCss(this, 'default-spatial', DEFAULT_SPATIAL));
    const effectsIn = springEasing(springFromCss(this, 'default-effects', DEFAULT_EFFECTS));
    const effectsOut = springEasing(springFromCss(this, 'fast-effects', FAST_EFFECTS));
    // The parallax offset of the calendar part.
    const parallax = -48;

    outgoing.hidden = false;
    outgoing.classList.add('leaving');
    const outHeight = outgoing.offsetHeight;
    const toInput = to === 'input';
    const animations = [
      panes.animate({height: [`${startHeight}px`, `${endHeight}px`]}, spatial),
      incoming.animate(
        {translate: [`0 ${toInput ? endHeight : parallax}px`, '0 0']},
        spatial,
      ),
      incoming.animate({opacity: [0, 1]}, {...effectsIn, fill: 'backwards'}),
      outgoing.animate(
        {translate: ['0 0', `0 ${toInput ? parallax : outHeight}px`]},
        {...spatial, fill: 'forwards'},
      ),
      outgoing.animate({opacity: [1, 0]}, {...effectsOut, fill: 'forwards'}),
    ];
    Promise.all(animations.slice(0, 1).concat(animations.slice(3)).map((a) => a.finished))
      .catch((): void => undefined)
      .then(() => {
        outgoing.classList.remove('leaving');
        outgoing.hidden = this.displayMode !== from;
        for (const animation of animations.slice(3)) animation.cancel();
      });
  }

  // Text input (DateInputContent).

  private handleInput() {
    const field = this.field;
    if (!field) return;
    const locale = this.resolvedLocale;
    const format = dateInputFormat(locale);
    // Only digits, at most eight; the delimiters are added (DateInputTransformation).
    const digits = field.value.replace(/\D/g, '').slice(0, 8);
    const shown = withDelimiters(digits, format);
    if (field.value !== shown) field.value = shown;
    this.inputText = shown;
    let value = '';
    this.inputError = '';
    if (digits.length === 8) {
      const day = parseInputDigits(digits, format);
      this.inputError = this.validate(day, format.pattern.toUpperCase(), locale);
      if (!this.inputError && day !== null) value = formatIso(day);
    }
    this.typedValue = value;
    this.setValue(value);
  }

  /** DateInputValidator. */
  private validate(day: number | null, pattern: string, locale: string) {
    const text = this.text;
    const format = formatter(locale);
    if (day === null) return fill(text.invalidPattern, pattern);
    const {year} = dateParts(day);
    const first = this.firstMonth.year;
    const last = this.lastMonth.year;
    if (year < first || year > last) {
      return fill(text.invalidYearRange, format.number(first), format.number(last));
    }
    if (!this.isSelectable(day)) return fill(text.invalidNotAllowed, format.headline(day));
    return '';
  }

  private handleInputKeydown(event: KeyboardEvent) {
    // ImeAction.Done.
    if (event.key === 'Enter') this.field?.blur();
  }
}
