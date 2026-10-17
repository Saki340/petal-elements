/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import {html, isServer, nothing, PropertyValues} from 'lit';
import {property, state} from 'lit/decorators.js';

import {
  NavigationIconPosition,
  NavigationItem,
} from '../../internal/navigation/navigation-item.js';

/**
 * Dispatched by an item when its label measures differently, so the rail can
 * size itself to the widest item.
 */
export const ITEM_LAYOUT_EVENT = 'petal-navigation-item-layout';

/**
 * An item of a wide navigation rail, after Jetpack Compose
 * (`WideNavigationRailItem`, `AnimatedNavigationItem`).
 *
 * The icon sits above a small label in a collapsed rail and before a larger
 * one in an expanded rail. Moving between the two animates the size of the
 * item, the indicator and the icon with the default spatial spring, and the
 * label fades out and in (its alpha is `4 * (p - 0.5)^2` of the progress p).
 */
export class NavigationRailItem extends NavigationItem {
  /** Whether the rail is expanded; set by the rail. */
  @property({type: Boolean, attribute: false}) railExpanded = false;

  @state() private labelText = '';

  private measureObserver?: ResizeObserver;
  private textObserver?: MutationObserver;

  protected override get position(): NavigationIconPosition {
    return this.iconPosition ?? (this.railExpanded ? 'start' : 'top');
  }

  /**
   * The width of the item with the icon at the start, in px: the width the rail
   * needs to show it in full when expanded. 0 until it has been measured.
   */
  get startWidth(): number {
    const wrapper = this.renderRoot?.querySelector<HTMLElement>('.measure.start');
    return wrapper ? wrapper.offsetWidth : 0;
  }

  override connectedCallback() {
    super.connectedCallback();
    if (isServer) return;
    this.readLabelText();
    this.textObserver ??= new MutationObserver(() => this.readLabelText());
    this.textObserver.observe(this, {characterData: true, childList: true, subtree: true});
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.textObserver?.disconnect();
    this.measureObserver?.disconnect();
    this.measureObserver = undefined;
  }

  protected override renderExtra() {
    // Hidden copies of the label in both type styles. Their size is the label's
    // width at the top and at the start (Compose measures the label as it is
    // laid out), which the layout needs in `calc()`; the start copy also has
    // the item's padding, to read the whole width of the item from.
    return this.labelText
      ? html`<span class="measure top" aria-hidden="true"
            ><span class="text">${this.labelText}</span></span
          ><span class="measure start" aria-hidden="true"
            ><span class="text">${this.labelText}</span></span
          >`
      : nothing;
  }

  protected override updated(changed: PropertyValues<this>) {
    super.updated(changed);
    if (isServer) return;
    if (!this.measureObserver) {
      this.measureObserver = new ResizeObserver(() => this.measure());
    }
    this.measureObserver.disconnect();
    for (const element of this.renderRoot.querySelectorAll('.measure .text')) {
      this.measureObserver.observe(element);
    }
    this.measure();
  }

  private readLabelText() {
    // Only the label: the default slot's content, not the icons (an icon's
    // text is its ligature name).
    const text = [...this.childNodes]
      .filter((node) =>
        node instanceof Element
          ? !node.hasAttribute('slot')
          : node.nodeType === Node.TEXT_NODE,
      )
      .map((node) => node.textContent ?? '')
      .join('');
    this.labelText = text.replace(/\s+/g, ' ').trim();
  }

  private measure() {
    const width = (selector: string) =>
      this.renderRoot.querySelector<HTMLElement>(selector)?.offsetWidth ?? 0;
    const top = width('.measure.top .text');
    const start = width('.measure.start .text');
    const before = [this.style.getPropertyValue('--_label-top-width'), this.style.getPropertyValue('--_label-start-width')];
    const after = [`${top}px`, `${start}px`];
    if (before[0] === after[0] && before[1] === after[1]) return;
    this.style.setProperty('--_label-top-width', after[0]);
    this.style.setProperty('--_label-start-width', after[1]);
    this.dispatchEvent(new Event(ITEM_LAYOUT_EVENT, {bubbles: true}));
  }
}
