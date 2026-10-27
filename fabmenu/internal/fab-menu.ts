/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import {html, isServer, LitElement, nothing, PropertyValues} from 'lit';
import {property, state} from 'lit/decorators.js';
import {classMap} from 'lit/directives/class-map.js';

import {SLOW_EFFECTS, Spring} from '../../internal/motion/spring.js';

import {FabMenuAlignment, FabMenuItem} from './fab-menu-item.js';

/**
 * A FAB menu after Jetpack Compose's `FloatingActionButtonMenu`: a column of
 * `petal-fab-menu-item`s above a button, usually a `petal-toggle-fab` in the
 * `button` slot.
 *
 * Opening and closing is a stagger: the number of visible items follows the
 * slow effects spring, rounded, and each item that becomes visible or hidden
 * animates its own width and opacity. Items appear from the one closest to the
 * button upward and disappear from the top.
 *
 * @slot - The `petal-fab-menu-item`s.
 * @slot button - The `petal-toggle-fab` that opens and closes the menu.
 */
export class FabMenu extends LitElement {
  /**
   * Whether the menu is open. A `petal-toggle-fab` in the `button` slot is
   * kept in sync, and its `change` event sets this.
   */
  @property({type: Boolean, reflect: true}) expanded = false;

  /**
   * The horizontal alignment of the items and the button, `end` by default.
   */
  @property({reflect: true, attribute: 'horizontal-alignment'})
  horizontalAlignment: FabMenuAlignment = 'end';

  /**
   * Accessible name of the group of items.
   */
  @property({attribute: 'items-label'}) itemsLabel = '';

  /** Whether any item is drawn. Without one the menu is just the button. */
  @state() private shown = false;

  private readonly stagger = new Spring(SLOW_EFFECTS);
  private frame = 0;
  private lastFrame = 0;
  private known = new WeakSet<FabMenuItem>();

  protected override render() {
    return html`
      <div
        class="items ${classMap({shown: this.shown})}"
        role="group"
        aria-label=${this.itemsLabel || nothing}
        ?inert=${!this.expanded}>
        <slot @slotchange=${this.handleItemsChange}></slot>
      </div>
      <div class="button">
        <slot name="button" @slotchange=${this.handleButtonChange}></slot>
      </div>
    `;
  }

  override connectedCallback() {
    super.connectedCallback();
    document.addEventListener('pointerdown', this.handleOutside, true);
    this.addEventListener('keydown', this.handleKeydown);
    this.addEventListener('change', this.handleChange);
    this.addEventListener('click', this.handleClick);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('pointerdown', this.handleOutside, true);
    this.removeEventListener('keydown', this.handleKeydown);
    this.removeEventListener('change', this.handleChange);
    this.removeEventListener('click', this.handleClick);
    cancelAnimationFrame(this.frame);
    this.frame = 0;
  }

  private get items() {
    return Array.from(this.children).filter(
      (child): child is FabMenuItem =>
        child instanceof FabMenuItem && !child.hidden && child.slot === '',
    );
  }

  private get toggle() {
    return this.querySelector<HTMLElement & {checked: boolean; popup: boolean}>(
      ':scope > [slot="button"]',
    );
  }

  protected override willUpdate(changed: PropertyValues<this>) {
    if (!changed.has('expanded')) return;
    // The items take their room at once, so that focus can go to them.
    if (this.expanded) this.shown = true;
    // willUpdate() also runs when rendering on the server: no DOM to measure.
    if (isServer) return;
    this.stagger.target = this.expanded ? this.items.length : 0;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!this.hasUpdated || reduce) {
      this.settle();
    }
  }

  protected override updated(changed: PropertyValues<this>) {
    if (changed.has('horizontalAlignment')) this.syncItems();
    if (changed.has('expanded')) {
      this.syncToggle();
      if (this.hasUpdated && changed.get('expanded') !== undefined) {
        this.dispatchEvent(new Event(this.expanded ? 'open' : 'close'));
      }
      this.startAnimation();
    }
  }

  /** Jumps to the end of the animation. */
  private settle() {
    cancelAnimationFrame(this.frame);
    this.frame = 0;
    this.stagger.value = this.stagger.target;
    this.stagger.velocity = 0;
    this.layoutItems(false);
  }

  private startAnimation() {
    if (this.frame) return;
    if (!this.hasUpdated || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.settle();
      return;
    }
    this.lastFrame = performance.now();
    const tick = () => {
      const now = performance.now();
      const ms = Math.min(now - this.lastFrame, 64);
      this.lastFrame = now;
      this.frame = this.advance(ms) ? requestAnimationFrame(tick) : 0;
    };
    this.frame = requestAnimationFrame(tick);
  }

  /**
   * Moves the stagger and the items `ms` milliseconds forward.
   *
   * @return Whether anything is still moving.
   * @internal
   */
  protected advance(ms: number) {
    const stagger = this.stagger;
    stagger.step(ms);
    // The stagger is an Int animation with a visibility threshold of 1.
    if (Math.abs(stagger.value - stagger.target) < 1 && Math.abs(stagger.velocity) < 62.5) {
      stagger.value = stagger.target;
      stagger.velocity = 0;
    }
    const items = this.layoutItems(true, ms);
    return stagger.value !== stagger.target || items.some((item) => item.isAnimating);
  }

  /**
   * Shows the items from `count - round(stagger)` on (Compose's
   * `itemVisible`) and steps their springs.
   */
  private layoutItems(animate: boolean, ms = 0) {
    const items = this.items;
    const count = items.length;
    const visible = Math.min(Math.max(Math.round(this.stagger.value), 0), count);
    items.forEach((item, index) => {
      item.horizontalAlignment = this.horizontalAlignment;
      const shown = index >= count - visible;
      const first = !this.known.has(item);
      this.known.add(item);
      item.setShown(shown, animate && !first);
      if (animate) item.step(ms);
    });
    // Without a visible item the menu has no height for them.
    this.shown = items.some((item) => item.isVisible);
    return items;
  }

  private syncItems() {
    for (const item of this.items) item.horizontalAlignment = this.horizontalAlignment;
  }

  private syncToggle() {
    const toggle = this.toggle;
    if (!toggle) return;
    toggle.popup = true;
    toggle.checked = this.expanded;
  }

  private handleItemsChange() {
    const count = this.items.length;
    this.stagger.target = this.expanded ? count : 0;
    if (!this.hasUpdated || this.stagger.value > count) this.stagger.value = this.stagger.target;
    if (!this.expanded) this.stagger.value = 0;
    this.layoutItems(false);
    this.startAnimation();
  }

  private handleButtonChange() {
    this.syncToggle();
  }

  private handleChange = (event: Event) => {
    const toggle = this.toggle;
    if (!toggle || event.target !== toggle) return;
    this.expanded = toggle.checked;
  };

  private handleClick = (event: MouseEvent) => {
    const toggle = this.toggle;
    if (!toggle || event.target !== toggle || event.detail !== 0) return;
    // Opened with the keyboard: focus goes to the first item.
    void this.updateComplete.then(() => {
      if (this.expanded) this.focusItem(0);
    });
  };

  /** A press outside closes the menu. */
  private handleOutside = (event: PointerEvent) => {
    if (!this.expanded || event.composedPath().includes(this)) return;
    this.expanded = false;
  };

  private focusItem(index: number) {
    this.items[index]?.focus();
  }

  /**
   * The keys of Compose: on the button Tab and the down arrow go to the first
   * item. Escape closes, and the arrows move between the items.
   */
  private handleKeydown = (event: KeyboardEvent) => {
    if (!this.expanded) return;
    const toggle = this.toggle;
    const items = this.items;
    const target = event.target as Element;
    const onToggle = target === toggle;
    const index = items.indexOf(target as FabMenuItem);

    if (event.key === 'Escape') {
      event.preventDefault();
      this.expanded = false;
      if (index !== -1) toggle?.focus();
      return;
    }
    if (onToggle) {
      if ((event.key === 'Tab' && !event.shiftKey) || event.key === 'ArrowDown') {
        if (!items.length) return;
        event.preventDefault();
        this.focusItem(0);
      }
      return;
    }
    if (index === -1) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (index === items.length - 1) toggle?.focus();
      else this.focusItem(index + 1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.focusItem(Math.max(index - 1, 0));
    }
  };
}
