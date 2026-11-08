/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import '../../divider/divider.js';
import '../../focus/md-focus-ring.js';
import '../../iconbutton/icon-button.js';
import '../../ripple/ripple.js';
import '../../textfield/outlined-text-field.js';

import {html, isServer, nothing, PropertyValues} from 'lit';
import {property, query, state} from 'lit/decorators.js';
import {classMap} from 'lit/directives/class-map.js';
import {repeat} from 'lit/directives/repeat.js';

import {FormRestoreState, getFormValue} from '../../behaviors/form-associated.js';
import {FAST_EFFECTS, springEasing, springFromCss} from '../../internal/motion/spring.js';
import type {PetalOutlinedTextField} from '../../textfield/outlined-text-field.js';

import {
  addMonths,
  CalendarMonth,
  DateFormatter,
  dateInputFormat,
  daysInMonth,
  firstDayOf,
  formatIso,
  formatter,
  monthOf,
  monthsBetween,
  parseInputDigits,
  parseIso,
  RangePoint,
  rangeRows,
  toInputDigits,
  today,
  weekday,
  withDelimiters,
} from './calendar.js';
import {DateEntry, DatePickerDisplayMode, DAYS_IN_WEEK, ROWS} from './date-entry.js';

/**
 * The height of a month in the list: the subhead (CalendarMonthSubheadPadding
 * and a 20px line) and six rows of 48px. Every month has it, so only the
 * months in view are rendered.
 */
const MONTH_HEIGHT = 336;

/** A row of days. */
const CELL = 48;

/** DatePickerModalTokens.DateStateLayerHeight centered in a row. */
const RANGE_TOP = 4;

type Field = 'start' | 'end';

interface Selection {
  start: number | null;
  end: number | null;
}

/**
 * Where a point on a row is, for the days' `space-evenly` in a row, in the
 * variables set on the range element.
 */
function position({column, part}: RangePoint) {
  return `calc(var(--_gap) * ${column + 1} + var(--_cell) * ${column + part})`;
}

/**
 * A date range picker, after Jetpack Compose Material 3 (`DateRangePicker` in
 * DateRangePicker.kt and DateRangeInput.kt): a header with the two dates, a
 * list of months that scrolls, and text fields for typing the dates.
 *
 * @fires input {Event} The selection changed. --bubbles --composed
 * @fires change {Event} The selection changed. --bubbles
 */
export class DateRangePicker extends DateEntry {
  /** The first selected date, as an ISO date (`2026-10-21`), or `''`. */
  @property() start = '';

  /**
   * The last selected date, as an ISO date, or `''` while only the first is
   * selected. It is the same as `start` for a single day.
   */
  @property() end = '';

  /** The title above the dates in calendar mode. */
  @property({attribute: 'picker-title'}) pickerTitle = 'Select dates';

  /** The title above the dates in text input mode. */
  @property({attribute: 'input-title'}) inputTitle = 'Enter dates';

  /** Names the first date: its text field and headline while it is empty. */
  @property({attribute: 'start-label'}) startLabel = 'Start date';

  /** Names the last date: its text field and headline while it is empty. */
  @property({attribute: 'end-label'}) endLabel = 'End date';

  /** The first month in view. */
  @state() private displayedMonth: CalendarMonth = monthOf(today());
  /** The day that has the roving tab stop, while focus is in the calendar. */
  @state() private focusDay: number | null = null;
  /** The height of the list, for how many months to render. */
  @state() private listHeight = 568;
  @state() private startText = '';
  @state() private endText = '';
  @state() private startError = '';
  @state() private endError = '';

  /** The list has to be scrolled to the displayed month. */
  private scrollPending = true;
  /** The dates changed from the calendar or the text fields. */
  private ownChange = false;
  /** The dates changed from the text fields, which keep what was typed. */
  private typed = false;
  private observer?: ResizeObserver;

  @query('.list') private readonly list!: HTMLElement | null;
  @query('.panes') private readonly panes!: HTMLElement | null;
  @query('.start-field') private readonly startField!: PetalOutlinedTextField | null;

  /** Scrolls to the month that has the given ISO date. */
  showMonthOf(date: string) {
    const day = parseIso(date);
    if (day === null) return;
    this.displayedMonth = this.clampMonth(monthOf(day));
    this.scrollPending = true;
    this.requestUpdate();
  }

  override [getFormValue]() {
    const {start, end} = this.selection;
    if (!this.name || start === null) return null;
    const data = new FormData();
    data.append(`${this.name}-start`, formatIso(start));
    if (end !== null) data.append(`${this.name}-end`, formatIso(end));
    return data;
  }

  override formResetCallback() {
    this.start = this.getAttribute('start') ?? '';
    this.end = this.getAttribute('end') ?? '';
  }

  override formStateRestoreCallback(state: FormRestoreState) {
    if (!(state instanceof FormData) || !this.name) return;
    this.start = String(state.get(`${this.name}-start`) ?? '');
    this.end = String(state.get(`${this.name}-end`) ?? '');
  }

  override connectedCallback() {
    super.connectedCallback();
    if (this.hasUpdated) this.observeList();
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.observer?.disconnect();
  }

  protected override firstUpdated() {
    this.observeList();
  }

  // The list has no height while it is hidden, as in a closed dialog or in
  // text input mode, and loses its position with it.
  private observeList() {
    if (isServer || !this.list) return;
    this.observer ??= new ResizeObserver(([entry]) => {
      const height = entry.contentRect.height;
      if (height === 0) {
        this.scrollPending = true;
        return;
      }
      this.listHeight = height;
      this.scrollToDisplayedMonth();
    });
    this.observer.observe(this.list);
  }

  protected override willUpdate(changed: PropertyValues<this>) {
    const {ownChange, typed} = this;
    this.ownChange = false;
    this.typed = false;
    // Show the first date's month when it is set from outside, or when the
    // limits move away from the shown month.
    if (changed.has('start') && !ownChange && this.selection.start !== null) {
      this.displayedMonth = this.clampMonth(monthOf(this.selection.start));
      this.scrollPending = true;
    } else if (changed.has('min') || changed.has('max')) {
      this.displayedMonth = this.clampMonth(this.displayedMonth);
      this.scrollPending = true;
    }
    if ((changed.has('start') || changed.has('end') || changed.has('locale')) && !typed) {
      this.resetFields();
    }
  }

  protected override updated() {
    this.scrollToDisplayedMonth();
  }

  private scrollToDisplayedMonth() {
    const list = this.list;
    if (!this.scrollPending || !list?.clientHeight) return;
    this.scrollPending = false;
    list.scrollTop = monthsBetween(this.firstMonth, this.displayedMonth) * MONTH_HEIGHT;
  }

  /** The dates, under the rules of DateRangePickerState.setSelection. */
  private get selection(): Selection {
    const start = parseIso(this.start);
    const end = parseIso(this.end);
    if (start === null || (end !== null && end < start)) return {start: null, end: null};
    return {start, end};
  }

  private resetFields() {
    const {start, end} = this.selection;
    const format = dateInputFormat(this.resolvedLocale);
    const text = (day: number | null) =>
      day === null ? '' : withDelimiters(toInputDigits(day, format), format);
    this.startText = text(start);
    this.endText = text(end);
    this.startError = '';
    this.endError = '';
  }

  // Rendering.

  protected override render() {
    const locale = this.resolvedLocale;
    const format = formatter(locale);
    const selection = this.selection;
    const picker = this.displayMode === 'picker';
    return html`
      <div class="date-picker">
        ${this.noHeader ? nothing : this.renderHeader(format, selection, picker)}
        <div class="panes">
          <div class="pane picker-pane" ?inert=${!picker} ?hidden=${!picker}>
            ${this.renderWeekdays(locale)} ${this.renderList(locale, format, selection)}
          </div>
          <div class="pane input-pane" ?inert=${picker} ?hidden=${picker}>
            ${this.renderField('start', locale)} ${this.renderField('end', locale)}
          </div>
        </div>
      </div>
    `;
  }

  private renderHeader(format: DateFormatter, {start, end}: Selection, picker: boolean) {
    const text = this.text;
    const description = (label: string, day: number | null) =>
      `${label}: ${day === null ? text.noSelection : format.description(day)}`;
    return html`
      <div class="header">
        <div class="title">${picker ? this.pickerTitle : this.inputTitle}</div>
        <div class="headline-row">
          <div
            class="headline"
            aria-live="polite"
            aria-label=${`${description(this.startLabel, start)}, ${description(this.endLabel, end)}`}>
            <span class="headline-start"
              ><span>${start === null ? this.startLabel : format.headline(start)}</span>
              <span>-</span></span
            >
            <span>${end === null ? this.endLabel : format.headline(end)}</span>
          </div>
          ${this.renderModeToggle(picker, this.toggleDisplayMode)}
        </div>
      </div>
      <petal-divider></petal-divider>
    `;
  }

  /** The indices of the months to render: those in view, and the focused one. */
  private renderedMonths() {
    const firstMonth = this.firstMonth;
    const count = monthsBetween(firstMonth, this.lastMonth) + 1;
    const shown = monthsBetween(firstMonth, this.displayedMonth);
    const from = Math.max(0, shown - 1);
    const to = Math.min(count - 1, shown + Math.ceil(this.listHeight / MONTH_HEIGHT) + 1);
    const indices = Array.from({length: to - from + 1}, (_, i) => from + i);
    if (this.focusDay !== null) {
      const focused = monthsBetween(firstMonth, monthOf(this.focusDay));
      if (focused < from || focused > to) indices.push(focused);
    }
    return {count, indices: indices.sort((a, b) => a - b)};
  }

  private renderList(locale: string, format: DateFormatter, selection: Selection) {
    const firstWeekday = this.firstWeekday(locale);
    const {count, indices} = this.renderedMonths();
    const months = indices.map((index) => addMonths(this.firstMonth, index));
    const tabStop = this.tabStop(months, selection.start);
    return html`<div
      class="list"
      @scroll=${this.handleScroll}
      @keydown=${this.handleDayKeydown}
      @focusout=${this.handleCalendarFocusOut}>
      <div class="months" style="height: ${count * MONTH_HEIGHT}px">
        ${repeat(
          indices,
          (index) => index,
          (index, i) => this.renderMonth(index, months[i], firstWeekday, format, selection, tabStop),
        )}
      </div>
    </div>`;
  }

  private renderMonth(
    index: number,
    month: CalendarMonth,
    firstWeekday: number,
    format: DateFormatter,
    selection: Selection,
    tabStop: number | null,
  ) {
    const text = this.text;
    const {start, end} = selection;
    const hasRange = start !== null && end !== null;
    const first = firstDayOf(month);
    const leading = (weekday(first) - firstWeekday + 7) % 7;
    const count = daysInMonth(month);
    const todayDay = today();
    const rows = [];
    for (let row = 0; row < ROWS; row++) {
      const cells = [];
      for (let column = 0; column < DAYS_IN_WEEK; column++) {
        const dayIndex = row * DAYS_IN_WEEK + column - leading;
        if (dayIndex < 0 || dayIndex >= count) {
          cells.push(html`<div class="cell" role="gridcell"></div>`);
          continue;
        }
        const day = first + dayIndex;
        const isStart = day === start;
        const isEnd = day === end;
        const isToday = day === todayDay;
        const inRange = hasRange && day >= start && day <= end;
        const enabled = this.isSelectable(day) && !this.disabled;
        // dayContentDescription.
        const role = isStart
          ? this.startLabel
          : isEnd
            ? this.endLabel
            : inRange
              ? text.dayInRange
              : '';
        const label = [hasRange || isStart ? role : '', isToday ? text.today : '', format.description(day)]
          .filter(Boolean)
          .join(', ');
        cells.push(html`<div
          class="cell"
          role="gridcell"
          aria-selected=${String(isStart || isEnd || inRange)}>
          <button
            class="day ${classMap({
              selected: isStart || isEnd,
              today: isToday,
              'range-start': isStart,
              'in-range': inRange,
            })}"
            data-day=${day}
            tabindex=${day === tabStop ? 0 : -1}
            aria-label=${label}
            aria-current=${isToday ? 'date' : nothing}
            ?disabled=${!enabled}
            @click=${() => this.select(day)}>
            <petal-focus-ring part="focus-ring"></petal-focus-ring>
            <petal-ripple ?disabled=${!enabled}></petal-ripple>
            <span aria-hidden="true">${format.number(dayIndex + 1)}</span>
          </button>
        </div>`);
      }
      rows.push(html`<div class="week" role="row">${cells}</div>`);
    }
    const ranges = hasRange ? rangeRows(month, leading, start, end) : [];
    const label = format.monthYear(month);
    return html`<div class="list-month" style="top: ${index * MONTH_HEIGHT}px">
      <div class="subhead" aria-hidden="true">${label}</div>
      <div class="weeks" role="grid" aria-label=${label}>
        ${ranges.map(
          ({row, from, to}) =>
            html`<div
              class="range"
              style="top: ${row * CELL + RANGE_TOP}px; inset-inline-start: ${from
                ? position(from)
                : '0'}; inset-inline-end: ${to ? `calc(100% - ${position(to)})` : '0'}"></div>`,
        )}
        ${rows}
      </div>
    </div>`;
  }

  /** The day in the tab order: the focused, first, today's or a selectable day. */
  private tabStop(months: CalendarMonth[], start: number | null) {
    const rendered = (day: number | null) =>
      day !== null &&
      months.some((month) => monthsBetween(monthOf(day), month) === 0) &&
      this.isSelectable(day);
    const inView = this.displayedMonth;
    if (rendered(this.focusDay)) return this.focusDay;
    if (rendered(start)) return start;
    const todayDay = today();
    if (rendered(todayDay)) return todayDay;
    const first = firstDayOf(inView);
    for (let i = 0; i < daysInMonth(inView); i++) {
      if (this.isSelectable(first + i)) return first + i;
    }
    return null;
  }

  private renderField(field: Field, locale: string) {
    const pattern = dateInputFormat(locale).pattern.toUpperCase();
    const label = field === 'start' ? this.startLabel : this.endLabel;
    const error = field === 'start' ? this.startError : this.endError;
    return html`<petal-outlined-text-field
      class=${classMap({[`${field}-field`]: true, 'has-error': !!error})}
      label=${label}
      placeholder=${pattern}
      aria-label=${`${label}, ${pattern}`}
      inputmode="numeric"
      autocomplete="off"
      .value=${field === 'start' ? this.startText : this.endText}
      ?error=${!!error}
      error-text=${error}
      ?disabled=${this.disabled}
      @input=${(event: Event) => this.handleInput(field, event)}
      @keydown=${this.handleInputKeydown}></petal-outlined-text-field>`;
  }

  // Selection.

  // updateDateSelection: a day after the start ends the range, and any other
  // day starts a new one.
  private select(day: number) {
    if (!this.isSelectable(day)) return;
    this.focusDay = day;
    const {start, end} = this.selection;
    if (start !== null && end === null && day >= start) this.setRange(start, day);
    else this.setRange(day, null);
  }

  private setRange(startDay: number | null, endDay: number | null) {
    const start = startDay === null ? '' : formatIso(startDay);
    const end = endDay === null ? '' : formatIso(endDay);
    if (start === this.start && end === this.end) return;
    this.ownChange = true;
    this.start = start;
    this.end = end;
    this.dispatchEvent(new Event('input', {bubbles: true, composed: true}));
    this.dispatchEvent(new Event('change', {bubbles: true}));
  }

  // The list.

  private handleScroll() {
    const list = this.list;
    if (!list || this.scrollPending) return;
    const month = this.clampMonth(
      addMonths(this.firstMonth, Math.floor(list.scrollTop / MONTH_HEIGHT)),
    );
    if (monthsBetween(month, this.displayedMonth) !== 0) this.displayedMonth = month;
  }

  private handleDayKeydown(event: KeyboardEvent) {
    const button = (event.target as HTMLElement).closest<HTMLElement>('.day');
    if (!button) return;
    const target = this.dayKeyTarget(event, Number(button.dataset['day']));
    if (target === null) return;
    event.preventDefault();
    this.moveFocusTo(target);
  }

  // The focused day's month is always rendered, and focusing it scrolls to it.
  private async moveFocusTo(day: number) {
    if (!this.isShownDay(day)) return;
    this.focusDay = day;
    await this.updateComplete;
    this.renderRoot.querySelector<HTMLElement>(`.day[data-day="${day}"]`)?.focus();
  }

  private handleCalendarFocusOut(event: FocusEvent) {
    const to = event.relatedTarget as Node | null;
    if (!to || !this.list?.contains(to)) this.focusDay = null;
  }

  // Display mode.

  private async toggleDisplayMode() {
    const from = this.displayMode;
    const to: DatePickerDisplayMode = from === 'picker' ? 'input' : 'picker';
    // DateRangePickerStateImpl.displayMode shows the start date's month, and
    // the fields start over from the dates.
    const {start} = this.selection;
    if (start !== null) this.displayedMonth = this.clampMonth(monthOf(start));
    this.scrollPending = true;
    this.resetFields();
    this.displayMode = to;
    await this.updateComplete;
    if (to === 'input') {
      // Compose focuses the text field after MotionTokens.DurationMedium2.
      setTimeout(() => this.startField?.focus(), 300);
    }
    if (this.panes && !this.reducedMotion()) this.crossfade(this.panes, from, to);
  }

  // SwitchableDateEntryContent: a Crossfade on the fast effects spring.
  private crossfade(
    panes: HTMLElement,
    from: DatePickerDisplayMode,
    to: DatePickerDisplayMode,
  ) {
    const incoming = panes.querySelector<HTMLElement>(`.${to}-pane`)!;
    const outgoing = panes.querySelector<HTMLElement>(`.${from}-pane`)!;
    const effects = springEasing(springFromCss(this, 'fast-effects', FAST_EFFECTS));
    outgoing.hidden = false;
    outgoing.classList.add('leaving');
    incoming.animate({opacity: [0, 1]}, effects);
    const fade = outgoing.animate({opacity: [1, 0]}, {...effects, fill: 'forwards'});
    fade.finished
      .catch((): void => undefined)
      .then(() => {
        outgoing.classList.remove('leaving');
        outgoing.hidden = this.displayMode !== from;
        fade.cancel();
      });
  }

  // Text input (DateRangeInputContent).

  private handleInput(field: Field, event: Event) {
    const input = event.target as PetalOutlinedTextField;
    const format = dateInputFormat(this.resolvedLocale);
    // Only digits, at most eight; the delimiters are added (DateInputTransformation).
    const shown = withDelimiters(input.value.replace(/\D/g, '').slice(0, 8), format);
    if (input.value !== shown) input.value = shown;
    if (field === 'start') this.startText = shown;
    else this.endText = shown;
    this.applyFields(field);
  }

  // The fields are read together, unlike DateRangeInputContent: there a date
  // typed while the other was incomplete stays in its field but is lost from
  // the selection.
  private applyFields(edited: Field) {
    const locale = this.resolvedLocale;
    const format = dateInputFormat(locale);
    const read = (text: string) => {
      const digits = text.replace(/\D/g, '');
      if (digits.length !== 8) return {day: null, error: ''};
      const day = parseInputDigits(digits, format);
      const error = this.validate(day, format.pattern.toUpperCase(), locale);
      return {day: error ? null : day, error};
    };
    const start = read(this.startText);
    const end = read(this.endText);
    if (start.day !== null && end.day !== null && start.day > end.day) {
      const field = edited === 'start' ? start : end;
      field.day = null;
      field.error = this.text.invalidRange;
    }
    this.startError = start.error;
    this.endError = end.error;
    this.typed = true;
    this.setRange(start.day, start.day === null ? null : end.day);
  }

  private handleInputKeydown(event: KeyboardEvent) {
    // ImeAction.Done.
    if (event.key === 'Enter') (event.target as HTMLElement).blur();
  }
}
