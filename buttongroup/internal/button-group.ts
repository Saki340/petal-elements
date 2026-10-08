/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import {html, isServer, LitElement, PropertyValues} from 'lit';
import {property, queryAssignedElements} from 'lit/decorators.js';

import {Button, ButtonSize} from '../../button/internal/button.js';

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
   * clicking the selected one keeps it selected.
   */
  @property({type: Boolean, attribute: 'single-select', reflect: true})
  singleSelect = false;

  @queryAssignedElements({flatten: true})
  private readonly items!: HTMLElement[];

  /** Buttons whose size was set by the group. */
  private readonly sized = new WeakSet<Button>();

  private pressed: {
    item: HTMLElement;
    setPaddings: (extra: (index: number) => number) => void;
  } | null = null;

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
    return html`<slot @slotchange=${this.applySize}></slot>`;
  }

  protected override updated(changed: PropertyValues<this>) {
    if (changed.has('size')) this.applySize();
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
  }

  /**
   * Widens the pressed item by `--_expanded-ratio` of its width, taking the
   * space from its neighbors, at most their leading padding. A middle item
   * takes half from each side. Same rules as Compose's ButtonGroup layout.
   *
   * The space moves through the items' inline padding (half on each side),
   * so labels keep their width and are never cut off.
   */
  private startPress(event: Event) {
    if (this.connected || this.pressed) return;
    const item = this.itemOf(event);
    const items = this.items;
    const index = item ? items.indexOf(item) : -1;
    if (!item || index < 0 || items.length < 2) return;
    if (item.hasAttribute('disabled') || item.hasAttribute('soft-disabled')) return;

    const ratio = Number(getComputedStyle(this).getPropertyValue('--_expanded-ratio')) || 0;
    const paddings = items.map((el) => {
      const style = getComputedStyle(el);
      return [parseFloat(style.paddingInlineStart) || 0, parseFloat(style.paddingInlineEnd) || 0];
    });
    const change = items.map(() => 0);
    const grow = ratio * item.getBoundingClientRect().width;
    if (index > 0 && index < items.length - 1) {
      const growth = Math.min(grow / 2, paddings[index - 1][0], paddings[index + 1][0]);
      change[index - 1] = -growth;
      change[index + 1] = -growth;
      change[index] = 2 * growth;
    } else {
      const neighbor = index === 0 ? 1 : index - 1;
      const growth = Math.min(grow, paddings[neighbor][0]);
      change[neighbor] = -growth;
      change[index] = growth;
    }

    const setPaddings = (extra: (i: number) => number) => {
      items.forEach((el, i) => {
        el.style.paddingInlineStart = `${paddings[i][0] + extra(i) / 2}px`;
        el.style.paddingInlineEnd = `${paddings[i][1] + extra(i) / 2}px`;
      });
    };
    this.pressed = {item, setPaddings};
    // Fix the current paddings first, so the change to the targets animates.
    setPaddings(() => 0);
    requestAnimationFrame(() => {
      if (this.pressed?.item === item) setPaddings((i) => change[i]);
    });
    window.addEventListener('pointerup', () => this.endPress(), {once: true});
    window.addEventListener('pointercancel', () => this.endPress(), {once: true});
  }

  private endPress() {
    const pressed = this.pressed;
    if (!pressed) return;
    this.pressed = null;
    pressed.setPaddings(() => 0);
    // Back to the stylesheet's paddings once the items have settled.
    const items = this.items;
    const duration = Math.max(
      ...items.map((el) => parseFloat(getComputedStyle(el).transitionDuration) || 0),
    );
    setTimeout(() => {
      if (this.pressed) return;
      for (const el of items) {
        el.style.removeProperty('padding-inline-start');
        el.style.removeProperty('padding-inline-end');
      }
    }, duration * 1000 + 50);
  }
}
