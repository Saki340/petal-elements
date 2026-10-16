/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import {isServer, LitElement} from 'lit';
import {property, queryAssignedElements} from 'lit/decorators.js';

import {ITEM_SELECTED_EVENT, NavigationItem} from './navigation-item.js';

/**
 * The base of the navigation bar and rail: it keeps one of its items selected
 * (Compose's `selectableGroup`), puts the selected one in the tab order, and
 * moves the focus between items with the arrow keys.
 *
 * @fires change {Event} The user selected another item. The target's
 * `selectedIndex` and `selectedItem` tell which. Cancel it to keep the
 * previous item selected. --bubbles
 */
export abstract class NavigationContainer extends LitElement {
  /** The direction the items are laid out in, and so the arrow keys. */
  protected abstract readonly orientation: 'horizontal' | 'vertical';

  /** The items, in the default slot. */
  @queryAssignedElements({flatten: true, selector: '[petal-navigation-item]'})
  readonly items!: NavigationItem[];

  /**
   * The index of the selected item, or -1 when none is. Setting it selects
   * that item without a `change` event.
   */
  @property({type: Number, attribute: 'selected-index'})
  get selectedIndex() {
    return this.items.findIndex((item) => item.selected);
  }
  set selectedIndex(index: number) {
    const select = () => {
      this.items.forEach((item, i) => {
        item.selected = i === index;
      });
      this.updateTabStops();
    };
    // Before the first render the items are not known yet (a Lit property
    // binding sets this early).
    if (this.hasUpdated) select();
    else void this.updateComplete.then(select);
  }

  /** The selected item, or `null`. */
  get selectedItem(): NavigationItem | null {
    return this.items.find((item) => item.selected) ?? null;
  }

  protected readonly internals =
    // Cast needed for closure
    (this as HTMLElement).attachInternals();

  constructor() {
    super();
    if (isServer) return;
    this.internals.role = 'tablist';
    this.addEventListener('click', this.onClick);
    this.addEventListener('keydown', this.onKeydown);
    this.addEventListener(ITEM_SELECTED_EVENT, this.onItemSelected);
  }

  protected override firstUpdated() {
    this.internals.ariaOrientation = this.orientation;
  }

  /** Call when the items in the default slot change. */
  protected handleSlotChange() {
    // One item at most is selected: the first one that says so.
    const selected = this.items.filter((item) => item.selected);
    for (const extra of selected.slice(1)) extra.selected = false;
    this.updateTabStops();
  }

  /** Only the selected item (or the first one) is in the tab order. */
  protected updateTabStops() {
    const enabled = this.items.filter((item) => !item.disabled);
    const current = enabled.find((item) => item.selected) ?? enabled[0];
    for (const item of this.items) item.tabIndex = item === current ? 0 : -1;
  }

  private itemOf(event: Event) {
    const path = event.composedPath();
    return this.items.find((item) => path.includes(item)) ?? null;
  }

  private readonly onClick = async (event: Event) => {
    const item = this.itemOf(event);
    // Allow the event to bubble, so it can be canceled.
    await 0;
    if (!item || item.disabled || item.selected || event.defaultPrevented) return;

    const previous = this.selectedItem;
    for (const other of this.items) other.selected = other === item;
    const canceled = !this.dispatchEvent(new Event('change', {bubbles: true, cancelable: true}));
    if (canceled) {
      for (const other of this.items) other.selected = other === previous;
    }
    this.updateTabStops();
  };

  // An item set to selected from outside deselects the others.
  private readonly onItemSelected = (event: Event) => {
    const item = this.itemOf(event);
    if (!item?.selected) return;
    for (const other of this.items) {
      if (other !== item && other.selected) other.selected = false;
    }
    this.updateTabStops();
  };

  /** Arrow keys, Home and End move the focus; Enter and Space select. */
  private readonly onKeydown = (event: KeyboardEvent) => {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
    const enabled = this.items.filter((item) => !item.disabled);
    if (enabled.length < 2) return;

    const horizontal = this.orientation === 'horizontal';
    const rtl = getComputedStyle(this).direction === 'rtl';
    let step = 0;
    switch (event.key) {
      case horizontal ? 'ArrowRight' : 'ArrowDown':
        step = horizontal && rtl ? -1 : 1;
        break;
      case horizontal ? 'ArrowLeft' : 'ArrowUp':
        step = horizontal && rtl ? 1 : -1;
        break;
      case 'Home':
      case 'End':
        break;
      default:
        return;
    }

    event.preventDefault();
    const focused = enabled.findIndex((item) => item.matches(':focus-within'));
    let next: number;
    if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = enabled.length - 1;
    else if (focused < 0) next = step > 0 ? 0 : enabled.length - 1;
    else next = (focused + step + enabled.length) % enabled.length;
    enabled[next].focus();
  };
}
