/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

// Times for the time picker: `HH:MM` strings outside, like
// `<input type="time">`, and an hour (0-23) and a minute inside.

/** An hour (0-23) and a minute (0-59). */
export interface Time {
  hour: number;
  minute: number;
}

/** The time of `HH:MM` (seconds are ignored), or null if it is not one. */
export function parseTime(value: string | null | undefined): Time | null {
  const match = /^(\d{2}):(\d{2})(?::\d{2}(?:\.\d+)?)?$/.exec(value ?? '');
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  return hour <= 23 && minute <= 59 ? {hour, minute} : null;
}

/** `HH:MM`. */
export function formatTime({hour, minute}: Time) {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

/** The hour shown in 12-hour mode: 12, then 1 to 11 (hourForDisplay). */
export function displayHour(hour: number, is24Hour: boolean) {
  if (is24Hour) return hour % 24;
  return hour % 12 === 0 ? 12 : hour % 12;
}

/**
 * A language tag Intl accepts: without a POSIX `@` part, canonical, else
 * `en-US`.
 */
export function validLocale(tag: string | null | undefined) {
  try {
    return Intl.getCanonicalLocales((tag ?? '').split('@')[0])[0] ?? 'en-US';
  } catch {
    return 'en-US';
  }
}

/** Whether a locale writes times with 24 hours (hour cycle h23 or h24). */
export function uses24Hour(locale: string) {
  const {hourCycle} = new Intl.DateTimeFormat(locale, {hour: 'numeric'}).resolvedOptions() as {
    hourCycle?: string;
  };
  return hourCycle === 'h23' || hourCycle === 'h24';
}

/** The locale's names for the morning and afternoon periods (AM and PM). */
export function dayPeriods(locale: string): DayPeriods {
  const format = new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    hour12: true,
    timeZone: 'UTC',
  });
  const period = (hour: number) =>
    format.formatToParts(new Date(Date.UTC(2000, 0, 1, hour))).find(
      (part) => part.type === 'dayPeriod',
    )?.value ?? (hour < 12 ? 'AM' : 'PM');
  return {am: period(9), pm: period(15)};
}

/** Formats numbers with one or two digits at least. */
export interface NumberFormatter {
  one(value: number): string;
  two(value: number): string;
}

/** The names of the two day periods. */
export interface DayPeriods {
  am: string;
  pm: string;
}

/** Formats numbers for a locale, without grouping (toLocalString). */
export function numberFormatter(locale: string): NumberFormatter {
  const one = new Intl.NumberFormat(locale, {useGrouping: false});
  const two = new Intl.NumberFormat(locale, {useGrouping: false, minimumIntegerDigits: 2});
  return {
    one: (value: number) => one.format(value),
    two: (value: number) => two.format(value),
  };
}

// Angles are in radians from the 3 o'clock direction, clockwise (the y axis
// points down), as Compose's AnalogTimePickerState.

export const FULL_CIRCLE = Math.PI * 2;
const RADIANS_PER_HOUR = FULL_CIRCLE / 12;
const RADIANS_PER_MINUTE = FULL_CIRCLE / 60;

/** The angle of an hour's place on the dial. */
export function hourAngle(hour: number) {
  return RADIANS_PER_HOUR * (hour % 12) - FULL_CIRCLE / 4;
}

/** The angle of a minute's place on the dial. */
export function minuteAngle(minute: number) {
  return RADIANS_PER_MINUTE * minute - FULL_CIRCLE / 4;
}

/** The angle of a point from the dial's center. */
export function pointAngle(x: number, y: number) {
  return Math.atan2(y, x);
}

/** The hour (0-11) whose place is closest to an angle. */
export function angleToHour(angle: number) {
  const fromTop = angle + FULL_CIRCLE / 4;
  return ((Math.round(fromTop / RADIANS_PER_HOUR) % 12) + 12) % 12;
}

/** The minute whose place is closest to an angle. */
export function angleToMinute(angle: number) {
  const fromTop = angle + FULL_CIRCLE / 4;
  return ((Math.round(fromTop / RADIANS_PER_MINUTE) % 60) + 60) % 60;
}

/**
 * The angle equal to `target` (modulo a full turn) closest to `from`, so the
 * selector takes the short way round (endValueForAnimation).
 */
export function nearestAngle(from: number, target: number) {
  let diff = from - target;
  while (diff > Math.PI) diff -= FULL_CIRCLE;
  while (diff <= -Math.PI) diff += FULL_CIRCLE;
  return from - diff;
}
