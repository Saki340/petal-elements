/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import '../../elevation/elevation.js';
import '../../focus/md-focus-ring.js';

import {html, isServer, LitElement, nothing, PropertyValues} from 'lit';
import {property, query, state} from 'lit/decorators.js';
import {classMap} from 'lit/directives/class-map.js';

import {ARIAMixinStrict} from '../../internal/aria/aria.js';
import {mixinDelegatesAria} from '../../internal/aria/delegate.js';
import {
  DEFAULT_SPATIAL,
  FAST_EFFECTS,
  Spring,
  springFromCss,
  SpringName,
  SpringSpec,
} from '../../internal/motion/spring.js';

import {
  Anchor,
  calculateStandardAnchors,
  closestAnchor,
  computeTarget,
  overflowScale,
  positionOf,
  resolveValue,
  SheetValue,
  VelocityTracker,
} from './sheet-physics.js';

/** BottomSheetDefaults.SheetPeekHeight. */
const PEEK_HEIGHT = 56;

/** Android's touch slop, 8dp, as for the modal sheet. */
const TOUCH_SLOP = 8;

// Separate variable needed for closure.
const standardBottomSheetBaseClass = mixinDelegatesAria(LitElement);

/**
 * A standard bottom sheet, after Jetpack Compose Material 3
 * (`BottomSheetScaffold` and its `StandardBottomSheet`): a sheet docked at the
 * bottom that stays on screen with the page usable behind it, showing
 * `peek-height` of itself until it is dragged or expanded.
 *
 * The content goes in the default slot, a custom drag handle in the
 * `drag-handle` slot. The sheet rests partially expanded or expanded, and
 * hidden too with `hideable`. Dragging it, its drag handle, `value`,
 * `expand()`, `partialExpand()`, `show()` and `hide()` move it.
 *
 * @fires change {Event} The sheet came to rest at another value. --bubbles
 *
 * @slot - The sheet's content.
 * @slot drag-handle - Replaces the default 32px by 4px drag handle.
 */
export class StandardBottomSheet extends standardBottomSheetBaseClass {
  /**
   * Where the sheet rests: `partially-expanded`, `expanded`, or `hidden` when
   * `hideable`. Setting it moves the sheet there.
   */
  @property({reflect: true}) value: SheetValue = 'partially-expanded';

  /** How much of the sheet shows when partially expanded, in px. */
  @property({type: Number, attribute: 'peek-height'}) peekHeight = PEEK_HEIGHT;

  /** Lets the sheet hide below the page (Compose's `skipHiddenState = false`). */
  @property({type: Boolean}) hideable = false;

  /** Stops dragging the sheet (Compose's `sheetSwipeEnabled = false`). */
  @property({type: Boolean, attribute: 'no-swipe'}) noSwipe = false;

  /** Removes the drag handle (Compose's `sheetDragHandle = null`). */
  @property({type: Boolean, attribute: 'no-drag-handle'}) noDragHandle = false;

  /**
   * Places the sheet at the bottom of its positioned parent instead of the
   * viewport.
   */
  @property({type: Boolean, reflect: true}) contained = false;

  /** Moves the sheet without animations. */
  @property({type: Boolean}) quick = false;

  /** The drag handle's name while it expands the sheet. */
  @property({attribute: 'expand-label'}) expandLabel = 'Expand bottom sheet';

  /** The drag handle's name while it collapses the sheet. */
  @property({attribute: 'collapse-label'}) collapseLabel = 'Collapse bottom sheet';

  /** The drag handle's name while it shows a hidden sheet. */
  @property({attribute: 'show-label'}) showLabel = 'Show bottom sheet';

  @state() private settledValue: SheetValue = 'partially-expanded';
  @state() private bodyOverflows = false;

  @query('.layer') private readonly layer!: HTMLElement | null;
  @query('.sheet') private readonly sheet!: HTMLElement | null;
  @query('.content') private readonly content!: HTMLElement | null;
  @query('.body') private readonly body!: HTMLElement | null;
  @query('.drag-handle') private readonly dragHandle!: HTMLElement | null;

  private anchors: Anchor[] = [];
  private fullHeight = 0;
  private sheetHeight = 0;
  private resizeObserver?: ResizeObserver;
  private measured = false;

  private targetValue: SheetValue = 'partially-expanded';
  private readonly offsetSpring = new Spring(DEFAULT_SPATIAL, 0.5);
  private frame = 0;
  private lastTime = 0;
  private waiters: Array<() => void> = [];
  /** The value being moved to by this element, so `value` is not re-applied. */
  private applyingValue = false;

  private pointer?: {
    id: number;
    startX: number;
    startY: number;
    lastY: number;
    dragging: boolean;
    tracker: VelocityTracker;
  };
  private suppressClick = false;

  /** Expands the sheet fully (SheetState.expand(): the default spatial spring). */
  async expand() {
    await this.moveTo('expanded', this.spring('default-spatial', DEFAULT_SPATIAL));
  }

  /**
   * Collapses the sheet to its peek height (SheetState.partialExpand(): the
   * fast effects spring).
   */
  async partialExpand() {
    await this.moveTo('partially-expanded', this.spring('fast-effects', FAST_EFFECTS));
  }

  /**
   * Shows a hidden sheet: partially expanded if it can be, else expanded
   * (SheetState.show()).
   */
  async show() {
    const target =
      positionOf(this.anchors, 'partially-expanded') === undefined
        ? 'expanded'
        : 'partially-expanded';
    await this.moveTo(target, this.spring('default-spatial', DEFAULT_SPATIAL));
  }

  /** Hides a `hideable` sheet (SheetState.hide(): the fast effects spring). */
  async hide() {
    if (!this.hideable) {
      throw new Error('Attempted to hide a standard bottom sheet that is not hideable.');
    }
    await this.moveTo('hidden', this.spring('fast-effects', FAST_EFFECTS));
  }

  override connectedCallback() {
    super.connectedCallback();
    if (this.hasUpdated) this.observeSizes();
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    if (isServer) return;
    cancelAnimationFrame(this.frame);
    this.frame = 0;
    this.resizeObserver?.disconnect();
  }

  protected override willUpdate(changed: PropertyValues<this>) {
    // Before the first measure, the sheet starts where `value` says.
    if (!this.measured && changed.has('value')) {
      this.settledValue = this.value;
      this.targetValue = this.value;
    }
  }

  protected override render() {
    const {ariaLabel} = this as ARIAMixinStrict;
    const classes = {
      'scrolls': this.bodyOverflows && this.settledValue === 'expanded',
      'at-rest-hidden': this.settledValue === 'hidden' && this.targetValue === 'hidden',
    };
    // The drag handle's click (StandardBottomSheet): an expanded sheet hides
    // or collapses, a partially expanded one expands, a hidden one shows.
    const handleLabel =
      this.settledValue === 'expanded'
        ? this.collapseLabel
        : this.settledValue === 'hidden'
          ? this.showLabel
          : this.expandLabel;
    return html`
      <div class="layer" style=${`--_peek-height: ${this.peekHeight}px`}>
        <div
          class="sheet ${classMap(classes)}"
          role="region"
          aria-label=${ariaLabel || 'Bottom Sheet'}
          ?inert=${classes['at-rest-hidden']}
          @pointerdown=${this.handlePointerDown}
          @pointermove=${this.handlePointerMove}
          @pointerup=${this.handlePointerUp}
          @pointercancel=${this.handlePointerCancel}>
          <petal-elevation part="elevation"></petal-elevation>
          <div class="content">
            ${this.noDragHandle
              ? nothing
              : html`<button
                  id="drag-handle"
                  class="drag-handle"
                  type="button"
                  aria-label=${handleLabel}
                  aria-expanded=${String(this.settledValue === 'expanded')}
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
      </div>
    `;
  }

  protected override firstUpdated() {
    if (isServer) return;
    this.resizeObserver = new ResizeObserver(() => this.handleResize());
    this.observeSizes();
    this.sheet!.addEventListener('click', this.handleClickCapture, {capture: true});
    // Measuring sets the settled value, a reactive property: not in this update.
    queueMicrotask(() => this.handleResize());
  }

  protected override updated(changed: PropertyValues<this>) {
    // Only the sheet's position and the anchors change here, not reactive
    // properties: those changes are in moveTo() and handleResize(), called
    // from here through a microtask.
    if (
      changed.has('peekHeight') ||
      changed.has('hideable') ||
      changed.has('noDragHandle')
    ) {
      queueMicrotask(() => this.handleResize());
    }
    if (changed.has('value') && this.measured && !this.applyingValue) {
      const value = this.value;
      queueMicrotask(() => {
        if (value === 'expanded') void this.expand();
        else if (value === 'hidden' && this.hideable) void this.hide();
        else if (value === 'hidden') void this.moveTo(this.settledValue, this.spring('default-spatial', DEFAULT_SPATIAL));
        else if (this.settledValue === 'hidden') void this.show();
        else void this.partialExpand();
      });
    }
  }

  private observeSizes() {
    if (this.layer) this.resizeObserver?.observe(this.layer);
    if (this.sheet) this.resizeObserver?.observe(this.sheet);
    if (this.content) this.resizeObserver?.observe(this.content);
  }

  // Geometry -----------------------------------------------------------------

  private measure() {
    const layer = this.layer;
    const sheet = this.sheet;
    if (!layer || !sheet) return;
    this.fullHeight = layer.clientHeight;
    this.sheetHeight = sheet.offsetHeight;
    this.anchors = calculateStandardAnchors(
      this.fullHeight,
      this.sheetHeight,
      this.peekHeight,
      this.hideable,
    );
    this.measureBody();
  }

  private measureBody() {
    const body = this.body;
    if (!body) return;
    this.bodyOverflows = body.scrollHeight > body.clientHeight + 1;
  }

  /** Updates the anchors; the sheet stays at its value or the closest one left. */
  private handleResize() {
    if (!this.layer) return;
    this.measure();
    if (this.anchors.length === 0) return;
    const value = resolveValue(this.anchors, this.targetValue);
    const position = positionOf(this.anchors, value)!;
    if (this.pointer?.dragging) {
      this.offsetSpring.value = this.clampOffset(this.offsetSpring.value);
    } else if (!this.measured || (!this.frame && this.offsetSpring.atRest)) {
      this.offsetSpring.value = position;
      this.offsetSpring.target = position;
      this.targetValue = value;
      this.setSettled(value);
    } else {
      this.targetValue = value;
      this.offsetSpring.target = position;
    }
    this.measured = true;
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
    return this.quick || (!isServer && matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  /** Moves the sheet to a value on a spring, carrying `velocity`. */
  private moveTo(value: SheetValue, spec: SpringSpec, velocity = 0): Promise<void> {
    this.resolveWaiters();
    const position = positionOf(this.anchors, value);
    if (position === undefined) return Promise.resolve();
    this.targetValue = value;
    if (this.reduceMotion) {
      this.offsetSpring.value = position;
      this.offsetSpring.target = position;
      this.offsetSpring.velocity = 0;
      this.setSettled(value);
      this.paint();
      return Promise.resolve();
    }
    this.offsetSpring.spec = spec;
    this.offsetSpring.target = position;
    this.offsetSpring.velocity = velocity;
    // A hidden sheet is shown before it moves up.
    this.sheet?.classList.remove('at-rest-hidden');
    return new Promise<void>((resolve) => {
      this.waiters.push(resolve);
      this.startLoop();
    });
  }

  private setSettled(value: SheetValue) {
    const changed = value !== this.settledValue;
    this.settledValue = value;
    this.applyingValue = true;
    this.value = value;
    this.updateComplete.then(() => (this.applyingValue = false));
    if (changed && this.measured) {
      this.dispatchEvent(new Event('change', {bubbles: true}));
    }
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
    const ms = Math.min(now - this.lastTime, 64);
    this.lastTime = now;
    const dragging = !!this.pointer?.dragging;
    if (!dragging) this.offsetSpring.step(ms);
    this.paint();
    if (!dragging && !this.offsetSpring.atRest) {
      this.frame = requestAnimationFrame(this.tick);
    } else if (!dragging) {
      this.offsetSpring.value = this.offsetSpring.target;
      this.setSettled(this.targetValue);
      this.paint();
      this.resolveWaiters();
    }
  };

  private paint() {
    const sheet = this.sheet;
    if (!sheet || this.anchors.length === 0) return;
    const offset = this.offsetSpring.value;
    const minPosition = Math.min(...this.anchors.map((anchor) => anchor.position));
    const scale = overflowScale(offset, minPosition, this.sheetHeight);
    // verticalScaleUp / verticalScaleDown, as the modal sheet.
    sheet.style.transform =
      scale === 1 ? `translateY(${offset}px)` : `translateY(${offset}px) scaleY(${scale})`;
    if (this.content) this.content.style.transform = scale === 1 ? '' : `scaleY(${1 / scale})`;
  }

  // Drag handle --------------------------------------------------------------

  private handleDragHandleClick() {
    switch (this.settledValue) {
      case 'expanded':
        void (this.hideable ? this.hide() : this.partialExpand());
        break;
      case 'partially-expanded':
        void this.expand();
        break;
      default:
        void this.show();
        break;
    }
  }

  /** The drag handle's expand and collapse actions for the keyboard. */
  private handleDragHandleKeydown(event: KeyboardEvent) {
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (this.settledValue === 'hidden') void this.show();
      else void this.expand();
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (
        this.settledValue === 'expanded' &&
        positionOf(this.anchors, 'partially-expanded') !== undefined
      ) {
        void this.partialExpand();
      } else if (this.hideable) {
        void this.hide();
      }
    }
  }

  // Gestures -----------------------------------------------------------------

  private canStartDrag(event: PointerEvent) {
    if (this.noSwipe || !event.isPrimary || event.button !== 0) return false;
    const path = event.composedPath();
    const handle = this.dragHandle;
    const onHandle = !!handle && path.includes(handle);
    // An expanded sheet's scrolling content scrolls; the handle always drags.
    if (!onHandle && this.body && path.includes(this.body)) {
      if (this.bodyOverflows && this.settledValue === 'expanded') return false;
    }
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
      if (Math.abs(dx) > Math.abs(dy)) {
        this.pointer = undefined;
        return;
      }
      this.beginDrag(event);
    }
    const delta = event.clientY - pointer.lastY;
    pointer.lastY = event.clientY;
    this.offsetSpring.value = this.clampOffset(this.offsetSpring.value + delta);
    this.offsetSpring.target = this.offsetSpring.value;
    this.targetValue = closestAnchor(this.anchors, this.offsetSpring.value)?.value ?? this.targetValue;
    this.paint();
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
    this.resolveWaiters();
    this.offsetSpring.velocity = 0;
    this.offsetSpring.target = this.offsetSpring.value;
  }

  private handlePointerUp(event: PointerEvent) {
    this.endPointer(event, true);
  }

  private handlePointerCancel(event: PointerEvent) {
    this.endPointer(event, false);
  }

  /**
   * Lets go of the sheet: it goes to the anchor `computeTarget` picks, on the
   * default spatial spring with the pointer's velocity (the standard sheet's
   * AnchoredDraggableDefaults.flingBehavior; no dampening near the bottom).
   */
  private endPointer(event: PointerEvent, withVelocity: boolean) {
    const pointer = this.pointer;
    if (!pointer || pointer.id !== event.pointerId) return;
    this.pointer = undefined;
    this.sheet!.classList.remove('dragging');
    if (!pointer.dragging) return;
    this.suppressClick = true;
    const velocity = withVelocity ? pointer.tracker.velocity(event.timeStamp) : 0;
    const target = computeTarget(this.anchors, this.offsetSpring.value, velocity);
    void this.moveTo(target, this.spring('default-spatial', DEFAULT_SPATIAL), velocity);
  }

  private readonly handleClickCapture = (event: Event) => {
    if (!this.suppressClick) return;
    this.suppressClick = false;
    event.stopPropagation();
    event.preventDefault();
  };
}
