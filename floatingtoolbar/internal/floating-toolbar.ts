/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import '../../elevation/elevation.js';

import {html, isServer, LitElement, nothing, PropertyValues} from 'lit';
import {property, query, state} from 'lit/decorators.js';
import {classMap} from 'lit/directives/class-map.js';

import {ARIAMixinStrict} from '../../internal/aria/aria.js';
import {mixinDelegatesAria} from '../../internal/aria/delegate.js';
import {FAST_SPATIAL, Spring, springFromCss} from '../../internal/motion/spring.js';

/** Whether the toolbar lies along the x axis or the y axis. */
export type FloatingToolbarOrientation = 'horizontal' | 'vertical';

/**
 * The color scheme: Compose's `standardFloatingToolbarColors()` and
 * `vibrantFloatingToolbarColors()`.
 */
export type FloatingToolbarColors = 'standard' | 'vibrant';

/**
 * Where the floating action button sits: `start` or `end` of a horizontal
 * toolbar (`FloatingToolbarHorizontalFabPosition`), `top` or `bottom` of a
 * vertical one (`FloatingToolbarVerticalFabPosition`). `start` also means
 * `top`, and `end` means `bottom`, so one value fits both orientations.
 */
export type FloatingToolbarFabPosition = 'start' | 'end' | 'top' | 'bottom';

// Separate variable needed for closure.
const floatingToolbarBaseClass = mixinDelegatesAria(LitElement);

/** One frame at 60Hz, for the spring when the browser gives no time. */
const FRAME_MS = 1000 / 60;

/**
 * A Material 3 Expressive floating toolbar, after Jetpack Compose
 * (`HorizontalFloatingToolbar` and `VerticalFloatingToolbar`).
 *
 * The actions (icon buttons and the like) go in the default slot. Without a
 * floating action button, the `leading` and `trailing` slots hold actions that
 * show only while the toolbar is `expanded` (`leadingContent` and
 * `trailingContent`), and the default slot is always shown. An element in the
 * `fab` slot makes it the toolbar with a floating action button: the whole
 * toolbar collapses into the FAB, which grows from 56px to 80px.
 *
 * `expanded` is a state the page owns, as in Compose: the toolbar does not
 * react to scrolling by itself.
 *
 * Accessibility: the actions are a `toolbar` (`aria-orientation` follows
 * `orientation`; name it with `aria-label`). The arrow keys (along the
 * orientation), Home and End move focus between the actions; every action
 * stays in the tab order. The actions that a collapsed toolbar hides are
 * `inert`.
 */
export class FloatingToolbar extends floatingToolbarBaseClass {
  /** `horizontal` (a row) or `vertical` (a column). */
  @property({reflect: true}) orientation: FloatingToolbarOrientation = 'horizontal';

  /**
   * Whether the toolbar is expanded. Collapsed, a toolbar with a FAB shows only
   * the FAB and one without shows only the default slot.
   */
  @property({type: Boolean, reflect: true}) expanded = false;

  /** `standard` (the default) or `vibrant`. */
  @property({reflect: true}) colors: FloatingToolbarColors = 'standard';

  /**
   * Where the FAB sits, when there is one. `end` (the default; `bottom` when
   * vertical) or `start` (`top` when vertical).
   */
  @property({attribute: 'fab-position', reflect: true})
  fabPosition: FloatingToolbarFabPosition = 'end';

  /** There is a `fab` slot with something in it. */
  @state() private hasFab = false;

  /** The expand or collapse animation is running. */
  @state() private moving = false;

  @query('.root') private readonly rootEl!: HTMLElement | null;
  @query('.toolbar') private readonly toolbarEl!: HTMLElement | null;
  @query('.leading-inner') private readonly leadingEl!: HTMLElement | null;
  @query('.trailing-inner') private readonly trailingEl!: HTMLElement | null;

  /** 0 is collapsed and 1 expanded; the spring may overshoot. */
  private readonly progress = new Spring(FAST_SPATIAL);
  private frame = 0;
  private lastTime: number | undefined;
  private resizeObserver?: ResizeObserver;
  private ready = false;

  override connectedCallback() {
    super.connectedCallback();
    // Sized right in the first render.
    this.hasFab = this.querySelector(':scope > [slot="fab"]') !== null;
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.stop();
    this.resizeObserver?.disconnect();
    this.resizeObserver = undefined;
  }

  protected override render() {
    const vertical = this.orientation === 'vertical';
    const fabFirst = this.fabPosition === 'start' || this.fabPosition === 'top';
    const classes = {
      'horizontal': !vertical,
      'vertical': vertical,
      'with-fab': this.hasFab,
      'fab-first': fabFirst,
      // The hidden parts are also hidden from focus and assistive technology
      // once they are collapsed.
      'rest-collapsed': !this.expanded && !this.moving,
    };
    const hidden = !this.expanded;
    const {ariaLabel} = this as ARIAMixinStrict;
    return html`
      <div class="root ${classMap(classes)}">
        <div class="toolbar-box">
          <petal-elevation></petal-elevation>
          <div class="surface">
            <div
              class="toolbar"
              role="toolbar"
              aria-orientation=${vertical ? 'vertical' : 'horizontal'}
              aria-label=${ariaLabel || nothing}
              ?inert=${this.hasFab && hidden}
              @keydown=${this.handleKeydown}>
              ${this.hasFab
                ? nothing
                : html`<div class="end leading" ?inert=${hidden}>
                    <div class="leading-inner">
                      <slot name="leading" @slotchange=${this.measure}></slot>
                    </div>
                  </div>`}
              <div class="items">
                <slot @slotchange=${this.measure}></slot>
              </div>
              ${this.hasFab
                ? nothing
                : html`<div class="end trailing" ?inert=${hidden}>
                    <div class="trailing-inner">
                      <slot name="trailing" @slotchange=${this.measure}></slot>
                    </div>
                  </div>`}
            </div>
          </div>
        </div>
        <div class="fab">
          <slot name="fab" @slotchange=${this.handleFabSlotChange}></slot>
        </div>
      </div>
    `;
  }

  protected override updated(changed: PropertyValues<this>) {
    if (isServer) return;
    this.observeSizes();
    this.measure();
    if (!this.ready) {
      this.ready = true;
      this.jumpTo(this.expanded ? 1 : 0);
    } else if (changed.has('expanded')) {
      this.animateTo(this.expanded ? 1 : 0);
    } else {
      this.paint();
    }
  }

  // Layout -------------------------------------------------------------------

  /** Measure again when the actions change size. */
  private observeSizes() {
    if (typeof ResizeObserver === 'undefined') return;
    this.resizeObserver ??= new ResizeObserver(() => this.measure());
    this.resizeObserver.disconnect();
    for (const element of [this.toolbarEl, this.leadingEl, this.trailingEl]) {
      if (element) this.resizeObserver.observe(element);
    }
  }

  /**
   * Reads the size of the content at full expansion (Compose's
   * `maxIntrinsicWidth` and `maxIntrinsicHeight`). The CSS scales it with the
   * progress.
   */
  private readonly measure = () => {
    const root = this.rootEl;
    if (!root) return;
    const vertical = this.orientation === 'vertical';
    const size = (element: HTMLElement | null) =>
      element ? (vertical ? element.offsetHeight : element.offsetWidth) : 0;
    root.style.setProperty('--_natural', `${size(this.toolbarEl)}px`);
    root.style.setProperty('--_leading-natural', `${size(this.leadingEl)}px`);
    root.style.setProperty('--_trailing-natural', `${size(this.trailingEl)}px`);
  };

  private handleFabSlotChange(event: Event) {
    const slot = event.target as HTMLSlotElement;
    this.hasFab = slot.assignedElements().length > 0;
  }

  // Motion -------------------------------------------------------------------

  /**
   * Compose animates the size with `FloatingToolbarDefaults.animationSpec()`:
   * `MotionSchemeKeyTokens.FastSpatial`, a spring. The FAB size, the toolbar
   * size and the elevation all follow the same progress.
   */
  private animateTo(target: number) {
    this.progress.target = target;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.jumpTo(target);
      return;
    }
    this.progress.spec = springFromCss(this, 'fast-spatial', FAST_SPATIAL);
    if (this.frame) return;
    this.moving = true;
    this.lastTime = undefined;
    this.frame = requestAnimationFrame(this.tick);
  }

  private jumpTo(value: number) {
    this.stop();
    this.progress.value = value;
    this.progress.target = value;
    this.progress.velocity = 0;
    this.paint();
  }

  private stop() {
    if (this.frame) cancelAnimationFrame(this.frame);
    this.frame = 0;
    this.moving = false;
  }

  private readonly tick = (time?: number) => {
    this.frame = 0;
    const elapsed =
      typeof time === 'number' && this.lastTime !== undefined ? time - this.lastTime : FRAME_MS;
    this.lastTime = typeof time === 'number' ? time : undefined;
    this.progress.step(Math.min(Math.max(elapsed, 0), 64));
    if (this.progress.atRest) {
      this.jumpTo(this.progress.target);
      return;
    }
    this.paint();
    this.frame = requestAnimationFrame(this.tick);
  };

  private paint() {
    this.rootEl?.style.setProperty('--_p', String(this.progress.value));
  }

  // Keyboard -----------------------------------------------------------------

  /** The actions that arrow keys visit, in order. */
  private actions() {
    const slots = this.renderRoot.querySelectorAll<HTMLSlotElement>(
      '.toolbar slot:not([name="fab"])',
    );
    const actions: HTMLElement[] = [];
    for (const slot of slots) {
      if (slot.closest('[inert]')) continue;
      for (const element of slot.assignedElements({flatten: true})) {
        const action = element as HTMLElement;
        if (!action.hidden && !action.hasAttribute('disabled')) actions.push(action);
      }
    }
    return actions;
  }

  private handleKeydown(event: KeyboardEvent) {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
    const vertical = this.orientation === 'vertical';
    const rtl = getComputedStyle(this).direction === 'rtl';
    let step = 0;
    let edge: 'first' | 'last' | undefined;
    switch (event.key) {
      case 'ArrowRight':
        if (!vertical) step = rtl ? -1 : 1;
        break;
      case 'ArrowLeft':
        if (!vertical) step = rtl ? 1 : -1;
        break;
      case 'ArrowDown':
        if (vertical) step = 1;
        break;
      case 'ArrowUp':
        if (vertical) step = -1;
        break;
      case 'Home':
        edge = 'first';
        break;
      case 'End':
        edge = 'last';
        break;
    }
    if (!step && !edge) return;

    // Text fields use these keys themselves.
    const target = event.composedPath()[0];
    if (
      target instanceof HTMLElement &&
      (target.isContentEditable || /^(input|textarea|select)$/i.test(target.localName))
    ) {
      return;
    }

    const actions = this.actions();
    const current = actions.findIndex((action) => action.matches(':focus-within'));
    if (current === -1 || actions.length < 2) return;

    // Skip actions that cannot take focus.
    const order = edge
      ? actions.map((_, i) => (edge === 'first' ? i : actions.length - 1 - i))
      : Array.from({length: actions.length - 1}, (_, i) => {
          return (current + step * (i + 1) + actions.length * actions.length) % actions.length;
        });
    for (const index of order) {
      actions[index].focus();
      if (actions[index].matches(':focus-within')) {
        event.preventDefault();
        return;
      }
    }
  }
}
