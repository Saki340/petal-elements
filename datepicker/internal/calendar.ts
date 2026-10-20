/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

// Calendar dates for the date picker, after Jetpack Compose Material 3
// (CalendarModel.kt). A date is a day with no time and no time zone: dates
// are ISO strings (`2026-10-21`) outside, and day numbers counted from
// 1970-01-01 inside, so no time zone can move a day. Names and formats come
// from Intl for the picker's locale.

/** A calendar month. */
export interface CalendarMonth {
  year: number;
  /** 1 to 12. */
  month: number;
}

const MS_PER_DAY = 86400000;

/** The day number of a date (days since 1970-01-01). */
export function dayNumber(year: number, month: number, day: number) {
  return Math.floor(Date.UTC(year, month - 1, day) / MS_PER_DAY);
}

/** The year, month (1-12) and day of a day number. */
export function dateParts(day: number) {
  const date = new Date(day * MS_PER_DAY);
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
  };
}

/** The day number of an ISO date (`YYYY-MM-DD`), or null if it is not one. */
export function parseIso(value: string | null | undefined): number | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value ?? '');
  if (!match) return null;
  const [year, month, day] = match.slice(1).map(Number);
  return isValidDate(year, month, day) ? dayNumber(year, month, day) : null;
}

/** The ISO date (`YYYY-MM-DD`) of a day number. */
export function formatIso(day: number) {
  const {year, month, day: date} = dateParts(day);
  return `${String(year).padStart(4, '0')}-${pad(month)}-${pad(date)}`;
}

function pad(value: number) {
  return String(value).padStart(2, '0');
}

/** Whether the year, month and day make a real date. */
export function isValidDate(year: number, month: number, day: number) {
  return (
    month >= 1 &&
    month <= 12 &&
    day >= 1 &&
    day <= daysInMonth({year, month})
  );
}

/** Today in the browser's time zone, as a day number. */
export function today(now = new Date()) {
  return dayNumber(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

/** The month a day number is in. */
export function monthOf(day: number): CalendarMonth {
  const {year, month} = dateParts(day);
  return {year, month};
}

/** The month `count` months after `from` (before, if negative). */
export function addMonths(from: CalendarMonth, count: number): CalendarMonth {
  const index = from.year * 12 + from.month - 1 + count;
  return {year: Math.floor(index / 12), month: (index % 12 + 12) % 12 + 1};
}

/** The months from `a` to `b` (negative if `b` is before `a`). */
export function monthsBetween(a: CalendarMonth, b: CalendarMonth) {
  return (b.year - a.year) * 12 + (b.month - a.month);
}

export function daysInMonth({year, month}: CalendarMonth) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/** The day number of the first day of a month. */
export function firstDayOf(month: CalendarMonth) {
  return dayNumber(month.year, month.month, 1);
}

/** The day of the week of a day number: 0 for Sunday to 6 for Saturday. */
export function weekday(day: number) {
  // 1970-01-01 was a Thursday.
  return (((day + 4) % 7) + 7) % 7;
}

/**
 * The first day of the week for a locale: 0 for Sunday to 6 for Saturday,
 * from `Intl.Locale` week info where the browser has it.
 */
export function firstDayOfWeek(locale: string): number {
  try {
    const intlLocale = new Intl.Locale(locale) as Intl.Locale & {
      getWeekInfo?: () => {firstDay: number};
      weekInfo?: {firstDay: number};
    };
    const info = intlLocale.getWeekInfo?.() ?? intlLocale.weekInfo;
    if (info) return info.firstDay % 7;
    const region = intlLocale.maximize().region ?? '';
    return SUNDAY_FIRST.has(region) ? 0 : region === 'MV' ? 5 : SATURDAY_FIRST.has(region) ? 6 : 1;
  } catch {
    return 0;
  }
}

// For browsers without week info (CLDR weekData).
const SUNDAY_FIRST = new Set(
  'AG AS BD BR BS BT BW BZ CA CN CO DM DO ET GT GU HK HN ID IL IN JM JP KE KH KR LA MH MM MO MT MX MZ NI NP PA PE PH PK PR PT PY SA SG SV TH TT TW UM US VE VI WS YE ZA ZW'.split(
    ' ',
  ),
);
const SATURDAY_FIRST = new Set('AE AF BH DJ DZ EG IQ IR JO KW LY OM QA SD SY'.split(' '));

/** The weekdays' full and narrow names, from Sunday. */
/** A weekday's full and narrow names. */
export interface WeekdayName {
  full: string;
  narrow: string;
}

export function weekdayNames(locale: string): WeekdayName[] {
  const full = new Intl.DateTimeFormat(locale, {weekday: 'long', timeZone: 'UTC'});
  const narrow = new Intl.DateTimeFormat(locale, {weekday: 'narrow', timeZone: 'UTC'});
  // 1970-01-04 was a Sunday.
  return Array.from({length: 7}, (_, i) => {
    const date = new Date((3 + i) * MS_PER_DAY);
    return {full: full.format(date), narrow: narrow.format(date)};
  });
}

interface DatePart {
  type: string;
  value: string;
}

interface DateFormatOptions {
  year?: string;
  month?: string;
  day?: string;
  weekday?: string;
}

/** The part of `Intl.DateTimeFormat` used here. */
interface DateFormat {
  format(date: Date): string;
  formatToParts(date: Date): DatePart[];
}

// Plain types in the signature: the manifest generator cannot follow `Intl`
// types.
function utcFormat(locale: string, options: DateFormatOptions): DateFormat {
  return new Intl.DateTimeFormat(locale, {
    ...options,
    timeZone: 'UTC',
  } as Intl.DateTimeFormatOptions);
}

/**
 * Formats like Compose's DatePickerFormatter skeletons: `headline` is
 * `yMMMd`, `description` is `yMMMMEEEEd` and `monthYear` is `yMMMM`.
 */
/** Formats dates and numbers for a locale. */
export interface DateFormatter {
  /** `yMMMd`, e.g. Oct 21, 2026. */
  headline(day: number): string;
  /** `yMMMMEEEEd`, e.g. Wednesday, October 21, 2026. */
  description(day: number): string;
  /** `yMMMM`, e.g. October 2026. */
  monthYear(month: CalendarMonth): string;
  number(value: number): string;
}

export function formatter(locale: string): DateFormatter {
  const headline = utcFormat(locale, {year: 'numeric', month: 'short', day: 'numeric'});
  const description = utcFormat(locale, {
    year: 'numeric',
    month: 'long',
    weekday: 'long',
    day: 'numeric',
  });
  const monthYear = utcFormat(locale, {year: 'numeric', month: 'long'});
  const number = new Intl.NumberFormat(locale, {useGrouping: false});
  return {
    headline: (day: number) => headline.format(new Date(day * MS_PER_DAY)),
    description: (day: number) => description.format(new Date(day * MS_PER_DAY)),
    monthYear: (month: CalendarMonth) =>
      monthYear.format(new Date(firstDayOf(month) * MS_PER_DAY)),
    number: (value: number) => number.format(value),
  };
}

/** A field of a typed date. */
export type DateField = 'day' | 'month' | 'year';

/** The typed date format of a locale, like Compose's DateInputFormat. */
export interface DateInputFormat {
  /** `dd`, `MM` and `yyyy` in the locale's order, with the delimiter. */
  pattern: string;
  delimiter: string;
  /** The fields in order. */
  order: DateField[];
}

/**
 * The locale's short numeric date order and delimiter, made into a
 * two-digit day and month and a four-digit year (datePatternAsInputFormat).
 */
export function dateInputFormat(locale: string): DateInputFormat {
  const parts = utcFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date(0));
  const order: DateInputFormat['order'] = [];
  let delimiter = '';
  for (const part of parts) {
    if (part.type === 'day' || part.type === 'month' || part.type === 'year') {
      order.push(part.type);
    } else if (part.type === 'literal' && !delimiter) {
      delimiter = /[/\-.]/.exec(part.value)?.[0] ?? '';
    }
  }
  if (order.length !== 3) order.splice(0, order.length, 'month', 'day', 'year');
  delimiter ||= '/';
  const field = {day: 'dd', month: 'MM', year: 'yyyy'};
  return {pattern: order.map((part) => field[part]).join(delimiter), delimiter, order};
}

/** The digits of a day in the input format, without delimiters. */
export function toInputDigits(day: number, format: DateInputFormat) {
  const parts = dateParts(day);
  return format.order
    .map((part) => String(parts[part]).padStart(part === 'year' ? 4 : 2, '0'))
    .join('');
}

/** The digits with the delimiters added as they are typed (DateOutputTransformation). */
export function withDelimiters(digits: string, format: DateInputFormat) {
  const pattern = format.pattern;
  const first = pattern.indexOf(format.delimiter);
  const second = pattern.lastIndexOf(format.delimiter);
  let text = digits;
  if (first >= 0 && first <= text.length) {
    text = text.slice(0, first) + format.delimiter + text.slice(first);
  }
  if (second > first && second <= text.length) {
    text = text.slice(0, second) + format.delimiter + text.slice(second);
  }
  return text;
}

/** The day number of eight typed digits, or null if they are not a date. */
export function parseInputDigits(digits: string, format: DateInputFormat): number | null {
  if (!/^\d{8}$/.test(digits)) return null;
  const values = {day: 0, month: 0, year: 0};
  let index = 0;
  for (const part of format.order) {
    const length = part === 'year' ? 4 : 2;
    values[part] = Number(digits.slice(index, index + length));
    index += length;
  }
  return isValidDate(values.year, values.month, values.day)
    ? dayNumber(values.year, values.month, values.day)
    : null;
}
