/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import '../../focus/md-focus-ring.js';
import '../../ripple/ripple.js';

import {html, isServer, LitElement, nothing, PropertyValues, TemplateResult} from 'lit';
import {property, state} from 'lit/decorators.js';
import {classMap} from 'lit/directives/class-map.js';

/** Where the icon sits: above the label (`top`) or before it (`start`). */
export type NavigationIconPosition = 'top' | 'start';

/**
 * Dispatched by an item when it becomes selected, so its navigation bar or
 * rail can deselect the others.
 */
export const ITEM_SELECTED_EVENT = 'petal-navigation-item-selected';

// Progress values as registered properties, so the layout can follow a spring
// with `calc()`: how far the indicator has grown (Compose's
// animateIndicatorProgressAsState) and how far the icon has moved from the top
// to the start position (iconPositionProgress).
if (!isServer && 'registerProperty' in CSS) {
  for (const name of ['--petal-navigation-indicator', '--petal-navigation-position']) {
    try {
      CSS.registerProperty({name, syntax: '<number>', inherits: true, initialValue: '0'});
    } catch {
      // Already registered.
    }
  }
}

/**
 * The item of a navigation bar or rail, after Jetpack Compose Material 3
 * (`NavigationItem` in NavigationItem.kt).
 *
 * The icon goes in the `icon` slot (and optionally a `selected-icon` slot),
 * the label in the default slot. An item with `href` is a link. The bar or
 * rail keeps one item selected and gives it the `tab` role in a `tablist`, as
 * Compose's `Role.Tab` inside `selectableGroup`.
 *
 * @slot - The label text.
 * @slot icon - The icon (`<petal-icon slot="icon">`).
 * @slot selected-icon - The icon while selected, for example a filled one; the
 *     `icon` slot's icon when empty.
 * @slot badge - A `petal-badge` on the icon.
 */
export abstract class NavigationItem extends LitElement {
  /** Whether the item is the current destination. */
  @property({type: Boolean, reflect: true}) selected = false;

  /** Disables the item. */
  @property({type: Boolean, reflect: true}) disabled = false;

  /** Makes the item a link to this URL. */
  @property() href = '';

  /** Where a link opens (`_blank`, ...). */
  @property() target = '';

  /**
   * Where the icon sits. Defaults to `top` in a navigation bar; a rail picks
   * it from whether it is expanded.
   */
  @property({attribute: 'icon-position', reflect: true})
  iconPosition?: NavigationIconPosition;

  @state() protected hasLabel = false;
  @state() protected hasSelectedIcon = false;

  protected readonly internals =
    // Cast needed for closure
    (this as HTMLElement).attachInternals();

  constructor() {
    super();
    if (isServer) return;
    this.internals.role = 'tab';
    this.addEventListener('keydown', this.onKeydown);
  }

  override connectedCallback() {
    super.connectedCallback();
    // The bar or rail finds its items by this attribute.
    this.setAttribute('petal-navigation-item', '');
    // Alone, an item is a tab stop; its bar or rail takes over the tabindex.
    if (!this.hasAttribute('tabindex')) this.tabIndex = this.disabled ? -1 : 0;
  }

  /** The position of the icon in effect. */
  protected get position(): NavigationIconPosition {
    return this.iconPosition ?? 'top';
  }

  protected itemClasses(): Record<string, boolean> {
    return {
      'selected': this.selected,
      'disabled': this.disabled,
      'start': this.position === 'start',
      'icon-only': !this.hasLabel,
      'has-selected-icon': this.hasSelectedIcon,
    };
  }

  /** Extra elements the item layout needs, rendered inside the item. */
  protected renderExtra(): TemplateResult | typeof nothing {
    return nothing;
  }

  protected override render() {
    const content = html`
      <div class="indicator-area">
        <div class="indicator"></div>
        <petal-ripple .control=${this}></petal-ripple>
        <petal-focus-ring part="focus-ring" .control=${this}></petal-focus-ring>
      </div>
      <div class="icon">
        <slot name="icon"></slot>
        <slot name="selected-icon" @slotchange=${this.onSelectedIconSlotChange}></slot>
        <span class="badge-anchor"><slot name="badge"></slot></span>
      </div>
      <div class="label"><slot @slotchange=${this.onLabelSlotChange}></slot></div>
      ${this.renderExtra()}
    `;
    const classes = classMap({item: true, ...this.itemClasses()});
    // A link wraps the item, so it opens in a new tab, shows its address, and
    // so on. It is not a tab stop: the item itself takes the focus.
    return this.href && !this.disabled
      ? html`<a
          class=${classes}
          href=${this.href}
          target=${this.target || nothing}
          tabindex="-1"
          role="presentation"
          >${content}</a
        >`
      : html`<div class=${classes} role="presentation">${content}</div>`;
  }

  protected override updated(changed: PropertyValues<this>) {
    this.internals.ariaSelected = String(this.selected);
    this.internals.ariaDisabled = this.disabled ? 'true' : 'false';
    if (changed.has('disabled') && this.disabled && this.tabIndex >= 0) this.tabIndex = -1;
    if (changed.has('selected') && this.selected) {
      this.dispatchEvent(new Event(ITEM_SELECTED_EVENT, {bubbles: true}));
    }
  }

  /** Activates the item from the keyboard, following the link if it has one. */
  private readonly onKeydown = (event: KeyboardEvent) => {
    if (event.defaultPrevented || this.disabled) return;
    if (event.key !== 'Enter' && event.key !== ' ') return;
    // Space would scroll the page.
    event.preventDefault();
    const link = this.renderRoot?.querySelector<HTMLAnchorElement>('a.item');
    if (link) link.click();
    else this.click();
  };

  private onLabelSlotChange(event: Event) {
    const slot = event.target as HTMLSlotElement;
    this.hasLabel = slot
      .assignedNodes({flatten: true})
      .some(
        (node) =>
          node.nodeType === Node.ELEMENT_NODE ||
          (node.nodeType === Node.TEXT_NODE && /\S/.test((node as Text).data)),
      );
  }

  private onSelectedIconSlotChange(event: Event) {
    const slot = event.target as HTMLSlotElement;
    this.hasSelectedIcon = slot.assignedNodes({flatten: true}).length > 0;
  }
}
