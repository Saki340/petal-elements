/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import {html, isServer, LitElement, nothing, PropertyValues, TemplateResult} from 'lit';
import {property} from 'lit/decorators.js';
import {classMap} from 'lit/directives/class-map.js';

import {ARIAMixinStrict} from '../../internal/aria/aria.js';
import {mixinDelegatesAria} from '../../internal/aria/delegate.js';
import {SLOW_SPATIAL, Spring, springFromCss} from '../../internal/motion/spring.js';

// Separate variable needed for closure.
const progressBaseClass = mixinDelegatesAria(LitElement);

/**
 * A progress component.
 */
export abstract class Progress extends progressBaseClass {
  /**
   * Progress to display, a fraction between 0 and `max`.
   */
  @property({type: Number}) value = 0;

  /**
   * Maximum progress to display, defaults to 1.
   */
  @property({type: Number}) max = 1;

  /**
   * Whether or not to display indeterminate progress, which gives no indication
   * to how long an activity will take.
   */
  @property({type: Boolean}) indeterminate = false;

  /**
   * Whether or not to render indeterminate mode using 4 colors instead of one.
   */
  @property({type: Boolean, attribute: 'four-color'}) fourColor = false;

  /**
   * Whether a change of `value` (or `max`) moves the indicator on the slow
   * spatial spring of the motion scheme, which overshoots a little, instead of
   * jumping to it. From the shown progress, also when the value changes again
   * on the way; without motion with `prefers-reduced-motion`. Compose's
   * indicators jump (a petal-elements option).
   */
  @property({type: Boolean, attribute: 'animate-value'}) animateValue = false;

  /** The progress drawn while `animate-value` moves it, 0 to 1. */
  private shownFraction?: number;
  private valueSpring?: Spring;
  private valueFrame = 0;

  /** The progress to draw, 0 to 1 (an overshoot past the ends is cut). */
  protected get fraction() {
    return Math.min(1, Math.max(0, this.shownFraction ?? this.targetFraction));
  }

  private get targetFraction() {
    return Math.min(1, Math.max(0, this.value / this.max || 0));
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.stopValueAnimation();
  }

  protected override willUpdate(changed: PropertyValues<this>) {
    super.willUpdate(changed);
    if (!this.animateValue || this.indeterminate) {
      this.stopValueAnimation();
      this.shownFraction = undefined;
    } else if (
      this.shownFraction === undefined ||
      (!isServer && matchMedia('(prefers-reduced-motion: reduce)').matches)
    ) {
      // The first value, animate-value just set, or reduced motion: no motion.
      this.stopValueAnimation();
      this.shownFraction = this.targetFraction;
    }
  }

  protected override updated(changed: PropertyValues<this>) {
    super.updated(changed);
    if (this.shownFraction !== undefined && this.shownFraction !== this.targetFraction) {
      this.animateToValue();
    }
  }

  private animateToValue() {
    if (isServer) return;
    if (!this.valueSpring) {
      // Compose's ProgressAnimationSpec threshold: 1/1000 of the progress.
      this.valueSpring = new Spring(springFromCss(this, 'slow-spatial', SLOW_SPATIAL), 0.001);
      this.valueSpring.value = this.shownFraction!;
    }
    this.valueSpring.target = this.targetFraction;
    if (this.valueFrame) return;
    let last = performance.now();
    const tick = (now: number) => {
      const spring = this.valueSpring;
      if (!spring) return;
      spring.step(Math.min(64, now - last));
      last = now;
      if (spring.atRest) {
        this.shownFraction = spring.target;
        this.stopValueAnimation();
      } else {
        this.shownFraction = spring.value;
        this.valueFrame = requestAnimationFrame(tick);
      }
      this.requestUpdate();
    };
    this.valueFrame = requestAnimationFrame(tick);
  }

  private stopValueAnimation() {
    // Never set on the server, which has no cancelAnimationFrame.
    if (this.valueFrame) cancelAnimationFrame(this.valueFrame);
    this.valueFrame = 0;
    this.valueSpring = undefined;
  }

  protected override render() {
    // Needed for closure conformance
    const {ariaLabel} = this as ARIAMixinStrict;
    return html`
      <div
        class="progress ${classMap(this.getRenderClasses())}"
        role="progressbar"
        aria-label="${ariaLabel || nothing}"
        aria-valuemin="0"
        aria-valuemax=${this.max}
        aria-valuenow=${this.indeterminate ? nothing : this.value}
        >${this.renderIndicator()}</div
      >
    `;
  }

  protected getRenderClasses() {
    return {
      'indeterminate': this.indeterminate,
      'four-color': this.fourColor,
    };
  }

  protected abstract renderIndicator(): TemplateResult;
}
