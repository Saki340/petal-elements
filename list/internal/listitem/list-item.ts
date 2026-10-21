/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import '../../../focus/md-focus-ring.js';
import '../../../item/item.js';
import '../../../ripple/ripple.js';

import {
  html,
  isServer,
  LitElement,
  nothing,
  PropertyValues,
  TemplateResult,
} from 'lit';
import {property, query} from 'lit/decorators.js';
import {ClassInfo, classMap} from 'lit/directives/class-map.js';
import {literal, html as staticHtml, StaticValue} from 'lit/static-html.js';

import {ARIAMixinStrict} from '../../../internal/aria/aria.js';
import {mixinDelegatesAria} from '../../../internal/aria/delegate.js';
import {safeHref} from '../../../internal/directives/safe-href.js';
import {
  createRequestActivationEvent,
  ListItem,
} from '../list-navigation-helpers.js';

/**
 * Supported behaviors for a list item.
 */
export type ListItemType = 'text' | 'button' | 'link';

// Separate variable needed for closure.
const listItemBaseClass = mixinDelegatesAria(LitElement);

/**
 * @fires request-activation {Event} Requests the list to set `tabindex=0` on
 * the item and focus it. Used internally for list keyboard navigation; most
 * applications do not need to listen for this event. It is exposed for
 * authors building their own list-item replacements or wrapping items in a
 * custom controller. --bubbles --composed
 *
 * @slot - The headline, as text (the same as the `headline` slot).
 * @slot headline - The main line of text.
 * @slot overline - A short line above the headline.
 * @slot supporting-text - Lines below the headline.
 * @slot trailing-supporting-text - Short text at the end, such as a count or a time.
 * @slot start - Content at the start: an icon, an avatar, an image or a control.
 * @slot end - Content at the end: an icon or a control.
 */
export class ListItemEl extends listItemBaseClass implements ListItem {
  /** @nocollapse */
  static override shadowRootOptions = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  /**
   * Disables the item and makes it non-selectable and non-interactive.
   */
  @property({type: Boolean, reflect: true}) disabled = false;

  /**
   * Sets the behavior of the list item, defaults to "text". Change to "link" or
   * "button" for interactive items.
   */
  @property({reflect: true}) type: ListItemType = 'text';

  /**
   * Shows the item as selected (Compose's `ListItem(selected = ...)`): the
   * secondary container color, on-secondary-container texts and icons, and
   * rounded corners. It does not change by itself; set it from your
   * selection logic.
   */
  @property({type: Boolean, reflect: true}) selected = false;

  /**
   * Only needed for SSR.
   *
   * Set automatically on items of three lines: with both overline and
   * supporting text, or with supporting text on more than one line. Such an
   * item is 88px high and its content is aligned to the top. Add this
   * attribute to avoid a flash of unstyled content when rendering on the
   * server.
   */
  @property({type: Boolean, reflect: true, attribute: 'three-line'})
  threeLine = false;

  /**
   * READONLY. Sets the `petal-list-item` attribute on the element.
   */
  @property({type: Boolean, attribute: 'petal-list-item', reflect: true})
  isListItem = true;

  /**
   * Sets the underlying `HTMLAnchorElement`'s `href` resource attribute.
   */
  @property() href = '';

  /**
   * Sets the underlying `HTMLAnchorElement`'s `target` attribute when `href` is
   * set.
   */
  @property() target: '_blank' | '_parent' | '_self' | '_top' | '' = '';

  /**
   * Sets the underlying `HTMLAnchorElement`'s `rel` attribute when `href` is
   * set.
   */
  @property() rel = '';

  /**
   * Sets the underlying `HTMLAnchorElement`'s `referrerpolicy` attribute when
   * `href` is set.
   */
  @property() referrerPolicy = '';

  @query('.list-item') protected readonly listItemRoot!: HTMLElement | null;

  private get isDisabled() {
    return this.disabled && this.type !== 'link';
  }

  private resizeObserver?: ResizeObserver;

  protected override willUpdate(changed: PropertyValues<ListItemEl>) {
    if (this.href) {
      this.type = 'link';
    }

    super.willUpdate(changed);
  }

  override connectedCallback() {
    super.connectedCallback();
    // The width decides whether the supporting text wraps to a second line.
    if (!isServer && typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => this.updateThreeLine());
      this.resizeObserver.observe(this);
    }
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.resizeObserver?.disconnect();
    this.resizeObserver = undefined;
  }

  /**
   * An item of three lines (Compose's `ListItemType.ThreeLine`): overline and
   * supporting text together, or supporting text higher than 30px (more than
   * one line). It has a larger minimum height and aligns its content to the
   * top.
   */
  private updateThreeLine() {
    const slots = this.renderRoot?.querySelectorAll<HTMLSlotElement>(
      'slot[name=overline], slot[name=supporting-text]',
    );
    if (!slots || slots.length < 2) {
      return;
    }

    const [overline, supporting] = Array.from(slots).map((slot) =>
      slot.assignedElements({flatten: true}),
    );
    const supportingHeight = supporting.reduce(
      (height, element) => height + element.getBoundingClientRect().height,
      0,
    );
    this.threeLine =
      (overline.length > 0 && supporting.length > 0) || supportingHeight > 30;
  }

  protected override render() {
    return this.renderListItem(html`
      <petal-item>
        <div slot="container">
          ${this.renderRipple()} ${this.renderFocusRing()}
        </div>
        <slot name="start" slot="start"></slot>
        <slot name="end" slot="end"></slot>
        ${this.renderBody()}
      </petal-item>
    `);
  }

  /**
   * Renders the root list item.
   *
   * @param content the child content of the list item.
   */
  protected renderListItem(content: unknown) {
    const isAnchor = this.type === 'link';
    let tag: StaticValue;
    switch (this.type) {
      case 'link':
        tag = literal`a`;
        break;
      case 'button':
        tag = literal`button`;
        break;
      default:
      case 'text':
        tag = literal`li`;
        break;
    }

    const isInteractive = this.type !== 'text';
    // TODO(b/265339866): announce "button"/"link" inside of a list item. Until
    // then all are "listitem" roles for correct announcement.
    const target = isAnchor && !!this.target ? this.target : nothing;
    return staticHtml`
      <${tag}
        id="item"
        tabindex="${this.isDisabled || !isInteractive ? -1 : 0}"
        ?disabled=${this.isDisabled}
        role="listitem"
        aria-selected=${this.selected
          ? 'true'
          : (this as ARIAMixinStrict).ariaSelected || nothing}
        aria-checked=${(this as ARIAMixinStrict).ariaChecked || nothing}
        aria-expanded=${(this as ARIAMixinStrict).ariaExpanded || nothing}
        aria-haspopup=${(this as ARIAMixinStrict).ariaHasPopup || nothing}
        class="list-item ${classMap(this.getRenderClasses())}"
        href=${safeHref(this.href)}
        target=${target}
        rel=${(isAnchor && this.rel) || nothing}
        referrerpolicy=${(isAnchor && this.referrerPolicy) || nothing}
        @focus=${this.onFocus}
      >${content}</${tag}>
    `;
  }

  /**
   * Handles rendering of the ripple element.
   */
  protected renderRipple(): TemplateResult | typeof nothing {
    if (this.type === 'text') {
      return nothing;
    }

    return html` <petal-ripple
      part="ripple"
      for="item"
      ?disabled=${this.isDisabled}></petal-ripple>`;
  }

  /**
   * Handles rendering of the focus ring.
   */
  protected renderFocusRing(): TemplateResult | typeof nothing {
    if (this.type === 'text') {
      return nothing;
    }

    return html` <petal-focus-ring
      @visibility-changed=${this.onFocusRingVisibilityChanged}
      part="focus-ring"
      for="item"
      inward></petal-focus-ring>`;
  }

  protected onFocusRingVisibilityChanged(e: Event) {}

  /**
   * Classes applied to the list item root.
   */
  protected getRenderClasses(): ClassInfo {
    return {'disabled': this.isDisabled};
  }

  /**
   * Handles rendering the headline and supporting text.
   */
  protected renderBody() {
    return html`
      <slot></slot>
      <slot
        name="overline"
        slot="overline"
        @slotchange=${this.updateThreeLine}></slot>
      <slot name="headline" slot="headline"></slot>
      <slot
        name="supporting-text"
        slot="supporting-text"
        @slotchange=${this.updateThreeLine}></slot>
      <slot
        name="trailing-supporting-text"
        slot="trailing-supporting-text"></slot>
    `;
  }

  protected onFocus() {
    if (this.tabIndex !== -1) {
      return;
    }
    // Handles the case where the user clicks on the element and then tabs.
    this.dispatchEvent(createRequestActivationEvent());
  }

  override focus() {
    // TODO(b/300334509): needed for some cases where delegatesFocus doesn't
    // work programmatically like in FF and select-option
    this.listItemRoot?.focus();
  }

  override click() {
    if (!this.listItemRoot) {
      // If the element has not finished rendering, call super to ensure click
      // events are dispatched.
      super.click();
      return;
    }

    // Forward click to the element to ensure link <a>.click() works correctly.
    this.listItemRoot.click();
  }
}
