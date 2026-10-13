/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import '../../elevation/elevation.js';

import {html, isServer, LitElement, nothing, PropertyValues} from 'lit';
import {property, query, state} from 'lit/decorators.js';
import {classMap} from 'lit/directives/class-map.js';

/** Displayed pull distance (px) at which a release starts a refresh. */
const THRESHOLD = 80;

/** The displayed distance approaches this value as the finger keeps going. */
const MAX_PULL = 140;

/** Pull distance (px) after which a touch counts as a pull, not a tap. */
const SLOP = 4;

/** Raw finger distance to displayed distance, with exponential resistance. */
function resist(raw: number) {
  return MAX_PULL * (1 - Math.exp(-raw / MAX_PULL));
}

/**
 * A pull-to-refresh container that animates the petal-elements flower.
 *
 * The element is the scroll container: give it a height. Content goes in the
 * default slot and stays still; only the indicator moves over it. Pulling
 * down at the top and releasing past the threshold sets `refreshing` and fires
 * `refresh`. The app sets `refreshing` back to false when it is done.
 *
 * Pulling needs touch input, so keyboard and mouse users cannot refresh this
 * way. Apps should also offer another way, such as a refresh button.
 *
 * @fires refresh {Event} The user pulled past the threshold and released.
 * `refreshing` is already true. --bubbles --composed
 */
export class PullToRefresh extends LitElement {
  /** Whether a refresh is in progress. Set it to false when it is done. */
  @property({type: Boolean, reflect: true}) refreshing = false;

  /** Ignores pulls. */
  @property({type: Boolean, reflect: true}) disabled = false;

  /** Accessible name of the indicator while refreshing. */
  @property() label = 'Refreshing';

  /** The indicator is closing: the flower folds, then it slides away. */
  @state() private closing = false;

  @query('.indicator') private readonly indicator!: HTMLElement | null;

  private tracking = false;
  private pulling = false;
  private startY = 0;
  private distance = 0;

  constructor() {
    super();
    if (!isServer) {
      // Touch events, not pointer events: to keep the page from scrolling or
      // overscrolling while pulling, `touchmove` must be cancelled, and
      // pointer events cannot be (the browser sends `pointercancel` once it
      // starts to pan). The listener must be non-passive, which is why it is
      // added here and not with `@touchmove`. Mouse input is ignored on
      // purpose so text can still be selected on desktop.
      this.addEventListener('touchstart', this.onTouchStart, {passive: true});
      this.addEventListener('touchmove', this.onTouchMove, {passive: false});
      this.addEventListener('touchend', this.onTouchEnd);
      this.addEventListener('touchcancel', this.onTouchCancel);
    }
  }

  protected override willUpdate(changed: PropertyValues<this>) {
    if (changed.has('refreshing')) {
      // Refreshing ended: fold the flower and slide the indicator away.
      this.closing = changed.get('refreshing') === true && !this.refreshing;
    }
  }

  protected override render() {
    const classes = {
      'refreshing': this.refreshing,
      'closing': this.closing,
    };
    return html`
      <div class="overlay">
        <div
          class="indicator ${classMap(classes)}"
          role=${this.refreshing ? 'progressbar' : nothing}
          aria-label=${this.refreshing ? this.label : nothing}
          aria-hidden=${this.refreshing ? nothing : 'true'}
          @transitionend=${this.onTransitionEnd}>
          <petal-elevation part="elevation"></petal-elevation>
          <svg class="flower" viewBox="0 0 36 36" aria-hidden="true">
            <g class="bloom">
              <ellipse class="petal petal-1" cx="18" cy="10" rx="5" ry="8" />
              <ellipse class="petal petal-2" cx="26" cy="18" rx="8" ry="5" />
              <ellipse class="petal petal-3" cx="18" cy="26" rx="5" ry="8" />
              <ellipse class="petal petal-4" cx="10" cy="18" rx="8" ry="5" />
              <circle class="center" cx="18" cy="18" r="4" />
            </g>
          </svg>
        </div>
      </div>
      <slot></slot>
    `;
  }

  private readonly onTouchStart = (event: TouchEvent) => {
    this.tracking = false;
    this.pulling = false;
    if (
      this.disabled ||
      this.refreshing ||
      event.touches.length !== 1 ||
      this.scrollTop > 0
    ) {
      return;
    }
    this.tracking = true;
    this.startY = event.touches[0].clientY;
    this.distance = 0;
  };

  private readonly onTouchMove = (event: TouchEvent) => {
    if (!this.tracking) return;
    if (this.disabled || this.refreshing || this.scrollTop > 0) {
      this.endPull(false);
      return;
    }
    const raw = event.touches[0].clientY - this.startY;
    if (!this.pulling) {
      if (raw < -SLOP) {
        // Scrolling up: leave it to the browser.
        this.tracking = false;
        return;
      }
      if (raw <= SLOP) return;
      this.pulling = true;
      this.closing = false;
      this.indicator?.classList.add('dragging');
    }
    if (event.cancelable) event.preventDefault();
    this.distance = resist(Math.max(0, raw - SLOP));
    this.showPull();
  };

  private readonly onTouchEnd = () => {
    this.endPull(this.distance >= THRESHOLD);
  };

  private readonly onTouchCancel = () => {
    this.endPull(false);
  };

  /** Pushes the pull distance to the indicator without re-rendering. */
  private showPull() {
    const indicator = this.indicator;
    if (!indicator) return;
    const progress = Math.min(1, this.distance / THRESHOLD);
    indicator.style.setProperty('--_pull', `${this.distance}px`);
    indicator.style.setProperty('--_progress', String(progress));
    indicator.classList.toggle('ready', progress >= 1);
  }

  private endPull(refresh: boolean) {
    const wasPulling = this.pulling;
    this.tracking = false;
    this.pulling = false;
    if (!wasPulling) return;
    const indicator = this.indicator;
    indicator?.classList.remove('dragging', 'ready');
    indicator?.style.removeProperty('--_pull');
    indicator?.style.removeProperty('--_progress');
    this.distance = 0;
    if (refresh) {
      this.refreshing = true;
      this.dispatchEvent(new Event('refresh', {bubbles: true, composed: true}));
    } else {
      // Spring back.
      this.closing = true;
    }
  }

  private onTransitionEnd(event: TransitionEvent) {
    if (
      this.closing &&
      event.target === this.indicator &&
      event.propertyName === 'transform'
    ) {
      this.closing = false;
    }
  }
}
