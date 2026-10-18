/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import '../../focus/md-focus-ring.js';
import '../../ripple/ripple.js';

import {html, LitElement} from 'lit';
import {property, query} from 'lit/decorators.js';

import {
  FAST_SPATIAL,
  Spring,
  SpringSpec,
  springFromCss,
} from '../../internal/motion/spring.js';

/** The horizontal alignment of the items of a FAB menu. */
export type FabMenuAlignment = 'start' | 'center' | 'end';

/** MotionSchemeKeyTokens.FastEffects, the same in both schemes. */
const FAST_EFFECTS: SpringSpec = {dampingRatio: 1, stiffness: 3800};

/**
 * An item of a FAB menu after Jetpack Compose's `FloatingActionButtonMenuItem`:
 * a pill with an icon and a label. When it appears its width grows from 0 on
 * the fast spatial spring and its opacity on the fast effects spring, and the
 * contents stay aligned like the menu's items.
 */
export class FabMenuItem extends LitElement {
  /** @nocollapse */
  static override shadowRootOptions: ShadowRootInit = {
    mode: 'open' as const,
    delegatesFocus: true,
  };

  /**
   * Which side of the menu the item hugs. `petal-fab-menu` sets it, like the
   * `horizontalAlignment` of Compose's `FloatingActionButtonMenuScope`.
   */
  @property({reflect: true, attribute: 'horizontal-alignment'})
  horizontalAlignment: FabMenuAlignment = 'end';

  @query('.item') private readonly item!: HTMLElement | null;
  @query('.content') private readonly content!: HTMLElement | null;

  // The width as a fraction of the natural one and the opacity, 0 to 1.
  private width?: Spring;
  private alpha?: Spring;
  private target = 1;

  protected override render() {
    return html`
      <button class="item" type="button">
        <petal-focus-ring part="focus-ring"></petal-focus-ring>
        <petal-ripple class="ripple"></petal-ripple>
        <span class="clip">
          <span class="content">
            <slot name="icon"></slot>
            <span class="label"><slot></slot></span>
          </span>
        </span>
      </button>
    `;
  }

  /**
   * Whether the item is drawn at all (its opacity is not 0). The menu has no
   * height when no item is.
   * @internal
   */
  get isVisible() {
    return this.alpha ? this.alpha.value !== 0 : this.target === 1;
  }

  /**
   * Whether the width or opacity are still moving.
   * @internal
   */
  get isAnimating() {
    return !!this.width && !!this.alpha && (!this.width.atRest || !this.alpha.atRest);
  }

  /**
   * Shows or hides the item. The springs move toward the new state with the
   * next `step()`s; without `animate` it is there at once.
   * @internal
   */
  setShown(shown: boolean, animate = true) {
    const target = shown ? 1 : 0;
    if (!animate) {
      this.target = target;
      this.width = this.alpha = undefined;
      this.apply(target, target);
      return;
    }
    if (!this.width || !this.alpha) {
      // Nothing to move.
      if (target === this.target) return;
      this.width = new Spring(springFromCss(this, 'fast-spatial', FAST_SPATIAL));
      this.alpha = new Spring(FAST_EFFECTS);
      this.width.value = this.alpha.value = this.target;
    }
    if (this.width.target !== target) {
      this.width.spec = springFromCss(this, 'fast-spatial', FAST_SPATIAL);
    }
    this.target = target;
    this.width.target = this.alpha.target = target;
  }

  /**
   * Moves the springs `ms` milliseconds forward and lays the item out.
   * @internal
   */
  step(ms: number) {
    const {width, alpha} = this;
    if (!width || !alpha) return;
    width.step(ms);
    alpha.step(ms);
    if (width.atRest && alpha.atRest) {
      width.value = width.target;
      alpha.value = alpha.target;
      this.width = this.alpha = undefined;
      this.apply(this.target, this.target);
      return;
    }
    this.apply(width.value, alpha.value);
  }

  /**
   * The width is the natural one times `width` (Compose's layout modifier, so
   * it may overshoot), the opacity `alpha`; an item that is not drawn (alpha 0)
   * is not hit either.
   */
  private apply(width: number, alpha: number) {
    const item = this.item;
    if (!item) return;
    if (width === 1 && alpha === 1) {
      item.style.removeProperty('width');
      this.style.removeProperty('opacity');
      this.style.removeProperty('pointer-events');
      return;
    }
    const natural = this.content?.offsetWidth ?? 0;
    item.style.width = `${natural * Math.max(width, 0)}px`;
    this.style.opacity = String(alpha);
    if (alpha === 0) {
      this.style.pointerEvents = 'none';
    } else {
      this.style.removeProperty('pointer-events');
    }
  }

  protected override updated() {
    // A hidden item that has just rendered gets its state.
    if (!this.width && this.target === 0) this.apply(0, 0);
  }
}
