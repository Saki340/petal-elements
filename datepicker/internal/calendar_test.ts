/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  addMonths,
  dateInputFormat,
  dayNumber,
  daysInMonth,
  firstDayOfWeek,
  formatIso,
  parseInputDigits,
  parseIso,
  rangeRows,
  toInputDigits,
  weekday,
  withDelimiters,
} from './calendar.js';

describe('rangeRows', () => {
  // October 2026 starts on a Thursday: four empty cells with weeks from Sunday.
  const october = {year: 2026, month: 10};
  const leading = 4;
  const first = dayNumber(2026, 10, 1);
  const on = (date: number) => first + date - 1;

  it('is empty outside the month and for a single day', () => {
    expect(rangeRows(october, leading, on(40), on(50))).toEqual([]);
    expect(rangeRows(october, leading, on(-20), on(-10))).toEqual([]);
    expect(rangeRows(october, leading, on(5), on(5))).toEqual([]);
  });

  it('goes from middle to middle in one row', () => {
    expect(rangeRows(october, leading, on(5), on(7))).toEqual([
      {row: 1, from: {column: 1, part: 0.5}, to: {column: 3, part: 0.5}},
    ]);
  });

  it('reaches the edges of the rows in between', () => {
    expect(rangeRows(october, leading, on(5), on(21))).toEqual([
      {row: 1, from: {column: 1, part: 0.5}, to: null},
      {row: 2, from: null, to: null},
      {row: 3, from: null, to: {column: 3, part: 0.5}},
    ]);
  });

  it('starts and ends on whole days when the range goes on in other months', () => {
    expect(rangeRows(october, leading, on(-5), on(50))).toEqual([
      {row: 0, from: {column: 4, part: 0}, to: null},
      {row: 1, from: null, to: null},
      {row: 2, from: null, to: null},
      {row: 3, from: null, to: null},
      {row: 4, from: null, to: {column: 6, part: 1}},
    ]);
  });
});

describe('date picker calendar', () => {
  it('reads and writes ISO dates without time zones', () => {
    const day = parseIso('2026-10-21')!;
    expect(formatIso(day)).toBe('2026-10-21');
    expect(weekday(day)).toBe(3); // A Wednesday.
    expect(parseIso('2026-02-30')).toBeNull();
    expect(parseIso('21/10/2026')).toBeNull();
  });

  it('counts months and days', () => {
    expect(addMonths({year: 2026, month: 11}, 3)).toEqual({year: 2027, month: 2});
    expect(addMonths({year: 2026, month: 1}, -1)).toEqual({year: 2025, month: 12});
    expect(daysInMonth({year: 2028, month: 2})).toBe(29);
    expect(daysInMonth({year: 2026, month: 2})).toBe(28);
  });

  it('starts weeks on the locale’s first day', () => {
    expect(firstDayOfWeek('en-US')).toBe(0);
    expect(firstDayOfWeek('de-DE')).toBe(1);
    expect(firstDayOfWeek('ja-JP')).toBe(0);
  });

  it('takes the input pattern from the locale (datePatternAsInputFormat)', () => {
    expect(dateInputFormat('en-US').pattern).toBe('MM/dd/yyyy');
    expect(dateInputFormat('de-DE').pattern).toBe('dd.MM.yyyy');
    expect(dateInputFormat('zh-CN').pattern).toBe('yyyy/MM/dd');
    expect(dateInputFormat('ja-JP').pattern).toBe('yyyy/MM/dd');
    expect(dateInputFormat('en-GB').pattern).toBe('dd/MM/yyyy');
  });

  it('adds delimiters as digits are typed and parses eight digits', () => {
    const us = dateInputFormat('en-US');
    expect(withDelimiters('10', us)).toBe('10/');
    expect(withDelimiters('1021', us)).toBe('10/21/');
    expect(withDelimiters('10212026', us)).toBe('10/21/2026');
    expect(parseInputDigits('10212026', us)).toBe(dayNumber(2026, 10, 21));
    expect(parseInputDigits('13452027', us)).toBeNull();
    const zh = dateInputFormat('zh-CN');
    expect(toInputDigits(dayNumber(2026, 10, 21), zh)).toBe('20261021');
    expect(withDelimiters('20261021', zh)).toBe('2026/10/21');
  });
});
