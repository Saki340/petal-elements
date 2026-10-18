/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import '../../elevation/elevation.js';
import '../../focus/md-focus-ring.js';
import '../../ripple/ripple.js';

import {html, isServer, LitElement, nothing, PropertyValues, svg} from 'lit';
import {property, state} from 'lit/decorators.js';
import {classMap} from 'lit/directives/class-map.js';
import {styleMap} from 'lit/directives/style-map.js';

import {ARIAMixinStrict} from '../../internal/aria/aria.js';
import {mixinDelegatesAria} from '../../internal/aria/delegate.js';
import {FAST_SPATIAL, Spring, springFromCss} from '../../internal/motion/spring.js';

/**
 * The size of the toggle FAB when it is not checked, like the FAB sizes:
 * `baseline` (56px, the default), `medium` (80px) and `large` (96px). Checked,
 * it is always the close button's size (56px).
 */
export type ToggleFabSize = 'baseline' | 'medium' | 'large';

/**
 * Where the checked (smaller) container sits in the space of the unchecked
 * one, `ToggleFloatingActionButton`'s `contentAlignment`, along the inline
 * axis. It is always at the top.
 */
export type ToggleFabAlignment = 'start' | 'center' | 'end';

// Separate variable needed for closure.
const toggleFabBaseClass = mixinDelegatesAria(LitElement);

/**
 * A toggleable FAB after Jetpack Compose's `ToggleFloatingActionButton`
 * (FloatingActionButtonMenu.kt): when it is toggled its container animates its
 * size, corner radius and color, and its icon its size and color, driven by a
 * `checkedProgress` from 0 to 1 that follows the fast spatial spring.
 */
export class ToggleFab extends toggleFabBaseClass {
  /** @nocollapse */
  static override shadowRootOptions: ShadowRootInit = {
    mode: 'open' as const,
    delegatesFocus: true,
  };

  /**
   * Whether the FAB is checked (a FAB menu is open).
   */
  @property({type: Boolean, reflect: true}) checked = false;

  /**
   * The size of the unchecked FAB. The container always keeps this much room
   * and shrinks inside of it.
   */
  @property({reflect: true}) size: ToggleFabSize = 'baseline';

  /**
   * Where the container sits in its room when it is checked and smaller, like
   * Compose's `contentAlignment` (`TopEnd` by default).
   */
  @property({attribute: 'content-alignment', reflect: true})
  contentAlignment: ToggleFabAlignment = 'end';

  /**
   * Whether the FAB opens a popup (a FAB menu): it then reports `checked` with
   * `aria-expanded` instead of `aria-pressed`. `petal-fab-menu` sets it on its
   * button.
   */
  @property({type: Boolean, reflect: true}) popup = false;

  /**
   * Compose's `checkedProgress`: 0 (unchecked) to 1 (checked), animated, and
   * past 0.5 the icon is the checked one.
   */
  @state() protected progress = 0;

  private spring?: Spring;
  private frame = 0;
  private lastFrame = 0;

  protected override render() {
    // Needed for closure conformance
    const {ariaLabel} = this as ARIAMixinStrict;
    const checkedIcon = this.progress > 0.5;
    return html`
      <button
        class="toggle"
        type="button"
        style=${styleMap({'--_progress': String(this.progress)})}
        aria-label=${ariaLabel || nothing}
        aria-pressed=${this.popup ? nothing : String(this.checked)}
        aria-expanded=${this.popup ? String(this.checked) : nothing}
        @click=${this.handleClick}>
        <petal-elevation part="elevation"></petal-elevation>
        <petal-focus-ring part="focus-ring"></petal-focus-ring>
        <petal-ripple class="ripple"></petal-ripple>
        <span class="icon ${classMap({'checked': checkedIcon})}" aria-hidden="true">
          <slot name="icon">${this.renderAdd()}</slot>
          <slot name="checked-icon">${this.renderClose()}</slot>
        </span>
      </button>
    `;
  }

  // The icons of Compose's sample (Icons.Filled.Add and Icons.Filled.Close).
  private renderAdd() {
    return svg`<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>`;
  }

  private renderClose() {
    return svg`<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>`;
  }

  private handleClick() {
    this.checked = !this.checked;
    this.dispatchEvent(new Event('change', {bubbles: true}));
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.stopAnimation();
  }

  protected override willUpdate(changed: PropertyValues<this>) {
    if (!changed.has('checked')) return;
    const target = this.checked ? 1 : 0;
    // willUpdate() also runs when rendering on the server: no animation.
    if (isServer) {
      this.progress = target;
      return;
    }
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!this.hasUpdated || reduce || !this.isConnected) {
      // animateFloatAsState starts at its target, and reduced motion jumps.
      this.stopAnimation();
      this.progress = target;
      return;
    }
    const spec = springFromCss(this, 'fast-spatial', FAST_SPATIAL);
    this.spring ??= new Spring(spec);
    this.spring.spec = spec;
    this.spring.value = this.progress;
    this.spring.target = target;
    this.startAnimation();
  }

  private startAnimation() {
    if (this.frame) return;
    this.lastFrame = performance.now();
    const tick = () => {
      const now = performance.now();
      const ms = Math.min(now - this.lastFrame, 64);
      this.lastFrame = now;
      this.frame = this.advance(ms) ? requestAnimationFrame(tick) : 0;
    };
    this.frame = requestAnimationFrame(tick);
  }

  private stopAnimation() {
    cancelAnimationFrame(this.frame);
    this.frame = 0;
    this.spring = undefined;
  }

  /**
   * Moves the animation `ms` milliseconds forward.
   *
   * @return Whether it is still moving.
   * @internal
   */
  protected advance(ms: number) {
    const spring = this.spring;
    if (!spring) return false;
    spring.step(ms);
    if (spring.atRest) {
      this.progress = spring.target;
      this.spring = undefined;
      return false;
    }
    this.progress = spring.value;
    return true;
  }
}
