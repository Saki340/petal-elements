/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import '../../focus/md-focus-ring.js';

import {html, isServer, LitElement, nothing, PropertyValues} from 'lit';
import {customElement, property, query, state} from 'lit/decorators.js';
import {classMap} from 'lit/directives/class-map.js';
import {repeat} from 'lit/directives/repeat.js';

import {Spring, SpringSpec} from '../../internal/motion/spring.js';

import {styles} from './scroll-field-styles.cssresult.js';

declare global {
  interface HTMLElementTagNameMap {
    'petal-scroll-field': ScrollField;
  }
}

/** PageSize.Fixed(ScrollFieldDefaults.ScrollFieldHeight / 3). */
const PAGE_SIZE = 200 / 3;

/** The spring of PagerState.animateScrollToPage (the default spring()). */
const SCROLL_SPRING: SpringSpec = {dampingRatio: 1, stiffness: 1500};

/** The snap of PagerDefaults.flingBehavior (StiffnessMediumLow). */
const SNAP_SPRING: SpringSpec = {dampingRatio: 1, stiffness: 400};

/** A fling faster than this (px/s) goes to the next page its way. */
const FLING_VELOCITY = 400;

const TOUCH_SLOP = 8;

/** How much of a wheel's scrolling makes one step (one notch of a mouse). */
const WHEEL_STEP = 100;

/** After this long without wheel events, what was left over is dropped. */
const WHEEL_IDLE = 200;

/** A value in 0 to count - 1 for a page, which may be any integer. */
function wrap(page: number, count: number) {
  return ((page % count) + count) % count;
}

interface Drag {
  id: number;
  y: number;
  position: number;
  dragging: boolean;
  samples: Array<{y: number; t: number}>;
}

/**
 * A wheel of numbers that goes round without end, after Jetpack Compose
 * Material 3 (`ScrollField`). Internal to `petal-time-picker`.
 *
 * @fires input {Event} The value changed. --bubbles
 */
@customElement('petal-scroll-field')
export class ScrollField extends LitElement {
  static override styles = [styles];

  /** How many values the wheel has. */
  @property({type: Number}) count = 60;

  /** The selected value, from 0 to `count` - 1. */
  @property({type: Number}) value = 0;

  /** What the wheel selects, for assistive technology. */
  @property() label = '';

  @property({type: Boolean, reflect: true}) disabled = false;

  /** The text of a value. */
  @property({attribute: false}) format: (value: number) => string = String;

  /** How a value is read out. */
  @property({attribute: false}) describe: (value: number) => string = String;

  /** The closest whole page, which is the selected one. */
  @state() private page = 0;

  @query('.track') private readonly track!: HTMLElement | null;

  /** Where the wheel is, in pages. */
  private position = 0;
  private spring: Spring | null = null;
  private frame = 0;
  private drag: Drag | null = null;
  private wheelTotal = 0;
  private wheelTime = 0;

  override disconnectedCallback() {
    super.disconnectedCallback();
    if (this.spring) this.moveTo(this.spring.target);
    this.stop();
  }

  protected override willUpdate(changed: PropertyValues<this>) {
    if (changed.has('value') || changed.has('count')) {
      // From outside: straight there by the short way (calculateTargetPage).
      const current = wrap(this.page, this.count);
      const moving = this.spring !== null || this.drag?.dragging;
      if (this.value !== current && !moving) {
        this.page += this.value - current;
        this.position = this.page;
      }
    }
  }

  protected override render() {
    const selected = this.page;
    const pages = [selected - 2, selected - 1, selected, selected + 1, selected + 2];
    const value = wrap(selected, this.count);
    return html`<div
      class="wheel"
      role="spinbutton"
      tabindex=${this.disabled ? nothing : 0}
      aria-label=${this.label}
      aria-valuemin="0"
      aria-valuemax=${this.count - 1}
      aria-valuenow=${value}
      aria-valuetext=${this.describe(value)}
      aria-disabled=${this.disabled ? 'true' : nothing}
      @keydown=${this.handleKeydown}
      @wheel=${this.handleWheel}
      @pointerdown=${this.handlePointerDown}
      @pointermove=${this.handlePointerMove}
      @pointerup=${this.handlePointerUp}
      @pointercancel=${this.handlePointerUp}>
      <petal-focus-ring part="focus-ring" inward></petal-focus-ring>
      <div class="track" style=${`transform: translateY(${this.offset}px)`} aria-hidden="true">
        ${repeat(
          pages,
          (page) => page,
          (page) => html`<div
            class="item ${classMap({selected: page === selected})}"
            style=${`--_page: ${page}`}
            @click=${() => this.handleItemClick(page)}>
            ${this.format(wrap(page, this.count))}
          </div>`,
        )}
      </div>
    </div>`;
  }

  private get offset() {
    return -this.position * PAGE_SIZE;
  }

  // Moving.

  /** Puts the wheel somewhere; passing the middle of a page selects the next. */
  private moveTo(position: number) {
    this.position = position;
    if (this.track) this.track.style.transform = `translateY(${this.offset}px)`;
    const page = Math.round(position);
    if (page === this.page) return;
    this.page = page;
    const value = wrap(page, this.count);
    if (value === this.value) return;
    this.value = value;
    this.dispatchEvent(new Event('input', {bubbles: true}));
  }

  private stop() {
    if (isServer) return;
    cancelAnimationFrame(this.frame);
    this.spring = null;
  }

  /** Where the wheel will settle. */
  private get targetPage() {
    return this.spring ? this.spring.target : this.page;
  }

  private animateTo(page: number, spec: SpringSpec, velocity = 0) {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.stop();
      this.moveTo(page);
      return;
    }
    cancelAnimationFrame(this.frame);
    const spring = new Spring(spec, 0.001);
    spring.value = this.position;
    spring.velocity = velocity;
    spring.target = page;
    this.spring = spring;
    let last = performance.now();
    const frame = (now: number) => {
      spring.step(Math.min(now - last, 64));
      last = now;
      if (spring.atRest) {
        this.spring = null;
        this.moveTo(page);
        return;
      }
      this.moveTo(spring.value);
      this.frame = requestAnimationFrame(frame);
    };
    this.frame = requestAnimationFrame(frame);
  }

  // Input.

  private handleItemClick(page: number) {
    if (!this.disabled && page !== this.page) this.animateTo(page, SCROLL_SPRING);
  }

  private handleKeydown(event: KeyboardEvent) {
    if (this.disabled) return;
    const step = event.key === 'ArrowDown' ? 1 : event.key === 'ArrowUp' ? -1 : 0;
    if (step === 0) return;
    event.preventDefault();
    this.animateTo(this.targetPage + step, SCROLL_SPRING);
  }

  private handleWheel(event: WheelEvent) {
    if (this.disabled) return;
    event.preventDefault();
    if (event.timeStamp - this.wheelTime > WHEEL_IDLE) this.wheelTotal = 0;
    this.wheelTime = event.timeStamp;
    const unit = event.deltaMode === 1 ? 33 : event.deltaMode === 2 ? 100 : 1;
    this.wheelTotal += event.deltaY * unit;
    const steps = Math.trunc(this.wheelTotal / WHEEL_STEP);
    if (steps === 0) return;
    this.wheelTotal -= steps * WHEEL_STEP;
    this.animateTo(this.targetPage + steps, SCROLL_SPRING);
  }

  private handlePointerDown(event: PointerEvent) {
    if (this.disabled || !event.isPrimary || event.button !== 0 || this.drag) return;
    this.stop();
    this.drag = {
      id: event.pointerId,
      y: event.clientY,
      position: this.position,
      dragging: false,
      samples: [{y: event.clientY, t: event.timeStamp}],
    };
  }

  private handlePointerMove(event: PointerEvent) {
    const drag = this.drag;
    if (!drag || drag.id !== event.pointerId) return;
    const delta = event.clientY - drag.y;
    if (!drag.dragging) {
      if (Math.abs(delta) < TOUCH_SLOP) return;
      drag.dragging = true;
      try {
        (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
      } catch {
        // The pointer is gone.
      }
    }
    this.moveTo(drag.position - delta / PAGE_SIZE);
    drag.samples.push({y: event.clientY, t: event.timeStamp});
    if (drag.samples.length > 5) drag.samples.shift();
  }

  private handlePointerUp(event: PointerEvent) {
    const drag = this.drag;
    if (!drag || drag.id !== event.pointerId) return;
    this.drag = null;
    if (!drag.dragging) {
      // Stopped by the press, and let go without moving: back to a whole page.
      if (this.position !== Math.round(this.position)) {
        this.animateTo(Math.round(this.position), SNAP_SPRING);
      }
      return;
    }
    const [a, b] = [drag.samples[0], drag.samples[drag.samples.length - 1]];
    const velocity = b.t > a.t ? ((b.y - a.y) / (b.t - a.t)) * 1000 : 0;
    // PagerSnapDistance.atMost(1): a fling goes to the next page its way, and
    // a slow release to the closest (snapPositionalThreshold = 0.5).
    let target = Math.round(this.position);
    if (Math.abs(velocity) > FLING_VELOCITY) {
      target = velocity < 0 ? Math.ceil(this.position) : Math.floor(this.position);
    }
    this.animateTo(target, SNAP_SPRING, -velocity / PAGE_SIZE);
  }
}
