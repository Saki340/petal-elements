/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import '../../elevation/elevation.js';
import '../../focus/md-focus-ring.js';
import '../../ripple/ripple.js';

import {html, LitElement, nothing, PropertyValues} from 'lit';
import {property, query} from 'lit/decorators.js';
import {classMap} from 'lit/directives/class-map.js';

import {ARIAMixinStrict} from '../../internal/aria/aria.js';
import {mixinDelegatesAria} from '../../internal/aria/delegate.js';
import {FAST_SPATIAL, Spring, springFromCss} from '../../internal/motion/spring.js';

/**
 * FAB sizes, as in Compose: `small` (40px), `baseline` (56px, the default),
 * `medium` (80px) and `large` (96px). Extended FABs (with a `label`) are 56px
 * high for `small` and `baseline`, 80px for `medium` and 96px for `large`.
 */
export type FabSize = 'small' | 'baseline' | 'medium' | 'large';

/** MotionSchemeKeyTokens.FastEffects, the same in both schemes. */
const FAST_EFFECTS = {dampingRatio: 1, stiffness: 3800};

// Separate variable needed for closure.
const fabBaseClass = mixinDelegatesAria(LitElement);

// tslint:disable-next-line:enforce-comments-on-exported-symbols
export abstract class SharedFab extends fabBaseClass {
  /** @nocollapse */
  static override shadowRootOptions: ShadowRootInit = {
    mode: 'open' as const,
    delegatesFocus: true,
  };

  /**
   * The size of the FAB.
   *
   * NOTE: Branded FABs cannot be sized to `small` or `medium`.
   */
  @property({reflect: true}) size: FabSize = 'baseline';

  /**
   * The text to display on the FAB.
   */
  @property() label = '';

  /**
   * Lowers the FAB's elevation.
   */
  @property({type: Boolean}) lowered = false;

  /**
   * Whether an extended FAB shows its label. When false, it shrinks to the
   * icon alone with Compose's animation; the label still names the button.
   */
  @property({type: Boolean}) expanded = true;

  @query('.fab') private readonly fab!: HTMLElement | null;
  @query('.label') private readonly labelElement!: HTMLElement | null;

  // The expansion, 0 (collapsed) to 1, and the label opacity: Compose's
  // updateTransition with FastSpatial for the width and FastEffects for the
  // alpha (FloatingActionButton.kt).
  private width?: Spring;
  private alpha?: Spring;
  private frame = 0;
  private lastFrame = 0;

  protected override render() {
    // Needed for closure conformance
    const {ariaLabel} = this as ARIAMixinStrict;
    return html`
      <button
        class="fab ${classMap(this.getRenderClasses())}"
        aria-label=${ariaLabel || nothing}>
        <petal-elevation part="elevation"></petal-elevation>
        <petal-focus-ring part="focus-ring"></petal-focus-ring>
        <petal-ripple class="ripple"></petal-ripple>
        ${this.renderTouchTarget()} ${this.renderIcon()} ${this.renderLabel()}
      </button>
    `;
  }

  protected getRenderClasses() {
    const isExtended = !!this.label;
    return {
      'lowered': this.lowered,
      'small': this.size === 'small' && !isExtended,
      'medium': this.size === 'medium' && !isExtended,
      'large': this.size === 'large' && !isExtended,
      'extended': isExtended,
      'extended-small': this.size === 'small' && isExtended,
      'extended-medium': this.size === 'medium' && isExtended,
      'extended-large': this.size === 'large' && isExtended,
    };
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    cancelAnimationFrame(this.frame);
    this.frame = 0;
  }

  protected override updated(changed: PropertyValues<this>) {
    if (!changed.has('expanded') && !changed.has('label') && !changed.has('size')) {
      return;
    }
    const target = this.label && !this.expanded ? 0 : 1;
    const first = changed.has('expanded') && changed.get('expanded') === undefined;
    if (!this.label) {
      this.stopExpansion();
      return;
    }
    if (!this.width) {
      if (target === 1) {
        this.applyExpansion(1, 1);
        return;
      }
      this.width = new Spring(springFromCss(this, 'fast-spatial', FAST_SPATIAL));
      this.alpha = new Spring(FAST_EFFECTS);
      this.width.value = this.alpha.value = 1;
    }
    this.width.target = this.alpha!.target = target;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (first || reduce) {
      cancelAnimationFrame(this.frame);
      this.frame = 0;
      if (target === 1) {
        this.stopExpansion();
        return;
      }
      this.width.value = this.alpha!.value = 0;
      this.width.velocity = this.alpha!.velocity = 0;
      this.applyExpansion(0, 0);
      return;
    }
    this.animateExpansion();
  }

  private animateExpansion() {
    if (this.frame) return;
    this.lastFrame = 0;
    const tick = (now: number) => {
      const width = this.width;
      const alpha = this.alpha;
      if (!width || !alpha) {
        this.frame = 0;
        return;
      }
      if (this.lastFrame) {
        const ms = Math.min(now - this.lastFrame, 64);
        width.step(ms);
        alpha.step(ms);
      }
      this.lastFrame = now;
      this.applyExpansion(width.value, alpha.value);
      if (width.atRest && alpha.atRest) {
        this.frame = 0;
        if (width.target === 1) this.stopExpansion();
        return;
      }
      this.frame = requestAnimationFrame(tick);
    };
    this.frame = requestAnimationFrame(tick);
  }

  /**
   * Lays out the extended FAB `progress` of the way from the collapsed width
   * (its height) to the full width, like Compose's lerp in a layout modifier.
   */
  private applyExpansion(progress: number, alpha: number) {
    const fab = this.fab;
    if (!fab) return;
    // Not in the render classes, so that it changes without an update.
    fab.classList.toggle('collapsing', progress < 1 || alpha < 1);
    if (progress >= 1 && alpha >= 1) {
      fab.style.removeProperty('width');
      fab.style.removeProperty('min-width');
      this.labelElement?.style.removeProperty('opacity');
      return;
    }
    fab.style.removeProperty('width');
    fab.style.removeProperty('min-width');
    const full = fab.getBoundingClientRect().width;
    const collapsed = fab.getBoundingClientRect().height;
    fab.style.minWidth = '0px';
    fab.style.width = `${collapsed + (full - collapsed) * progress}px`;
    this.labelElement?.style.setProperty('opacity', String(Math.max(0, Math.min(1, alpha))));
  }

  private stopExpansion() {
    cancelAnimationFrame(this.frame);
    this.frame = 0;
    this.width = undefined;
    this.alpha = undefined;
    this.applyExpansion(1, 1);
  }

  private renderTouchTarget() {
    return html`<div class="touch-target"></div>`;
  }

  private renderLabel() {
    return this.label ? html`<span class="label">${this.label}</span>` : '';
  }

  private renderIcon() {
    const {ariaLabel} = this as ARIAMixinStrict;
    return html`<span class="icon">
      <slot
        name="icon"
        aria-hidden=${ariaLabel || this.label
          ? 'true'
          : (nothing as unknown as 'false')}>
        <span></span>
      </slot>
    </span>`;
  }
}
