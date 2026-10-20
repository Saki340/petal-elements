/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import {html, isServer, LitElement, PropertyValues} from 'lit';
import {property, query, queryAssignedElements, state} from 'lit/decorators.js';
import {classMap} from 'lit/directives/class-map.js';

import {
  heroKeylineList,
  KeylineList,
  multiBrowseKeylineList,
  uncontainedKeylineList,
} from './keylines.js';
import {itemLayout, itemScrollOffset, maxScrollOffset, snapScrollOffsets} from './layout.js';
import {Strategy} from './strategy.js';

/**
 * The carousel's layout: Compose's `HorizontalMultiBrowseCarousel`,
 * `HorizontalUncontainedCarousel` or `HorizontalCenteredHeroCarousel`.
 */
export type CarouselVariant = 'multi-browse' | 'uncontained' | 'hero';

/**
 * A carousel, after Jetpack Compose Material 3 (the carousel package:
 * Carousel.kt, Keylines.kt, Strategy.kt, KeylineSnapPosition.kt). The items
 * are its children. They scroll as pages of the large item's size; each one
 * is masked down and moved to the keyline it is at, so items grow as they
 * reach the focal place and shrink as they leave it.
 *
 * Each item gets `--carousel-item-mask-width` (its shown width in px) and
 * `--carousel-item-mask-fraction` (0 at the smallest keyline, the anchors'
 * 10px, and 1 at the largest)
 * for content that should follow the mask, as Compose's
 * `CarouselItemDrawInfo`.
 */
export class Carousel extends LitElement {
  /** `multi-browse`, `uncontained` or `hero` (centered). */
  @property({reflect: true}) variant: CarouselVariant = 'multi-browse';

  /**
   * The large items' width in px (`preferredItemWidth`, or `itemWidth` for
   * `uncontained`). A hero carousel without it fills the width less its small
   * items.
   */
  @property({type: Number, attribute: 'item-width'}) itemWidth = 0;

  /** The space between items in px (`itemSpacing`). */
  @property({type: Number, attribute: 'item-spacing'}) itemSpacing = 0;

  /** The small items' smallest width in px (CarouselDefaults.MinSmallItemSize). */
  @property({type: Number, attribute: 'min-small-item-width'})
  minSmallItemWidth = 40;

  /** The small items' largest width in px (CarouselDefaults.MaxSmallItemSize). */
  @property({type: Number, attribute: 'max-small-item-width'})
  maxSmallItemWidth = 56;

  @queryAssignedElements({flatten: true}) private readonly items!: HTMLElement[];
  @query('.scroller') private readonly scroller!: HTMLElement | null;

  @state() private viewWidth = 0;
  @state() private trackWidth = 0;
  @state() private snapOffsets: number[] = [];
  @state() private itemSize = 0;

  private strategy = Strategy.EMPTY;
  private resizeObserver?: ResizeObserver;
  private frame = 0;

  /**
   * The index of the item whose resting place is nearest the scroll offset
   * (the pager's current page).
   */
  get currentIndex() {
    const count = this.items.length;
    if (!this.strategy.isValid || count === 0) return 0;
    const scrollOffset = this.scrollOffset();
    let current = 0;
    let nearest = Infinity;
    for (let i = 0; i < count; i++) {
      const distance = Math.abs(itemScrollOffset(this.strategy, i, count) - scrollOffset);
      if (distance < nearest) {
        nearest = distance;
        current = i;
      }
    }
    return current;
  }

  /** Scrolls item `index` to its resting place. */
  scrollToItem(index: number, behavior: ScrollBehavior = 'smooth') {
    const count = this.items.length;
    const scroller = this.scroller;
    if (!scroller || !this.strategy.isValid || count === 0) return;
    const i = Math.max(0, Math.min(index, count - 1));
    const offset = itemScrollOffset(this.strategy, i, count);
    const rtl = getComputedStyle(this).direction === 'rtl';
    scroller.scrollTo({left: rtl ? -offset : offset, behavior});
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.resizeObserver?.disconnect();
    if (!isServer) cancelAnimationFrame(this.frame);
  }

  protected override render() {
    const snaps = this.variant !== 'uncontained';
    return html`<div
      class="scroller ${classMap({snaps})}"
      tabindex="0"
      @scroll=${this.handleScroll}
      @focusin=${this.handleFocusIn}>
      <div class="track" style=${`width: ${this.trackWidth}px`}>
        ${snaps
          ? this.snapOffsets.map(
              (offset) => html`<span class="snap" style=${`inset-inline-start: ${offset}px`}></span>`,
            )
          : null}
        <div
          class="stage"
          style=${`width: ${this.viewWidth}px; --_item-size: ${this.itemSize}px`}>
          <slot @slotchange=${this.handleSlotChange}></slot>
        </div>
      </div>
    </div>`;
  }

  protected override firstUpdated() {
    if (isServer) return;
    this.setAttribute('role', 'region');
    this.setAttribute('aria-roledescription', 'carousel');
    this.resizeObserver = new ResizeObserver(() => this.measure());
    this.resizeObserver.observe(this.scroller!);
  }

  protected override updated(changed: PropertyValues<this>) {
    if (
      changed.has('variant') ||
      changed.has('itemWidth') ||
      changed.has('itemSpacing') ||
      changed.has('minSmallItemWidth') ||
      changed.has('maxSmallItemWidth')
    ) {
      // Measuring sets reactive state: not in this update.
      queueMicrotask(() => this.measure());
    }
    // The items' places depend on the rendered track.
    this.layoutItems();
  }

  private handleSlotChange() {
    this.measure();
  }

  private handleScroll() {
    if (this.frame) return;
    this.frame = requestAnimationFrame(() => {
      this.frame = 0;
      this.layoutItems();
    });
  }

  // An item that takes focus scrolls to its resting place.
  private handleFocusIn(event: FocusEvent) {
    const item = this.items.find((el) => el.contains(event.target as Node));
    if (item) this.scrollToItem(this.items.indexOf(item));
  }

  /** The keylines for the carousel's width (CarouselPageSize). */
  private keylineList(availableSpace: number, itemCount: number): KeylineList {
    const spacing = this.itemSpacing;
    switch (this.variant) {
      case 'uncontained':
        return uncontainedKeylineList(availableSpace, this.itemWidth, spacing);
      case 'hero':
        return heroKeylineList(
          availableSpace,
          this.itemWidth > 0 ? this.itemWidth : null,
          spacing,
          itemCount,
          true,
          this.minSmallItemWidth,
          this.maxSmallItemWidth,
        );
      default:
        return multiBrowseKeylineList(
          availableSpace,
          this.itemWidth,
          spacing,
          itemCount,
          this.minSmallItemWidth,
          this.maxSmallItemWidth,
        );
    }
  }

  private measure() {
    const scroller = this.scroller;
    if (!scroller) return;
    const availableSpace = scroller.clientWidth;
    this.viewWidth = availableSpace;
    const count = this.items.length;
    this.strategy = new Strategy(
      this.keylineList(availableSpace, count),
      availableSpace,
      this.itemSpacing,
      0,
      0,
    );
    if (!this.strategy.isValid) {
      this.trackWidth = availableSpace;
      this.snapOffsets = [];
      this.itemSize = 0;
      this.layoutItems();
      return;
    }
    this.itemSize = this.strategy.itemMainAxisSize;
    this.trackWidth = maxScrollOffset(this.strategy, count) + availableSpace;
    this.snapOffsets = snapScrollOffsets(this.strategy, count);
    this.labelItems();
    this.layoutItems();
  }

  private scrollOffset() {
    return Math.abs(this.scroller?.scrollLeft ?? 0);
  }

  /** Puts every item at its keyline for the scroll offset (carouselItem). */
  private layoutItems() {
    const items = this.items;
    const strategy = this.strategy;
    if (!strategy.isValid) {
      for (const item of items) item.style.visibility = 'hidden';
      return;
    }
    const max = maxScrollOffset(strategy, items.length);
    const scrollOffset = Math.min(this.scrollOffset(), max);
    const itemSize = strategy.itemMainAxisSize;
    const current = this.currentIndex;
    const range = strategy.maxItemSize - strategy.minItemSize;
    items.forEach((item, index) => {
      const {center, size} = itemLayout(strategy, index, scrollOffset, max);
      const inset = Math.max(0, (itemSize - size) / 2);
      const style = item.style;
      style.visibility = '';
      style.insetInlineStart = `${center - itemSize / 2}px`;
      style.clipPath = `inset(0 ${inset}px round var(--_item-shape))`;
      style.zIndex = String(Math.round(100 / (1 + Math.abs(index - current))));
      style.setProperty('--carousel-item-mask-width', `${size}px`);
      style.setProperty(
        '--carousel-item-mask-fraction',
        (range > 0 ? (size - strategy.minItemSize) / range : 1).toFixed(4),
      );
    });
  }

  /** Names items that have no name, as slides "1 of 5". */
  private labelItems() {
    const count = this.items.length;
    this.items.forEach((item, index) => {
      if (!item.hasAttribute('role')) item.setAttribute('role', 'group');
      if (!item.hasAttribute('aria-roledescription')) {
        item.setAttribute('aria-roledescription', 'slide');
      }
      if (!item.hasAttribute('aria-label') && !item.hasAttribute('aria-labelledby')) {
        item.setAttribute('aria-label', `${index + 1} of ${count}`);
      }
    });
  }
}
