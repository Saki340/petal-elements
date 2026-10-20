/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

// The time picker after Jetpack Compose Material 3 (TimePicker.kt,
// TimePickerDialog.kt, TimePickerTokens, TimeInputTokens at androidx commit
// df73c24). The selector turns on real animation frames, so no Environment
// (its mock clock does not advance performance.now()).

import {html, render, TemplateResult} from 'lit';

import './time-picker-dialog.js';
import './time-picker.js';

import type {PetalTimePickerDialog} from './time-picker-dialog.js';
import type {PetalTimePicker} from './time-picker.js';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('petal-time-picker', () => {
  let root: HTMLElement;

  beforeEach(() => {
    root = document.createElement('div');
    root.lang = 'en-US';
    document.body.append(root);
  });

  afterEach(() => root.remove());

  async function setup(
    template: TemplateResult = html`<petal-time-picker
      value="14:30"
      layout="vertical"></petal-time-picker>`,
  ) {
    render(template, root);
    const picker = root.querySelector('petal-time-picker') as PetalTimePicker;
    await picker.updateComplete;
    return picker;
  }

  const $ = (picker: Element, selector: string) =>
    picker.shadowRoot!.querySelector(selector) as HTMLElement;
  const $$ = (picker: Element, selector: string) => [
    ...picker.shadowRoot!.querySelectorAll<HTMLElement>(selector),
  ];
  const box = (el: Element) => el.getBoundingClientRect();
  const shown = (picker: Element, selector: string) => $(picker, selector).textContent!.trim();

  /** Taps the dial at a clock position (hours from the top) and a ratio of its size. */
  async function tapDial(picker: PetalTimePicker, hours: number, ratio = 101 / 256) {
    const dial = $(picker, '.dial');
    const b = box(dial);
    const angle = (hours / 12) * Math.PI * 2 - Math.PI / 2;
    const x = b.left + b.width / 2 + Math.cos(angle) * ratio * b.width;
    const y = b.top + b.height / 2 + Math.sin(angle) * ratio * b.width;
    const init = {pointerId: 1, isPrimary: true, button: 0, clientX: x, clientY: y, bubbles: true};
    dial.dispatchEvent(new PointerEvent('pointerdown', init));
    dial.dispatchEvent(new PointerEvent('pointerup', init));
    await picker.updateComplete;
  }

  describe('layout', () => {
    it('shows the hour and minute in 96 by 80px boxes with a colon', async () => {
      const picker = await setup();
      const hour = $(picker, '.time-selector.hour');
      expect([box(hour).width, box(hour).height]).toEqual([96, 80]);
      expect(getComputedStyle(hour).fontSize).toBe('57px');
      expect(box($(picker, '.separator')).width).toBe(24);
      expect(shown(picker, '.time-selector.hour')).toBe('02');
      expect(shown(picker, '.time-selector.minute')).toBe('30');
    });

    it('has a 256px dial 36px below, with 12 at the top, 101px from the center', async () => {
      const picker = await setup();
      const dial = $(picker, '.dial');
      expect([box(dial).width, box(dial).height]).toEqual([256, 256]);
      expect(box(dial).top - box($(picker, '.display')).bottom).toBe(36);
      const twelve = $(picker, '.face.hour.active .dial-number[data-value="12"]');
      const center = box(dial).top + 128;
      expect(center - (box(twelve).top + 24)).toBeCloseTo(101, 0);
      expect(box(twelve).left + 24).toBeCloseTo(box(dial).left + 128, 0);
    });

    it('puts the handle on the selected hour, with the number in on-primary', async () => {
      const picker = await setup();
      const handle = box($(picker, '.handle'));
      expect(handle.width).toBe(48);
      const two = $(picker, '.face.hour.active .dial-number[data-value="2"]');
      expect(handle.left + 24).toBeCloseTo(box(two).left + 24, 0);
      expect(handle.top + 24).toBeCloseTo(box(two).top + 24, 0);
      const clone = $(picker, '.selected-labels .dial-number[data-value="2"]');
      // ClockDialSelectedLabelTextColor: on-primary (white by default).
      expect(getComputedStyle(clone).color).toBe('rgb(255, 255, 255)');
      expect(getComputedStyle($(picker, '.selected-labels')).clipPath).toContain('circle');
    });

    it('puts the dial beside the time with layout="horizontal"', async () => {
      const picker = await setup(html`<petal-time-picker value="14:30" layout="horizontal"></petal-time-picker>`);
      const display = box($(picker, '.display'));
      const dial = box($(picker, '.dial'));
      expect(dial.left - display.right).toBe(36);
      const period = $(picker, '.period');
      expect([box(period).width, box(period).height]).toEqual([216, 38]);
    });
  });

  describe('hours', () => {
    it('uses 12 hours with AM and PM for en-US', async () => {
      const picker = await setup();
      expect(picker.is24Hour).toBeFalse();
      const items = $$(picker, '.period-item');
      expect(items.map((item) => item.textContent!.trim())).toEqual(['AM', 'PM']);
      expect(items[1].getAttribute('aria-checked')).toBe('true');
      expect([box($(picker, '.period')).width, box($(picker, '.period')).height]).toEqual([52, 80]);
    });

    it('uses 24 hours for zh-CN, with 12 to 23 on an inner circle', async () => {
      const picker = await setup(html`<petal-time-picker
        locale="zh-CN"
        value="14:30"
        layout="vertical"></petal-time-picker>`);
      expect(picker.is24Hour).toBeTrue();
      expect($(picker, '.period')).toBeNull();
      expect(shown(picker, '.time-selector.hour')).toBe('14');
      const dial = box($(picker, '.dial'));
      const twelve = $(picker, '.face.hour.active .dial-number[data-value="12"]');
      expect(dial.top + 128 - (box(twelve).top + 24)).toBeCloseTo(69, 0);
    });

    it('takes hour-cycle', async () => {
      const picker = await setup(html`<petal-time-picker hour-cycle="24" value="09:00"></petal-time-picker>`);
      expect(picker.is24Hour).toBeTrue();
      expect(shown(picker, '.time-selector.hour')).toBe('09');
    });

    it('switches AM and PM', async () => {
      const picker = await setup();
      const change = jasmine.createSpy('change');
      picker.addEventListener('change', change);
      $$(picker, '.period-item')[0].click();
      await picker.updateComplete;
      expect(picker.value).toBe('02:30');
      expect(change).toHaveBeenCalledTimes(1);
    });
  });

  describe('dial', () => {
    it('sets the tapped hour, then shows minutes 100ms later', async () => {
      const picker = await setup();
      const input = jasmine.createSpy('input');
      picker.addEventListener('input', input);
      await tapDial(picker, 3);
      expect(picker.value).toBe('15:30');
      expect(input).toHaveBeenCalled();
      expect(picker.selection).toBe('hour');
      await wait(150);
      expect(picker.selection).toBe('minute');
      expect($(picker, '.face.minute').classList.contains('active')).toBeTrue();
    });

    it('sets the tapped minute to the closest five minutes', async () => {
      const picker = await setup();
      picker.selection = 'minute';
      await picker.updateComplete;
      await tapDial(picker, 6.2);
      expect(picker.value).toBe('14:30');
      await tapDial(picker, 1.9);
      expect(picker.value).toBe('14:10');
    });

    it('sets an inner hour from 12 in 24 hours', async () => {
      const picker = await setup(html`<petal-time-picker hour-cycle="24" value="09:00" layout="vertical"></petal-time-picker>`);
      await tapDial(picker, 3, 69 / 256);
      expect(picker.value).toBe('15:00');
      picker.selection = 'hour';
      await picker.updateComplete;
      await tapDial(picker, 3);
      expect(picker.value).toBe('03:00');
    });

    it('turns the handle on a spring to the minutes', async () => {
      const picker = await setup();
      const before = box($(picker, '.handle'));
      picker.selection = 'minute';
      await picker.updateComplete;
      await wait(40);
      const moving = box($(picker, '.handle'));
      await wait(800);
      const after = box($(picker, '.handle'));
      const six = box($(picker, '.face.minute .dial-number[data-value="30"]'));
      expect(moving.top).not.toBe(before.top);
      expect(after.top + 24).toBeCloseTo(six.top + 24, 0);
    });

    it('selects with the keyboard', async () => {
      const picker = await setup();
      const two = $(picker, '.face.hour.active .dial-number[data-value="2"]');
      expect(two.tabIndex).toBe(0);
      two.focus();
      two.dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowRight', bubbles: true}));
      const three = picker.shadowRoot!.activeElement as HTMLElement;
      expect(three.dataset['value']).toBe('3');
      three.click();
      await picker.updateComplete;
      expect(picker.value).toBe('15:30');
    });
  });

  describe('text input', () => {
    async function inputMode(value = '14:30', cycle = '') {
      const picker = await setup(html`<petal-time-picker
        display-mode="input"
        hour-cycle=${cycle}
        value=${value}></petal-time-picker>`);
      const hour = $(picker, '.hour-field') as HTMLInputElement;
      const minute = $(picker, '.minute-field') as HTMLInputElement;
      const type = async (field: HTMLInputElement, text: string) => {
        field.focus();
        field.value = text;
        field.dispatchEvent(new InputEvent('input', {inputType: 'insertText', data: text, bubbles: true}));
        await picker.updateComplete;
      };
      return {picker, hour, minute, type};
    }

    it('has 96 by 72px fields with Hour and Minute below', async () => {
      const {picker, hour} = await inputMode();
      expect([box(hour).width, box(hour).height]).toEqual([96, 72]);
      expect(getComputedStyle(hour).fontSize).toBe('45px');
      expect($$(picker, '.support').map((el) => el.textContent!.trim())).toEqual(['Hour', 'Minute']);
      expect(hour.value).toBe('02');
    });

    it('takes a typed hour and moves on to the minutes', async () => {
      const {picker, hour, minute, type} = await inputMode();
      await type(hour, '7');
      expect(picker.value).toBe('19:30');
      expect(picker.shadowRoot!.activeElement).toBe(minute);
      await type(minute, '45');
      expect(picker.value).toBe('19:45');
    });

    it('shows Compose’s errors', async () => {
      const {picker, hour, minute, type} = await inputMode();
      await type(hour, '13');
      expect(shown(picker, '.support.error')).toBe('Hour must be 1–12');
      expect(picker.value).toBe('14:30');
      await type(hour, '01');
      await type(minute, '75');
      expect(shown(picker, '.support.error')).toBe('Minute must be 0–59');
      const {picker: picker24, hour: hour24, type: type24} = await inputMode('10:00', '24');
      await type24(hour24, '24');
      expect(shown(picker24, '.support.error')).toBe('Hour must be 0–23');
    });

    it('keeps only digits', async () => {
      const {hour, type} = await inputMode();
      await type(hour, '1a');
      expect(hour.value).toBe('02');
    });
  });

  it('takes part in forms', async () => {
    render(html`<form><petal-time-picker name="time" value="08:15"></petal-time-picker></form>`, root);
    const picker = root.querySelector('petal-time-picker') as PetalTimePicker;
    await picker.updateComplete;
    expect(new FormData(root.querySelector('form')!).get('time')).toBe('08:15');
  });
});

describe('petal-time-picker-dialog', () => {
  let root: HTMLElement;

  beforeEach(() => {
    root = document.createElement('div');
    root.lang = 'en-US';
    document.body.append(root);
  });

  afterEach(() => root.remove());

  async function setup() {
    render(html`<petal-time-picker-dialog quick value="07:45"></petal-time-picker-dialog>`, root);
    const dialog = root.querySelector('petal-time-picker-dialog') as PetalTimePickerDialog;
    await dialog.show();
    const picker = dialog.shadowRoot!.querySelector('petal-time-picker') as PetalTimePicker;
    await picker.updateComplete;
    const buttons = [...dialog.shadowRoot!.querySelectorAll<HTMLElement>('.actions petal-text-button')];
    return {dialog, picker, cancel: buttons[0], ok: buttons[1]};
  }

  const closed = (dialog: Element) =>
    new Promise((resolve) => dialog.addEventListener('closed', resolve, {once: true}));

  it('has the title, the picker and the actions', async () => {
    const {dialog, cancel, ok} = await setup();
    const shadow = dialog.shadowRoot!;
    expect(shadow.querySelector('.title')!.textContent!.trim()).toBe('Select Time');
    expect([cancel.textContent!.trim(), ok.textContent!.trim()]).toEqual(['Cancel', 'OK']);
    expect(shadow.querySelector('.mode-toggle')!.getAttribute('aria-label')).toBe(
      'Switch to text input mode',
    );
    await dialog.close();
  });

  it('keeps the time only after OK', async () => {
    const {dialog, picker, ok} = await setup();
    const change = jasmine.createSpy('change');
    dialog.addEventListener('change', change);
    picker.shadowRoot!.querySelectorAll<HTMLElement>('.period-item')[1].click();
    await picker.updateComplete;
    expect(dialog.value).toBe('07:45');
    ok.click();
    await closed(dialog);
    expect(dialog.value).toBe('19:45');
    expect(change).toHaveBeenCalledTimes(1);
  });

  it('drops the time on Cancel', async () => {
    const {dialog, picker, cancel} = await setup();
    picker.shadowRoot!.querySelectorAll<HTMLElement>('.period-item')[1].click();
    cancel.click();
    await closed(dialog);
    expect(dialog.value).toBe('07:45');
  });

  it('switches to text input', async () => {
    const {dialog, picker} = await setup();
    dialog.shadowRoot!.querySelector<HTMLElement>('.mode-toggle')!.click();
    await dialog.updateComplete;
    await picker.updateComplete;
    expect(picker.displayMode).toBe('input');
    expect(dialog.shadowRoot!.querySelector('.title')!.textContent!.trim()).toBe('Enter Time');
    await dialog.close();
  });
});
