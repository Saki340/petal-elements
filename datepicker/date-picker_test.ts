/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

// The date picker after Jetpack Compose Material 3 (DatePicker.kt,
// DateInput.kt, DatePickerDialog, DatePickerModalTokens at androidx commit
// df73c24). Paging uses real animation frames, so no Environment (its mock
// clock does not advance performance.now()).

import {html, render} from 'lit';

import './date-picker-dialog.js';
import './date-picker.js';

import {formatIso, today} from './internal/calendar.js';
import type {PetalDatePickerDialog} from './date-picker-dialog.js';
import type {PetalDatePicker} from './date-picker.js';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('petal-date-picker', () => {
  let root: HTMLElement;

  beforeEach(() => {
    root = document.createElement('div');
    root.lang = 'en-US';
    document.body.append(root);
  });

  afterEach(() => {
    root.remove();
  });

  async function setup(template = html`<petal-date-picker value="2026-10-21"></petal-date-picker>`) {
    render(template, root);
    const picker = root.querySelector('petal-date-picker') as PetalDatePicker;
    await picker.updateComplete;
    return picker;
  }

  const $ = (picker: Element, selector: string) =>
    picker.shadowRoot!.querySelector(selector) as HTMLElement;
  const $$ = (picker: Element, selector: string) => [
    ...picker.shadowRoot!.querySelectorAll<HTMLElement>(selector),
  ];
  /** The days of the shown month. */
  const days = (picker: Element) =>
    $$(picker, '.month:not([inert]) .day');
  const dayText = (button: HTMLElement) => button.textContent!.trim();
  const monthYear = (picker: Element) => $(picker, '.month-year').textContent!.trim();

  describe('layout', () => {
    it('is 360px wide on surface-container-high', async () => {
      const picker = await setup();
      expect(picker.getBoundingClientRect().width).toBe(360);
      expect(getComputedStyle(picker).backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
    });

    it('has a header of at least 120px with the title and the headline', async () => {
      const picker = await setup();
      expect($(picker, '.header').getBoundingClientRect().height).toBeGreaterThanOrEqual(120);
      expect($(picker, '.title').textContent!.trim()).toBe('Select date');
      expect($(picker, '.headline').textContent!.trim()).toBe('Oct 21, 2026');
      expect(getComputedStyle($(picker, '.headline')).fontSize).toBe('32px');
    });

    it('has a 56px month row and 48px cells holding 40px days', async () => {
      const picker = await setup();
      expect($(picker, '.nav').getBoundingClientRect().height).toBe(56);
      expect($(picker, '.weekday').getBoundingClientRect().height).toBe(48);
      const day = days(picker)[0];
      const box = day.getBoundingClientRect();
      expect([box.width, box.height]).toEqual([40, 40]);
      expect($(picker, '.month:not([inert])').getBoundingClientRect().height).toBe(288);
    });

    it('lays out the month from the locale’s first day of the week', async () => {
      const picker = await setup();
      const names = $$(picker, '.weekday').map((el) => el.textContent!.trim());
      expect(names).toEqual(['S', 'M', 'T', 'W', 'T', 'F', 'S']);
      // October 2026 starts on a Thursday: four empty cells before it.
      const firstWeek = $$(picker, '.month:not([inert]) .week')[0];
      expect(firstWeek.querySelectorAll('.day').length).toBe(3);
      picker.locale = 'de-DE';
      await picker.updateComplete;
      expect($$(picker, '.weekday')[0].getAttribute('aria-label')).toBe('Montag');
      expect(monthYear(picker)).toBe('Oktober 2026');
    });

    it('falls back to en-US for tags Intl rejects, such as en-US@posix', async () => {
      const picker = await setup(html`<petal-date-picker
        locale="en-US@posix"
        value="2026-10-21"></petal-date-picker>`);
      expect(monthYear(picker)).toBe('October 2026');
      picker.locale = 'not a language';
      await picker.updateComplete;
      expect(monthYear(picker)).toBe('October 2026');
    });

    it('marks the selected day and today', async () => {
      const picker = await setup(html`<petal-date-picker
        value=${formatIso(today() + 1 > today() ? today() : today())}></petal-date-picker>`);
      const selected = $(picker, '.month:not([inert]) .day.selected');
      expect(selected).not.toBeNull();
      expect(selected.getAttribute('aria-current')).toBe('date');
    });
  });

  describe('selection', () => {
    it('selects a clicked day and fires input and change', async () => {
      const picker = await setup();
      const input = jasmine.createSpy('input');
      const change = jasmine.createSpy('change');
      picker.addEventListener('input', input);
      picker.addEventListener('change', change);
      days(picker).find((day) => dayText(day) === '5')!.click();
      await picker.updateComplete;
      expect(picker.value).toBe('2026-10-05');
      expect(input).toHaveBeenCalledTimes(1);
      expect(change).toHaveBeenCalledTimes(1);
      expect($(picker, '.headline').textContent!.trim()).toBe('Oct 5, 2026');
    });

    it('disables days outside min and max and the arrows at the ends', async () => {
      const picker = await setup(html`<petal-date-picker
        value="2026-10-21"
        min="2026-10-10"
        max="2026-10-25"></petal-date-picker>`);
      const enabled = days(picker).filter((day) => !(day as HTMLButtonElement).disabled);
      expect(enabled.map(dayText)).toEqual(
        Array.from({length: 16}, (_, i) => String(i + 10)),
      );
      expect(($(picker, '.previous') as HTMLButtonElement).disabled).toBeTrue();
      expect(($(picker, '.next') as HTMLButtonElement).disabled).toBeTrue();
    });

    it('asks isDateSelectable (SelectableDates)', async () => {
      const picker = await setup();
      picker.isDateSelectable = (date) => new Date(date).getUTCDay() !== 0;
      await picker.updateComplete;
      const sunday = days(picker).find((day) => dayText(day) === '4') as HTMLButtonElement;
      expect(sunday.disabled).toBeTrue();
    });

    it('takes part in forms', async () => {
      render(
        html`<form><petal-date-picker name="date" value="2026-10-21"></petal-date-picker></form>`,
        root,
      );
      const form = root.querySelector('form')!;
      const picker = root.querySelector('petal-date-picker') as PetalDatePicker;
      await picker.updateComplete;
      expect(new FormData(form).get('date')).toBe('2026-10-21');
      picker.value = '2026-12-01';
      expect(new FormData(form).get('date')).toBe('2026-12-01');
    });
  });

  describe('months', () => {
    it('slides to the next and previous month', async () => {
      const picker = await setup();
      $(picker, '.next').click();
      await wait(50);
      // On the way: the track is moving.
      const track = $(picker, '.track');
      expect(track.style.getPropertyValue('--_offset')).not.toBe('0px');
      await wait(700);
      expect(monthYear(picker)).toBe('November 2026');
      $(picker, '.previous').click();
      await wait(700);
      expect(monthYear(picker)).toBe('October 2026');
    });

    it('shows the month of a value set from outside', async () => {
      const picker = await setup();
      picker.value = '2030-03-15';
      await picker.updateComplete;
      expect(monthYear(picker)).toBe('March 2030');
    });
  });

  describe('keyboard', () => {
    const press = (picker: Element, key: string) =>
      (picker.shadowRoot!.activeElement as HTMLElement).dispatchEvent(
        new KeyboardEvent('keydown', {key, bubbles: true, composed: true}),
      );
    const focused = (picker: Element) =>
      (picker.shadowRoot!.activeElement as HTMLElement).textContent!.trim();

    it('keeps one day in the tab order, the selected one', async () => {
      const picker = await setup();
      const tabbable = days(picker).filter((day) => day.tabIndex === 0);
      expect(tabbable.map(dayText)).toEqual(['21']);
    });

    it('moves by day and week with the arrow keys', async () => {
      const picker = await setup();
      days(picker).find((day) => dayText(day) === '21')!.focus();
      press(picker, 'ArrowRight');
      await wait(20);
      expect(focused(picker)).toBe('22');
      press(picker, 'ArrowDown');
      await wait(20);
      expect(focused(picker)).toBe('29');
      press(picker, 'Home');
      await wait(20);
      expect(focused(picker)).toBe('25');
    });

    it('goes to the next month past the last day', async () => {
      const picker = await setup();
      days(picker).find((day) => dayText(day) === '31')!.focus();
      press(picker, 'ArrowRight');
      await wait(700);
      expect(monthYear(picker)).toBe('November 2026');
      expect(focused(picker)).toBe('1');
    });
  });

  describe('years', () => {
    it('opens a grid of years over the calendar and goes to the chosen year', async () => {
      const picker = await setup();
      $(picker, '.year-button').click();
      await picker.updateComplete;
      expect($(picker, '.years').classList.contains('open')).toBeTrue();
      expect($(picker, '.arrows').hidden).toBeTrue();
      const selected = $(picker, '.year.selected');
      expect(selected.textContent!.trim()).toBe('2026');
      const box = selected.getBoundingClientRect();
      expect([box.width, box.height]).toEqual([72, 36]);
      ($(picker, '.year[data-year="2030"]')).click();
      await picker.updateComplete;
      expect(monthYear(picker)).toBe('October 2030');
      expect($(picker, '.years').classList.contains('open')).toBeFalse();
    });

    it('lists the years from 1900 to 2100 without min and max', async () => {
      const picker = await setup();
      $(picker, '.year-button').click();
      await picker.updateComplete;
      const years = $$(picker, '.year');
      expect(years[0].textContent!.trim()).toBe('1900');
      expect(years[years.length - 1].textContent!.trim()).toBe('2100');
    });
  });

  describe('text input', () => {
    async function inputMode() {
      const picker = await setup(html`<petal-date-picker
        display-mode="input"
        min="2026-01-01"
        max="2027-12-31"></petal-date-picker>`);
      const field = $(picker, 'petal-outlined-text-field') as HTMLElement & {
        value: string;
        error: boolean;
        errorText: string;
        updateComplete: Promise<boolean>;
      };
      const type = async (text: string) => {
        field.value = text;
        field.dispatchEvent(new Event('input', {bubbles: true, composed: true}));
        await picker.updateComplete;
        await field.updateComplete;
      };
      return {picker, field, type};
    }

    it('shows the locale’s pattern', async () => {
      const {picker, field} = await inputMode();
      expect(field.getAttribute('placeholder')).toBe('MM/DD/YYYY');
      expect($(picker, '.headline').textContent!.trim()).toBe('Entered date');
    });

    it('adds the delimiters and selects a typed date', async () => {
      const {picker, field, type} = await inputMode();
      await type('1021');
      expect(field.value).toBe('10/21/');
      expect(picker.value).toBe('');
      await type('10/21/2026');
      expect(picker.value).toBe('2026-10-21');
      expect(field.error).toBeFalse();
    });

    it('keeps only digits', async () => {
      const {field, type} = await inputMode();
      await type('1a0');
      expect(field.value).toBe('10/');
    });

    it('shows Compose’s errors', async () => {
      const {picker, field, type} = await inputMode();
      await type('13452026');
      expect(field.errorText).toBe('Date does not match expected pattern: MM/DD/YYYY');
      await type('10212030');
      expect(field.errorText).toBe('Date out of expected year range 2026 - 2027');
      picker.isDateSelectable = () => false;
      await type('10212026');
      expect(field.errorText).toBe('Date not allowed: Oct 21, 2026');
      expect(picker.value).toBe('');
    });

    it('switches between the calendar and the text field', async () => {
      const picker = await setup();
      $(picker, '.mode-toggle').click();
      await picker.updateComplete;
      expect(picker.displayMode).toBe('input');
      expect($(picker, '.mode-toggle').getAttribute('aria-label')).toBe(
        'Switch to calendar input mode',
      );
    });
  });
});

describe('petal-date-picker-dialog', () => {
  let root: HTMLElement;

  beforeEach(() => {
    root = document.createElement('div');
    root.lang = 'en-US';
    document.body.append(root);
  });

  afterEach(() => {
    root.remove();
  });

  async function setup() {
    render(
      html`<petal-date-picker-dialog quick value="2026-10-21"></petal-date-picker-dialog>`,
      root,
    );
    const dialog = root.querySelector('petal-date-picker-dialog') as PetalDatePickerDialog;
    await dialog.show();
    const picker = dialog.shadowRoot!.querySelector('petal-date-picker') as PetalDatePicker;
    await picker.updateComplete;
    const pick = async (text: string) => {
      [...picker.shadowRoot!.querySelectorAll<HTMLElement>('.month:not([inert]) .day')]
        .find((day) => day.textContent!.trim() === text)!
        .click();
      await dialog.updateComplete;
    };
    const buttons = [
      ...dialog.shadowRoot!.querySelectorAll<HTMLElement>('.actions petal-text-button'),
    ];
    return {dialog, picker, pick, cancel: buttons[0], ok: buttons[1]};
  }

  it('is 360px wide with the picker and Cancel and OK', async () => {
    const {dialog, picker, cancel, ok} = await setup();
    expect(picker.getBoundingClientRect().width).toBe(360);
    expect([cancel.textContent!.trim(), ok.textContent!.trim()]).toEqual(['Cancel', 'OK']);
    await dialog.close();
  });

  it('keeps the picked date only after OK', async () => {
    const {dialog, pick, ok} = await setup();
    const change = jasmine.createSpy('change');
    dialog.addEventListener('change', change);
    await pick('5');
    expect(dialog.value).toBe('2026-10-21');
    ok.click();
    await new Promise((resolve) => dialog.addEventListener('closed', resolve, {once: true}));
    expect(dialog.value).toBe('2026-10-05');
    expect(dialog.returnValue).toBe('confirm');
    expect(dialog.open).toBeFalse();
    expect(change).toHaveBeenCalledTimes(1);
  });

  it('drops the picked date on Cancel', async () => {
    const {dialog, pick, cancel} = await setup();
    await pick('5');
    cancel.click();
    await new Promise((resolve) => dialog.addEventListener('closed', resolve, {once: true}));
    expect(dialog.value).toBe('2026-10-21');
    // Opening again starts from the confirmed date.
    await dialog.show();
    const picker = dialog.shadowRoot!.querySelector('petal-date-picker') as PetalDatePicker;
    expect(picker.value).toBe('2026-10-21');
    await dialog.close();
  });
});
