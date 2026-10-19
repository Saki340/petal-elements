/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import '../../elevation/elevation.js';
import '../../focus/md-focus-ring.js';
import '../../ripple/ripple.js';

import {html, isServer, LitElement, nothing} from 'lit';
import {
  property,
  query,
  queryAssignedElements,
  queryAssignedNodes,
  state,
} from 'lit/decorators.js';
import {ClassInfo, classMap} from 'lit/directives/class-map.js';

import {
  DEFAULT_SPATIAL,
  springEasing,
  springFromCss,
} from '../../internal/motion/spring.js';
import {mixinFocusable} from '../../labs/behaviors/focusable.js';

/**
 * Symbol used by the tab bar to request a tab to animate its indicator from a
 * previously selected tab.
 */
export const ANIMATE_INDICATOR = Symbol('animateIndicator');

// Separate variable needed for closure.
const tabBaseClass = mixinFocusable(LitElement);

/**
 * Tab component.
 */
export class Tab extends tabBaseClass {
  /**
   * The attribute `md-tab` indicates that the element is a tab for the parent
   * element, `<petal-tabs>`. Make sure if you're implementing your own `md-tab`
   * component that you have an `md-tab` attribute set.
   */
  @property({type: Boolean, reflect: true, attribute: 'md-tab'})
  readonly isTab = true;

  /**
   * Whether or not the tab is selected.
   **/
  @property({type: Boolean, reflect: true}) active = false;

  /**
   * @deprecated use `active`
   */
  @property({type: Boolean})
  get selected() {
    return this.active;
  }
  set selected(active: boolean) {
    this.active = active;
  }

  /**
   * In SSR, set this to true when an icon is present.
   */
  @property({type: Boolean, attribute: 'has-icon'}) hasIcon = false;

  /**
   * In SSR, set this to true when there is no label and only an icon.
   */
  @property({type: Boolean, attribute: 'icon-only'}) iconOnly = false;

  @query('.indicator') private readonly indicator!: HTMLElement | null;
  @state() protected fullWidthIndicator = false;
  @queryAssignedNodes({flatten: true})
  private readonly assignedDefaultNodes!: Node[];
  @queryAssignedElements({slot: 'icon', flatten: true})
  private readonly assignedIcons!: HTMLElement[];
  private readonly internals =
    // Cast needed for closure
    (this as HTMLElement).attachInternals();

  constructor() {
    super();
    if (!isServer) {
      this.internals.role = 'tab';
      this.addEventListener('keydown', this.handleKeydown.bind(this));
    }
  }

  protected override render() {
    const indicator = html`<div class="indicator"></div>`;
    return html`<div
      class="button"
      role="presentation"
      @click=${this.handleContentClick}>
      <petal-focus-ring part="focus-ring" inward .control=${this}></petal-focus-ring>
      <petal-elevation part="elevation"></petal-elevation>
      <petal-ripple .control=${this}></petal-ripple>
      <div
        class="content ${classMap(this.getContentClasses())}"
        role="presentation">
        <slot name="icon" @slotchange=${this.handleIconSlotChange}></slot>
        <slot @slotchange=${this.handleSlotChange}></slot>
        ${this.fullWidthIndicator ? nothing : indicator}
      </div>
      ${this.fullWidthIndicator ? indicator : nothing}
    </div>`;
  }

  protected getContentClasses(): ClassInfo {
    return {
      'has-icon': this.hasIcon,
      'has-label': !this.iconOnly,
    };
  }

  protected override updated() {
    this.internals.ariaSelected = String(this.active);
  }

  private async handleKeydown(event: KeyboardEvent) {
    // Allow event to bubble.
    await 0;
    if (event.defaultPrevented) {
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      // Prevent default behavior such as scrolling when pressing spacebar.
      event.preventDefault();
      this.click();
    }
  }

  private handleContentClick(event: Event) {
    // Ensure the "click" target is always the tab, and not content, by stopping
    // propagation of content clicks and re-clicking the host.
    event.stopPropagation();
    this.click();
  }

  [ANIMATE_INDICATOR](previousTab: Tab) {
    if (isServer || !this.indicator) {
      return;
    }

    this.indicator.getAnimations().forEach((a) => {
      a.cancel();
    });
    const previous = previousTab.indicator;
    if (!previous || shouldReduceMotion()) {
      return;
    }

    // TabIndicatorOffsetNode animates the indicator's offset and width from
    // where they are to the new tab's on the default spatial spring. Both
    // edges follow the same spring, which moves the offset and the width in
    // step. The previous indicator is where the last animation left it, if one
    // is running.
    const from = previous.getBoundingClientRect();
    const to = this.indicator.getBoundingClientRect();
    if (from.width === 0 || to.width === 0) {
      return;
    }

    const {easing, duration} = springEasing(
      springFromCss(this, 'default-spatial', DEFAULT_SPATIAL),
    );
    this.indicator.animate(
      [
        {left: `${from.left - to.left}px`, right: `${to.right - from.right}px`},
        {left: '0px', right: '0px'},
      ],
      {duration, easing},
    );
  }

  private handleSlotChange() {
    this.iconOnly = false;
    // Check if there's any label text or elements. If not, then there is only
    // an icon.
    for (const node of this.assignedDefaultNodes) {
      const hasTextContent =
        node.nodeType === Node.TEXT_NODE &&
        !!(node as Text).wholeText.match(/\S/);
      if (node.nodeType === Node.ELEMENT_NODE || hasTextContent) {
        return;
      }
    }

    this.iconOnly = true;
  }

  private handleIconSlotChange() {
    this.hasIcon = this.assignedIcons.length > 0;
  }
}

function shouldReduceMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
