/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import '../../elevation/elevation.js';
import '../../focus/md-focus-ring.js';
import '../../ripple/ripple.js';

import {html, isServer, LitElement, nothing, PropertyValues} from 'lit';
import {property, query} from 'lit/decorators.js';
import {classMap} from 'lit/directives/class-map.js';

import {ARIAMixinStrict} from '../../internal/aria/aria.js';
import {mixinDelegatesAria} from '../../internal/aria/delegate.js';
import {hasFinePointer, prefersReducedMotion} from '../../internal/motion/hover.js';
import {FAST_SPATIAL, Spring, springFromCss} from '../../internal/motion/spring.js';

/**
 * FAB sizes, as in Compose: `small` (40px), `baseline` (56px, the default),
 * `medium` (80px) and `large` (96px). Extended FABs (with a `label`) are 56px
 * high for `small` and `baseline`, 80px for `medium` and 96px for `large`.
 */
export type FabSize = 'small' | 'baseline' | 'medium' | 'large';

/** How near a mouse pointer draws a following FAB, in px from its edges. */
const FOLLOW_REACH = 28;
/** How far a following FAB moves toward the pointer, at most, in px. */
const FOLLOW_DISTANCE = 4;

/** MotionSchemeKeyTokens.FastEffects, the same in both schemes. */
const FAST_EFFECTS = {dampingRatio: 1, stiffness: 3800};

// Separate variable needed for closure.
const fabBaseClass = mixinDelegatesAria(LitElement);

/**
 * @slot icon - The icon (`<petal-icon slot="icon">`).
 */
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

  /**
   * Moves the FAB up to 4px toward a mouse pointer within 28px of it, and
   * back when the pointer leaves (a petal-elements addition). Meant for the
   * page's main FAB only.
   */
  @property({type: Boolean, reflect: true, attribute: 'follow-pointer'})
  followPointer = false;

  @query('.fab') private readonly fab!: HTMLElement | null;
  @query('.label') private readonly labelElement!: HTMLElement | null;

  // The expansion, 0 (collapsed) to 1, and the label opacity: Compose's
  // updateTransition with FastSpatial for the width and FastEffects for the
  // alpha (FloatingActionButton.kt).
  private width?: Spring;
  private alpha?: Spring;
  private frame = 0;
  private lastFrame = 0;
  /** The offset toward the pointer, as `--_follow-x` and `-y` on `.fab`. */
  private follow = {x: 0, y: 0};

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

  override connectedCallback() {
    super.connectedCallback();
    if (this.followPointer) this.listenToPointer(true);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    cancelAnimationFrame(this.frame);
    this.frame = 0;
    this.listenToPointer(false);
  }

  private listenToPointer(on: boolean) {
    if (isServer) return;
    window.removeEventListener('pointermove', this.handlePointerMove);
    document.documentElement.removeEventListener('pointerleave', this.handlePointerLeave);
    if (on) {
      window.addEventListener('pointermove', this.handlePointerMove, {passive: true});
      document.documentElement.addEventListener('pointerleave', this.handlePointerLeave);
    } else {
      this.setFollow(0, 0);
    }
  }

  private readonly handlePointerMove = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse' || !hasFinePointer() || prefersReducedMotion()) {
      this.setFollow(0, 0);
      return;
    }
    // The FAB's box where it rests.
    const box = (this.fab ?? this).getBoundingClientRect();
    const left = box.left - this.follow.x;
    const top = box.top - this.follow.y;
    const dx = event.clientX - (left + box.width / 2);
    const dy = event.clientY - (top + box.height / 2);
    // How far the pointer is outside the FAB.
    const outsideX = Math.max(0, Math.abs(dx) - box.width / 2);
    const outsideY = Math.max(0, Math.abs(dy) - box.height / 2);
    const distance = Math.hypot(dx, dy);
    if (Math.hypot(outsideX, outsideY) > FOLLOW_REACH || distance === 0) {
      this.setFollow(0, 0);
      return;
    }
    // Toward the pointer, the full distance from the FAB's edge outward.
    const edge = Math.hypot(Math.min(Math.abs(dx), box.width / 2), Math.min(Math.abs(dy), box.height / 2));
    const amount = FOLLOW_DISTANCE * Math.min(1, edge > 0 ? distance / edge : 1);
    this.setFollow((dx / distance) * amount, (dy / distance) * amount);
  };

  private readonly handlePointerLeave = () => {
    this.setFollow(0, 0);
  };

  private setFollow(x: number, y: number) {
    const fab = this.fab;
    if (!fab || (x === this.follow.x && y === this.follow.y)) return;
    this.follow = {x, y};
    // Not render classes or properties, so that they change without an
    // update.
    fab.classList.toggle('following', x !== 0 || y !== 0);
    fab.style.setProperty('--_follow-x', `${x}px`);
    fab.style.setProperty('--_follow-y', `${y}px`);
  }

  protected override updated(changed: PropertyValues<this>) {
    if (changed.has('followPointer') && (this.followPointer || changed.get('followPointer'))) {
      this.listenToPointer(this.followPointer);
    }
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
