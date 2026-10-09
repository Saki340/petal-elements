/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import {html, isServer, LitElement, nothing, PropertyValues} from 'lit';
import {property, queryAssignedElements} from 'lit/decorators.js';

/** `small` (TopAppBar), `medium` or `large` (the flexible two-row bars). */
export type TopAppBarSize = 'small' | 'medium' | 'large';

/**
 * TopTitleAlphaEasing, CubicBezierEasing(.8, 0, .8, .15): the small title's
 * opacity for a collapsed fraction.
 */
function topTitleAlpha(fraction: number) {
  const [x1, y1, x2, y2] = [0.8, 0, 0.8, 0.15];
  const bezier = (t: number, a: number, b: number) =>
    3 * (1 - t) * (1 - t) * t * a + 3 * (1 - t) * t * t * b + t * t * t;
  // Solve x(t) = fraction by bisection; x is increasing.
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 30; i++) {
    const mid = (lo + hi) / 2;
    if (bezier(mid, x1, x2) < fraction) lo = mid;
    else hi = mid;
  }
  return bezier((lo + hi) / 2, y1, y2);
}

/**
 * A Material 3 top app bar, after Jetpack Compose (`TopAppBar`,
 * `MediumFlexibleTopAppBar`, `LargeFlexibleTopAppBar`).
 *
 * Sticks to the top of the page. A small bar takes the scrolled container
 * color when content is scrolled under it; a medium or large bar collapses
 * into a small one as the page scrolls (`exitUntilCollapsed`).
 *
 * @slot navigation - A navigation icon button, at the start.
 * @slot actions - Action icon buttons, at the end.
 */
export class TopAppBar extends LitElement {
  /** `small`, `medium` or `large`. */
  @property({reflect: true}) size: TopAppBarSize = 'small';

  /** The title. */
  @property() headline = '';

  /** An optional subtitle below the title. */
  @property() subtitle = '';

  /** Centers the title (`titleHorizontalAlignment`). */
  @property({type: Boolean, reflect: true}) centered = false;

  /**
   * The id of the scrolling element under the bar. Without it, the page
   * scrolls.
   */
  @property({attribute: 'scroll-target'}) scrollTarget = '';

  /** The collapsed fraction: 0 expanded, 1 collapsed (or scrolled, small). */
  get collapsedFraction() {
    return this.fraction;
  }

  @queryAssignedElements({slot: 'navigation'})
  private readonly navigationElements!: HTMLElement[];

  private fraction = 0;
  /** The size the custom properties were last set for. */
  private applied?: TopAppBarSize;
  private scroller: EventTarget | null = null;
  private frame = 0;

  override connectedCallback() {
    super.connectedCallback();
    if (isServer) return;
    queueMicrotask(() => this.listen());
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.unlisten();
  }

  protected override render() {
    const twoRows = this.size === 'medium' || this.size === 'large';
    // Like Compose, only one title is exposed to assistive technology.
    const smallTitleHidden = twoRows && this.fraction < 0.5;
    return html`
      <div class="bar" part="container">
        <div class="top">
          <div class="navigation">
            <slot name="navigation" @slotchange=${this.onNavigationChange}></slot>
          </div>
          <div class="title" aria-hidden=${smallTitleHidden ? 'true' : nothing}>
            ${this.renderTitle()}
          </div>
          <div class="actions"><slot name="actions"></slot></div>
        </div>
        ${twoRows
          ? html`<div class="bottom">
              <div class="title" aria-hidden=${smallTitleHidden ? nothing : 'true'}>
                ${this.renderTitle()}
              </div>
            </div>`
          : nothing}
      </div>
    `;
  }

  private renderTitle() {
    return html`<span class="headline">${this.headline}</span>${this.subtitle
        ? html`<span class="subtitle">${this.subtitle}</span>`
        : nothing}`;
  }

  protected override updated(changed: PropertyValues<this>) {
    if (changed.has('subtitle')) this.toggleAttribute('has-subtitle', !!this.subtitle);
    if (changed.has('scrollTarget') && this.isConnected) {
      this.unlisten();
      this.listen();
    }
    if (changed.has('size')) this.update_();
  }

  private onNavigationChange() {
    this.toggleAttribute('has-navigation', this.navigationElements.length > 0);
  }

  private listen() {
    if (this.scroller || !this.isConnected) return;
    const root = this.getRootNode() as Document | ShadowRoot;
    this.scroller = (this.scrollTarget && root.getElementById?.(this.scrollTarget)) || window;
    this.scroller.addEventListener('scroll', this.onScroll, {passive: true});
    window.addEventListener('resize', this.onScroll, {passive: true});
    this.update_();
  }

  private unlisten() {
    this.scroller?.removeEventListener('scroll', this.onScroll);
    window.removeEventListener('resize', this.onScroll);
    this.scroller = null;
    cancelAnimationFrame(this.frame);
  }

  private readonly onScroll = () => {
    cancelAnimationFrame(this.frame);
    this.frame = requestAnimationFrame(() => this.update_());
  };

  /** Recomputes the collapsed fraction from the scroll position. */
  private update_() {
    if (!this.scroller) return;
    const scrollTop =
      this.scroller === window
        ? window.scrollY
        : (this.scroller as HTMLElement).scrollTop;
    let fraction: number;
    if (this.size === 'small') {
      // overlappedFraction > 0.01: content is under the bar.
      fraction = scrollTop > 0 ? 1 : 0;
    } else {
      const style = getComputedStyle(this);
      const range =
        parseFloat(style.getPropertyValue('--_expanded-height')) -
        parseFloat(style.getPropertyValue('--_collapsed-height'));
      const containerTop =
        this.scroller === window ? 0 : (this.scroller as HTMLElement).getBoundingClientRect().top;
      const offset = containerTop - this.getBoundingClientRect().top;
      fraction = range > 0 ? Math.min(1, Math.max(0, offset / range)) : 0;
    }
    if (fraction === this.fraction && this.applied === this.size) return;
    this.applied = this.size;
    const crossedHalf = fraction < 0.5 !== this.fraction < 0.5;
    this.fraction = fraction;
    this.style.setProperty('--_fraction', fraction.toFixed(4));
    // Two-row bars fade the small title in and the large title out.
    const small = this.size === 'small';
    this.style.setProperty('--_top-title-opacity', (small ? 1 : topTitleAlpha(fraction)).toFixed(4));
    this.style.setProperty('--_bottom-title-opacity', (1 - fraction).toFixed(4));
    this.toggleAttribute('scrolled', fraction > 0);
    if (crossedHalf) this.requestUpdate();
  }
}
