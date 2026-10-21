/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import {html, isServer, LitElement, nothing, PropertyValues} from 'lit';
import {property, query, queryAssignedElements} from 'lit/decorators.js';

import {ARIAMixinStrict} from '../../internal/aria/aria.js';
import {mixinDelegatesAria} from '../../internal/aria/delegate.js';
import {Spring, SpringSpec, springFromCss} from '../../internal/motion/spring.js';
import {ITEM_SELECTED_EVENT} from '../../internal/navigation/navigation-item.js';
import {VelocityTracker} from '../../sheet/internal/sheet-physics.js';

/**
 * How the drawer shows: `modal` over the page with a scrim, `dismissible`
 * beside the content, which it pushes aside, or `standard`, always shown
 * (Compose's ModalNavigationDrawer, DismissibleNavigationDrawer and
 * PermanentNavigationDrawer).
 */
export type NavigationDrawerType = 'modal' | 'dismissible' | 'standard';

// ExpressiveMotionTokens (the default scheme), the fallbacks when the page has
// no `--md-sys-motion-spring-*` properties.

/** MotionSchemeKeyTokens.DefaultSpatial: opens the drawer and settles drags. */
const DEFAULT_SPATIAL: SpringSpec = {dampingRatio: 0.8, stiffness: 380};

/** MotionSchemeKeyTokens.FastEffects: closes the drawer. */
const FAST_EFFECTS: SpringSpec = {dampingRatio: 1, stiffness: 3800};

/** DrawerPositionalThreshold: past half of the way, a drag settles there. */
const POSITIONAL_THRESHOLD = 0.5;

/** DrawerVelocityThreshold, 400dp/s: a faster drag settles in its direction. */
const VELOCITY_THRESHOLD = 400;

/** Android's touch slop, 8dp, before a pointer drags the drawer. */
const TOUCH_SLOP = 8;

// Separate variable needed for closure.
const navigationDrawerBaseClass = mixinDelegatesAria(LitElement);

/**
 * A navigation drawer, after Jetpack Compose Material 3 (NavigationDrawer.kt:
 * `ModalNavigationDrawer`, `DismissibleNavigationDrawer`,
 * `PermanentNavigationDrawer` and their drawer sheets).
 *
 * The items and anything else (headlines, dividers) go in the default slot.
 * A modal drawer opens over the page with a scrim; clicking the scrim,
 * pressing Escape or dragging the drawer toward its edge closes it. A
 * dismissible drawer sits beside the page content in a row and pushes it
 * aside as it opens. A standard drawer is always shown.
 *
 * @fires open {Event} Dispatched when the drawer is opening, before any
 * animations. Cancelable.
 * @fires opened {Event} Dispatched when the drawer has opened, after any
 * animations.
 * @fires close {Event} Dispatched when the drawer is closing, before any
 * animations. Cancelable.
 * @fires closed {Event} Dispatched when the drawer has closed, after any
 * animations.
 * @fires change {Event} Dispatched when the user selects an item. Cancelable.
 *
 * @slot - The drawer's content: `petal-navigation-drawer-item`s, headings and
 *     `petal-divider`s.
 */
export class NavigationDrawer extends navigationDrawerBaseClass {
  /** How the drawer shows. */
  @property({reflect: true}) type: NavigationDrawerType = 'modal';

  /**
   * Opens the drawer when set to `true` and closes it when set to `false`. A
   * standard drawer is always shown.
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
      // Open from the start, like rememberDrawerState(DrawerValue.Open): shown
      // at once, without taking the focus.
      if (!this.hasUpdated) this.openAtStart = true;
      void this.show();
    } else {
      void this.close();
    }
  }

  /** Opens and closes without animations. */
  @property({type: Boolean}) quick = false;

  /** The items, in the default slot. */
  @queryAssignedElements({flatten: true, selector: '[petal-navigation-drawer-item]'})
  readonly items!: HTMLElement[];

  @query('dialog') private readonly dialog!: HTMLDialogElement | null;
  @query('.scrim') private readonly scrim!: HTMLElement | null;
  @query('.sheet') private readonly sheet!: HTMLElement | null;
  @query('.content') private readonly content!: HTMLElement | null;

  private isOpen = false;
  private openAtStart = false;
  // getIsConnectedPromise() immediately sets the resolve property.
  private isConnectedPromiseResolve!: () => void;
  private isConnectedPromise = this.getIsConnectedPromise();

  // The offset is the distance the drawer is moved toward its edge: the
  // negative of its width when closed, 0 when open (Compose's
  // DrawerState.currentOffset).
  private width = 0;
  private readonly offsetSpring = new Spring(DEFAULT_SPATIAL);
  private targetOpen = false;
  private frame = 0;
  private lastTime = 0;
  private waiters: Array<() => void> = [];
  private closing?: Promise<void>;

  private pointer?: {
    id: number;
    startX: number;
    startY: number;
    startOffset: number;
    dragging: boolean;
    tracker: VelocityTracker;
  };
  private suppressClick = false;

  constructor() {
    super();
    if (isServer) return;
    this.addEventListener('click', this.onItemClick);
    this.addEventListener(ITEM_SELECTED_EVENT, this.onItemSelected);
  }

  /**
   * Opens the drawer and fires a cancelable `open` event. After the
   * animation, an `opened` event is fired.
   *
   * @return A Promise that resolves after the animation is finished.
   */
  async show() {
    await this.isConnectedPromise;
    await this.updateComplete;
    await this.closing;
    if (this.type === 'standard' || this.targetOpen) return;
    if (!this.dispatchEvent(new Event('open', {cancelable: true}))) {
      this.markOpen(false);
      return;
    }
    this.markOpen(true);
    this.targetOpen = true;
    if (this.type === 'modal') {
      this.showScrim();
      this.dialog?.showModal();
    }
    this.measure();
    if (this.openAtStart) {
      this.openAtStart = false;
      this.jump(0);
      this.dispatchEvent(new Event('opened'));
      return;
    }
    if (!this.moving) this.jump(-this.width);
    this.toggleAttribute('moving', true);
    // ModalNavigationDrawer and DismissibleNavigationDrawer: keyboard focus
    // goes to the drawer's first element. (showModal() would focus the
    // scrolling content instead: the items are slotted.)
    this.focusFirst();
    await this.animateTo(0, this.spring('default-spatial', DEFAULT_SPATIAL));
    if (!this.targetOpen) return;
    this.toggleAttribute('moving', false);
    this.dispatchEvent(new Event('opened'));
  }

  /**
   * Closes the drawer and fires a cancelable `close` event. After the
   * animation, a `closed` event is fired.
   *
   * @return A Promise that resolves after the animation is finished.
   */
  async close(velocity = 0) {
    if (!this.isConnected) {
      this.markOpen(false);
      return;
    }
    await this.updateComplete;
    if (this.type === 'standard' || !this.targetOpen) {
      this.markOpen(false);
      return;
    }
    if (this.closing) return this.closing;
    if (!this.dispatchEvent(new Event('close', {cancelable: true}))) {
      this.markOpen(true);
      // A drag that let go springs back.
      void this.animateTo(0, this.spring('default-spatial', DEFAULT_SPATIAL));
      return;
    }
    this.markOpen(false);
    this.targetOpen = false;
    this.toggleAttribute('moving', true);
    const closing = (async () => {
      // DrawerState.close(): the fast effects spring.
      await this.animateTo(-this.width, this.spring('fast-effects', FAST_EFFECTS), velocity);
      if (this.targetOpen) return;
      this.dialog?.close();
      this.hideScrim();
      this.toggleAttribute('moving', false);
      this.clearPaint();
      this.dispatchEvent(new Event('closed'));
    })();
    this.closing = closing;
    try {
      await closing;
    } finally {
      this.closing = undefined;
    }
  }

  override connectedCallback() {
    super.connectedCallback();
    this.isConnectedPromiseResolve();
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.isConnectedPromise = this.getIsConnectedPromise();
    cancelAnimationFrame(this.frame);
    this.frame = 0;
  }

  protected override render() {
    const {ariaLabel} = this as ARIAMixinStrict;
    // Compose's NavigationMenu pane title.
    const label = ariaLabel || 'Navigation menu';
    const sheet = html`<nav
      class="sheet"
      aria-label=${this.type === 'modal' ? nothing : label}
      @pointerdown=${this.handlePointerDown}
      @pointermove=${this.handlePointerMove}
      @pointerup=${this.handlePointerUp}
      @pointercancel=${this.handlePointerCancel}
      @keydown=${this.handleKeydown}>
      <div class="content"><slot></slot></div>
    </nav>`;
    if (this.type !== 'modal') return sheet;
    return html`
      <div class="scrim" popover="manual"></div>
      <dialog
        aria-label=${label}
        @cancel=${this.handleCancel}
        @click=${this.handleDialogClick}
        @close=${this.handleNativeClose}
        @pointerdown=${this.handlePointerDown}
        @pointermove=${this.handlePointerMove}
        @pointerup=${this.handlePointerUp}
        @pointercancel=${this.handlePointerCancel}>
        ${sheet}
      </dialog>
    `;
  }

  protected override updated(changed: PropertyValues<this>) {
    if (changed.has('type') && changed.get('type') !== undefined) {
      // Start over in the new form, closed.
      cancelAnimationFrame(this.frame);
      this.frame = 0;
      this.resolveWaiters();
      this.targetOpen = false;
      this.markOpen(false);
      this.toggleAttribute('moving', false);
      this.hideScrim();
      this.clearPaint();
    }
  }

  /** Sets `open` without showing or closing the drawer. */
  private markOpen(open: boolean) {
    if (this.isOpen === open) return;
    this.isOpen = open;
    this.toggleAttribute('open', open);
    this.requestUpdate('open', !open);
  }

  private measure() {
    this.width = this.sheet?.offsetWidth ?? 0;
  }

  private focusFirst() {
    const first = this.items.find((item) => !item.hasAttribute('disabled'));
    first?.focus();
  }

  // Motion -------------------------------------------------------------------

  private spring(name: string, fallback: SpringSpec) {
    return springFromCss(this, name, fallback);
  }

  private get reduceMotion() {
    return this.quick || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  }

  private get moving() {
    return this.hasAttribute('moving');
  }

  private jump(offset: number) {
    this.offsetSpring.value = offset;
    this.offsetSpring.target = offset;
    this.offsetSpring.velocity = 0;
    this.paint();
  }

  /**
   * Moves the drawer to an offset on a spring, carrying `velocity`. Resolves
   * when it rests, or when another move takes over.
   */
  private animateTo(offset: number, spec: SpringSpec, velocity = 0): Promise<void> {
    this.resolveWaiters();
    if (this.reduceMotion) {
      this.jump(offset);
      return Promise.resolve();
    }
    this.offsetSpring.spec = spec;
    this.offsetSpring.target = offset;
    this.offsetSpring.velocity = velocity;
    return new Promise<void>((resolve) => {
      this.waiters.push(resolve);
      this.startLoop();
    });
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
    if (this.pointer?.dragging) return;
    const now = performance.now();
    // At most a few frames' worth, so a background tab does not jump.
    const ms = Math.min(now - this.lastTime, 64);
    this.lastTime = now;
    this.offsetSpring.step(ms);
    this.paint();
    if (!this.offsetSpring.atRest) {
      this.frame = requestAnimationFrame(this.tick);
    } else {
      this.offsetSpring.value = this.offsetSpring.target;
      this.paint();
      this.resolveWaiters();
    }
  };

  /**
   * Writes the offset to the elements: a modal drawer moves over the page and
   * the scrim follows how far it is open; a dismissible one moves with the
   * content beside it. When the spring overshoots past open, the surface
   * scales up from its far side so no gap shows at the edge, and the content
   * scales back down (horizontalScaleUp, horizontalScaleDown).
   */
  private paint() {
    const sheet = this.sheet;
    if (!sheet || !this.width) return;
    const offset = this.offsetSpring.value;
    const rtl = getComputedStyle(this).direction === 'rtl';
    const scale = offset > 0 ? 1 + offset / this.width : 1;
    const transforms = [];
    if (this.type === 'modal') transforms.push(`translateX(${rtl ? -offset : offset}px)`);
    if (scale !== 1) transforms.push(`scaleX(${scale})`);
    sheet.style.transform = transforms.join(' ');
    if (this.content) this.content.style.transform = scale === 1 ? '' : `scaleX(${1 / scale})`;
    if (this.type === 'dismissible') {
      this.style.marginInlineStart = `${offset}px`;
    }
    const fraction = Math.max(0, Math.min(1, (offset + this.width) / this.width));
    this.scrim?.style.setProperty('--_scrim-alpha', String(fraction));
  }

  /** Back to the styles of the resting state. */
  private clearPaint() {
    if (this.sheet) this.sheet.style.transform = '';
    if (this.content) this.content.style.transform = '';
    this.style.removeProperty('margin-inline-start');
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

  // Dismissing ---------------------------------------------------------------

  private handleCancel(event: Event) {
    if (event.target !== this.dialog) return;
    // The drawer animates away before the dialog closes.
    event.preventDefault();
    void this.close();
  }

  private handleDialogClick(event: Event) {
    if (this.suppressClick) {
      this.suppressClick = false;
      return;
    }
    // A click on the dialog itself landed outside the drawer: on the scrim.
    if (event.target !== this.dialog) return;
    void this.close();
  }

  /** The native dialog can close on its own, e.g. when it is removed. */
  private handleNativeClose() {
    if (this.dialog?.open) return;
    this.hideScrim();
    if (this.targetOpen && !this.closing) {
      this.targetOpen = false;
      this.markOpen(false);
      this.toggleAttribute('moving', false);
      this.clearPaint();
    }
  }

  /** A dismissible drawer closes with Escape too. */
  private handleKeydown(event: KeyboardEvent) {
    if (this.type !== 'dismissible' || event.key !== 'Escape' || !this.targetOpen) return;
    event.preventDefault();
    void this.close();
  }

  // Dragging a modal drawer ----------------------------------------------------

  private handlePointerDown(event: PointerEvent) {
    if (this.type !== 'modal' || !this.targetOpen || this.closing) return;
    if (event.button !== 0 || this.pointer) return;
    event.stopPropagation();
    const tracker = new VelocityTracker();
    tracker.addPosition(event.timeStamp, event.clientX);
    this.pointer = {
      id: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startOffset: this.offsetSpring.value,
      dragging: false,
      tracker,
    };
  }

  private handlePointerMove(event: PointerEvent) {
    const pointer = this.pointer;
    if (!pointer || event.pointerId !== pointer.id) return;
    event.stopPropagation();
    const rtl = getComputedStyle(this).direction === 'rtl';
    const dx = (event.clientX - pointer.startX) * (rtl ? -1 : 1);
    if (!pointer.dragging) {
      const dy = event.clientY - pointer.startY;
      if (Math.abs(dx) < TOUCH_SLOP || Math.abs(dx) < Math.abs(dy)) return;
      pointer.dragging = true;
      (event.currentTarget as Element).setPointerCapture?.(event.pointerId);
      cancelAnimationFrame(this.frame);
      this.frame = 0;
    }
    pointer.tracker.addPosition(event.timeStamp, event.clientX * (rtl ? -1 : 1));
    // AnchoredDraggableState keeps the offset between its anchors.
    this.jump(Math.max(-this.width, Math.min(0, pointer.startOffset + dx)));
  }

  private handlePointerUp(event: PointerEvent) {
    const pointer = this.pointer;
    if (!pointer || event.pointerId !== pointer.id) return;
    event.stopPropagation();
    this.pointer = undefined;
    if (!pointer.dragging) return;
    // The click that ends a drag must not close or select anything.
    this.suppressClick = true;
    setTimeout(() => (this.suppressClick = false));
    const velocity = pointer.tracker.velocity(event.timeStamp);
    const offset = this.offsetSpring.value;
    // AnchoredDraggable: a fast drag settles in its direction; otherwise past
    // half of the way from where it started.
    let open: boolean;
    if (Math.abs(velocity) >= VELOCITY_THRESHOLD) {
      open = velocity > 0;
    } else {
      open = offset > -this.width * POSITIONAL_THRESHOLD;
    }
    if (open) {
      void this.animateTo(0, this.spring('default-spatial', DEFAULT_SPATIAL), velocity);
    } else {
      void this.close(velocity);
    }
  }

  private handlePointerCancel(event: PointerEvent) {
    const pointer = this.pointer;
    if (!pointer || event.pointerId !== pointer.id) return;
    this.pointer = undefined;
    if (pointer.dragging) {
      void this.animateTo(0, this.spring('default-spatial', DEFAULT_SPATIAL));
    }
  }

  // Items --------------------------------------------------------------------

  private itemOf(event: Event) {
    const path = event.composedPath();
    return this.items.find((item) => path.includes(item)) ?? null;
  }

  private readonly onItemClick = async (event: Event) => {
    const item = this.itemOf(event) as (HTMLElement & {selected: boolean}) | null;
    // Allow the event to bubble, so it can be canceled.
    await 0;
    if (!item || item.hasAttribute('disabled') || item.selected || event.defaultPrevented) {
      return;
    }
    const items = this.items as Array<HTMLElement & {selected: boolean}>;
    const previous = items.find((other) => other.selected) ?? null;
    for (const other of items) other.selected = other === item;
    const canceled = !this.dispatchEvent(new Event('change', {bubbles: true, cancelable: true}));
    if (canceled) {
      for (const other of items) other.selected = other === previous;
    }
  };

  // An item set to selected from outside deselects the others.
  private readonly onItemSelected = (event: Event) => {
    const item = this.itemOf(event) as (HTMLElement & {selected: boolean}) | null;
    if (!item?.selected) return;
    for (const other of this.items as Array<HTMLElement & {selected: boolean}>) {
      if (other !== item && other.selected) other.selected = false;
    }
  };

  private getIsConnectedPromise() {
    return new Promise<void>((resolve) => {
      this.isConnectedPromiseResolve = resolve;
    });
  }
}
