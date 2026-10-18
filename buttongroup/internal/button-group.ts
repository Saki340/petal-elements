/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import {html, isServer, LitElement, PropertyValues} from 'lit';
import {property, queryAssignedElements} from 'lit/decorators.js';

import {Button, ButtonSize} from '../../button/internal/button.js';
import {
  Spring,
  springFromCss,
  FAST_SPATIAL,
} from '../../internal/motion/spring.js';

/** A pressed item lets go once its press has reached this far, like Compose. */
const RELEASE_AT = 0.75;

/**
 * A Material 3 Expressive button group.
 *
 * Standard groups space their buttons apart; a pressed button widens by a
 * share of its width and its neighbors give way, as in Compose's
 * `ButtonGroup`. Connected groups (`connected`) place buttons 2px apart with
 * small inner corners, as in Compose's connected button group shapes.
 *
 * Buttons without a `size` get the group's size.
 */
export class ButtonGroup extends LitElement {
  /** Size of the group and of buttons that have no size of their own. */
  @property({reflect: true}) size: ButtonSize = 'small';

  /** Connected layout: buttons 2px apart with small inner corners. */
  @property({type: Boolean, reflect: true}) connected = false;

  /**
   * Only one toggle button can be selected. Selecting one deselects the others;
   * clicking the selected one keeps it selected. Like a radio group, only the
   * selected button is in the tab order, and arrow keys (and Home, End) move
   * the selection.
   */
  @property({type: Boolean, attribute: 'single-select', reflect: true})
  singleSelect = false;

  @queryAssignedElements({flatten: true})
  private readonly items!: HTMLElement[];

  /** Buttons whose size was set by the group. */
  private readonly sized = new WeakSet<Button>();
  /** Buttons whose tabindex was set by the group. */
  private readonly tabStops = new WeakSet<HTMLElement>();

  /** The press of each item, a spring from 0 (released) to 1 (pressed). */
  private readonly presses = new Map<HTMLElement, Spring>();
  /** Items released before their press reached RELEASE_AT. */
  private readonly releasing = new Set<HTMLElement>();
  /** Paddings and widths of the items at rest, while presses animate. */
  private basePaddings: number[][] | null = null;
  private baseWidths: number[] = [];
  private frame = 0;
  private lastTime = 0;

  constructor() {
    super();
    if (isServer) return;
    this.addEventListener('pointerdown', (event) => {
      if (event.button === 0) this.startPress(event);
    });
    this.addEventListener('keydown', (event) => {
      if (!event.repeat && (event.key === ' ' || event.key === 'Enter')) {
        this.startPress(event);
      }
      this.handleArrowKey(event);
    });
    this.addEventListener('keyup', () => {
      this.endPress();
    });
    this.addEventListener('click', (event) => {
      this.handleClick(event);
    });
    this.addEventListener('change', (event) => {
      this.handleChange(event);
    });
  }

  override connectedCallback() {
    super.connectedCallback();
    if (!this.hasAttribute('role')) this.setAttribute('role', 'group');
  }

  protected override render() {
    return html`<slot @slotchange=${this.onSlotChange}></slot>`;
  }

  protected override updated(changed: PropertyValues<this>) {
    if (changed.has('size')) this.applySize();
    if (changed.has('singleSelect')) this.updateTabStops();
  }

  private onSlotChange() {
    this.applySize();
    this.updateTabStops();
  }

  /** The toggle buttons that can be chosen. */
  private get choices() {
    return this.items.filter(
      (item): item is Button =>
        item instanceof Button && item.toggle && !item.disabled && !item.softDisabled,
    );
  }

  /**
   * In single-select groups, only the selected button (or the first one) is in
   * the tab order, like a radio group.
   */
  private updateTabStops() {
    const choices = this.singleSelect ? this.choices : [];
    const current = choices.find((item) => item.selected) ?? choices[0];
    for (const item of this.items) {
      if (choices.includes(item as Button)) {
        item.tabIndex = item === current ? 0 : -1;
        this.tabStops.add(item);
      } else if (this.tabStops.has(item)) {
        item.removeAttribute('tabindex');
        this.tabStops.delete(item);
      }
    }
  }

  /** Arrow keys, Home and End choose another button in single-select groups. */
  private handleArrowKey(event: KeyboardEvent) {
    if (!this.singleSelect || event.altKey || event.ctrlKey || event.metaKey) return;
    const choices = this.choices;
    const item = this.itemOf(event);
    const index = choices.indexOf(item as Button);
    if (index < 0) return;
    const rtl = getComputedStyle(this).direction === 'rtl';
    let next: number;
    switch (event.key) {
      case 'ArrowRight':
        next = index + (rtl ? -1 : 1);
        break;
      case 'ArrowLeft':
        next = index + (rtl ? 1 : -1);
        break;
      case 'ArrowDown':
        next = index + 1;
        break;
      case 'ArrowUp':
        next = index - 1;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = choices.length - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    const target = choices[(next + choices.length) % choices.length];
    target.focus();
    if (!target.selected) target.click();
  }

  private applySize() {
    for (const item of this.items) {
      if (!(item instanceof Button)) continue;
      if (!item.size || this.sized.has(item)) {
        item.size = this.size;
        this.sized.add(item);
      }
    }
  }

  private itemOf(event: Event) {
    const path = event.composedPath();
    return this.items.find((item) => path.includes(item)) ?? null;
  }

  private handleClick(event: Event) {
    const item = this.itemOf(event);
    if (this.singleSelect && item instanceof Button && item.toggle && item.selected) {
      // Keep the selected button selected (the button toggles after dispatch
      // unless the click is canceled).
      event.preventDefault();
    }
  }

  private handleChange(event: Event) {
    const item = this.itemOf(event);
    if (!this.singleSelect || !(item instanceof Button) || !item.selected) return;
    for (const other of this.items) {
      if (other !== item && other instanceof Button && other.toggle) {
        other.selected = false;
      }
    }
    this.updateTabStops();
  }

  /**
   * Widens the pressed item by `--_expanded-ratio` of its width at rest; the
   * whole group makes room, each other item in proportion to its width (a
   * petal-elements choice: Compose's ButtonGroup takes the space from the
   * neighbors only). Like Compose's `animateWidth`, the press is a fast
   * spatial spring (it overshoots with the expressive scheme), and a quick
   * press is held until it is 75% of the way.
   *
   * The space moves through the items' inline padding (half on each side),
   * so labels keep their width and are never cut off.
   */
  private startPress(event: Event) {
    const item = this.itemOf(event);
    if (!item || this.items.length < 2) return;
    if (item.hasAttribute('disabled') || item.hasAttribute('soft-disabled')) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let spring = this.presses.get(item);
    if (!spring) {
      spring = new Spring(springFromCss(this, 'fast-spatial', FAST_SPATIAL));
      this.presses.set(item, spring);
    }
    spring.target = 1;
    this.releasing.delete(item);
    this.animatePresses();
    const end = () => this.endPress(item);
    window.addEventListener('pointerup', end, {once: true});
    window.addEventListener('pointercancel', end, {once: true});
    // The release may never come here: the window loses focus, or a key press
    // ends on another element when focus moves away.
    window.addEventListener('blur', end, {once: true});
    if (event.type === 'keydown') item.addEventListener('focusout', end, {once: true});
  }

  private endPress(item?: HTMLElement) {
    for (const [pressed, spring] of this.presses) {
      if (item && pressed !== item) continue;
      if (spring.target === 0) continue;
      if (spring.value >= RELEASE_AT) spring.target = 0;
      else this.releasing.add(pressed);
    }
    this.animatePresses();
  }

  private animatePresses() {
    if (this.frame) return;
    this.lastTime = performance.now();
    const tick = () => {
      const now = performance.now();
      // At most a few frames' worth, so a background tab does not jump.
      const ms = Math.min(now - this.lastTime, 64);
      this.lastTime = now;
      let moving = false;
      for (const [item, spring] of this.presses) {
        spring.step(ms);
        if (this.releasing.has(item) && spring.value >= RELEASE_AT) {
          this.releasing.delete(item);
          spring.target = 0;
        }
        if (!spring.atRest || spring.target !== 0) moving = true;
      }
      this.layoutPresses();
      if (moving) {
        this.frame = requestAnimationFrame(tick);
      } else {
        this.frame = 0;
        this.presses.clear();
        this.resetPaddings();
      }
    };
    this.frame = requestAnimationFrame(tick);
  }

  /** Sets the items' paddings for the current presses (Compose's measure). */
  private layoutPresses() {
    const items = this.items;
    if (!this.basePaddings) {
      this.basePaddings = items.map((el) => {
        const style = getComputedStyle(el);
        return [parseFloat(style.paddingInlineStart) || 0, parseFloat(style.paddingInlineEnd) || 0];
      });
      this.baseWidths = items.map((el) => el.getBoundingClientRect().width);
    }
    const ratio = Number(getComputedStyle(this).getPropertyValue('--_expanded-ratio')) || 0;
    const base = this.basePaddings;
    const change = items.map(() => 0);
    items.forEach((item, index) => {
      const value = this.presses.get(item)?.value ?? 0;
      if (!value) return;
      // The whole group makes room: every other item gives up a share in
      // proportion to its width at rest, at most its own padding, so labels
      // are never cut off.
      const others = items.map((_, i) => i).filter((i) => i !== index);
      const total = others.reduce((sum, i) => sum + this.baseWidths[i], 0);
      if (!total) return;
      const growth = value * ratio * this.baseWidths[index];
      let given = 0;
      for (const i of others) {
        const padding = base[i] ? base[i][0] + base[i][1] : 0;
        const share = Math.min((growth * this.baseWidths[i]) / total, padding);
        change[i] -= share;
        given += share;
      }
      change[index] += given;
    });
    items.forEach((el, i) => {
      if (!base[i]) return;
      // Paddings cannot go below zero.
      el.style.paddingInlineStart = `${Math.max(0, base[i][0] + change[i] / 2)}px`;
      el.style.paddingInlineEnd = `${Math.max(0, base[i][1] + change[i] / 2)}px`;
    });
  }

  /** Back to the stylesheet's paddings once every press has settled. */
  private resetPaddings() {
    this.basePaddings = null;
    for (const el of this.items) {
      el.style.removeProperty('padding-inline-start');
      el.style.removeProperty('padding-inline-end');
    }
  }

}
