/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import {html, isServer, LitElement, nothing, PropertyValues} from 'lit';
import {property, query} from 'lit/decorators.js';

import {observeVisibility} from '../../internal/motion/visibility.js';
import {ARIAMixinStrict} from '../../internal/aria/aria.js';
import {mixinDelegatesAria} from '../../internal/aria/delegate.js';

import {determinateFrame, Frame, indeterminateFrame} from './animation.js';

const baseClass = mixinDelegatesAria(LitElement);

/**
 * A Material 3 Expressive loading indicator, after Jetpack Compose
 * (`LoadingIndicator`, `ContainedLoadingIndicator`).
 *
 * Without `value` it is indeterminate: seven Material shapes morph into each
 * other on a spring while the indicator turns. With `value` (0 to 1) it is
 * determinate: a circle morphs into a soft burst as the value grows.
 */
export class LoadingIndicator extends baseClass {
  /**
   * Progress from 0 to 1. When not set, the indicator is indeterminate.
   */
  @property({type: Number}) value?: number;

  /** Draws the indicator in a primary container (ContainedLoadingIndicator). */
  @property({type: Boolean, reflect: true}) contained = false;

  @query('path') private readonly pathElement!: SVGPathElement | null;

  private frame = 0;
  private start = 0;
  /** Whether the indicator is in the viewport; it draws only then. */
  private visible = true;
  private unobserve?: () => void;

  override connectedCallback() {
    super.connectedCallback();
    if (!isServer) {
      this.unobserve = observeVisibility(this, (visible) => {
        this.visible = visible;
        if (visible) {
          this.startAnimation();
        } else {
          cancelAnimationFrame(this.frame);
          this.frame = 0;
        }
      });
    }
    this.startAnimation();
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.unobserve?.();
    cancelAnimationFrame(this.frame);
    this.frame = 0;
  }

  protected override render() {
    // Needed for closure conformance
    const {ariaLabel} = this as ARIAMixinStrict;
    const determinate = this.value !== undefined;
    const value = determinate ? Math.min(1, Math.max(0, this.value!)) : 0;
    const frame = determinate ? determinateFrame(value) : indeterminateFrame(0);
    return html`<div
      class="container"
      role="progressbar"
      aria-label=${ariaLabel || nothing}
      aria-valuemin=${determinate ? 0 : nothing}
      aria-valuemax=${determinate ? 1 : nothing}
      aria-valuenow=${determinate ? value : nothing}>
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path d=${frame.d} transform="rotate(${frame.rotation} 24 24)"></path>
      </svg>
    </div>`;
  }

  protected override updated(changed: PropertyValues<this>) {
    if (changed.has('value')) this.startAnimation();
  }

  /** Draws one frame. */
  private draw(frame: Frame) {
    const path = this.pathElement;
    if (!path) return;
    path.setAttribute('d', frame.d);
    path.setAttribute('transform', `rotate(${frame.rotation.toFixed(2)} 24 24)`);
  }

  private startAnimation() {
    if (isServer || this.value !== undefined || this.frame || !this.isConnected || !this.visible) {
      if (this.value !== undefined) {
        cancelAnimationFrame(this.frame);
        this.frame = 0;
      }
      return;
    }
    this.start = performance.now();
    const tick = () => {
      // With reduced motion, the shape stays and only turns.
      const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
      const ms = performance.now() - this.start;
      const frame = reduced
        ? {...indeterminateFrame(0), rotation: (ms / 4666) * 360}
        : indeterminateFrame(ms);
      this.draw(frame);
      this.frame = requestAnimationFrame(tick);
    };
    this.frame = requestAnimationFrame(tick);
  }
}
