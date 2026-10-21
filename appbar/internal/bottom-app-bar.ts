/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import {html, isServer, LitElement, PropertyValues} from 'lit';
import {property, queryAssignedElements, state} from 'lit/decorators.js';
import {classMap} from 'lit/directives/class-map.js';

import {FAST_SPATIAL, Spring, springFromCss} from '../../internal/motion/spring.js';

/** How long without scroll events ends a scroll, for browsers without `scrollend`. */
const SCROLL_END_DELAY = 150;

/** How far a pointer moves before it drags the bar (Android's touch slop). */
const TOUCH_SLOP = 8;

/**
 * A bottom app bar, after Jetpack Compose Material 3 (`BottomAppBar` and
 * `FlexibleBottomAppBar` in AppBar.kt, `BottomAppBarTokens`,
 * `DockedToolbarTokens`): actions at the start and a floating action button
 * at the end, or with `flexible`, a lower bar with its content spread out.
 *
 * With `hide-on-scroll`, the bar slides away as the page scrolls down and
 * comes back as it scrolls up (`BottomAppBarDefaults.exitAlwaysScrollBehavior`).
 *
 * @fires hide-change {Event} The hidden fraction changed.
 *
 * @slot - The actions: icon buttons, at the start (spread out when `flexible`).
 * @slot fab - A floating action button at the end (not with `flexible`).
 */
export class BottomAppBar extends LitElement {
  /**
   * The Material 3 Expressive flexible bottom app bar: 64px high, its content
   * spread with 16px at the ends, and no floating action button slot.
   */
  @property({type: Boolean, reflect: true}) flexible = false;

  /** Slides the bar away while the page scrolls down. */
  @property({type: Boolean, attribute: 'hide-on-scroll'}) hideOnScroll = false;

  /**
   * The id of the scrolling element under the bar. Without it, the page
   * scrolls.
   */
  @property({attribute: 'scroll-target'}) scrollTarget = '';

  @queryAssignedElements({slot: 'fab'}) private readonly fabElements!: HTMLElement[];
  @state() private hasFab = false;

  /** How much of the bar is hidden: 0 shown, 1 hidden (`collapsedFraction`). */
  get hiddenFraction() {
    const height = this.barHeight();
    return height > 0 ? Math.min(1, Math.max(0, -this.offset / height)) : 0;
  }

  /** Shows the bar again, sliding. */
  show() {
    this.settleTo(0);
  }

  // The height offset, from 0 (shown) to minus the bar's height (hidden).
  private offset = 0;
  private scroller: EventTarget | null = null;
  private lastScroll = 0;
  private scrollEndTimer = 0;
  private readonly spring = new Spring(FAST_SPATIAL, 0.5);
  private frame = 0;
  private lastTime = 0;
  private pointer: {id: number; startY: number; lastY: number; dragging: boolean} | null = null;

  override connectedCallback() {
    super.connectedCallback();
    if (isServer) return;
    queueMicrotask(() => this.listen());
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.unlisten();
    if (isServer) return;
    cancelAnimationFrame(this.frame);
    this.frame = 0;
  }

  protected override render() {
    return html`<div
      class="bar ${classMap({'has-fab': this.hasFab})}"
      part="container"
      @pointerdown=${this.handlePointerDown}
      @pointermove=${this.handlePointerMove}
      @pointerup=${this.handlePointerUp}
      @pointercancel=${this.handlePointerUp}>
      <div class="actions"><slot></slot></div>
      <div class="fab"><slot name="fab" @slotchange=${this.handleFabChange}></slot></div>
    </div>`;
  }

  protected override updated(changed: PropertyValues<this>) {
    if ((changed.has('scrollTarget') || changed.has('hideOnScroll')) && this.isConnected) {
      this.unlisten();
      this.listen();
      if (!this.hideOnScroll) this.setOffset(0);
    }
  }

  private handleFabChange() {
    this.hasFab = this.fabElements.length > 0;
  }

  private barHeight() {
    return isServer ? 0 : this.getBoundingClientRect().height;
  }

  // Scrolling (ExitAlwaysScrollBehavior) --------------------------------------

  private listen() {
    if (this.scroller || !this.isConnected || !this.hideOnScroll) return;
    const root = this.getRootNode() as Document | ShadowRoot;
    this.scroller = (this.scrollTarget && root.getElementById?.(this.scrollTarget)) || window;
    this.lastScroll = this.scrollPosition();
    this.scroller.addEventListener('scroll', this.onScroll, {passive: true});
    this.scroller.addEventListener('scrollend', this.onScrollEnd);
  }

  private unlisten() {
    this.scroller?.removeEventListener('scroll', this.onScroll);
    this.scroller?.removeEventListener('scrollend', this.onScrollEnd);
    this.scroller = null;
    if (!isServer) clearTimeout(this.scrollEndTimer);
  }

  private scrollPosition() {
    return this.scroller === window
      ? window.scrollY
      : ((this.scroller as HTMLElement | null)?.scrollTop ?? 0);
  }

  // onPostScroll: the bar moves by what the content scrolled.
  private readonly onScroll = () => {
    const top = this.scrollPosition();
    const delta = top - this.lastScroll;
    this.lastScroll = top;
    if (this.pointer?.dragging) return;
    this.stopSpring();
    this.setOffset(this.offset - delta);
    clearTimeout(this.scrollEndTimer);
    this.scrollEndTimer = window.setTimeout(this.onScrollEnd, SCROLL_END_DELAY);
  };

  // settleAppBarBottom: a bar left part way goes to the closer end on the fast
  // spatial spring. (The fling's decay is the browser's own scrolling.)
  private readonly onScrollEnd = () => {
    clearTimeout(this.scrollEndTimer);
    this.settle();
  };

  private settle() {
    const fraction = this.hiddenFraction;
    if (fraction < 0.01 || fraction === 1) return;
    this.settleTo(fraction < 0.5 ? 0 : -this.barHeight());
  }

  private settleTo(target: number) {
    if (target === this.offset) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.setOffset(target);
      return;
    }
    this.spring.spec = springFromCss(this, 'fast-spatial', FAST_SPATIAL);
    this.spring.value = this.offset;
    this.spring.target = target;
    if (this.frame) return;
    this.lastTime = performance.now();
    this.frame = requestAnimationFrame(this.tick);
  }

  private readonly tick = (now: number) => {
    this.frame = 0;
    this.spring.step(Math.min(now - this.lastTime, 64));
    this.lastTime = now;
    // At rest, exactly at the target.
    this.setOffset(this.spring.atRest ? this.spring.target : this.spring.value);
    if (!this.spring.atRest) this.frame = requestAnimationFrame(this.tick);
  };

  private stopSpring() {
    cancelAnimationFrame(this.frame);
    this.frame = 0;
  }

  /** Moves the bar; the offset stays between shown and hidden. */
  private setOffset(offset: number) {
    const height = this.barHeight();
    const clamped = Math.max(-height, Math.min(0, offset));
    if (clamped === this.offset) return;
    this.offset = clamped;
    this.style.setProperty('--_offset', `${-clamped}px`);
    this.toggleAttribute('hidden-by-scroll', height > 0 && clamped <= -height);
    this.dispatchEvent(new Event('hide-change'));
  }

  // Dragging the bar (appBarDragModifier) -------------------------------------

  private handlePointerDown(event: PointerEvent) {
    if (!this.hideOnScroll || !event.isPrimary || event.pointerType === 'mouse') return;
    this.pointer = {id: event.pointerId, startY: event.clientY, lastY: event.clientY, dragging: false};
  }

  private handlePointerMove(event: PointerEvent) {
    const pointer = this.pointer;
    if (!pointer || pointer.id !== event.pointerId) return;
    if (!pointer.dragging) {
      if (Math.abs(event.clientY - pointer.startY) < TOUCH_SLOP) return;
      pointer.dragging = true;
      pointer.lastY = event.clientY;
      this.stopSpring();
      try {
        (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
      } catch {
        // The pointer is gone.
      }
    }
    // Dragging down hides the bar (heightOffset -= delta).
    this.setOffset(this.offset - (event.clientY - pointer.lastY));
    pointer.lastY = event.clientY;
  }

  private handlePointerUp(event: PointerEvent) {
    const pointer = this.pointer;
    if (!pointer || pointer.id !== event.pointerId) return;
    this.pointer = null;
    if (pointer.dragging) this.settle();
  }
}
