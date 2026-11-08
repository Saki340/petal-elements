/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

// The vibrant time picker and the scroll wheels after Jetpack Compose
// Material 3 (TimePicker.kt, ScrollField.kt, VibrantTimePickerDialog at
// androidx commit df73c24). The wheels use real animation frames, so no
// Environment.

import {html, render, TemplateResult} from 'lit';

import './time-picker-dialog.js';
import './time-picker.js';

import type {PetalTimePickerDialog} from './time-picker-dialog.js';
import type {PetalTimePicker} from './time-picker.js';
import type {ScrollField} from './internal/scroll-field.js';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
/** Longer than the slowest spring of the wheel takes. */
const SETTLE = 700;

describe('expressive petal-time-picker', () => {
  let root: HTMLElement;

  beforeEach(() => {
    root = document.createElement('div');
    root.lang = 'en-US';
    document.body.append(root);
  });

  afterEach(() => root.remove());

  async function setup(template: TemplateResult) {
    render(template, root);
    const picker = root.querySelector('petal-time-picker') as PetalTimePicker;
    await picker.updateComplete;
    return picker;
  }

  const $ = (picker: Element, selector: string) =>
    picker.shadowRoot!.querySelector(selector) as HTMLElement;
  const box = (el: Element) => el.getBoundingClientRect();
  const css = (el: Element) => getComputedStyle(el);

  describe('vibrant dial', () => {
    const vibrant = () =>
      setup(html`<petal-time-picker
        vibrant
        layout="vertical"
        value="14:30"></petal-time-picker>`);

    it('has 100 by 120px time boxes with the large shape', async () => {
      const picker = await vibrant();
      const hour = $(picker, '.time-selector.hour');
      expect(box(hour).width).toBe(100);
      expect(box(hour).height).toBe(120);
      expect(css(hour).borderRadius).toBe('16px');
    });

    it('is 132px wide for 24 hours when vertical, and 100px beside the dial', async () => {
      const picker = await setup(html`<petal-time-picker
        vibrant
        hour-cycle="24"
        layout="vertical"
        value="14:30"></petal-time-picker>`);
      expect(box($(picker, '.time-selector.hour')).width).toBe(132);
      picker.layout = 'horizontal';
      await picker.updateComplete;
      expect(box($(picker, '.time-selector.hour')).width).toBe(100);
    });

    it('outlines the selected box 2px and colors it from the color scheme', async () => {
      const picker = await setup(html`<petal-time-picker
        vibrant
        layout="vertical"
        style="--md-sys-color-primary: rgb(1, 2, 3); --md-sys-color-surface-container-lowest: rgb(4, 5, 6); --md-sys-color-on-surface: rgb(7, 8, 9)"
        value="14:30"></petal-time-picker>`);
      const hour = css($(picker, '.time-selector.hour'));
      expect(hour.boxShadow).toContain('2px');
      expect(hour.boxShadow).toContain('rgb(1, 2, 3)');
      expect(hour.color).toBe('rgb(1, 2, 3)');
      expect(hour.backgroundColor).toBe('rgb(4, 5, 6)');
      const minute = css($(picker, '.time-selector.minute'));
      expect(minute.boxShadow).toBe('none');
      expect(minute.color).toBe('rgb(7, 8, 9)');
      expect(css($(picker, '.dial')).backgroundColor).toBe('rgb(4, 5, 6)');
    });

    it('still lets the component tokens win', async () => {
      const picker = await setup(html`<petal-time-picker
        vibrant
        layout="vertical"
        style="--md-time-picker-time-selector-selected-label-text-color: rgb(9, 9, 9)"
        value="14:30"></petal-time-picker>`);
      expect(css($(picker, '.time-selector.hour')).color).toBe('rgb(9, 9, 9)');
    });

    it('has the vibrant spacing', async () => {
      const picker = await vibrant();
      expect(box($(picker, '.separator')).width).toBe(16);
      const period = $(picker, '.period');
      expect(box(period).width).toBe(56);
      expect(box(period).height).toBe(120);
      expect(css(period).rowGap).toBe('8px');
      expect(css(period).marginInlineStart).toBe('16px');
      expect(css($(picker, '.dial')).marginTop).toBe('12px');
      expect(box($(picker, '.dial')).width).toBe(256);
    });

    it('has the period below and the dial 52px away when horizontal', async () => {
      const picker = await setup(html`<petal-time-picker
        vibrant
        layout="horizontal"
        value="14:30"></petal-time-picker>`);
      const period = $(picker, '.period');
      expect(box(period).height).toBe(40);
      expect(css(period).columnGap).toBe('16px');
      expect(css(period).marginTop).toBe('16px');
      expect(css($(picker, '.dial')).marginLeft).toBe('52px');
    });

    it('leaves the standard picker as it was', async () => {
      const picker = await setup(html`<petal-time-picker
        layout="vertical"
        value="14:30"></petal-time-picker>`);
      expect(box($(picker, '.time-selector.hour')).width).toBe(96);
      expect(css($(picker, '.dial')).marginTop).toBe('36px');
    });
  });

  describe('vibrant text input', () => {
    const vibrantInput = () =>
      setup(html`<petal-time-picker
        vibrant
        display-mode="input"
        value="09:05"></petal-time-picker>`);

    it('has 100 by 120px fields in DisplayLarge, the toggle 8px after them', async () => {
      const picker = await vibrantInput();
      const field = $(picker, '.hour-field');
      expect(box(field).width).toBe(100);
      expect(box(field).height).toBe(120);
      expect(css(field).fontSize).toBe('57px');
      expect(css($(picker, '.period')).marginInlineStart).toBe('8px');
    });

    it('shows the supporting text only for an error', async () => {
      const picker = await vibrantInput();
      expect(css($(picker, '.support')).display).toBe('none');
      const field = $(picker, '.hour-field') as HTMLInputElement;
      field.value = '13';
      field.dispatchEvent(new InputEvent('input', {inputType: 'insertText'}));
      await picker.updateComplete;
      expect(css($(picker, '.support.error')).display).not.toBe('none');
    });
  });

  describe('scroll wheels', () => {
    async function scroll(value = '14:30', attrs = {is24: false}) {
      const picker = await setup(html`<petal-time-picker
        display-mode="scroll"
        hour-cycle=${attrs.is24 ? '24' : '12'}
        value=${value}></petal-time-picker>`);
      const hour = $(picker, '.hour-wheel') as ScrollField;
      const minute = $(picker, '.minute-wheel') as ScrollField;
      await hour.updateComplete;
      await minute.updateComplete;
      return {picker, hour, minute};
    }

    const wheel = (field: ScrollField) =>
      field.shadowRoot!.querySelector('.wheel') as HTMLElement;
    const selected = (field: ScrollField) =>
      field.shadowRoot!.querySelector('.selected')!.textContent!.trim();
    const items = (field: ScrollField) => [
      ...field.shadowRoot!.querySelectorAll<HTMLElement>('.item'),
    ];
    const key = (field: ScrollField, name: string) =>
      wheel(field).dispatchEvent(new KeyboardEvent('keydown', {key: name, bubbles: true}));

    function pointer(field: ScrollField, type: string, y: number) {
      wheel(field).dispatchEvent(
        new PointerEvent(type, {pointerId: 1, isPrimary: true, button: 0, clientY: y, bubbles: true}),
      );
    }

    it('is vibrant, with 100 by 120px wheels on the large shape', async () => {
      const {picker, hour} = await scroll();
      expect($(picker, '.time-picker').classList).toContain('vibrant');
      expect(box(hour).width).toBe(100);
      expect(box(hour).height).toBe(120);
      expect(css(wheel(hour)).borderRadius).toBe('16px');
      expect(box($(picker, '.separator')).width).toBe(16);
      expect(css($(picker, '.period')).marginInlineStart).toBe('8px');
    });

    it('shows the time, the selected number in emphasized DisplayLarge', async () => {
      const {hour, minute} = await scroll();
      expect(selected(hour)).toBe('02');
      expect(selected(minute)).toBe('30');
      const number = hour.shadowRoot!.querySelector('.selected')!;
      expect(css(number).fontSize).toBe('57px');
      expect(css(number).fontWeight).toBe('500');
      const other = items(hour).find((item) => !item.classList.contains('selected'))!;
      expect(css(other).fontSize).toBe('45px');
    });

    it('has neighbours 200/3px away', async () => {
      const {minute} = await scroll();
      const [, previous, current] = items(minute);
      expect(box(current).top - box(previous).top).toBeCloseTo(200 / 3, 1);
    });

    it('has twelve hours from 1 to 12, or twenty-four from 0', async () => {
      const twelve = await scroll('00:30');
      expect(selected(twelve.hour)).toBe('12');
      expect(twelve.hour.count).toBe(12);
      expect(twelve.hour.value).toBe(11);
      const twentyFour = await scroll('00:30', {is24: true});
      expect(selected(twentyFour.hour)).toBe('00');
      expect(twentyFour.hour.count).toBe(24);
    });

    it('moves one with the arrow keys and sets the time', async () => {
      const {picker, minute} = await scroll();
      const events: string[] = [];
      picker.addEventListener('input', () => events.push('input'));
      picker.addEventListener('change', () => events.push('change'));
      key(minute, 'ArrowDown');
      await wait(SETTLE);
      expect(picker.value).toBe('14:31');
      expect(selected(minute)).toBe('31');
      expect(events).toEqual(['input', 'change']);
      key(minute, 'ArrowUp');
      await wait(SETTLE);
      expect(picker.value).toBe('14:30');
    });

    it('goes round, without changing the other wheel', async () => {
      const {picker, minute} = await scroll('14:59');
      key(minute, 'ArrowDown');
      await wait(SETTLE);
      expect(picker.value).toBe('14:00');
      expect(selected(minute)).toBe('00');
    });

    it('keeps the period when the hour wheel moves', async () => {
      const {picker, hour} = await scroll('14:30');
      key(hour, 'ArrowDown');
      await wait(SETTLE);
      expect(picker.value).toBe('15:30');
      const twelve = await scroll('11:30');
      key(twelve.hour, 'ArrowDown');
      await wait(SETTLE);
      expect(twelve.picker.value).toBe('00:30');
    });

    it('goes to a number that is clicked', async () => {
      const {picker, minute} = await scroll();
      const next = items(minute)[3];
      expect(next.textContent!.trim()).toBe('31');
      next.click();
      await wait(SETTLE);
      expect(picker.value).toBe('14:31');
    });

    it('goes back after a slow, short drag', async () => {
      const {picker, minute} = await scroll();
      pointer(minute, 'pointerdown', 100);
      pointer(minute, 'pointermove', 90);
      await wait(200);
      pointer(minute, 'pointermove', 80);
      await wait(200);
      pointer(minute, 'pointerup', 80);
      await wait(SETTLE);
      expect(picker.value).toBe('14:30');
    });

    it('selects the closest number after a slow, long drag', async () => {
      const {picker, minute} = await scroll();
      pointer(minute, 'pointerdown', 100);
      pointer(minute, 'pointermove', 60);
      await wait(200);
      pointer(minute, 'pointermove', 30);
      await wait(200);
      pointer(minute, 'pointerup', 30);
      await wait(SETTLE);
      expect(picker.value).toBe('14:31');
    });

    it('goes to the next number after a fling, however short', async () => {
      const {picker, minute} = await scroll();
      pointer(minute, 'pointerdown', 100);
      pointer(minute, 'pointermove', 90);
      await wait(16);
      pointer(minute, 'pointermove', 76);
      pointer(minute, 'pointerup', 76);
      await wait(SETTLE);
      expect(picker.value).toBe('14:31');
    });

    it('moves one for each notch of a mouse wheel', async () => {
      const {picker, minute} = await scroll();
      wheel(minute).dispatchEvent(
        new WheelEvent('wheel', {deltaY: 100, bubbles: true, cancelable: true}),
      );
      await wait(SETTLE);
      expect(picker.value).toBe('14:31');
    });

    it('jumps when the value is set from outside, without events', async () => {
      const {picker, hour, minute} = await scroll();
      let events = 0;
      picker.addEventListener('input', () => events++);
      picker.value = '09:05';
      await picker.updateComplete;
      await hour.updateComplete;
      await minute.updateComplete;
      expect(selected(hour)).toBe('09');
      expect(selected(minute)).toBe('05');
      expect(events).toBe(0);
    });

    it('keeps the hour wheel when the period changes', async () => {
      const {picker, hour} = await scroll('14:30');
      const am = $(picker, '.period-item');
      am.click();
      await picker.updateComplete;
      await hour.updateComplete;
      expect(picker.value).toBe('02:30');
      expect(selected(hour)).toBe('02');
    });

    it('reads out the wheel as a spin button', async () => {
      const {hour, minute} = await scroll();
      const element = wheel(hour);
      expect(element.getAttribute('role')).toBe('spinbutton');
      expect(element.getAttribute('aria-label')).toBe('Select hour');
      expect(element.getAttribute('aria-valuetext')).toBe("2 o'clock");
      expect(wheel(minute).getAttribute('aria-valuetext')).toBe('30 minutes');
    });

    it('does not move while disabled', async () => {
      const picker = await setup(html`<petal-time-picker
        display-mode="scroll"
        disabled
        hour-cycle="12"
        value="14:30"></petal-time-picker>`);
      const minute = $(picker, '.minute-wheel') as ScrollField;
      await minute.updateComplete;
      expect(wheel(minute).hasAttribute('tabindex')).toBeFalse();
      key(minute, 'ArrowDown');
      await wait(100);
      expect(picker.value).toBe('14:30');
    });
  });

  describe('dialog', () => {
    async function setupDialog(template: TemplateResult) {
      render(template, root);
      const dialog = root.querySelector('petal-time-picker-dialog') as PetalTimePickerDialog;
      await dialog.updateComplete;
      await dialog.show();
      await dialog.updateComplete;
      const picker = $(dialog, 'petal-time-picker') as PetalTimePicker;
      await picker.updateComplete;
      return {dialog, picker};
    }

    it('has no title when vibrant, 12px around the picker', async () => {
      const {dialog, picker} = await setupDialog(html`<petal-time-picker-dialog
        quick
        vibrant
        layout="vertical"
        value="14:30"></petal-time-picker-dialog>`);
      expect($(dialog, '.title')).toBeNull();
      expect(css($(dialog, '.layout')).paddingTop).toBe('12px');
      expect(css($(dialog, '.layout')).rowGap).toBe('12px');
      expect(picker.vibrant).toBeTrue();
      await dialog.close();
    });

    it('keeps the title when not vibrant', async () => {
      const {dialog, picker} = await setupDialog(html`<petal-time-picker-dialog
        quick
        value="14:30"></petal-time-picker-dialog>`);
      expect($(dialog, '.title').textContent!.trim()).toBe('Select Time');
      expect(picker.vibrant).toBeFalse();
      await dialog.close();
    });

    it('goes between the wheels and the text fields', async () => {
      const {dialog, picker} = await setupDialog(html`<petal-time-picker-dialog
        quick
        display-mode="scroll"
        value="14:30"></petal-time-picker-dialog>`);
      expect(picker.displayMode).toBe('scroll');
      expect($(dialog, '.title')).toBeNull();
      const toggle = $(dialog, '.mode-toggle');
      expect(toggle.getAttribute('aria-label')).toBe('Switch to text input mode');
      toggle.click();
      await dialog.updateComplete;
      await picker.updateComplete;
      expect(picker.displayMode).toBe('input');
      expect(toggle.getAttribute('aria-label')).toBe('Switch to scroll mode');
      toggle.click();
      await dialog.updateComplete;
      await picker.updateComplete;
      expect(picker.displayMode).toBe('scroll');
      await dialog.close();
    });

    it('keeps a time set on the wheels on OK', async () => {
      const {dialog, picker} = await setupDialog(html`<petal-time-picker-dialog
        quick
        display-mode="scroll"
        value="14:30"></petal-time-picker-dialog>`);
      const minute = $(picker, '.minute-wheel') as ScrollField;
      await minute.updateComplete;
      minute.shadowRoot!
        .querySelector('.wheel')!
        .dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowDown', bubbles: true}));
      await wait(SETTLE);
      expect(dialog.value).toBe('14:30');
      const buttons = dialog.shadowRoot!.querySelectorAll<HTMLElement>('.actions petal-text-button');
      buttons[1].click();
      await wait(50);
      expect(dialog.value).toBe('14:31');
    });
  });
});
