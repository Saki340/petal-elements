/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

// The standard bottom sheet after Jetpack Compose Material 3
// (BottomSheetScaffold.kt, SheetDefaults.kt at androidx commit df73c24).

import '../standard-bottom-sheet.js';

import {html} from 'lit';

import {Environment} from '../../testing/environment.js';
import {StandardBottomSheet} from './standard-bottom-sheet.js';

describe('<petal-standard-bottom-sheet>', () => {
  const env = new Environment();
  const PAGE = 600;

  async function setup(attributes = '', contentHeight = 200) {
    const root = env.render(html`
      <div id="page" style="position: relative; height: ${PAGE}px; width: 800px">
        <button id="behind">Behind</button>
        <petal-standard-bottom-sheet contained aria-label="Places">
          <div style="height: ${contentHeight}px">
            <button id="inside">Inside</button>
          </div>
        </petal-standard-bottom-sheet>
      </div>
    `);
    const sheet = root.querySelector('petal-standard-bottom-sheet') as StandardBottomSheet;
    sheet.setAttribute('quick', '');
    for (const attribute of attributes.split(' ').filter(Boolean)) {
      const [name, value = ''] = attribute.split('=');
      sheet.setAttribute(name, value);
    }
    await flush();
    return sheet;
  }

  async function flush() {
    for (let i = 0; i < 5; i++) await env.waitForStability();
  }

  function parts(sheet: StandardBottomSheet) {
    const root = sheet.shadowRoot!;
    return {
      surface: root.querySelector<HTMLElement>('.sheet')!,
      handle: root.querySelector<HTMLElement>('.drag-handle')!,
    };
  }

  /** The sheet's top, from the top of the page. */
  function top(sheet: StandardBottomSheet) {
    const page = sheet.parentElement!.getBoundingClientRect();
    return parts(sheet).surface.getBoundingClientRect().top - page.top;
  }

  function height(sheet: StandardBottomSheet) {
    return parts(sheet).surface.getBoundingClientRect().height;
  }

  function pointer(sheet: StandardBottomSheet, type: string, y: number, time: number) {
    const event = new PointerEvent(type, {
      pointerId: 1,
      isPrimary: true,
      button: 0,
      clientX: 400,
      clientY: y,
      bubbles: true,
      composed: true,
    });
    Object.defineProperty(event, 'timeStamp', {value: time});
    parts(sheet).handle.dispatchEvent(event);
  }

  /** Drags the handle by `distance` px, at `speed` px per second at the end. */
  async function drag(sheet: StandardBottomSheet, distance: number, speed: number) {
    const start = parts(sheet).handle.getBoundingClientRect().top + 10;
    const steps = 10;
    const ms = Math.abs(distance / speed) * 1000 / steps || 100;
    pointer(sheet, 'pointerdown', start, 0);
    for (let i = 1; i <= steps; i++) {
      pointer(sheet, 'pointermove', start + (distance * i) / steps, i * ms);
    }
    pointer(sheet, 'pointerup', start + distance, steps * ms);
    await flush();
  }

  describe('layout', () => {
    it('peeks 56px above the bottom (SheetPeekHeight)', async () => {
      const sheet = await setup();
      expect(top(sheet)).toBe(PAGE - 56);
      expect(sheet.value).toBe('partially-expanded');
    });

    it('is at most 640px wide, centered, with the extra large top shape', async () => {
      const sheet = await setup();
      const {surface} = parts(sheet);
      const box = surface.getBoundingClientRect();
      const page = sheet.parentElement!.getBoundingClientRect();
      expect(box.width).toBe(640);
      expect(box.left - page.left).toBe(80);
      const style = getComputedStyle(surface);
      expect(style.borderTopLeftRadius).toBe('28px');
      expect(style.borderBottomLeftRadius).toBe('0px');
    });

    it('has a level 1 shadow (DockedStandardContainerElevation)', async () => {
      const sheet = await setup();
      const elevation = sheet.shadowRoot!.querySelector('petal-elevation')!;
      expect(getComputedStyle(elevation).getPropertyValue('--md-elevation-level').trim()).toBe(
        '1',
      );
    });

    it('leaves the page usable: no scrim, only the sheet takes pointers', async () => {
      const sheet = await setup();
      const behind = document.getElementById('behind')!;
      const box = behind.getBoundingClientRect();
      expect(document.elementFromPoint(box.left + 5, box.top + 5)).toBe(behind);
      expect(sheet.shadowRoot!.querySelector('.scrim')).toBeNull();
    });

    it('takes peek-height', async () => {
      const sheet = await setup('peek-height=120');
      expect(top(sheet)).toBe(PAGE - 120);
    });
  });

  describe('moving', () => {
    it('expands to its full height and collapses to the peek', async () => {
      const sheet = await setup();
      const change = jasmine.createSpy('change');
      sheet.addEventListener('change', change);
      await sheet.expand();
      await flush();
      expect(top(sheet)).toBe(PAGE - height(sheet));
      expect(sheet.value).toBe('expanded');
      expect(sheet.getAttribute('value')).toBe('expanded');
      await sheet.partialExpand();
      await flush();
      expect(top(sheet)).toBe(PAGE - 56);
      expect(change).toHaveBeenCalledTimes(2);
    });

    it('moves when value is set', async () => {
      const sheet = await setup();
      sheet.value = 'expanded';
      await flush();
      expect(top(sheet)).toBe(PAGE - height(sheet));
    });

    it('hides and shows only when hideable', async () => {
      const sheet = await setup();
      await expectAsync(sheet.hide()).toBeRejected();
      sheet.hideable = true;
      await flush();
      await sheet.hide();
      await flush();
      expect(top(sheet)).toBe(PAGE);
      expect(parts(sheet).surface.inert).toBeTrue();
      await sheet.show();
      await flush();
      expect(top(sheet)).toBe(PAGE - 56);
    });

    it('is no taller than the page', async () => {
      const sheet = await setup('', 2000);
      expect(height(sheet)).toBe(PAGE);
    });
  });

  describe('drag handle', () => {
    it('expands a peeking sheet and collapses an expanded one', async () => {
      const sheet = await setup();
      const {handle} = parts(sheet);
      expect(handle.getAttribute('aria-label')).toBe('Expand bottom sheet');
      handle.click();
      await flush();
      expect(sheet.value).toBe('expanded');
      expect(handle.getAttribute('aria-label')).toBe('Collapse bottom sheet');
      expect(handle.getAttribute('aria-expanded')).toBe('true');
      handle.click();
      await flush();
      expect(sheet.value).toBe('partially-expanded');
    });

    it('hides an expanded sheet when hideable', async () => {
      const sheet = await setup('hideable');
      await sheet.expand();
      await flush();
      parts(sheet).handle.click();
      await flush();
      expect(sheet.value).toBe('hidden');
    });

    it('expands and collapses with the arrow keys', async () => {
      const sheet = await setup();
      const {handle} = parts(sheet);
      handle.dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowUp', bubbles: true}));
      await flush();
      expect(sheet.value).toBe('expanded');
      handle.dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowDown', bubbles: true}));
      await flush();
      expect(sheet.value).toBe('partially-expanded');
    });
  });

  describe('dragging', () => {
    it('follows the pointer and settles at the closest anchor', async () => {
      const sheet = await setup();
      // Slowly up by 40px: less than the 56dp positional threshold.
      await drag(sheet, -40, 50);
      expect(sheet.value).toBe('partially-expanded');
      await drag(sheet, -120, 50);
      expect(sheet.value).toBe('expanded');
    });

    it('goes the way of a fling (VelocityThreshold)', async () => {
      const sheet = await setup();
      await drag(sheet, -20, 2000);
      expect(sheet.value).toBe('expanded');
      await drag(sheet, 20, 2000);
      expect(sheet.value).toBe('partially-expanded');
    });

    it('does not drag with no-swipe', async () => {
      const sheet = await setup('no-swipe');
      await drag(sheet, -150, 2000);
      expect(sheet.value).toBe('partially-expanded');
      expect(top(sheet)).toBe(PAGE - 56);
    });
  });
});
