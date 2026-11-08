/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import {html, isServer, LitElement, nothing, svg} from 'lit';
import {property} from 'lit/decorators.js';

import {mixinElementInternals} from '../../behaviors/element-internals.js';
import {mixinFormAssociated} from '../../behaviors/form-associated.js';

import {
  addMonths,
  CalendarMonth,
  dateParts,
  daysInMonth,
  firstDayOf,
  firstDayOfWeek,
  formatIso,
  formatter,
  monthOf,
  monthsBetween,
  parseIso,
  weekday,
  weekdayNames,
} from './calendar.js';

/** The date picker's display mode, as Compose's `DisplayMode`. */
export type DatePickerDisplayMode = 'picker' | 'input';

/**
 * The text the date pickers read out or show in errors, to replace their
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
  /** A day between the start and the end of a range. */
  dayInRange?: string;
  /** A range that ends before it starts. */
  invalidRange?: string;
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
  dayInRange: 'In range',
  invalidRange: 'Invalid date range input',
};

/**
 * A language tag Intl accepts: without a POSIX `@` part (some systems report
 * `en-US@posix`), canonical, else `en-US`.
 */
function validLocale(tag: string | null | undefined) {
  try {
    return Intl.getCanonicalLocales((tag ?? '').split('@')[0])[0] ?? 'en-US';
  } catch {
    return 'en-US';
  }
}

export function fill(template: string, ...values: string[]) {
  return values.reduce((text, value, i) => text.replace(`%${i + 1}`, value), template);
}

/** DatePickerDefaults.YearRange. */
const FIRST_YEAR = 1900;
const LAST_YEAR = 2100;

/** MaxCalendarRows, DaysInWeek. */
export const ROWS = 6;
export const DAYS_IN_WEEK = 7;

// Material icons (Apache-2.0): edit, date_range, keyboard_arrow_left,
// keyboard_arrow_right, arrow_drop_down and close.
export const ICONS = {
  edit: 'M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z',
  calendar:
    'M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5a2 2 0 0 0-1.99 2L3 20a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 16H5V9h14v11z',
  previous: 'M15.41 16.59 10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z',
  next: 'M8.59 16.59 13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z',
  dropDown: 'M7 10l5 5 5-5z',
  close:
    'M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z',
};

export function icon(path: string, className = 'icon') {
  return html`<svg class=${className} viewBox="0 0 24 24" aria-hidden="true">
    ${svg`<path d=${path} />`}
  </svg>`;
}

const dateEntryBaseClass = mixinFormAssociated(mixinElementInternals(LitElement));

/**
 * What the date picker and the date range picker share, as Compose's
 * `DateEntryContainer`, `WeekDays` and `DateInputValidator`: the limits, the
 * locale, the weekday row, the keys and the checks of typed dates.
 */
export class DateEntry extends dateEntryBaseClass {
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

  /** `picker` shows the calendar, `input` text fields. */
  @property({reflect: true, attribute: 'display-mode'})
  displayMode: DatePickerDisplayMode = 'picker';

  /** Hides the button that switches between the calendar and text input. */
  @property({type: Boolean, attribute: 'hide-mode-toggle'}) hideModeToggle = false;

  /** Hides the title and the headline, leaving only the calendar. */
  @property({type: Boolean, attribute: 'no-header'}) noHeader = false;

  /**
   * Whether a date can be selected, as Compose's `SelectableDates`. Called
   * with ISO dates between `min` and `max`.
   */
  @property({attribute: false}) isDateSelectable?: (date: string) => boolean;

  /** Replaces some of the read-out and error texts. */
  @property({attribute: false}) messages: DatePickerMessages = {};

  // Locale and formats.

  protected get resolvedLocale() {
    if (this.locale) return validLocale(this.locale);
    if (isServer) return 'en-US';
    // The closest `lang`, also across shadow roots (as in a dialog).
    let node: Element | null = this;
    while (node) {
      const lang = node.closest('[lang]')?.getAttribute('lang');
      if (lang) return validLocale(lang);
      const root = node.getRootNode();
      node = root instanceof ShadowRoot ? root.host : null;
    }
    return validLocale(navigator.language);
  }

  protected get text() {
    return {...DEFAULT_MESSAGES, ...this.messages};
  }

  protected firstWeekday(locale: string) {
    return this.firstDayOfWeek ?? firstDayOfWeek(locale);
  }

  protected reducedMotion() {
    return !isServer && matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  // Limits.

  protected get minDay() {
    return parseIso(this.min);
  }

  protected get maxDay() {
    return parseIso(this.max);
  }

  protected get firstMonth(): CalendarMonth {
    const min = this.minDay;
    return min === null ? {year: FIRST_YEAR, month: 1} : monthOf(min);
  }

  protected get lastMonth(): CalendarMonth {
    const max = this.maxDay;
    return max === null ? {year: LAST_YEAR, month: 12} : monthOf(max);
  }

  protected clampMonth(month: CalendarMonth): CalendarMonth {
    if (monthsBetween(this.firstMonth, month) < 0) return this.firstMonth;
    if (monthsBetween(month, this.lastMonth) < 0) return this.lastMonth;
    return month;
  }

  protected inRange(month: CalendarMonth) {
    return (
      monthsBetween(this.firstMonth, month) >= 0 && monthsBetween(month, this.lastMonth) >= 0
    );
  }

  protected isSelectable(day: number) {
    const min = this.minDay;
    const max = this.maxDay;
    if (min !== null && day < min) return false;
    if (max !== null && day > max) return false;
    const {year} = dateParts(day);
    if (min === null && year < FIRST_YEAR) return false;
    if (max === null && year > LAST_YEAR) return false;
    return this.isDateSelectable?.(formatIso(day)) ?? true;
  }

  /** Whether focus can move to the day, selectable or not. */
  protected isShownDay(day: number) {
    const min = this.minDay ?? firstDayOf({year: FIRST_YEAR, month: 1});
    const max = this.maxDay ?? firstDayOf({year: LAST_YEAR, month: 12}) + 30;
    return day >= min && day <= max;
  }

  // Parts.

  protected renderModeToggle(picker: boolean, toggle: () => void) {
    if (this.hideModeToggle) return nothing;
    const text = this.text;
    return html`<petal-icon-button
      class="mode-toggle"
      aria-label=${picker ? text.switchToInputMode : text.switchToCalendarMode}
      @click=${toggle}
      >${icon(picker ? ICONS.edit : ICONS.calendar)}</petal-icon-button
    >`;
  }

  protected renderWeekdays(locale: string) {
    const firstWeekday = this.firstWeekday(locale);
    const names = weekdayNames(locale);
    const weekdays = Array.from({length: DAYS_IN_WEEK}, (_, i) => names[(firstWeekday + i) % 7]);
    return html`<div class="weekdays" role="row">
      ${weekdays.map(
        (name) =>
          html`<div class="weekday" role="columnheader" aria-label=${name.full}>
            <span aria-hidden="true">${name.narrow}</span>
          </div>`,
      )}
    </div>`;
  }

  /** The day a key in the calendar moves to from `day`, or null for other keys. */
  protected dayKeyTarget(event: KeyboardEvent, day: number): number | null {
    const rtl = getComputedStyle(this).direction === 'rtl';
    const {year, month, day: date} = dateParts(day);
    const firstWeekday = this.firstWeekday(this.resolvedLocale);
    switch (event.key) {
      case 'ArrowLeft':
        return day + (rtl ? 1 : -1);
      case 'ArrowRight':
        return day + (rtl ? -1 : 1);
      case 'ArrowUp':
        return day - 7;
      case 'ArrowDown':
        return day + 7;
      case 'Home':
        return day - ((weekday(day) - firstWeekday + 7) % 7);
      case 'End':
        return day + 6 - ((weekday(day) - firstWeekday + 7) % 7);
      case 'PageUp':
      case 'PageDown': {
        const step = event.key === 'PageUp' ? -1 : 1;
        const to = addMonths({year, month}, event.shiftKey ? step * 12 : step);
        return firstDayOf(to) + Math.min(date, daysInMonth(to)) - 1;
      }
      default:
        return null;
    }
  }

  /** DateInputValidator, without the check of a range. */
  protected validate(day: number | null, pattern: string, locale: string) {
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
}
