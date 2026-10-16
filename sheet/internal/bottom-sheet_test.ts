/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import '../bottom-sheet.js';

import {html} from 'lit';

import {Environment} from '../../testing/environment.js';
import {BottomSheet} from './bottom-sheet.js';

describe('<petal-bottom-sheet>', () => {
  const env = new Environment();

  async function setupTest(attributes = '', contentHeight = 200) {
    const root = env.render(html`
      <button id="opener">Open</button>
      <petal-bottom-sheet aria-label="Options">
        <div style="height: ${contentHeight}px">
          <button id="first">First</button>
          <button id="last">Last</button>
        </div>
      </petal-bottom-sheet>
    `);
    const sheet = root.querySelector('petal-bottom-sheet') as BottomSheet;
    // Without animations, so the sheet is where it goes at once.
    sheet.setAttribute('quick', '');
    for (const attribute of attributes.split(' ').filter(Boolean)) {
      const [name, value = ''] = attribute.split('=');
      sheet.setAttribute(name, value);
    }
    await env.waitForStability();
    return sheet;
  }

  function parts(sheet: BottomSheet) {
    const root = sheet.shadowRoot!;
    return {
      dialog: root.querySelector('dialog')!,
      scrim: root.querySelector<HTMLElement>('.scrim')!,
      surface: root.querySelector<HTMLElement>('.sheet')!,
      handle: root.querySelector<HTMLElement>('.drag-handle')!,
    };
  }

  /** The distance of the sheet's top from the top of the page. */
  function top(sheet: BottomSheet) {
    const {surface} = parts(sheet);
    return surface.getBoundingClientRect().top;
  }

  function pointer(sheet: BottomSheet, type: string, y: number, time: number, x = 100) {
    const event = new PointerEvent(type, {
      pointerId: 1,
      isPrimary: true,
      button: 0,
      clientX: x,
      clientY: y,
      bubbles: true,
      composed: true,
    });
    Object.defineProperty(event, 'timeStamp', {value: time});
    parts(sheet).handle.dispatchEvent(event);
  }

  async function open(sheet: BottomSheet) {
    await sheet.show();
    await env.waitForStability();
  }

  /** Waits for the sheet's promise chains, which take several turns. */
  async function flush() {
    for (let i = 0; i < 5; i++) await env.waitForStability();
  }

  /**
   * Drags from the handle by `distance` px, moving at `speed` px per second
   * when let go, from the pointer's last 100ms.
   */
  function dragAt(sheet: BottomSheet, distance: number, speed: number) {
    const start = parts(sheet).handle.getBoundingClientRect().top + 20;
    // The last move: 50ms before letting go, at `speed`.
    const last = (speed * 50) / 1000;
    pointer(sheet, 'pointerdown', start, 0);
    pointer(sheet, 'pointermove', start + distance - last, 1950);
    pointer(sheet, 'pointermove', start + distance, 2000);
    pointer(sheet, 'pointerup', start + distance, 2000);
  }

  describe('Compose values', () => {
    it('is a surface container low sheet with extra large top corners', async () => {
      const sheet = await setupTest();
      await open(sheet);
      const style = getComputedStyle(parts(sheet).surface);

      // SheetBottomTokens.DockedContainerColor: SurfaceContainerLow (#f7f2fa).
      expect(style.backgroundColor).toBe('rgb(247, 242, 250)');
      // SheetBottomTokens.DockedContainerShape: CornerExtraLargeTop (28dp).
      expect(style.borderTopLeftRadius).toBe('28px');
      expect(style.borderTopRightRadius).toBe('28px');
      expect(style.borderBottomLeftRadius).toBe('0px');
      expect(style.borderBottomRightRadius).toBe('0px');
    });

    it('is at most 640px wide (BottomSheetDefaults.SheetMaxWidth)', async () => {
      const sheet = await setupTest();
      await open(sheet);
      const {surface} = parts(sheet);

      expect(getComputedStyle(surface).maxWidth).toBe('640px');
      expect(surface.getBoundingClientRect().width).toBeLessThanOrEqual(640);
    });

    it('has a 32dp by 4dp drag handle in a 48dp row', async () => {
      const sheet = await setupTest();
      await open(sheet);
      const handle = sheet.shadowRoot!.querySelector('.handle')!;
      const box = handle.getBoundingClientRect();
      const style = getComputedStyle(handle);

      // SheetBottomTokens.DockedDragHandleWidth, DockedDragHandleHeight and
      // DockedDragHandleColor (OnSurfaceVariant, #49454f).
      expect(box.width).toBe(32);
      expect(box.height).toBe(4);
      expect(style.backgroundColor).toBe('rgb(73, 69, 79)');
      // DragHandleVerticalPadding: 22dp above and below.
      expect(parts(sheet).handle.getBoundingClientRect().height).toBe(48);
    });

    it('has a scrim at 32% opacity (ScrimTokens)', async () => {
      const sheet = await setupTest();
      await open(sheet);
      const style = getComputedStyle(parts(sheet).scrim);

      expect(style.backgroundColor).toBe('rgb(0, 0, 0)');
      expect(Number(style.opacity)).toBeCloseTo(0.32);
    });

    it('has no scrim while hidden', async () => {
      const sheet = await setupTest();
      expect(parts(sheet).scrim.matches(':popover-open')).toBeFalse();
    });
  });

  describe('opening and closing', () => {
    it('opens and closes with show() and close()', async () => {
      const sheet = await setupTest();
      expect(sheet.open).toBeFalse();
      expect(parts(sheet).dialog.open).toBeFalse();

      await open(sheet);
      expect(sheet.open).toBeTrue();
      expect(sheet.hasAttribute('open')).toBeTrue();
      expect(parts(sheet).dialog.open).toBeTrue();
      expect(parts(sheet).scrim.matches(':popover-open')).toBeTrue();

      await sheet.close();
      await env.waitForStability();
      expect(sheet.open).toBeFalse();
      expect(sheet.hasAttribute('open')).toBeFalse();
      expect(parts(sheet).dialog.open).toBeFalse();
      expect(parts(sheet).scrim.matches(':popover-open')).toBeFalse();
    });

    it('opens and closes with the open attribute and property', async () => {
      const sheet = await setupTest();
      const opened = jasmine.createSpy('opened');
      const closed = jasmine.createSpy('closed');
      sheet.addEventListener('opened', opened);
      sheet.addEventListener('closed', closed);

      sheet.open = true;
      await flush();
      expect(parts(sheet).dialog.open).toBeTrue();
      expect(opened).toHaveBeenCalledTimes(1);

      sheet.removeAttribute('open');
      await flush();
      expect(parts(sheet).dialog.open).toBeFalse();
      expect(closed).toHaveBeenCalledTimes(1);
    });

    it('fires open, opened, close and closed in order', async () => {
      const sheet = await setupTest();
      const events: string[] = [];
      for (const type of ['open', 'opened', 'close', 'closed']) {
        sheet.addEventListener(type, () => events.push(type));
      }

      await sheet.show();
      expect(events).toEqual(['open', 'opened']);
      await sheet.close();
      expect(events).toEqual(['open', 'opened', 'close', 'closed']);
    });

    it('does not open when open is canceled', async () => {
      const sheet = await setupTest();
      sheet.addEventListener('open', (event) => event.preventDefault());

      await sheet.show();

      expect(sheet.open).toBeFalse();
      expect(parts(sheet).dialog.open).toBeFalse();
    });

    it('stays open when close is canceled', async () => {
      const sheet = await setupTest();
      await open(sheet);
      sheet.addEventListener('close', (event) => event.preventDefault());
      const closed = jasmine.createSpy('closed');
      sheet.addEventListener('closed', closed);

      await sheet.close();
      await env.waitForStability();

      expect(parts(sheet).dialog.open).toBeTrue();
      expect(closed).not.toHaveBeenCalled();
      expect(sheet.state).toBe('partially-expanded');
    });

    it('can open again after closing', async () => {
      const sheet = await setupTest();
      await open(sheet);
      await sheet.close();
      await env.waitForStability();

      await open(sheet);

      expect(parts(sheet).dialog.open).toBeTrue();
      expect(sheet.state).toBe('partially-expanded');
    });
  });

  describe('motion', () => {
    /** Runs the frames, 16ms apart, until `done` or 300 frames. */
    async function runFrames(sheet: BottomSheet, promise: Promise<void>) {
      let finished = false;
      void promise.then(() => (finished = true));
      const tops: number[] = [];
      for (let i = 0; i < 300 && !finished; i++) {
        await env.waitForStability();
        tops.push(top(sheet));
      }
      expect(finished).withContext('the animation ends').toBeTrue();
      return tops;
    }

    beforeEach(() => {
      let now = 0;
      spyOn(performance, 'now').and.callFake(() => (now += 16));
    });

    it('springs in from below the page to half of it, and out again', async () => {
      const sheet = await setupTest('', 2000);
      sheet.removeAttribute('quick');
      const full = () => parts(sheet).dialog.clientHeight;

      const tops = await runFrames(sheet, sheet.show());
      // Starts below the page, passes the middle, settles at half.
      expect(tops.length).toBeGreaterThan(5);
      expect(Math.max(...tops)).toBeGreaterThan(full() / 2);
      expect(tops[tops.length - 1]).toBeCloseTo(full() / 2, 0);
      expect(sheet.state).toBe('partially-expanded');
      expect(parts(sheet).scrim.style.getPropertyValue('--_scrim-alpha')).toBe('1');

      const closing = await runFrames(sheet, sheet.close());
      // It leaves through the bottom of the page.
      expect(Math.max(...closing)).toBeGreaterThan(full() - 1);
      expect(parts(sheet).dialog.open).toBeFalse();
      expect(sheet.state).toBe('hidden');
    });

    it('overshoots a little when it opens (the default spatial spring)', async () => {
      const sheet = await setupTest('skip-partially-expanded', 100);
      sheet.removeAttribute('quick');

      const tops = await runFrames(sheet, sheet.show());
      const rest = parts(sheet).dialog.clientHeight - 148;

      // The spring has a damping ratio of 0.8: it passes its target.
      expect(Math.min(...tops)).toBeLessThan(rest);
      expect(tops[tops.length - 1]).toBeCloseTo(rest, 0);
    });

    it('does not overshoot when it closes (the fast effects spring)', async () => {
      const sheet = await setupTest('', 100);
      await open(sheet);
      sheet.removeAttribute('quick');
      const full = parts(sheet).dialog.clientHeight;

      const tops = await runFrames(sheet, sheet.close());

      expect(Math.max(...tops)).toBeLessThanOrEqual(full);
    });
  });

  describe('states', () => {
    it('opens partially expanded, at half the page for a tall sheet', async () => {
      const sheet = await setupTest('', 2000);
      await open(sheet);
      const full = parts(sheet).dialog.clientHeight;

      expect(sheet.state).toBe('partially-expanded');
      expect(top(sheet)).toBeCloseTo(full / 2, 0);
    });

    it('opens partially expanded at its own height for a short sheet', async () => {
      const sheet = await setupTest('', 100);
      await open(sheet);
      const {surface, dialog} = parts(sheet);

      // 100px of content + the 48px handle row.
      expect(surface.offsetHeight).toBe(148);
      expect(top(sheet)).toBeCloseTo(dialog.clientHeight - 148, 0);
    });

    it('opens expanded with skip-partially-expanded', async () => {
      const sheet = await setupTest('skip-partially-expanded', 2000);
      await open(sheet);
      const {surface, dialog} = parts(sheet);

      expect(sheet.state).toBe('expanded');
      // As tall as the page.
      expect(surface.offsetHeight).toBe(dialog.clientHeight);
      expect(top(sheet)).toBeCloseTo(0, 0);
    });

    it('expands and partially expands', async () => {
      const sheet = await setupTest('', 2000);
      await open(sheet);

      await sheet.expand();
      expect(sheet.state).toBe('expanded');
      expect(top(sheet)).toBeCloseTo(0, 0);

      await sheet.partialExpand();
      expect(sheet.state).toBe('partially-expanded');
      expect(top(sheet)).toBeCloseTo(parts(sheet).dialog.clientHeight / 2, 0);
    });

    it('cannot partially expand with skip-partially-expanded', async () => {
      const sheet = await setupTest('skip-partially-expanded');
      await open(sheet);

      await expectAsync(sheet.partialExpand()).toBeRejected();
    });
  });

  describe('dismissing', () => {
    it('collapses an expanded sheet first on Escape, then closes', async () => {
      const sheet = await setupTest('', 2000);
      await open(sheet);
      await sheet.expand();
      const cancel = jasmine.createSpy('cancel');
      sheet.addEventListener('cancel', cancel);

      parts(sheet).dialog.dispatchEvent(new Event('cancel', {cancelable: true}));
      await env.waitForStability();
      expect(cancel).toHaveBeenCalledTimes(1);
      expect(sheet.state).toBe('partially-expanded');
      expect(parts(sheet).dialog.open).toBeTrue();

      parts(sheet).dialog.dispatchEvent(new Event('cancel', {cancelable: true}));
      await flush();
      expect(parts(sheet).dialog.open).toBeFalse();
    });

    it('closes an expanded sheet on Escape without a partially expanded state', async () => {
      const sheet = await setupTest('skip-partially-expanded');
      await open(sheet);

      parts(sheet).dialog.dispatchEvent(new Event('cancel', {cancelable: true}));
      await flush();

      expect(parts(sheet).dialog.open).toBeFalse();
    });

    it('stays open when cancel is canceled', async () => {
      const sheet = await setupTest();
      await open(sheet);
      sheet.addEventListener('cancel', (event) => event.preventDefault());

      parts(sheet).dialog.dispatchEvent(new Event('cancel', {cancelable: true}));
      await env.waitForStability();

      expect(parts(sheet).dialog.open).toBeTrue();
    });

    it('closes when the scrim is clicked', async () => {
      const sheet = await setupTest('', 2000);
      await open(sheet);
      await sheet.expand();

      // A click on the dialog itself lands outside the sheet. Even an
      // expanded sheet closes at once (animateToDismiss).
      parts(sheet).dialog.click();
      await flush();

      expect(parts(sheet).dialog.open).toBeFalse();
    });

    it('stays open when the sheet itself is clicked', async () => {
      const sheet = await setupTest();
      await open(sheet);

      parts(sheet).surface.click();
      await env.waitForStability();

      expect(parts(sheet).dialog.open).toBeTrue();
    });
  });

  describe('drag handle', () => {
    it('is a button named for what it does', async () => {
      const sheet = await setupTest('', 2000);
      await open(sheet);
      const {handle} = parts(sheet);

      expect(handle.localName).toBe('button');
      expect(handle.getAttribute('aria-label')).toBe('Expand bottom sheet');

      await sheet.expand();
      await env.waitForStability();
      expect(handle.getAttribute('aria-label')).toBe('Dismiss bottom sheet');
    });

    it('expands a partially expanded sheet, and dismisses an expanded one', async () => {
      const sheet = await setupTest('', 2000);
      await open(sheet);

      parts(sheet).handle.click();
      await env.waitForStability();
      expect(sheet.state).toBe('expanded');

      parts(sheet).handle.click();
      await flush();
      expect(parts(sheet).dialog.open).toBeFalse();
    });

    it('moves with the arrow keys', async () => {
      const sheet = await setupTest('', 2000);
      await open(sheet);
      const key = (name: string) =>
        parts(sheet).handle.dispatchEvent(
          new KeyboardEvent('keydown', {key: name, bubbles: true, cancelable: true}),
        );

      key('ArrowUp');
      await env.waitForStability();
      expect(sheet.state).toBe('expanded');

      key('ArrowDown');
      await env.waitForStability();
      expect(sheet.state).toBe('partially-expanded');

      key('ArrowDown');
      await flush();
      expect(parts(sheet).dialog.open).toBeFalse();
    });

    it('can be removed', async () => {
      const sheet = await setupTest('no-drag-handle');
      await open(sheet);

      expect(sheet.shadowRoot!.querySelector('.drag-handle')).toBeNull();
    });

    it('can be replaced by a slotted handle', async () => {
      const root = env.render(html`
        <petal-bottom-sheet quick>
          <span slot="drag-handle" id="custom">grip</span>
          Content
        </petal-bottom-sheet>
      `);
      const sheet = root.querySelector('petal-bottom-sheet') as BottomSheet;
      await env.waitForStability();

      const slot = sheet.shadowRoot!.querySelector<HTMLSlotElement>('slot[name="drag-handle"]')!;
      expect(slot.assignedElements()[0].id).toBe('custom');
    });
  });

  describe('dragging', () => {
    it('drags the sheet down with the pointer', async () => {
      const sheet = await setupTest('', 2000);
      await open(sheet);
      const before = top(sheet);

      const start = parts(sheet).handle.getBoundingClientRect().top + 20;
      pointer(sheet, 'pointerdown', start, 0);
      pointer(sheet, 'pointermove', start + 30, 100);

      expect(top(sheet)).toBeCloseTo(before + 30, 0);
    });

    it('does not drag before the touch slop', async () => {
      const sheet = await setupTest('', 2000);
      await open(sheet);
      const before = top(sheet);

      const start = parts(sheet).handle.getBoundingClientRect().top + 20;
      pointer(sheet, 'pointerdown', start, 0);
      pointer(sheet, 'pointermove', start + 7, 100);

      expect(top(sheet)).toBe(before);
    });

    it('does not drag past the expanded position', async () => {
      const sheet = await setupTest('', 2000);
      await open(sheet);

      const start = parts(sheet).handle.getBoundingClientRect().top + 20;
      pointer(sheet, 'pointerdown', start, 0);
      pointer(sheet, 'pointermove', start - 5000, 100);

      expect(top(sheet)).toBeCloseTo(0, 0);
    });

    it('settles at the closest anchor when let go without velocity', async () => {
      const sheet = await setupTest('', 2000);
      await open(sheet);
      const full = parts(sheet).dialog.clientHeight;

      // 100px up, closer to partially expanded than to expanded.
      dragAt(sheet, -100, 0);
      await flush();

      expect(sheet.state).toBe('partially-expanded');
      expect(top(sheet)).toBeCloseTo(full / 2, 0);
    });

    it('goes back when a slow drag stays within the positional threshold', async () => {
      const sheet = await setupTest('', 2000);
      await open(sheet);

      // 40px up at 50px per second.
      dragAt(sheet, -40, -50);
      await flush();

      expect(sheet.state).toBe('partially-expanded');
    });

    it('expands when dragged up beyond the positional threshold', async () => {
      const sheet = await setupTest('', 2000);
      await open(sheet);

      // 100px up at 50px per second: below the velocity threshold, beyond the
      // 56px positional threshold.
      dragAt(sheet, -100, -50);
      await flush();

      expect(sheet.state).toBe('expanded');
    });

    it('expands with a fast fling up', async () => {
      const sheet = await setupTest('', 2000);
      await open(sheet);

      // 20px at 500px per second.
      dragAt(sheet, -20, -500);
      await flush();

      expect(sheet.state).toBe('expanded');
    });

    it('closes when dragged down beyond the positional threshold', async () => {
      const sheet = await setupTest('', 2000);
      await open(sheet);
      const closed = jasmine.createSpy('closed');
      sheet.addEventListener('closed', closed);

      dragAt(sheet, 100, 50);
      await flush();

      expect(closed).toHaveBeenCalledTimes(1);
      expect(parts(sheet).dialog.open).toBeFalse();
    });

    it('closes with a fast fling down', async () => {
      const sheet = await setupTest('', 2000);
      await open(sheet);

      dragAt(sheet, 60, 600);
      await flush();

      expect(parts(sheet).dialog.open).toBeFalse();
    });

    it('springs back when the close is canceled', async () => {
      const sheet = await setupTest('', 2000);
      await open(sheet);
      const full = parts(sheet).dialog.clientHeight;
      sheet.addEventListener('close', (event) => event.preventDefault());

      dragAt(sheet, 300, 3000);
      await flush();

      expect(parts(sheet).dialog.open).toBeTrue();
      expect(sheet.state).toBe('partially-expanded');
      expect(top(sheet)).toBeCloseTo(full / 2, 0);
    });

    it('does not click a button that a drag ends on', async () => {
      const sheet = await setupTest('', 2000);
      await open(sheet);
      const click = jasmine.createSpy('click');
      sheet.addEventListener('click', click);

      dragAt(sheet, -20, -500);
      parts(sheet).handle.click();

      expect(click).not.toHaveBeenCalled();
      // The drag expanded it; the swallowed click did not dismiss it.
      expect(sheet.state).toBe('expanded');
    });

    it('ignores horizontal drags', async () => {
      const sheet = await setupTest('', 2000);
      await open(sheet);
      const before = top(sheet);

      const start = parts(sheet).handle.getBoundingClientRect().top + 20;
      pointer(sheet, 'pointerdown', start, 0, 100);
      pointer(sheet, 'pointermove', start + 3, 50, 160);
      pointer(sheet, 'pointermove', start + 80, 100, 170);

      expect(top(sheet)).toBe(before);
    });
  });

  describe('accessibility', () => {
    it('is a modal dialog labeled by aria-label', async () => {
      const sheet = await setupTest();
      await open(sheet);
      const {dialog} = parts(sheet);

      expect(dialog.getAttribute('role')).toBe('dialog');
      expect(dialog.getAttribute('aria-modal')).toBe('true');
      expect(dialog.getAttribute('aria-label')).toBe('Options');
      // The attribute moves from the host to the dialog.
      expect(sheet.hasAttribute('aria-label')).toBeFalse();
    });

    it('is named "Bottom Sheet" by default (Strings.BottomSheetPaneTitle)', async () => {
      const root = env.render(html`<petal-bottom-sheet quick>Content</petal-bottom-sheet>`);
      const sheet = root.querySelector('petal-bottom-sheet') as BottomSheet;
      await env.waitForStability();

      expect(parts(sheet).dialog.getAttribute('aria-label')).toBe('Bottom Sheet');
    });

    it('labels the drag handle with custom text', async () => {
      const sheet = await setupTest('expand-label=Mehr dismiss-label=Schliessen', 2000);
      await open(sheet);

      expect(parts(sheet).handle.getAttribute('aria-label')).toBe('Mehr');
      await sheet.expand();
      await env.waitForStability();
      expect(parts(sheet).handle.getAttribute('aria-label')).toBe('Schliessen');
    });

    it('focuses the drag handle, or the element with autofocus', async () => {
      const sheet = await setupTest();
      await open(sheet);
      expect(sheet.shadowRoot!.activeElement).toBe(parts(sheet).handle);
      await sheet.close();
      await env.waitForStability();

      sheet.querySelector('#last')!.setAttribute('autofocus', '');
      await open(sheet);
      expect(document.activeElement).toBe(sheet.querySelector('#last'));
    });

    it('returns focus to the opener when it closes', async () => {
      const sheet = await setupTest();
      const opener = document.querySelector<HTMLElement>('#opener')!;
      opener.focus();
      await open(sheet);
      expect(document.activeElement).not.toBe(opener);

      await sheet.close();
      await env.waitForStability();

      expect(document.activeElement).toBe(opener);
    });

    it('keeps focus in the sheet with sentinels at both ends', async () => {
      const sheet = await setupTest();
      await open(sheet);
      await env.waitForStability();
      const traps = sheet.shadowRoot!.querySelectorAll<HTMLElement>('.focus-trap');
      expect(traps.length).toBe(2);

      // Tab forward from the last element reaches the end sentinel, which
      // moves focus to the first one: the drag handle.
      const last = sheet.querySelector<HTMLElement>('#last')!;
      last.focus();
      traps[1].dispatchEvent(new FocusEvent('focus', {relatedTarget: last}));
      expect(sheet.shadowRoot!.activeElement).toBe(parts(sheet).handle);

      // Shift+Tab from the drag handle reaches the start sentinel, which
      // moves focus to the last element.
      traps[0].dispatchEvent(new FocusEvent('focus', {relatedTarget: parts(sheet).handle}));
      expect(document.activeElement).toBe(last);
    });

    it('has no sentinels with no-focus-trap', async () => {
      const sheet = await setupTest('no-focus-trap');
      await open(sheet);
      await env.waitForStability();

      expect(sheet.shadowRoot!.querySelectorAll('.focus-trap').length).toBe(0);
    });

    it('is not shown with the hidden attribute', async () => {
      const sheet = await setupTest('hidden');
      expect(getComputedStyle(sheet).display).toBe('none');
    });
  });
});
