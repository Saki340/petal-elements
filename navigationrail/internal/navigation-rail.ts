/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import {html, isServer, PropertyValues} from 'lit';
import {property, state} from 'lit/decorators.js';
import {classMap} from 'lit/directives/class-map.js';

import {NavigationContainer} from '../../internal/navigation/navigation-container.js';

import {ITEM_LAYOUT_EVENT, NavigationRailItem} from './navigation-rail-item.js';

/** WNRItemHorizontalPadding: space after the widest item when expanded. */
const ITEM_END_PADDING = 20;

/**
 * A Material 3 Expressive wide navigation rail, after Jetpack Compose
 * (`WideNavigationRail`).
 *
 * Collapsed, it is a narrow rail with the icon above each label; expanded, it
 * is as wide as its widest item (between 220px and 360px) with the icon before
 * the label. The width, the items and their labels animate between the two.
 * The `header` slot holds a menu button or a floating action button.
 */
export class NavigationRail extends NavigationContainer {
  protected readonly orientation = 'vertical';

  /** Whether the rail is expanded: wider, with the icons before the labels. */
  @property({type: Boolean, reflect: true}) expanded = false;

  @state() private hasHeader = false;

  constructor() {
    super();
    if (isServer) return;
    this.addEventListener(ITEM_LAYOUT_EVENT, () => this.updateExpandedWidth());
  }

  protected override render() {
    return html`
      <div class=${classMap({'header': true, 'has-header': this.hasHeader})}>
        <slot name="header" @slotchange=${this.onHeaderSlotChange}></slot>
      </div>
      <div class="items"><slot @slotchange=${this.onItemsSlotChange}></slot></div>
    `;
  }

  protected override updated(changed: PropertyValues<this>) {
    if (changed.has('expanded')) this.updateItems();
  }

  private get railItems() {
    return this.items.filter((item): item is NavigationRailItem => item instanceof NavigationRailItem);
  }

  private updateItems() {
    for (const item of this.railItems) item.railExpanded = this.expanded;
    this.updateExpandedWidth();
  }

  private onItemsSlotChange() {
    this.handleSlotChange();
    this.updateItems();
  }

  private onHeaderSlotChange(event: Event) {
    const slot = event.target as HTMLSlotElement;
    this.hasHeader = slot.assignedNodes({flatten: true}).length > 0;
    this.updateExpandedWidth();
  }

  /**
   * The expanded width: the widest of the items and the header, plus the
   * space after the items, kept between the minimum and the maximum width.
   */
  private updateExpandedWidth() {
    const style = getComputedStyle(this);
    const px = (name: string, fallback: number) =>
      parseFloat(style.getPropertyValue(name)) || fallback;
    const minimum = px('--_expanded-container-width-minimum', 220);
    const maximum = px('--_expanded-container-width-maximum', 360);
    const items = Math.max(0, ...this.railItems.map((item) => item.startWidth));
    const header = this.hasHeader
      ? Math.max(
          0,
          ...Array.from(this.querySelectorAll<HTMLElement>(':scope > [slot="header"]'), (e) => e.offsetWidth),
        )
      : 0;
    const content = Math.max(items ? items + ITEM_END_PADDING : 0, header);
    const width = Math.min(maximum, Math.max(minimum, content));
    this.style.setProperty('--_expanded-width', `${width}px`);
  }
}
