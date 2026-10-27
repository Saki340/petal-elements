/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import '../../focus/md-focus-ring.js';

import {html, isServer, LitElement, nothing, PropertyValues} from 'lit';
import {property, query, state} from 'lit/decorators.js';
import {classMap} from 'lit/directives/class-map.js';

import {ARIAMixinStrict} from '../../internal/aria/aria.js';
import {mixinDelegatesAria} from '../../internal/aria/delegate.js';
import {
  DEFAULT_EFFECTS,
  DEFAULT_SPATIAL,
  FAST_EFFECTS,
  Spring,
  springFromCss,
  SpringName,
  SpringSpec,
} from '../../internal/motion/spring.js';

import {
  Anchor,
  calculateAnchors,
  closestAnchor,
  computeTarget,
  dampenFlingVelocity,
  overflowScale,
  positionOf,
  resolveValue,
  SheetValue,
  VelocityTracker,
} from './sheet-physics.js';

export type {SheetValue} from './sheet-physics.js';

// ExpressiveMotionTokens (MotionScheme.expressive(), the default scheme), the
// fallbacks when the page has no `--md-sys-motion-spring-*` properties.

/**
 * How far a pointer moves before it drags the sheet: Android's touch slop,
 * 8dp (`ViewConfiguration.scaledTouchSlop`), which Compose's drag detection
 * uses.
 */
const TOUCH_SLOP = 8;

// Separate variable needed for closure.
const bottomSheetBaseClass = mixinDelegatesAria(LitElement);

/**
 * A modal bottom sheet, after Jetpack Compose Material 3 (`ModalBottomSheet`,
 * `BottomSheetDefaults`, `SheetState`).
 *
 * The content goes in the default slot. A custom drag handle goes in the
 * `drag-handle` slot. The sheet shows with `show()` or the `open` attribute,
 * partially expanded (half of the page, or the sheet's own height when that is
 * smaller) unless `skip-partially-expanded` is set. Dragging the sheet, its
 * drag handle, `expand()`, `partialExpand()` and `close()` move it between
 * expanded, partially expanded and hidden. Pressing Escape collapses an
 * expanded sheet to its partial height first, and then hides it. Clicking the
 * scrim hides it.
 *
 * @fires open {Event} Dispatched when the sheet is opening before any
 * animations. Cancelable.
 * @fires opened {Event} Dispatched when the sheet has opened after any
 * animations.
 * @fires close {Event} Dispatched when the sheet is closing before any
 * animations. Cancelable; a sheet dragged away springs back.
 * @fires closed {Event} Dispatched when the sheet has closed after any
 * animations.
 * @fires cancel {Event} Dispatched when the user asks to dismiss the sheet
 * with Escape or the scrim. Cancelable.
 *
 * @slot - The sheet's content.
 * @slot drag-handle - Replaces the default 32px by 4px drag handle.
 */
export class BottomSheet extends bottomSheetBaseClass {
  /**
   * Opens the sheet when set to `true` and closes it when set to `false`.
   */
  @property({type: Boolean})
  get open() {
    return this.isOpen;
  }

  set open(open: boolean) {
    if (open === this.isOpen) return;
    this.isOpen = open;
    this.toggleAttribute('open', open);
    if (open) {
      void this.show();
    } else {
      void this.close();
    }
  }

  /**
   * Skips the partially expanded state: the sheet opens expanded, and
   * dragging it moves it between expanded and hidden (Compose's
   * `skipPartiallyExpanded`).
   */
  @property({type: Boolean, attribute: 'skip-partially-expanded'})
  skipPartiallyExpanded = false;

  /**
   * Moves the sheet without animations.
   */
  @property({type: Boolean}) quick = false;

  /**
   * Removes the drag handle (Compose's `dragHandle = null`). The sheet can
   * still be dragged.
   */
  @property({type: Boolean, attribute: 'no-drag-handle'}) noDragHandle = false;

  /**
   * Disables focus trapping, which by default keeps keyboard Tab navigation
   * within the sheet.
   */
  @property({type: Boolean, attribute: 'no-focus-trap'}) noFocusTrap = false;

  /**
   * The accessible name of the drag handle while the sheet is expanded, where
   * it dismisses the sheet (Compose's `BottomSheetDismissDescription`).
   */
  @property({attribute: 'dismiss-label'}) dismissLabel = 'Dismiss bottom sheet';

  /**
   * The accessible name of the drag handle while the sheet is partially
   * expanded, where it expands the sheet (Compose's
   * `BottomSheetExpandDescription`).
   */
  @property({attribute: 'expand-label'}) expandLabel = 'Expand bottom sheet';

  /**
   * Where the sheet rests: `hidden`, `partially-expanded` or `expanded`.
   * While it moves, the place it left.
   */
  get state(): SheetValue {
    return this.settledValue;
  }

  @state() private settledValue: SheetValue = 'hidden';
  @state() private bodyOverflows = false;

  @query('dialog') private readonly dialog!: HTMLDialogElement | null;
  @query('.scrim') private readonly scrim!: HTMLElement | null;
  @query('.sheet') private readonly sheet!: HTMLElement | null;
  @query('.content') private readonly content!: HTMLElement | null;
  @query('.body') private readonly body!: HTMLElement | null;
  @query('.drag-handle') private readonly dragHandle!: HTMLElement | null;
  @query('.focus-trap') private readonly firstFocusTrap!: HTMLElement | null;

  private isOpen = false;
  private isOpening = false;
  private closing?: Promise<void>;
  // getIsConnectedPromise() immediately sets the resolve property.
  private isConnectedPromiseResolve!: () => void;
  private isConnectedPromise = this.getIsConnectedPromise();

  // Geometry, in px.
  private anchors: Anchor[] = [];
  private fullHeight = 0;
  private sheetHeight = 0;
  private resizeObserver?: ResizeObserver;

  // Motion. The offset is the distance of the sheet's top from the top of
  // the page; the scrim's opacity is 0 to 1.
  private targetValue: SheetValue = 'hidden';
  private readonly offsetSpring = new Spring(DEFAULT_SPATIAL);
  private readonly scrimSpring = new Spring(DEFAULT_EFFECTS);
  private frame = 0;
  private lastTime = 0;
  private waiters: Array<() => void> = [];

  // Gestures.
  private pointer?: {
    id: number;
    startX: number;
    startY: number;
    lastY: number;
    dragging: boolean;
    tracker: VelocityTracker;
  };
  private suppressClick = false;

  // This TreeWalker is used to walk through the sheet's children to find
  // focusable elements. We check for isServer because there isn't a
  // "document" during an SSR run.
  private readonly treewalker = isServer
    ? null
    : document.createTreeWalker(this, NodeFilter.SHOW_ELEMENT);

  /** The current offset of the sheet's top from the top of the page. */
  private get offset() {
    return this.offsetSpring.value;
  }

  private get dragging() {
    return !!this.pointer?.dragging;
  }

  /**
   * Opens the sheet and fires a cancelable `open` event. After the sheet's
   * animation, an `opened` event is fired.
   *
   * Add an `autofocus` attribute to a child of the sheet that should receive
   * focus after opening.
   *
   * @return A Promise that resolves after the animation is finished and the
   *     `opened` event was fired.
   */
  async show() {
    this.isOpening = true;
    // Sheets can be opened before being attached to the DOM, so we need to
    // wait until we're connected before calling `showModal()`.
    await this.isConnectedPromise;
    await this.updateComplete;
    // A sheet that is closing finishes closing first.
    await this.closing;
    const dialog = this.dialog!;
    // Check if already opened or if `close()` was called while awaiting.
    if (dialog.open || !this.isOpening) {
      this.isOpening = false;
      return;
    }

    const preventOpen = !this.dispatchEvent(new Event('open', {cancelable: true}));
    if (preventOpen) {
      this.markOpen(false);
      this.isOpening = false;
      return;
    }

    // The scrim goes in the top layer first, so it stays under the sheet and
    // above everything else on the page.
    this.showScrim();
    dialog.showModal();
    this.markOpen(true);
    // The sheet starts hidden, below the page. This runs before the browser
    // paints.
    this.measure();
    this.jumpTo('hidden');
    this.querySelector<HTMLElement>('[autofocus]')?.focus();

    // BottomSheetState.show(): partially expanded when there is such a state.
    const target = positionOf(this.anchors, 'partially-expanded') === undefined
      ? 'expanded'
      : 'partially-expanded';
    await this.animateTo(target, this.spring('default-spatial', DEFAULT_SPATIAL));
    this.dispatchEvent(new Event('opened'));
    this.isOpening = false;
  }

  /**
   * Closes the sheet and fires a cancelable `close` event. After the sheet's
   * animation, a `closed` event is fired.
   *
   * @return A Promise that resolves after the animation is finished and the
   *     `closed` event was fired.
   */
  async close() {
    this.isOpening = false;
    if (!this.isConnected) {
      // Disconnected sheets do not fire close events or animate.
      this.markOpen(false);
      return;
    }

    await this.updateComplete;
    const dialog = this.dialog!;
    // Check if already closed or if `show()` was called while awaiting.
    if (!dialog.open || this.isOpening) {
      if (!dialog.open) this.hideScrim();
      this.markOpen(false);
      return;
    }

    // SheetState.hide(): the fast effects spring.
    await this.hide(this.spring('fast-effects', FAST_EFFECTS));
  }

  /**
   * Expands the sheet to its full height (SheetState.expand()).
   *
   * @return A Promise that resolves after the animation is finished.
   */
  async expand() {
    if (!this.dialog?.open || this.closing) return;
    await this.animateTo('expanded', this.spring('default-spatial', DEFAULT_SPATIAL));
  }

  /**
   * Collapses the sheet to its partially expanded height
   * (SheetState.partialExpand()).
   *
   * @return A Promise that resolves after the animation is finished.
   */
  async partialExpand() {
    if (this.skipPartiallyExpanded) {
      throw new Error(
        'Attempted to partially expand a sheet with skip-partially-expanded set.',
      );
    }
    if (!this.dialog?.open || this.closing) return;
    await this.animateTo('partially-expanded', this.spring('fast-effects', FAST_EFFECTS));
  }

  override connectedCallback() {
    super.connectedCallback();
    this.isConnectedPromiseResolve();
    // Reconnected: the shadow root is there already.
    if (this.hasUpdated) this.observeSizes();
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.isConnectedPromise = this.getIsConnectedPromise();
    cancelAnimationFrame(this.frame);
    this.frame = 0;
    this.resizeObserver?.disconnect();
  }

  protected override render() {
    // The focus trap sentinels are only added after the sheet opens, since
    // dialog.showModal() will try to autofocus them, even with tabindex="-1".
    const showFocusTrap = this.open && !this.noFocusTrap;
    const focusTrap = html`
      <div
        class="focus-trap"
        tabindex="0"
        aria-hidden="true"
        @focus=${this.handleFocusTrapFocus}></div>
    `;

    // The body scrolls on its own only when the sheet is expanded and its
    // content is taller than the sheet; otherwise touches drag the sheet.
    const classes = {
      'scrolls': this.bodyOverflows && this.settledValue === 'expanded',
    };

    // BottomSheet's drag handle: it dismisses an expanded sheet and expands a
    // partially expanded one.
    const handleLabel =
      this.settledValue === 'partially-expanded' ? this.expandLabel : this.dismissLabel;

    const {ariaLabel} = this as ARIAMixinStrict;
    return html`
      <div class="scrim" popover="manual"></div>
      <dialog
        role="dialog"
        aria-modal="true"
        aria-label=${ariaLabel || 'Bottom Sheet'}
        @cancel=${this.handleCancel}
        @click=${this.handleDialogClick}
        @close=${this.handleNativeClose}>
        ${showFocusTrap ? focusTrap : nothing}
        <div
          class="sheet ${classMap(classes)}"
          @pointerdown=${this.handlePointerDown}
          @pointermove=${this.handlePointerMove}
          @pointerup=${this.handlePointerUp}
          @pointercancel=${this.handlePointerCancel}>
          <div class="content">
            ${this.noDragHandle
              ? nothing
              : html`<button
                  id="drag-handle"
                  class="drag-handle"
                  type="button"
                  aria-label=${handleLabel}
                  @click=${this.handleDragHandleClick}
                  @keydown=${this.handleDragHandleKeydown}>
                  <span class="handle-bounds">
                    <slot name="drag-handle"><span class="handle"></span></slot>
                    <petal-focus-ring part="focus-ring" for="drag-handle"></petal-focus-ring>
                  </span>
                </button>`}
            <div class="body">
              <slot @slotchange=${this.measureBody}></slot>
            </div>
          </div>
        </div>
        ${showFocusTrap ? focusTrap : nothing}
      </dialog>
    `;
  }

  protected override firstUpdated() {
    if (isServer) return;
    this.resizeObserver = new ResizeObserver(() => this.handleResize());
    this.observeSizes();
    // A drag that ends over a button must not click it. This runs before the
    // buttons' own listeners.
    this.sheet!.addEventListener('click', this.handleClickCapture, {capture: true});
  }

  protected override updated(changed: PropertyValues<this>) {
    if (changed.has('skipPartiallyExpanded') || changed.has('noDragHandle')) {
      if (this.dialog?.open) this.handleResize();
    }
  }

  private observeSizes() {
    const dialog = this.dialog;
    const sheet = this.sheet;
    if (dialog) this.resizeObserver?.observe(dialog);
    if (sheet) this.resizeObserver?.observe(sheet);
    if (this.content) this.resizeObserver?.observe(this.content);
  }

  /** Sets `open` without showing or closing the sheet. */
  private markOpen(open: boolean) {
    if (this.isOpen === open) return;
    this.isOpen = open;
    this.toggleAttribute('open', open);
    this.requestUpdate('open', !open);
  }

  // Geometry -----------------------------------------------------------------

  /** Reads the page's and the sheet's heights, and computes the anchors. */
  private measure() {
    const dialog = this.dialog;
    const sheet = this.sheet;
    if (!dialog || !sheet) return;
    this.fullHeight = dialog.clientHeight;
    this.sheetHeight = sheet.offsetHeight;
    this.anchors = calculateAnchors(
      this.fullHeight,
      this.sheetHeight,
      this.skipPartiallyExpanded,
    );
    this.measureBody();
  }

  private measureBody() {
    const body = this.body;
    if (!body) return;
    this.bodyOverflows = body.scrollHeight > body.clientHeight + 1;
  }

  /**
   * Updates the anchors when the page or the sheet changes size. The sheet
   * stays where it is, or goes to the closest value that still exists
   * (BottomSheet's `draggableAnchors`).
   */
  private handleResize() {
    if (!this.dialog?.open) return;
    this.measure();
    const value = resolveValue(this.anchors, this.targetValue);
    const position = positionOf(this.anchors, value)!;
    if (this.dragging) {
      this.offsetSpring.value = this.clampOffset(this.offset);
    } else if (this.targetValue !== value || !this.offsetSpring.atRest || this.frame) {
      // Moving: aim at the new position.
      this.targetValue = value;
      this.offsetSpring.target = position;
    } else {
      this.targetValue = value;
      this.settledValue = value;
      this.offsetSpring.value = position;
      this.offsetSpring.target = position;
    }
    this.paint();
  }

  private clampOffset(offset: number) {
    const positions = this.anchors.map((anchor) => anchor.position);
    return Math.max(Math.min(...positions), Math.min(Math.max(...positions), offset));
  }

  // Motion -------------------------------------------------------------------

  private spring(name: SpringName, fallback: SpringSpec) {
    return springFromCss(this, name, fallback);
  }

  private get reduceMotion() {
    return this.quick || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  }

  /** Puts the sheet at a value at once. */
  private jumpTo(value: SheetValue) {
    const position = positionOf(this.anchors, value) ?? this.fullHeight;
    this.targetValue = value;
    this.settledValue = value;
    this.offsetSpring.value = position;
    this.offsetSpring.target = position;
    this.offsetSpring.velocity = 0;
    this.scrimSpring.value = value === 'hidden' ? 0 : 1;
    this.scrimSpring.target = this.scrimSpring.value;
    this.scrimSpring.velocity = 0;
    this.paint();
  }

  /**
   * Moves the sheet to a value on a spring (AnchoredDraggableState
   * .animateTo), carrying `velocity`. The scrim fades while the target is not
   * hidden (ModalBottomSheet's `isScrimVisible`). Resolves when the sheet
   * rests, or when another move takes over.
   */
  private animateTo(value: SheetValue, spec: SpringSpec, velocity = 0): Promise<void> {
    const position = positionOf(this.anchors, value);
    // Interrupt the move in progress.
    this.resolveWaiters();
    if (position === undefined) return Promise.resolve();
    this.targetValue = value;
    if (this.reduceMotion) {
      this.jumpTo(value);
      return Promise.resolve();
    }
    this.offsetSpring.spec = spec;
    this.offsetSpring.target = position;
    this.offsetSpring.velocity = velocity;
    this.updateScrimTarget();
    return new Promise<void>((resolve) => {
      this.waiters.push(resolve);
      this.startLoop();
    });
  }

  private updateScrimTarget() {
    const target = this.targetValue === 'hidden' ? 0 : 1;
    if (this.scrimSpring.target === target) return;
    this.scrimSpring.spec = this.spring('default-effects', DEFAULT_EFFECTS);
    this.scrimSpring.target = target;
    this.startLoop();
  }

  private resolveWaiters() {
    const waiters = this.waiters;
    this.waiters = [];
    for (const resolve of waiters) resolve();
  }

  private startLoop() {
    if (this.frame) return;
    this.lastTime = performance.now();
    this.frame = requestAnimationFrame(this.tick);
  }

  private readonly tick = () => {
    this.frame = 0;
    const now = performance.now();
    // At most a few frames' worth, so a background tab does not jump.
    const ms = Math.min(now - this.lastTime, 64);
    this.lastTime = now;
    if (!this.dragging) this.offsetSpring.step(ms);
    this.scrimSpring.step(ms);
    this.paint();
    const moving = !this.dragging && !this.offsetSpring.atRest;
    if (moving || !this.scrimSpring.atRest) {
      this.frame = requestAnimationFrame(this.tick);
    } else if (!this.dragging) {
      this.offsetSpring.value = this.offsetSpring.target;
      this.scrimSpring.value = this.scrimSpring.target;
      this.settledValue = this.targetValue;
      this.paint();
      this.resolveWaiters();
    }
  };

  /** Writes the offset and the scrim's opacity to the elements. */
  private paint() {
    const sheet = this.sheet;
    if (!sheet || this.anchors.length === 0) return;
    const offset = this.offset;
    const minPosition = Math.min(...this.anchors.map((anchor) => anchor.position));
    const scale = overflowScale(offset, minPosition, this.sheetHeight);
    // The surface scales up when the spring overshoots above the topmost
    // anchor, so no gap shows below it; the content scales back down
    // (verticalScaleUp, verticalScaleDown).
    sheet.style.transform =
      scale === 1 ? `translateY(${offset}px)` : `translateY(${offset}px) scaleY(${scale})`;
    if (this.content) {
      this.content.style.transform = scale === 1 ? '' : `scaleY(${1 / scale})`;
    }
    const alpha = Math.max(0, Math.min(1, this.scrimSpring.value));
    this.scrim?.style.setProperty('--_scrim-alpha', String(alpha));
  }

  // Closing ------------------------------------------------------------------

  /**
   * Animates the sheet away, then closes the dialog. A `close` listener can
   * cancel it; the sheet then goes back to where it rests.
   */
  private hide(spec: SpringSpec, velocity = 0): Promise<void> {
    if (this.closing) return this.closing;
    const preventClose = !this.dispatchEvent(new Event('close', {cancelable: true}));
    if (preventClose) {
      void this.animateTo(this.settledValue, this.spring('default-spatial', DEFAULT_SPATIAL));
      return Promise.resolve();
    }
    const closing = (async () => {
      await this.animateTo('hidden', spec, velocity);
      this.completeClose();
    })();
    this.closing = closing;
    return closing;
  }

  private completeClose() {
    this.dialog?.close();
    this.hideScrim();
    this.settledValue = 'hidden';
    this.markOpen(false);
    this.closing = undefined;
    this.dispatchEvent(new Event('closed'));
  }

  private showScrim() {
    const scrim = this.scrim;
    if (scrim && 'showPopover' in scrim && !scrim.matches(':popover-open')) {
      scrim.style.setProperty('--_scrim-alpha', '0');
      scrim.showPopover();
    }
  }

  private hideScrim() {
    const scrim = this.scrim;
    if (scrim && 'hidePopover' in scrim && scrim.matches(':popover-open')) {
      scrim.hidePopover();
    }
  }

  /** The native dialog can close on its own, e.g. when it is removed. */
  private handleNativeClose() {
    if (!this.dialog?.open) this.hideScrim();
  }

  /**
   * The user asks to dismiss the sheet. A cancelable `cancel` event goes out
   * first. With `settle`, an expanded sheet that has a partially expanded
   * state collapses to it instead of closing (ModalBottomSheet's
   * `settleToDismiss`, for the back gesture); without, the sheet closes
   * (`animateToDismiss`, for the scrim).
   */
  private requestDismiss(settle: boolean) {
    const preventDefault = !this.dispatchEvent(new Event('cancel', {cancelable: true}));
    if (preventDefault) return;
    if (
      settle &&
      this.settledValue === 'expanded' &&
      positionOf(this.anchors, 'partially-expanded') !== undefined
    ) {
      void this.partialExpand();
    } else {
      void this.close();
    }
  }

  private handleCancel(event: Event) {
    if (event.target !== this.dialog) return;
    // The sheet animates away before the dialog closes.
    event.preventDefault();
    this.requestDismiss(true);
  }

  private handleDialogClick(event: Event) {
    // A click on the dialog itself landed outside the sheet: on the scrim.
    if (event.target !== this.dialog || this.closing) return;
    this.requestDismiss(false);
  }

  // Drag handle --------------------------------------------------------------

  private handleDragHandleClick() {
    if (this.closing) return;
    switch (this.settledValue) {
      case 'expanded':
        void this.close();
        break;
      case 'partially-expanded':
        void this.expand();
        break;
      default:
        break;
    }
  }

  /**
   * The drag handle's actions for the keyboard, as the semantics Compose adds
   * to it: up expands, down collapses to the partial height or dismisses.
   */
  private handleDragHandleKeydown(event: KeyboardEvent) {
    if (this.closing) return;
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      void this.expand();
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (
        this.settledValue === 'expanded' &&
        positionOf(this.anchors, 'partially-expanded') !== undefined
      ) {
        void this.partialExpand();
      } else {
        void this.close();
      }
    }
  }

  // Gestures -----------------------------------------------------------------

  private canStartDrag(event: PointerEvent) {
    if (!event.isPrimary || event.button !== 0) return false;
    if (this.settledValue === 'hidden' && !this.dialog?.open) return false;
    if (this.closing) return false;
    const path = event.composedPath();
    const handle = this.dragHandle;
    const onHandle = !!handle && path.includes(handle);
    // Scrolling content scrolls by itself; the handle always drags.
    if (!onHandle && this.body && path.includes(this.body)) {
      if (this.bodyOverflows && this.settledValue === 'expanded') return false;
    }
    // Text selection and sliders keep their own drags.
    return !path.some(
      (target) =>
        target instanceof HTMLElement &&
        target.matches('input, textarea, select, [contenteditable]'),
    );
  }

  private handlePointerDown(event: PointerEvent) {
    if (!this.canStartDrag(event)) return;
    this.suppressClick = false;
    this.pointer = {
      id: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      lastY: event.clientY,
      dragging: false,
      tracker: new VelocityTracker(),
    };
    this.pointer.tracker.addPosition(event.timeStamp, event.clientY);
    // Catch a sheet that is still moving at once.
    if (this.frame && !this.offsetSpring.atRest) this.beginDrag(event);
  }

  private handlePointerMove(event: PointerEvent) {
    const pointer = this.pointer;
    if (!pointer || pointer.id !== event.pointerId) return;
    pointer.tracker.addPosition(event.timeStamp, event.clientY);
    if (!pointer.dragging) {
      const dx = event.clientX - pointer.startX;
      const dy = event.clientY - pointer.startY;
      if (Math.hypot(dx, dy) < TOUCH_SLOP) return;
      // A mostly horizontal move is not for the sheet.
      if (Math.abs(dx) > Math.abs(dy)) {
        this.pointer = undefined;
        return;
      }
      this.beginDrag(event);
    }
    const delta = event.clientY - pointer.lastY;
    pointer.lastY = event.clientY;
    this.dragBy(delta);
  }

  private beginDrag(event: PointerEvent) {
    const pointer = this.pointer!;
    pointer.dragging = true;
    pointer.lastY = pointer.startY;
    try {
      this.sheet!.setPointerCapture(event.pointerId);
    } catch {
      // The pointer is gone.
    }
    this.sheet!.classList.add('dragging');
    // Take the sheet over from the spring.
    this.resolveWaiters();
    this.offsetSpring.velocity = 0;
    this.offsetSpring.target = this.offsetSpring.value;
  }

  /** Moves the sheet with the pointer, between the first and last anchor. */
  private dragBy(delta: number) {
    this.offsetSpring.value = this.clampOffset(this.offset + delta);
    this.offsetSpring.target = this.offsetSpring.value;
    // The scrim follows the closest anchor (AnchoredDraggableState
    // .targetValue while dragging).
    this.targetValue = closestAnchor(this.anchors, this.offset)?.value ?? this.targetValue;
    this.updateScrimTarget();
    this.paint();
  }

  private handlePointerUp(event: PointerEvent) {
    this.endPointer(event, true);
  }

  private handlePointerCancel(event: PointerEvent) {
    this.endPointer(event, false);
  }

  private endPointer(event: PointerEvent, withVelocity: boolean) {
    const pointer = this.pointer;
    if (!pointer || pointer.id !== event.pointerId) return;
    this.pointer = undefined;
    this.sheet!.classList.remove('dragging');
    if (!pointer.dragging) return;
    this.suppressClick = true;
    const velocity = withVelocity ? pointer.tracker.velocity(event.timeStamp) : 0;
    this.settle(velocity);
  }

  /**
   * Lets go of the sheet: it goes to the anchor `computeTarget` picks, on the
   * default spatial spring with the pointer's velocity, as ModalBottomSheet's
   * fling behavior does.
   */
  private settle(velocity: number) {
    const hidden = positionOf(this.anchors, 'hidden') ?? this.fullHeight;
    const dampened = dampenFlingVelocity(velocity, this.offset, hidden);
    const target = computeTarget(this.anchors, this.offset, dampened);
    const spec = this.spring('default-spatial', DEFAULT_SPATIAL);
    if (target === 'hidden') {
      void this.hide(spec, dampened);
      // A listener may have vetoed the close; then the sheet is back.
    } else {
      void this.animateTo(target, spec, dampened);
    }
  }

  private readonly handleClickCapture = (event: Event) => {
    if (!this.suppressClick) return;
    this.suppressClick = false;
    event.stopPropagation();
    event.preventDefault();
  };

  // Focus trap ---------------------------------------------------------------

  private handleFocusTrapFocus(event: FocusEvent) {
    const [firstFocusableChild, lastFocusableChild] = this.getFirstAndLastFocusableChildren();
    if (!firstFocusableChild || !lastFocusableChild) {
      // When a sheet does not have focusable children, the dialog itself
      // receives focus.
      this.dialog?.focus();
      return;
    }

    // To determine which child to focus, we need to know which focus trap
    // received focus...
    const isFirstFocusTrap = event.target === this.firstFocusTrap;
    const isLastFocusTrap = !isFirstFocusTrap;
    // ...and where the focus came from (what was previously focused).
    const focusCameFromFirstChild = event.relatedTarget === firstFocusableChild;
    const focusCameFromLastChild = event.relatedTarget === lastFocusableChild;
    // Focus can also come from outside the sheet, when it is programmatically
    // `focus()`'d or returns to the window.
    const focusCameFromOutsideSheet = !focusCameFromFirstChild && !focusCameFromLastChild;

    // Focus the first child at the end of the sheet when moving forward, or
    // when moving forwards into the sheet from outside of the window.
    const shouldFocusFirstChild =
      (isLastFocusTrap && focusCameFromLastChild) ||
      (isFirstFocusTrap && focusCameFromOutsideSheet);
    if (shouldFocusFirstChild) {
      firstFocusableChild.focus();
      return;
    }

    // Focus the last child at the beginning of the sheet when moving
    // backward, or when moving backwards into the sheet from outside.
    const shouldFocusLastChild =
      (isFirstFocusTrap && focusCameFromFirstChild) ||
      (isLastFocusTrap && focusCameFromOutsideSheet);
    if (shouldFocusLastChild) {
      lastFocusableChild.focus();
    }
  }

  /** The drag handle, then the sheet's content, in tab order. */
  private getFirstAndLastFocusableChildren(): [HTMLElement, HTMLElement] | [null, null] {
    if (!this.treewalker) return [null, null];

    let first: HTMLElement | null = this.dragHandle;
    let last: HTMLElement | null = this.dragHandle;

    // Reset the current node back to the root host element.
    this.treewalker.currentNode = this.treewalker.root;
    let lastInContent: HTMLElement | null = null;
    while (this.treewalker.nextNode()) {
      // Cast as Element since the TreeWalker filter only accepts Elements.
      const next = this.treewalker.currentNode as Element;
      if (!isFocusable(next)) continue;
      first ??= next;
      lastInContent = next;
    }
    last = lastInContent ?? last;
    return first && last ? [first, last] : [null, null];
  }

  private getIsConnectedPromise() {
    return new Promise<void>((resolve) => {
      this.isConnectedPromiseResolve = resolve;
    });
  }
}

function isFocusable(element: Element): element is HTMLElement {
  // Check if the element is a known built-in focusable element:
  // - <a> and <area> with `href` attributes.
  // - Form controls that are not disabled.
  // - `contenteditable` elements.
  // - Anything with a non-negative `tabindex`.
  const knownFocusableElements =
    ':is(button,input,select,textarea,object,:is(a,area)[href],[tabindex],[contenteditable=true])';
  const notDisabled = ':not(:disabled,[disabled])';
  const notNegativeTabIndex = ':not([tabindex^="-"])';
  if (element.matches(knownFocusableElements + notDisabled + notNegativeTabIndex)) {
    return true;
  }

  const isCustomElement = element.localName.includes('-');
  if (!isCustomElement) return false;

  // If a custom element does not have a tabindex, it may still be focusable
  // if it delegates focus with a shadow root. We also need to check again if
  // the custom element is a disabled form control.
  if (!element.matches(notDisabled)) return false;

  return element.shadowRoot?.delegatesFocus ?? false;
}
