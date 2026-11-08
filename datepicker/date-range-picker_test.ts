/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

// The date range picker after Jetpack Compose Material 3 (DateRangePicker.kt,
// DateRangeInput.kt, DateInputValidator at androidx commit df73c24).

import {html, render} from 'lit';

import './date-range-picker-dialog.js';
import './date-range-picker.js';

import type {PetalDateRangePickerDialog} from './date-range-picker-dialog.js';
import type {PetalDateRangePicker} from './date-range-picker.js';
import type {PetalOutlinedTextField} from '../textfield/outlined-text-field.js';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const MONTH_HEIGHT = 336;

describe('petal-date-range-picker', () => {
  let root: HTMLElement;

  beforeEach(() => {
    root = document.createElement('div');
    root.lang = 'en-US';
    document.body.append(root);
  });

  afterEach(() => {
    root.remove();
  });

  async function setup(
    template = html`<petal-date-range-picker
      start="2026-10-12"
      end="2026-10-21"></petal-date-range-picker>`,
  ) {
    render(template, root);
    const picker = root.querySelector('petal-date-range-picker') as PetalDateRangePicker;
    await picker.updateComplete;
    await wait(50);
    await picker.updateComplete;
    return picker;
  }

  const $ = (picker: Element, selector: string) =>
    picker.shadowRoot!.querySelector(selector) as HTMLElement;
  const $$ = (picker: Element, selector: string) => [
    ...picker.shadowRoot!.querySelectorAll<HTMLElement>(selector),
  ];
  const month = (picker: Element, label: string) =>
    $$(picker, '.list-month').find(
      (element) => element.querySelector('.subhead')!.textContent!.trim() === label,
    )!;
  const day = (picker: Element, label: string, date: number) =>
    [...month(picker, label).querySelectorAll<HTMLElement>('.day')].find(
      (button) => button.textContent!.trim() === String(date),
    )!;
  const october = 'October 2026';

  describe('layout', () => {
    it('is 360px wide with the height of the modal tokens', async () => {
      const picker = await setup();
      const box = picker.getBoundingClientRect();
      expect(box.width).toBe(360);
      expect(box.height).toBe(568);
    });

    it('has the title and both dates, indented 64px, in TitleLarge', async () => {
      const picker = await setup();
      expect($(picker, '.title').textContent!.trim()).toBe('Select dates');
      expect(getComputedStyle($(picker, '.title')).paddingInlineStart).toBe('64px');
      const headline = $(picker, '.headline');
      expect(getComputedStyle(headline).fontSize).toBe('22px');
      expect(headline.textContent!.replace(/\s+/g, ' ').trim()).toBe(
        'Oct 12, 2026 - Oct 21, 2026',
      );
    });

    it('shows the placeholders without dates', async () => {
      const picker = await setup(html`<petal-date-range-picker></petal-date-range-picker>`);
      expect($(picker, '.headline').textContent!.replace(/\s+/g, ' ').trim()).toBe(
        'Start date - End date',
      );
    });

    it('has months of 336px with a subhead padded 24, 20 and 8px', async () => {
      const picker = await setup();
      const element = month(picker, october);
      expect(element.getBoundingClientRect().height).toBe(MONTH_HEIGHT);
      const subhead = getComputedStyle(element.querySelector('.subhead')!);
      expect(subhead.paddingInlineStart).toBe('24px');
      expect(subhead.paddingTop).toBe('20px');
      expect(subhead.paddingBottom).toBe('8px');
      expect(subhead.fontSize).toBe('14px');
    });

    it('renders only the months in view', async () => {
      const picker = await setup();
      expect($$(picker, '.list-month').length).toBeLessThan(6);
    });

    it('starts at the first date\'s month', async () => {
      const picker = await setup();
      const list = $(picker, '.list');
      const months = (2026 - 1900) * 12 + 9;
      expect(list.scrollTop).toBe(months * MONTH_HEIGHT);
    });
  });

  describe('selection (updateDateSelection)', () => {
    it('sets the start, then the end', async () => {
      const picker = await setup(html`<petal-date-range-picker
        start="2026-10-05"></petal-date-range-picker>`);
      day(picker, october, 9).click();
      await picker.updateComplete;
      expect(picker.start).toBe('2026-10-05');
      expect(picker.end).toBe('2026-10-09');
    });

    it('allows a range of a single day', async () => {
      const picker = await setup(html`<petal-date-range-picker
        start="2026-10-05"></petal-date-range-picker>`);
      day(picker, october, 5).click();
      await picker.updateComplete;
      expect(picker.end).toBe('2026-10-05');
      expect($$(picker, '.range').length).toBe(0);
    });

    it('moves the start when an earlier day is picked', async () => {
      const picker = await setup(html`<petal-date-range-picker
        start="2026-10-05"></petal-date-range-picker>`);
      day(picker, october, 2).click();
      await picker.updateComplete;
      expect(picker.start).toBe('2026-10-02');
      expect(picker.end).toBe('');
    });

    it('starts over after a complete range', async () => {
      const picker = await setup();
      day(picker, october, 25).click();
      await picker.updateComplete;
      expect(picker.start).toBe('2026-10-25');
      expect(picker.end).toBe('');
    });

    it('fires input and change', async () => {
      const picker = await setup();
      const events: string[] = [];
      picker.addEventListener('input', () => events.push('input'));
      picker.addEventListener('change', () => events.push('change'));
      day(picker, october, 25).click();
      expect(events).toEqual(['input', 'change']);
    });

    it('does not scroll when a day is picked', async () => {
      const picker = await setup();
      const list = $(picker, '.list');
      list.scrollTop += 100;
      await wait(50);
      const before = list.scrollTop;
      day(picker, october, 25).click();
      await picker.updateComplete;
      await wait(50);
      expect(list.scrollTop).toBe(before);
    });

    it('treats an end without a start, or before it, as no selection', async () => {
      const picker = await setup(html`<petal-date-range-picker
        end="2026-10-05"></petal-date-range-picker>`);
      expect($$(picker, '.day.selected').length).toBe(0);
      picker.start = '2026-10-09';
      await picker.updateComplete;
      expect($$(picker, '.day.selected').length).toBe(0);
    });
  });

  describe('range (drawRangeBackground, Day)', () => {
    it('marks the two ends and the days in between', async () => {
      const picker = await setup();
      expect($$(picker, '.day.selected').length).toBe(2);
      expect($$(picker, '.day.in-range').length).toBe(10);
      expect(day(picker, october, 15).classList).toContain('in-range');
      expect(day(picker, october, 15).classList).not.toContain('selected');
    });

    it('draws 40px bands from the middle of the first day to the last', async () => {
      const picker = await setup();
      const bands = [...month(picker, october).querySelectorAll<HTMLElement>('.range')];
      // Mon 12 to Wed 21 in October 2026, weeks from Sunday.
      expect(bands.length).toBe(2);
      const start = day(picker, october, 12).getBoundingClientRect();
      const end = day(picker, october, 21).getBoundingClientRect();
      const weeks = month(picker, october).querySelector('.weeks')!.getBoundingClientRect();
      const first = bands[0].getBoundingClientRect();
      const last = bands[1].getBoundingClientRect();
      expect(first.height).toBe(40);
      expect(first.left).toBeCloseTo(start.left + start.width / 2, 0);
      expect(first.right).toBeCloseTo(weeks.right, 0);
      expect(first.top).toBeCloseTo(start.top, 0);
      expect(last.left).toBeCloseTo(weeks.left, 0);
      expect(last.right).toBeCloseTo(end.left + end.width / 2, 0);
    });

    it('colors the band and the days from the tokens', async () => {
      const picker = await setup(html`<petal-date-range-picker
        style="--md-date-picker-range-selection-active-indicator-container-color: rgb(1, 2, 3); --md-date-picker-selection-date-in-range-label-text-color: rgb(4, 5, 6)"
        start="2026-10-12"
        end="2026-10-21"></petal-date-range-picker>`);
      expect(getComputedStyle($(picker, '.range')).backgroundColor).toBe('rgb(1, 2, 3)');
      expect(getComputedStyle(day(picker, october, 15)).color).toBe('rgb(4, 5, 6)');
    });

    it('reads the role of a day (dayContentDescription)', async () => {
      const picker = await setup();
      expect(day(picker, october, 12).getAttribute('aria-label')).toBe(
        'Start date, Monday, October 12, 2026',
      );
      expect(day(picker, october, 21).getAttribute('aria-label')).toBe(
        'End date, Wednesday, October 21, 2026',
      );
      expect(day(picker, october, 15).getAttribute('aria-label')).toBe(
        'In range, Thursday, October 15, 2026',
      );
    });

    it('fills a whole month inside a longer range', async () => {
      const picker = await setup(html`<petal-date-range-picker
        start="2026-09-20"
        end="2026-11-05"></petal-date-range-picker>`);
      const days = month(picker, october).querySelectorAll('.day.in-range');
      expect(days.length).toBe(31);
    });
  });

  describe('limits', () => {
    it('shows only the months between min and max', async () => {
      const picker = await setup(html`<petal-date-range-picker
        min="2026-10-10"
        max="2026-11-20"></petal-date-range-picker>`);
      const labels = $$(picker, '.subhead').map((subhead) => subhead.textContent!.trim());
      expect(labels).toEqual(['October 2026', 'November 2026']);
      expect((day(picker, october, 9) as HTMLButtonElement).disabled).toBeTrue();
      expect((day(picker, october, 10) as HTMLButtonElement).disabled).toBeFalse();
    });

    it('asks isDateSelectable', async () => {
      const picker = await setup(html`<petal-date-range-picker
        start="2026-10-12"
        .isDateSelectable=${(date: string) => date !== '2026-10-15'}></petal-date-range-picker>`);
      expect((day(picker, october, 15) as HTMLButtonElement).disabled).toBeTrue();
    });
  });

  describe('scrolling', () => {
    it('renders new months while scrolling', async () => {
      const picker = await setup();
      $(picker, '.list').scrollTop += MONTH_HEIGHT * 12;
      await wait(100);
      await picker.updateComplete;
      expect(month(picker, 'October 2027')).toBeDefined();
      expect(month(picker, 'August 2026')).toBeUndefined();
    });

    it('scrolls to the month of a start set from outside', async () => {
      const picker = await setup();
      picker.start = '2030-03-02';
      picker.end = '';
      await picker.updateComplete;
      await wait(50);
      await picker.updateComplete;
      expect(month(picker, 'March 2030')).toBeDefined();
      const months = (2030 - 1900) * 12 + 2;
      expect($(picker, '.list').scrollTop).toBe(months * MONTH_HEIGHT);
    });

    it('scrolls with showMonthOf', async () => {
      const picker = await setup();
      picker.showMonthOf('2020-01-15');
      await picker.updateComplete;
      await wait(50);
      await picker.updateComplete;
      expect(month(picker, 'January 2020')).toBeDefined();
    });
  });

  describe('keyboard', () => {
    it('has one tab stop, on the first date', async () => {
      const picker = await setup();
      const stops = $$(picker, '.day').filter((button) => button.tabIndex === 0);
      expect(stops.length).toBe(1);
      expect(stops[0]).toBe(day(picker, october, 12));
    });

    it('moves by day and week and across months', async () => {
      const picker = await setup();
      const start = day(picker, october, 12);
      start.focus();
      start.dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowRight', bubbles: true}));
      await picker.updateComplete;
      await wait(0);
      const focused = () => picker.shadowRoot!.activeElement!.getAttribute('aria-label')!;
      expect(focused()).toContain('October 13, 2026');
      picker.shadowRoot!.activeElement!.dispatchEvent(
        new KeyboardEvent('keydown', {key: 'PageDown', bubbles: true}),
      );
      await picker.updateComplete;
      await wait(0);
      expect(focused()).toContain('November 13, 2026');
    });

    it('keeps the focused month when a far day is reached', async () => {
      const picker = await setup();
      const start = day(picker, october, 12);
      start.focus();
      start.dispatchEvent(
        new KeyboardEvent('keydown', {key: 'PageDown', shiftKey: true, bubbles: true}),
      );
      await picker.updateComplete;
      await wait(50);
      expect(picker.shadowRoot!.activeElement!.getAttribute('aria-label')).toContain(
        'October 12, 2027',
      );
    });
  });

  describe('text input (DateRangeInputContent)', () => {
    async function inputPicker(start = '', end = '') {
      const picker = await setup(html`<petal-date-range-picker
        display-mode="input"
        start=${start}
        end=${end}></petal-date-range-picker>`);
      const startField = $(picker, '.start-field') as PetalOutlinedTextField;
      const endField = $(picker, '.end-field') as PetalOutlinedTextField;
      await startField.updateComplete;
      const type = async (field: PetalOutlinedTextField, value: string) => {
        field.value = value;
        field.dispatchEvent(new Event('input', {bubbles: true}));
        await picker.updateComplete;
      };
      return {picker, startField, endField, type};
    }

    it('has two fields 8px apart labelled as the dates', async () => {
      const {picker, startField, endField} = await inputPicker();
      expect(startField.label).toBe('Start date');
      expect(endField.label).toBe('End date');
      expect(getComputedStyle($(picker, '.input-pane')).gap).toBe('8px');
      expect(startField.getBoundingClientRect().width).toBe(
        endField.getBoundingClientRect().width,
      );
    });

    it('shows the dates and adds separators as typed', async () => {
      const {startField, endField, type} = await inputPicker('2026-10-12', '2026-10-21');
      expect(startField.value).toBe('10/12/2026');
      expect(endField.value).toBe('10/21/2026');
      await type(startField, '1015');
      expect(startField.value).toBe('10/15/');
    });

    it('sets the dates when both are complete', async () => {
      const {picker, startField, endField, type} = await inputPicker();
      await type(startField, '10122026');
      expect(picker.start).toBe('2026-10-12');
      expect(picker.end).toBe('');
      await type(endField, '10212026');
      expect(picker.end).toBe('2026-10-21');
    });

    it('rejects an end before the start on the edited field', async () => {
      const {picker, startField, endField, type} = await inputPicker('2026-10-12', '');
      await type(endField, '10012026');
      expect(picker.end).toBe('');
      expect(endField.errorText).toBe('Invalid date range input');
      expect(endField.error).toBeTrue();
      expect(startField.error).toBeFalse();
    });

    it('keeps an end typed before the start', async () => {
      const {picker, startField, endField, type} = await inputPicker();
      await type(endField, '10212026');
      expect(picker.start).toBe('');
      expect(picker.end).toBe('');
      expect(endField.value).toBe('10/21/2026');
      await type(startField, '10122026');
      expect(picker.start).toBe('2026-10-12');
      expect(picker.end).toBe('2026-10-21');
    });

    it('clears the range error when the other date fixes it', async () => {
      const {picker, startField, endField, type} = await inputPicker('2026-10-12', '');
      await type(endField, '10012026');
      await type(startField, '09012026');
      expect(endField.error).toBeFalse();
      expect(picker.start).toBe('2026-09-01');
      expect(picker.end).toBe('2026-10-01');
    });

    it('shows the errors of DateInputValidator', async () => {
      const {startField, type} = await inputPicker();
      await type(startField, '13012026');
      expect(startField.errorText).toBe('Date does not match expected pattern: MM/DD/YYYY');
      await type(startField, '10122200');
      expect(startField.errorText).toBe('Date out of expected year range 1900 - 2100');
    });

    it('switches modes and takes its own height in text input', async () => {
      const picker = await setup();
      $(picker, '.mode-toggle').click();
      await picker.updateComplete;
      await wait(400);
      expect(picker.displayMode).toBe('input');
      expect($(picker, '.title').textContent!.trim()).toBe('Enter dates');
      expect(picker.getBoundingClientRect().height).toBeLessThan(300);
      $(picker, '.mode-toggle').click();
      await picker.updateComplete;
      await wait(400);
      expect(picker.getBoundingClientRect().height).toBe(568);
      expect(month(picker, october)).toBeDefined();
      expect($(picker, '.list').scrollTop).toBe(((2026 - 1900) * 12 + 9) * MONTH_HEIGHT);
    });
  });

  describe('forms', () => {
    it('submits the two dates under the name', async () => {
      render(
        html`<form>
          <petal-date-range-picker
            name="stay"
            start="2026-10-12"
            end="2026-10-21"></petal-date-range-picker>
        </form>`,
        root,
      );
      const picker = root.querySelector('petal-date-range-picker') as PetalDateRangePicker;
      await picker.updateComplete;
      const data = new FormData(root.querySelector('form')!);
      expect(data.get('stay-start')).toBe('2026-10-12');
      expect(data.get('stay-end')).toBe('2026-10-21');
    });

    it('goes back to its attributes on reset', async () => {
      render(
        html`<form>
          <petal-date-range-picker
            name="stay"
            start="2026-10-12"
            end="2026-10-21"></petal-date-range-picker>
        </form>`,
        root,
      );
      const picker = root.querySelector('petal-date-range-picker') as PetalDateRangePicker;
      await picker.updateComplete;
      picker.start = '2026-11-01';
      picker.end = '';
      root.querySelector('form')!.reset();
      expect(picker.start).toBe('2026-10-12');
      expect(picker.end).toBe('2026-10-21');
    });
  });

  describe('dialog', () => {
    async function setupDialog(start = '', end = '') {
      render(
        html`<petal-date-range-picker-dialog
          quick
          start=${start}
          end=${end}></petal-date-range-picker-dialog>`,
        root,
      );
      const dialog = root.querySelector(
        'petal-date-range-picker-dialog',
      ) as PetalDateRangePickerDialog;
      await dialog.updateComplete;
      await dialog.show();
      await wait(50);
      const picker = $(dialog, 'petal-date-range-picker') as PetalDateRangePicker;
      await picker.updateComplete;
      return {dialog, picker};
    }

    const save = (dialog: Element) => $(dialog, '.toolbar petal-text-button') as HTMLElement & {
      disabled: boolean;
    };
    const close = (dialog: Element) => $(dialog, '.toolbar petal-icon-button');

    it('is 360px wide and at most 568px high with Close and Save', async () => {
      const {dialog} = await setupDialog('2026-10-12', '2026-10-21');
      const content = $(dialog, '.content').getBoundingClientRect();
      expect(content.width).toBe(360);
      expect(content.height).toBeLessThanOrEqual(568);
      expect(close(dialog).getAttribute('aria-label')).toBe('Close');
      expect(save(dialog).textContent!.trim()).toBe('Save');
      await dialog.close();
    });

    it('shows the first date\'s month when it opens', async () => {
      const {dialog, picker} = await setupDialog('2026-10-12', '2026-10-21');
      expect(month(picker, october)).toBeDefined();
      expect($(picker, '.list').scrollTop).toBe(((2026 - 1900) * 12 + 9) * MONTH_HEIGHT);
      await dialog.close();
    });

    it('needs the end date to save', async () => {
      const {dialog, picker} = await setupDialog();
      picker.showMonthOf('2026-10-01');
      await picker.updateComplete;
      await wait(50);
      await picker.updateComplete;
      expect(save(dialog).disabled).toBeTrue();
      day(picker, october, 5).click();
      await dialog.updateComplete;
      expect(save(dialog).disabled).toBeTrue();
      day(picker, october, 9).click();
      await dialog.updateComplete;
      expect(save(dialog).disabled).toBeFalse();
      await dialog.close();
    });

    it('keeps the dates only on Save', async () => {
      const {dialog, picker} = await setupDialog('2026-10-12', '2026-10-21');
      let changes = 0;
      dialog.addEventListener('change', () => changes++);
      day(picker, october, 1).click();
      day(picker, october, 3).click();
      await dialog.updateComplete;
      expect(dialog.start).toBe('2026-10-12');
      save(dialog).click();
      await wait(50);
      expect(dialog.start).toBe('2026-10-01');
      expect(dialog.end).toBe('2026-10-03');
      expect(changes).toBe(1);
      expect(dialog.returnValue).toBe('confirm');
    });

    it('drops the dates on Close', async () => {
      const {dialog, picker} = await setupDialog('2026-10-12', '2026-10-21');
      day(picker, october, 1).click();
      await dialog.updateComplete;
      close(dialog).click();
      await wait(50);
      expect(dialog.start).toBe('2026-10-12');
      expect(dialog.returnValue).toBe('dismiss');
      await dialog.show();
      await wait(50);
      await picker.updateComplete;
      expect(picker.start).toBe('2026-10-12');
      expect(picker.end).toBe('2026-10-21');
      await dialog.close();
    });
  });
});
